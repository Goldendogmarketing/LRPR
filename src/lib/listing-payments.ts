import type { SupabaseClient } from "@supabase/supabase-js";
import { getStripe, siteOrigin } from "@/lib/stripe";

/**
 * One-time Stripe Price ID for an FSBO listing fee (set in env). FSBO users
 * join free and pay this once per listing at submission time.
 */
export function fsboListingPriceId(): string | null {
  return process.env.STRIPE_PRICE_FSBO_LISTING ?? null;
}

/** True when the FSBO per-listing fee is configured. */
export function listingFeeConfigured(): boolean {
  return Boolean(fsboListingPriceId());
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
  args: { submissionId: string; profileId: string; email?: string },
): Promise<string | null> {
  const priceId = fsboListingPriceId();
  if (!priceId) return null;

  const origin = siteOrigin();
  const metadata = {
    submissionId: args.submissionId,
    profileId: args.profileId,
    kind: "listing_fee",
  };

  const session = await getStripe()
    .checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
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
