"use server";

import { redirect } from "next/navigation";
import { buildAdminDecisionWorkflow } from "@/lib/admin-workflow";
import { buildResendEmailRequest, buildSupabaseInsertRequest } from "@/lib/integration-clients";

export async function adminDecisionAction(formData: FormData) {
  const submissionId = String(formData.get("submissionId") ?? "");
  const decision = String(formData.get("decision") ?? "changes_requested");
  const notes = String(formData.get("notes") ?? "");

  // Static scaffold record until the admin queue reads live Supabase submissions.
  const workflow = buildAdminDecisionWorkflow({
    submission: {
      id: submissionId,
      status: "pending_review",
      accountValidated: true,
      paymentRequired: false,
      paymentComplete: false,
      adminApproved: false,
      permissionConfirmed: decision === "approved",
    },
    decisionInput: {
      submissionId,
      decision,
      reviewerId: process.env.LRPR_ADMIN_REVIEWER_ID || "admin-scaffold",
      notes,
    },
  });

  if (!workflow.ok) {
    redirect(`/admin?decision=error&submission=${encodeURIComponent(submissionId)}`);
  }

  const reviewInsert = buildSupabaseInsertRequest({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    table: "admin_reviews",
    payload: workflow.reviewRecord,
  });
  const eventInsert = buildSupabaseInsertRequest({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    table: "submission_events",
    payload: workflow.eventRecord,
  });
  const submitterEmail = buildResendEmailRequest({
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.RESEND_FROM_EMAIL,
    to: workflow.notification.to ?? undefined,
    subject: workflow.notification.subject,
    html: `<p>${workflow.notification.preview}</p><p>Status: ${workflow.submissionUpdate.status}</p>`,
  });

  // Real version: verify Clerk admin role, update the submission row, insert these records, and queue Resend.
  console.info("LRPR admin decision scaffold", {
    decision: workflow.decision,
    submissionUpdate: workflow.submissionUpdate,
    publishGate: workflow.publishGate,
    reviewReady: reviewInsert.ready,
    eventReady: eventInsert.ready,
    emailReady: submitterEmail.ready,
  });

  redirect(`/admin?decision=${workflow.decision.decision}&submission=${encodeURIComponent(submissionId)}&status=${workflow.submissionUpdate.status}`);
}
