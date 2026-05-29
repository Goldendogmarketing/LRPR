import Stripe from "stripe";
import { isTierId, type TierId } from "@/lib/tiers";

/**
 * Server-only Stripe client. Import only in server actions / route handlers.
 * Throws if STRIPE_SECRET_KEY is missing so misconfig fails loud server-side
 * (never reaches the browser).
 */
let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  if (!_stripe) {
    // Omit apiVersion → use the version pinned by the installed SDK.
    _stripe = new Stripe(key);
  }
  return _stripe;
}

/** True when a Stripe secret key is configured (lets callers degrade gracefully). */
export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export type Cadence = "monthly" | "annual";

/**
 * Tiers billed as a recurring Stripe subscription (Checkout mode "subscription").
 * Agent + Vendor are ongoing; FSBO is a one-time per-listing fee (handled at
 * submission time, not here); Investor is "coming soon"; Free is $0.
 */
export const SUBSCRIPTION_TIERS: TierId[] = ["agent", "vendor"];

export function isSubscriptionTier(tier: TierId): boolean {
  return SUBSCRIPTION_TIERS.includes(tier);
}

/**
 * Map a subscription tier + cadence → its Stripe recurring Price ID (from env).
 * Returns null when not configured yet, so checkout can show a friendly
 * "pricing not set up" message instead of crashing.
 *
 * Env vars (set in Vercel):
 *   STRIPE_PRICE_AGENT_MONTHLY / STRIPE_PRICE_AGENT_ANNUAL
 *   STRIPE_PRICE_VENDOR_MONTHLY / STRIPE_PRICE_VENDOR_ANNUAL
 */
export function priceIdFor(tier: TierId, cadence: Cadence): string | null {
  const env = process.env;
  switch (tier) {
    case "agent":
      return (
        (cadence === "annual"
          ? env.STRIPE_PRICE_AGENT_ANNUAL
          : env.STRIPE_PRICE_AGENT_MONTHLY) ?? null
      );
    case "vendor":
      return (
        (cadence === "annual"
          ? env.STRIPE_PRICE_VENDOR_ANNUAL
          : env.STRIPE_PRICE_VENDOR_MONTHLY) ?? null
      );
    default:
      // fsbo (one-time, handled at submission), investor (coming soon), free
      return null;
  }
}

/** True if either cadence has a configured price for this subscription tier. */
export function hasAnyPrice(tier: TierId): boolean {
  return Boolean(priceIdFor(tier, "monthly") || priceIdFor(tier, "annual"));
}

/**
 * Reverse map a Stripe Price ID → tier. Used as a fallback in the webhook
 * when subscription metadata is missing. Checks all configured prices.
 */
export function tierForPriceId(priceId: string): TierId | null {
  const env = process.env;
  const table: [TierId, (string | undefined)[]][] = [
    ["agent", [env.STRIPE_PRICE_AGENT_MONTHLY, env.STRIPE_PRICE_AGENT_ANNUAL]],
    ["vendor", [env.STRIPE_PRICE_VENDOR_MONTHLY, env.STRIPE_PRICE_VENDOR_ANNUAL]],
  ];
  for (const [tier, ids] of table) {
    if (ids.some((id) => id && id === priceId)) return tier;
  }
  return null;
}

/** Normalize an untrusted cadence string. Defaults to monthly. */
export function asCadence(value: string | null | undefined): Cadence {
  return value === "annual" ? "annual" : "monthly";
}

/** Narrow an untrusted string to a TierId, else null. */
export function asTierId(value: string | null | undefined): TierId | null {
  return value && isTierId(value) ? value : null;
}

/** Site origin for Checkout success/cancel + portal return URLs. */
export function siteOrigin(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://lrpr.vercel.app";
}
