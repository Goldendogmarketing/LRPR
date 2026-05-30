import type { SupabaseClient } from "@supabase/supabase-js";
import { getStripe, siteOrigin } from "@/lib/stripe";

/**
 * One-time Stripe Price ID for an FSBO listing fee (set in env). Two tiers:
 *   standard ($350) -> classic presentation
 *   upgraded ($450) -> immersive presentation
 * FSBO users join free and pay this once per listing at submission time.
 */
export function fsboListingPriceId(upgraded: boolean): string | null {
  return (
    (upgraded
      ? process.env.STRIPE_PRICE_FSBO_UPGRADED
      : process.env.STRIPE_PRICE_FSBO_STANDARD) ?? null
  );
}

/** True when at least the standard FSBO listing fee is configured. */
export function listingFeeConfigured(): boolean {
  return Boolean(process.env.STRIPE_PRICE_FSBO_STANDARD);
}

/**
 * Create a one-time Stripe Checkout Session (payment mode) for an FSBO
 * listing fee, and record a pending row in the `payments` table. Returns the
 * hosted checkout URL, or null on misconfig / Stripe error so the caller can
 * fall back gracefully.
 *
 * The webhook (checkout.session.completed, mode=payment) flips the submission
 * to payment_complete + pending_review and marks the payment paid.
 */
export async function createListingCheckoutSession(
  supabase: SupabaseClient,
  args: {
    submissionId: string;
    profileId: string;
    email?: string;
    upgraded: boolean;
  },
): Promise<string | null> {
  const priceId = fsboListingPriceId(args.upgraded);
  // Fall back to standard if the upgraded price isn't configured yet.
  const effectivePriceId = priceId ?? fsboListingPriceId(false);
  if (!effectivePriceId) return null;

  const origin = siteOrigin();
  const metadata = {
    submissionId: args.submissionId,
    profileId: args.profileId,
    kind: "listing_fee",
    upgraded: args.upgraded ? "1" : "0",
  };

  const session = await getStripe()
    .checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: effectivePriceId, quantity: 1 }],
      customer_email: args.email,
      client_reference_id: args.submissionId,
      metadata,
      payment_intent_data: { metadata },
      success_url: `${origin}/submit-listing?paid=${args.submissionId}`,
      cancel_url: `${origin}/submit-listing?payment_cancelled=${args.submissionId}`,
    })
    .catch((err) => {
      console.error("FSBO listing checkout session failed:", err);
      return null;
    });

  if (!session?.url) return null;

  // Best-effort: record a pending payment row tied to the submission.
  const { error } = await supabase.from("payments").insert({
    submission_id: args.submissionId,
    stripe_checkout_session_id: session.id,
    amount_cents: session.amount_total ?? null,
    currency: session.currency ?? "usd",
    status: "pending",
  });
  if (error) {
    console.error("Failed to record pending payment row:", error.message);
  }

  return session.url;
}
