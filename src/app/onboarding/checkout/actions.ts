"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  getStripe,
  priceIdForTier,
  siteOrigin,
} from "@/lib/stripe";
import {
  createSupabaseServerClient,
  getOrCreateProfile,
} from "@/lib/supabase/server";
import { TIERS, isTierId } from "@/lib/tiers";

/**
 * Create a Stripe Checkout Session (subscription mode) for the selected paid
 * tier and redirect the user to Stripe's hosted checkout. On success Stripe
 * sends the user to /account?checkout=success and fires the webhook that
 * flips payment_complete + records the subscription.
 */
export async function createCheckoutSession(formData: FormData) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/onboarding");

  const tierRaw = String(formData.get("tier") ?? "");
  if (!isTierId(tierRaw) || !TIERS[tierRaw].requiresPayment) {
    redirect("/onboarding");
  }
  const tier = tierRaw;

  const priceId = priceIdForTier(tier);
  if (!priceId) {
    redirect(
      `/onboarding/checkout?tier=${tier}&error=${encodeURIComponent(
        "Pricing isn't configured for this tier yet. Please contact support.",
      )}`,
    );
  }

  const user = await currentUser();
  const primaryEmail =
    user?.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress ??
    user?.emailAddresses[0]?.emailAddress ??
    undefined;
  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || null;

  const supabase = createSupabaseServerClient();
  const profile = await getOrCreateProfile(supabase, {
    clerkUserId: userId,
    email: primaryEmail ?? "unknown@lrpr.local",
    fullName,
  });

  const origin = siteOrigin();
  const metadata = { profileId: profile.id, clerkUserId: userId, tier };

  const session = await getStripe()
    .checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      // Reuse an existing Stripe customer when we already have one, else let
      // Checkout create one and prefill the email.
      customer: profile.stripe_customer_id ?? undefined,
      customer_email: profile.stripe_customer_id ? undefined : primaryEmail,
      client_reference_id: profile.id,
      metadata,
      subscription_data: { metadata },
      allow_promotion_codes: true,
      success_url: `${origin}/account?checkout=success`,
      cancel_url: `${origin}/onboarding/checkout?tier=${tier}&checkout=cancelled`,
    })
    .catch((err) => {
      console.error("Stripe checkout session create failed:", err);
      return null;
    });

  if (!session?.url) {
    redirect(
      `/onboarding/checkout?tier=${tier}&error=${encodeURIComponent(
        "Could not start checkout. Please try again.",
      )}`,
    );
  }

  redirect(session.url);
}
