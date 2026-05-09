"use server";

import { redirect } from "next/navigation";
import {
  appendLocalSubmission,
  buildAdminNotification,
  buildCheckoutIntent,
  createSubmissionRecord,
  formDataToSubmissionInput,
} from "@/lib/submission-pipeline";
import {
  buildResendEmailRequest,
  buildStripeCheckoutSessionRequest,
  buildSupabaseInsertRequest,
} from "@/lib/integration-clients";

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
  const supabaseInsert = buildSupabaseInsertRequest({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    table: "submissions",
    payload: record,
  });
  const adminEmail = buildResendEmailRequest({
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.RESEND_FROM_EMAIL,
    to: process.env.ADMIN_NOTIFICATION_EMAIL,
    subject: notification.subject,
    html: `<p>${notification.preview}</p><p>Submission: ${record.id}</p><p>Status: ${record.status}</p>`,
  });
  const stripeSession = buildStripeCheckoutSessionRequest({
    secretKey: process.env.STRIPE_SECRET_KEY,
    priceId: checkout.priceId ?? undefined,
    successUrl: process.env.STRIPE_SUCCESS_URL ?? "http://localhost:3000/submit-listing?checkout=success",
    cancelUrl: process.env.STRIPE_CANCEL_URL ?? "http://localhost:3000/submit-listing?checkout=cancelled",
    metadata: { submissionId: record.id, submissionType: record.submissionType },
  });

  // These console messages intentionally stand in for Supabase, Resend, and Stripe until API keys are configured.
  console.info("LRPR submission saved", { submissionId: record.id, status: record.status, persistence, supabaseReady: supabaseInsert.ready });
  console.info("LRPR admin notification queued", { notification, emailReady: adminEmail.ready });
  console.info("LRPR checkout intent", { checkout, stripeReady: stripeSession.ready });

  redirect(`/submit-listing?submitted=${record.id}&status=${record.status}&checkout=${checkout.status}`);
}
