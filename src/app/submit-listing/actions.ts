"use server";

import { redirect } from "next/navigation";
import {
  buildAdminNotification,
  buildCheckoutIntent,
  createSubmissionRecord,
  formDataToSubmissionInput,
} from "@/lib/submission-pipeline";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function toNumberOrNull(value: string): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function submitListingAction(formData: FormData) {
  const payload = formDataToSubmissionInput(formData);
  const result = createSubmissionRecord(payload);

  if (!result.ok) {
    redirect(
      `/submit-listing?error=${encodeURIComponent(result.errors.join(", "))}`,
    );
  }

  const record = result.record;
  const checkout = buildCheckoutIntent(record);
  const notification = buildAdminNotification(record);

  // Persist to Supabase. We let Postgres generate the id (gen_random_uuid),
  // and we map the in-memory record to the DB column shape.
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("submissions")
    .insert({
      submission_type: record.submissionType,
      status: record.status,
      source_type: record.sourceType,
      listing_status: record.listingStatus,
      property_type: record.propertyType,
      contact_name: record.contactName,
      // The form has a single "contactMethod" field — dump into email for now.
      // When we split email/phone in the form (or add Clerk profile), refine this.
      contact_email: record.contactMethod,
      address_line: record.propertyAddress,
      price_or_rent: record.priceOrRent,
      beds: toNumberOrNull(record.beds),
      baths: toNumberOrNull(record.baths),
      notes: record.notes,
      account_validated: record.accountValidated,
      payment_required: record.paymentRequired,
      payment_complete: record.paymentComplete,
      admin_approved: record.adminApproved,
      permission_confirmed: record.permissionConfirmed,
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
    notificationTo: notification.to,
    checkoutStatus: checkout.status,
  });

  redirect(
    `/submit-listing?submitted=${data.id}&status=${data.status}&checkout=${checkout.status}`,
  );
}
