#!/usr/bin/env node
/**
 * One-off: create LRPR's Stripe products, prices, and webhook endpoint, then
 * print the env-var assignments. Run with the desired-mode secret key:
 *   STRIPE_SECRET_KEY=sk_test_... node scripts/setup-stripe-products.mjs
 *
 * Re-running creates DUPLICATE products — run once per environment.
 */
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("Missing STRIPE_SECRET_KEY");
  process.exit(1);
}
const stripe = new Stripe(key);
const WEBHOOK_URL = process.env.WEBHOOK_URL || "https://lrpr.vercel.app/api/webhooks/stripe";

async function recurringPrice(productId, amountCents, interval, nickname) {
  return stripe.prices.create({
    product: productId,
    currency: "usd",
    unit_amount: amountCents,
    nickname,
    recurring: { interval },
  });
}
async function oneTimePrice(productId, amountCents, nickname) {
  return stripe.prices.create({
    product: productId,
    currency: "usd",
    unit_amount: amountCents,
    nickname,
  });
}

const out = {};

// Agent ($30/mo, $270/yr)
const agent = await stripe.products.create({ name: "LRPR Agent" });
out.STRIPE_PRICE_AGENT_MONTHLY = (await recurringPrice(agent.id, 3000, "month", "Agent Monthly")).id;
out.STRIPE_PRICE_AGENT_ANNUAL = (await recurringPrice(agent.id, 27000, "year", "Agent Annual")).id;

// Vendor ($50/mo, $450/yr)
const vendor = await stripe.products.create({ name: "LRPR Vendor" });
out.STRIPE_PRICE_VENDOR_MONTHLY = (await recurringPrice(vendor.id, 5000, "month", "Vendor Monthly")).id;
out.STRIPE_PRICE_VENDOR_ANNUAL = (await recurringPrice(vendor.id, 45000, "year", "Vendor Annual")).id;

// FSBO listing fee, one-time ($350 standard, $450 immersive upgrade)
const fsbo = await stripe.products.create({ name: "LRPR FSBO Listing" });
out.STRIPE_PRICE_FSBO_STANDARD = (await oneTimePrice(fsbo.id, 35000, "FSBO Standard Listing")).id;
out.STRIPE_PRICE_FSBO_UPGRADED = (await oneTimePrice(fsbo.id, 45000, "FSBO Immersive Upgrade Listing")).id;

// Webhook — remove any existing endpoint for our URL, then create fresh so we
// can capture the signing secret (only returned at creation time).
const existing = await stripe.webhookEndpoints.list({ limit: 100 });
for (const e of existing.data) {
  if (e.url === WEBHOOK_URL) await stripe.webhookEndpoints.del(e.id);
}
const wh = await stripe.webhookEndpoints.create({
  url: WEBHOOK_URL,
  enabled_events: [
    "checkout.session.completed",
    "customer.subscription.updated",
    "customer.subscription.deleted",
  ],
});
out.STRIPE_WEBHOOK_SECRET = wh.secret;

for (const [k, v] of Object.entries(out)) {
  console.log(`${k}=${v}`);
}
