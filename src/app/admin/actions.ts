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

  // Refresh the admin queue so the changed row reflects new status immediately.
  revalidatePath("/admin");

  redirect(
    `/admin?decision=${workflow.decision.decision}&submission=${encodeURIComponent(submission!.id)}&status=${toStatus}`,
  );
}
