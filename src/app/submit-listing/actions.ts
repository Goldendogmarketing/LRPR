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
import { canSubmitListings } from "@/lib/tiers";

function toNumberOrNull(value: string): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
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
  });

  redirect(
    `/submit-listing?submitted=${data.id}&status=${data.status}&checkout=${checkout.status}`,
  );
}
