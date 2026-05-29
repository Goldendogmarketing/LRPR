"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  buildAdminNotification,
  buildCheckoutIntent,
  createSubmissionRecord,
  formDataToSubmissionInput,
} from "@/lib/submission-pipeline";
import {
  createSupabaseServerClient,
  getOrCreateProfile,
} from "@/lib/supabase/server";
import {
  LISTING_PHOTOS_BUCKET,
  uploadToBucket,
  validatePhotoFile,
  type StoredPhoto,
} from "@/lib/supabase/storage";
import { canSubmitListings } from "@/lib/tiers";
import { geocodeAddress } from "@/lib/geocoding";

function toNumberOrNull(value: string): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Pull File entries from a FormData field. Browsers can include an empty
 * File when the user picked nothing, so we also strip zero-byte entries.
 */
function extractFiles(formData: FormData, name: string): File[] {
  const raw = formData.getAll(name);
  const files: File[] = [];
  for (const v of raw) {
    if (typeof v === "string") continue;
    // FormData values that aren't strings are File-like Blobs in Next.js.
    if (v && typeof v === "object" && "size" in v && v.size > 0) {
      files.push(v as File);
    }
  }
  return files;
}

export async function submitListingAction(formData: FormData) {
  // Defense in depth: middleware should have redirected unauthenticated users
  // away from /submit-listing already, but server actions can be invoked
  // independently — re-check here.
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/submit-listing");
  }

  const payload = formDataToSubmissionInput(formData);
  const result = createSubmissionRecord({
    ...payload,
    // Trust Clerk's authentication as the "account_validated" gate signal.
    accountValidated: true,
    // Required permission checkbox on the form. This satisfies the
    // permission_confirmed publish gate so admin approval can reach
    // publish_ready. An unchecked/absent value leaves it false, which
    // correctly blocks publishing.
    permissionConfirmed: formData.get("permissionConfirmed") === "on",
  });

  if (!result.ok) {
    redirect(
      `/submit-listing?error=${encodeURIComponent(result.errors.join(", "))}`,
    );
  }

  const record = result.record;
  const checkout = buildCheckoutIntent(record);
  const notification = buildAdminNotification(record);

  // Resolve the Clerk user → Supabase profile so we can link the submission.
  const user = await currentUser();
  const primaryEmail =
    user?.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress ?? user?.emailAddresses[0]?.emailAddress ?? "unknown@lrpr.local";
  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || null;

  const supabase = createSupabaseServerClient();
  const profile = await getOrCreateProfile(supabase, {
    clerkUserId: userId,
    email: primaryEmail,
    fullName,
  });

  // Defense in depth: re-check tier authorization on the server even though
  // the page-level check already gated rendering. A signed-in user could
  // POST to this action directly with a malformed tier; we reject here.
  const isAdmin = user?.publicMetadata?.role === "admin";
  if (!canSubmitListings({ profileRole: profile.role, isAdmin })) {
    // Send them back to the listing page which will render the upgrade UI.
    redirect("/submit-listing");
  }

  // Upload photos before inserting the submission row so the row carries
  // the final URLs from the jump. If any photo fails validation, surface
  // the error and abort before writing anything to the DB.
  const incomingFiles = extractFiles(formData, "photos");
  const uploadedPhotos: StoredPhoto[] = [];
  for (const file of incomingFiles) {
    const reason = validatePhotoFile(file);
    if (reason) {
      redirect(`/submit-listing?error=${encodeURIComponent(reason)}`);
    }
    try {
      const stored = await uploadToBucket(supabase, {
        bucket: LISTING_PHOTOS_BUCKET,
        prefix: `submissions/${profile.id}`,
        file,
        originalName: file.name,
      });
      uploadedPhotos.push(stored);
    } catch (err) {
      console.error("Listing photo upload failed:", err);
      redirect(
        `/submit-listing?error=${encodeURIComponent(
          "Failed to upload one of the photos. Please try again.",
        )}`,
      );
    }
  }

  // Snapshot the submitter's profile customization at submission time so
  // later profile edits don't silently rewrite this listing's agent block.
  // The immersive template merges this snapshot with live profile values
  // via resolveListedBy() in src/lib/listing-presentation.ts.
  const { data: profileRow } = await supabase
    .from("profiles")
    .select(
      "display_name, brokerage, phone, headshot_url, tagline, accent_color",
    )
    .eq("id", profile.id)
    .maybeSingle();

  const listedBySnapshot = {
    profileId: profile.id,
    displayName: profileRow?.display_name ?? fullName ?? null,
    brokerage: profileRow?.brokerage ?? null,
    phone: profileRow?.phone ?? null,
    email: primaryEmail,
    headshotUrl: profileRow?.headshot_url ?? null,
    tagline: profileRow?.tagline ?? null,
    accentColor: profileRow?.accent_color ?? null,
  };

  const geo = await geocodeAddress(record.propertyAddress);

  const { data, error } = await supabase
    .from("submissions")
    .insert({
      submitter_profile_id: profile.id,
      submission_type: record.submissionType,
      status: record.status,
      source_type: record.sourceType,
      listing_status: record.listingStatus,
      property_type: record.propertyType,
      contact_name: record.contactName || fullName,
      contact_email: record.contactMethod || primaryEmail,
      address_line: record.propertyAddress,
      price_or_rent: record.priceOrRent,
      beds: toNumberOrNull(record.beds),
      baths: toNumberOrNull(record.baths),
      notes: record.notes,
      account_validated: true,
      payment_required: record.paymentRequired,
      payment_complete: record.paymentComplete,
      admin_approved: record.adminApproved,
      permission_confirmed: record.permissionConfirmed,
      photos: uploadedPhotos.map((p, i) => ({
        url: p.url,
        key: p.key,
        ordering: i,
        contentType: p.contentType,
      })),
      listed_by: listedBySnapshot,
      geocoding_status: geo.ok ? "succeeded" : "failed",
      latitude: geo.ok ? geo.latitude : null,
      longitude: geo.ok ? geo.longitude : null,
      geocoded_at: new Date().toISOString(),
      city: geo.ok ? geo.city : null,
      county: geo.ok ? geo.county : null,
      state: geo.ok ? (geo.state ?? "FL") : "FL",
      postal_code: geo.ok ? geo.postalCode : null,
    })
    .select("id, status")
    .single();

  if (error) {
    console.error("Supabase submissions insert failed:", error);
    redirect(
      `/submit-listing?error=${encodeURIComponent("Could not save submission: " + error.message)}`,
    );
  }

  // TODO (next sprint): queue Resend admin notification using `notification`,
  // and queue Stripe checkout when paid lanes return.
  console.info("LRPR submission persisted", {
    submissionId: data.id,
    status: data.status,
    profileId: profile.id,
    clerkUserId: userId,
    notificationTo: notification.to,
    checkoutStatus: checkout.status,
    geocoded: geo.ok,
  });

  redirect(
    `/submit-listing?submitted=${data.id}&status=${data.status}&checkout=${checkout.status}`,
  );
}
