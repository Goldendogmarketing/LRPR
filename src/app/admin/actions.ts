"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { buildAdminDecisionWorkflow } from "@/lib/admin-workflow";
import {
  createSupabaseServerClient,
  getOrCreateProfile,
  type SubmissionRow,
} from "@/lib/supabase/server";
import { slugify, type Listing, type ListedBy, type ListingType, type ListingStatus } from "@/data/site";
import { enrichAddress } from "@/lib/address-enrichment";
import { notify, buildDecisionEmail } from "@/lib/notifications";

/**
 * Translate the workflow's abstract status into a real DB enum value.
 *
 * Semantics:
 *  - approved (admin) + all other gates pass = "published" (auto-publish, set published_at)
 *  - approved (admin) + other gates missing = "approved" (admin's vote stands; later gate
 *    completion can promote it to published in a follow-up sprint)
 *  - changes_requested = "changes_requested"
 *  - rejected = "rejected"
 */
function decisionToDbStatus(
  workflowFinalStatus: string,
): SubmissionRow["status"] {
  switch (workflowFinalStatus) {
    case "publish_ready":
      return "published";
    case "approved":
      return "approved";
    case "changes_requested":
      return "changes_requested";
    case "rejected":
      return "rejected";
    default:
      // Fallback shouldn't happen; treat as changes_requested for safety.
      return "changes_requested";
  }
}

function errorRedirect(reason: string, submissionId?: string): never {
  const params = new URLSearchParams({ decision: "error", reason });
  if (submissionId) params.set("submission", submissionId);
  redirect(`/admin?${params.toString()}`);
}

