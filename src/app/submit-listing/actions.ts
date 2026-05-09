"use server";

import { redirect } from "next/navigation";
import {
  appendLocalSubmission,
  buildAdminNotification,
  buildCheckoutIntent,
  createSubmissionRecord,
  formDataToSubmissionInput,
} from "@/lib/submission-pipeline";

export async function submitListingAction(formData: FormData) {
  const payload = formDataToSubmissionInput(formData);
  const result = createSubmissionRecord(payload);

  if (!result.ok) {
    redirect(`/submit-listing?error=${encodeURIComponent(result.errors.join(", "))}`);
  }

  const record = result.record;
  const persistence = await appendLocalSubmission(record);

  const notification = buildAdminNotification(record);
  const checkout = buildCheckoutIntent(record);

  // These console messages intentionally stand in for Supabase, Resend, and Stripe until API keys are configured.
  console.info("LRPR submission saved", { submissionId: record.id, status: record.status, persistence });
  console.info("LRPR admin notification queued", notification);
  console.info("LRPR checkout intent", checkout);

  redirect(`/submit-listing?submitted=${record.id}&status=${record.status}&checkout=${checkout.status}`);
}
