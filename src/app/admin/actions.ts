"use server";

import { redirect } from "next/navigation";

type AdminDecision = "approved" | "changes_requested" | "rejected";

const labels: Record<AdminDecision, string> = {
  approved: "approved",
  changes_requested: "changes requested",
  rejected: "rejected",
};

export async function adminDecisionAction(formData: FormData) {
  const submissionId = String(formData.get("submissionId") ?? "");
  const rawDecision = String(formData.get("decision") ?? "changes_requested") as AdminDecision;
  const decision = rawDecision in labels ? rawDecision : "changes_requested";

  // Real version: verify Clerk admin role, write admin_reviews/submission_events, update submission status, queue Resend email.
  console.info("LRPR admin decision scaffold", {
    submissionId,
    decision,
    label: labels[decision],
    next: "Persist to Supabase admin_reviews and submission_events when database credentials are configured.",
  });

  redirect(`/admin?decision=${decision}&submission=${encodeURIComponent(submissionId)}`);
}