export async function adminDecisionAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/admin");
  }

  // Defense in depth: the page also checks admin role, but server actions
  // can be invoked independently from any signed-in user.
  const user = await currentUser();
  if (user?.publicMetadata?.role !== "admin") {
    errorRedirect("not_admin");
  }

  const submissionId = String(formData.get("submissionId") ?? "").trim();
  const decision = String(
    formData.get("decision") ?? "changes_requested",
  ).trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!submissionId) {
    errorRedirect("missing_submission_id");
  }

  const supabase = createSupabaseServerClient();

  // Fetch the live submission row.
  const { data: submission, error: fetchErr } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", submissionId)
    .single<SubmissionRow>();

  if (fetchErr || !submission) {
    console.error("Could not load submission for review:", fetchErr);
    errorRedirect("submission_not_found", submissionId);
  }

  // Resolve the reviewer's profile so admin_reviews / submission_events have
  // a valid FK. getOrCreateProfile is idempotent — admins who haven't taken
  // any other action yet still get a profile row.
  const primaryEmail =
    user!.emailAddresses.find((e) => e.id === user!.primaryEmailAddressId)
      ?.emailAddress ??
    user!.emailAddresses[0]?.emailAddress ??
    "admin@lrpr.local";
  const fullName =
    [user!.firstName, user!.lastName].filter(Boolean).join(" ") || null;

  const reviewerProfile = await getOrCreateProfile(supabase, {
    clerkUserId: userId!,
    email: primaryEmail,
    fullName,
  });

  // Build the workflow shape from the real DB row.
  const workflow = buildAdminDecisionWorkflow({
    submission: {
      id: submission!.id,
      status: submission!.status,
      contactMethod: submission!.contact_email ?? undefined,
      propertyAddress: submission!.address_line ?? undefined,
      accountValidated: submission!.account_validated,
      paymentRequired: submission!.payment_required,
      paymentComplete: submission!.payment_complete,
      adminApproved: submission!.admin_approved,
      permissionConfirmed: submission!.permission_confirmed,
    },
    decisionInput: {
      submissionId,
      decision,
      reviewerId: reviewerProfile.id,
      notes,
    },
  });

  if (!workflow.ok) {
    console.error("Admin workflow validation failed:", workflow.errors);
    errorRedirect("workflow_invalid", submissionId);
  }

  const fromStatus = submission!.status;
  const toStatus = decisionToDbStatus(workflow.submissionUpdate.status);

  // 1. Insert the admin_reviews audit row.
  const { error: reviewErr } = await supabase.from("admin_reviews").insert({
    submission_id: submission!.id,
    reviewer_profile_id: reviewerProfile.id,
    decision: workflow.decision.decision,
    notes: workflow.decision.notes || null,
    checklist: {
      canPublish: workflow.publishGate.canPublish,
      missingGateIds: workflow.publishGate.missingGateIds,
      gates: workflow.publishGate.gates,
    },
  });
  if (reviewErr) {
    console.error("Failed to insert admin_reviews row:", reviewErr);
  }

  // 2. Insert the submission_events audit row.
  const { error: eventErr } = await supabase.from("submission_events").insert({
    submission_id: submission!.id,
    actor_profile_id: reviewerProfile.id,
    event_type: workflow.eventRecord.eventType,
    from_status: fromStatus,
    to_status: toStatus,
    metadata: {
      decision: workflow.decision.decision,
      notes: workflow.decision.notes,
      canPublish: workflow.publishGate.canPublish,
      reviewerEmail: primaryEmail,
    },
  });
  if (eventErr) {
    console.error("Failed to insert submission_events row:", eventErr);
  }

  // 3. Update the submission row.
  const updatePayload: Record<string, unknown> = {
    status: toStatus,
    admin_approved: workflow.submissionUpdate.adminApproved,
    updated_at: workflow.submissionUpdate.updatedAt,
  };
  if (toStatus === "published") {
    updatePayload.published_at = workflow.submissionUpdate.updatedAt;
  }

  const { error: updateErr } = await supabase
    .from("submissions")
    .update(updatePayload)
    .eq("id", submission!.id);

  if (updateErr) {
    console.error("Failed to update submission:", updateErr);
    errorRedirect("update_failed", submissionId);
  }

  console.info("LRPR admin decision persisted", {
    submissionId: submission!.id,
    fromStatus,
    toStatus,
    decision: workflow.decision.decision,
    reviewerProfileId: reviewerProfile.id,
    canPublish: workflow.publishGate.canPublish,
  });

  // ── Publish to published_listings ──────────────────────────────────────
  // When the submission reaches "published" status, build a full Listing
  // object and upsert it into published_listings so it becomes live on the
  // public site. Wrapped in try/catch so any failure here cannot break the
  // existing admin decision flow.
  if (toStatus === "published") {
    try {
      const sub = submission as unknown as SubmissionRow;

      // Enrich the address with free public-data APIs before building the listing.
      const facts = await enrichAddress({
        latitude: sub.latitude,
        longitude: sub.longitude,
        address: sub.address_line ?? "",
      });

      // Derive the slug — id suffix avoids slug collisions across cities.
      const listingSlug = slugify(
        `${sub.address_line ?? "listing"}-${sub.city ?? ""}-${sub.id.slice(0, 8)}`,
      );

      // Map submission_type → ListingType.
      const listingType: ListingType =
        sub.submission_type === "rental-listing" ? "for-rent" : "for-sale";

      // Map listing_status → ListingStatus, defaulting to "active".
      const validStatuses: ListingStatus[] = ["active", "pending", "sold", "archived"];
      const listingStatus: ListingStatus =
        sub.listing_status && (validStatuses as string[]).includes(sub.listing_status)
          ? (sub.listing_status as ListingStatus)
          : "active";

      // Sort photos by ordering and extract URLs.
      const sortedPhotos = (sub.photos ?? [])
        .slice()
        .sort((a, b) => (a.ordering ?? 0) - (b.ordering ?? 0));
      const photoUrls = sortedPhotos.map((p) => p.url);
      const heroPhoto: string | undefined = photoUrls[0];

      const price = sub.price_or_rent ?? "Contact for price";
      const beds: number | undefined = sub.beds ?? undefined;
      const baths: number | undefined = sub.baths ?? undefined;

      // Derive a stable numeric id from the slug (used only as a React key).
      let numericId = 0;
      for (let i = 0; i < listingSlug.length; i++) {
        numericId = (numericId * 31 + listingSlug.charCodeAt(i)) >>> 0;
      }
      // Ensure positive and non-zero.
      const stableId = (numericId % 2_000_000_000) + 1;

      // Derive a readable category from property_type.
      const category = sub.property_type
        ? sub.property_type
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())
        : "Property";

      const detail = `${beds ?? "—"} bed · ${baths ?? "—"} bath`;

      const description =
        sub.notes?.trim() ||
        `${sub.property_type ?? "Property"} in ${sub.city ?? "the Lake Region"}, ${sub.county ?? "FL"}.`;

      const listing: Listing = {
        id: stableId,
        slug: listingSlug,
        address: sub.address_line ?? "Listing",
        city: sub.city ?? "",
        county: sub.county ?? "",
        state: sub.state ?? "FL",
        postalCode: sub.postal_code ?? "",
        latitude: sub.latitude ?? 0,
        longitude: sub.longitude ?? 0,
        type: listingType,
        status: listingStatus,
        category,
        price,
        beds,
        baths,
        detail,
        description,
        heroPhoto,
        photos: photoUrls,
        listedBy: (sub.listed_by as unknown as ListedBy) ?? undefined,
        publicDataFacts: facts,
      };

      const { error: upsertErr } = await supabase
        .from("published_listings")
        .upsert(
          {
            submission_id: sub.id,
            slug: listingSlug,
            title: sub.address_line ?? "Listing",
            public_status: listingStatus,
            city: sub.city ?? "",
            county: sub.county ?? "",
            latitude: sub.latitude ?? null,
            longitude: sub.longitude ?? null,
            photos: sub.photos ?? [],
            listed_by: sub.listed_by ?? {},
            listing_data: listing,
            public_data: { facts },
            published_at: new Date().toISOString(),
          },
          { onConflict: "slug" },
        );

      if (upsertErr) {
        console.error("[admin] Failed to upsert published_listings:", upsertErr);
      } else {
        console.info("[admin] Listing published to published_listings:", listingSlug);
      }

      // Update enrichment status on the submission row.
      await supabase
        .from("submissions")
        .update({
          enrichment_status: facts.length > 0 ? "succeeded" : "failed",
        })
        .eq("id", sub.id);
    } catch (publishErr) {
      // Non-fatal — log and continue. The submission update + redirect still runs.
      console.error("[admin] Unexpected error publishing listing:", publishErr);
    }
  }

  // Refresh the admin queue so the changed row reflects new status immediately.
  revalidatePath("/admin");

  // Send decision email to the submitter.
  try {
    const sub = submission as unknown as SubmissionRow;
    const contactEmail = sub.contact_email ?? null;
    if (contactEmail) {
      const email = buildDecisionEmail({
        decision: workflow.decision.decision,
        address: sub.address_line ?? submission!.id,
        notes: workflow.decision.notes,
      });
      await notify(supabase, {
        submissionId: submission!.id,
        to: contactEmail,
        ...email,
        templateKey: `property_submission.${workflow.decision.decision}`,
        payload: { decision: workflow.decision.decision },
      });
    }
  } catch (decisionEmailErr) {
    // Non-fatal — never break the redirect.
    console.error("[admin] Unexpected error sending decision email:", decisionEmailErr);
  }

  redirect(
    `/admin?decision=${workflow.decision.decision}&submission=${encodeURIComponent(submission!.id)}&status=${toStatus}`,
  );
}
