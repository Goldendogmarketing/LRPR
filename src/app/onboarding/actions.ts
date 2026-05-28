"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  createSupabaseServerClient,
  getOrCreateProfile,
} from "@/lib/supabase/server";
import { TIERS, isTierId } from "@/lib/tiers";

export async function setTierAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/onboarding");
  }

  const rawTier = String(formData.get("tier") ?? "");
  if (!isTierId(rawTier)) {
    redirect(
      `/onboarding?error=${encodeURIComponent("Please pick a valid account type.")}`,
    );
  }
  const tierId = rawTier;
  const tier = TIERS[tierId];

  const user = await currentUser();
  const primaryEmail =
    user?.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress ??
    user?.emailAddresses[0]?.emailAddress ??
    "unknown@lrpr.local";
  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || null;

  const supabase = createSupabaseServerClient();

  // Ensure a profile exists for this Clerk user.
  const profile = await getOrCreateProfile(supabase, {
    clerkUserId: userId,
    email: primaryEmail,
    fullName,
  });

  // Update the profile with the chosen tier.
  const { error } = await supabase
    .from("profiles")
    .update({
      role: tierId,
      tier_selected_at: new Date().toISOString(),
      payment_required: tier.requiresPayment,
      // payment_complete stays false for paid tiers until Stripe webhook flips it.
      payment_complete: !tier.requiresPayment,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profile.id);

  if (error) {
    console.error("Failed to save tier selection:", error);
    redirect(
      `/onboarding?error=${encodeURIComponent("Could not save your selection: " + error.message)}`,
    );
  }

  console.info("LRPR tier selected", {
    clerkUserId: userId,
    profileId: profile.id,
    tier: tierId,
    paymentRequired: tier.requiresPayment,
  });

  if (tier.requiresPayment) {
    redirect(`/onboarding/checkout?tier=${tierId}`);
  }

  redirect("/?welcome=1");
}
