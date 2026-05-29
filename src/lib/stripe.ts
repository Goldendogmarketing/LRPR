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

/**
 * Map a paid tier → its Stripe recurring Price ID (from env). Returns null
 * when the price isn't configured yet, so checkout can show a friendly
 * "pricing not set up" message instead of crashing.
 */
export function priceIdForTier(tier: TierId): string | null {
  const map: Record<TierId, string | undefined> = {
    free: undefined,
    fsbo: process.env.STRIPE_PRICE_FSBO,
    agent: process.env.STRIPE_PRICE_AGENT,
    investor: process.env.STRIPE_PRICE_INVESTOR,
    vendor: process.env.STRIPE_PRICE_VENDOR,
  };
  return map[tier] ?? null;
}

/**
 * Reverse map a Stripe Price ID → tier. Used as a fallback in the webhook
 * if subscription metadata is missing. Returns null if unknown.
 */
export function tierForPriceId(priceId: string): TierId | null {
  const entries: [TierId, string | undefined][] = [
    ["fsbo", process.env.STRIPE_PRICE_FSBO],
    ["agent", process.env.STRIPE_PRICE_AGENT],
    ["investor", process.env.STRIPE_PRICE_INVESTOR],
    ["vendor", process.env.STRIPE_PRICE_VENDOR],
  ];
  for (const [tier, id] of entries) {
    if (id && id === priceId) return tier;
  }
  return null;
}

/** Narrow an untrusted string to a TierId, else null. */
export function asTierId(value: string | null | undefined): TierId | null {
  return value && isTierId(value) ? value : null;
}

/** Site origin for Checkout success/cancel + portal return URLs. */
export function siteOrigin(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://lrpr.vercel.app";
}
