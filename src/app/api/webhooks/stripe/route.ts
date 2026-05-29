import type Stripe from "stripe";
import { getStripe, asTierId, tierForPriceId } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Stripe signature verification needs the Node runtime + the raw request body.
export const runtime = "nodejs";

/**
 * Stripe webhook. Verifies the signature, then reconciles subscription state
 * onto the profile:
 *   - checkout.session.completed     → payment_complete=true, store customer/sub, set role
 *   - customer.subscription.updated  → mirror status, payment_complete = active/trialing
 *   - customer.subscription.deleted  → payment_complete=false, status=canceled
 *
 * Returns 200 for handled + ignored events so Stripe stops retrying; 400 only
 * on signature failure; 500 if the secret is unset or a handler throws.
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return new Response("Stripe webhook secret not configured", { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error("Stripe signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  const supabase = createSupabaseServerClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const profileId = s.metadata?.profileId;
        if (profileId) {
          const update: Record<string, unknown> = {
            payment_required: true,
            payment_complete: true,
            subscription_status: "active",
            stripe_customer_id:
              typeof s.customer === "string" ? s.customer : s.customer?.id ?? null,
            stripe_subscription_id:
              typeof s.subscription === "string"
                ? s.subscription
                : s.subscription?.id ?? null,
            updated_at: new Date().toISOString(),
          };
          const tier = asTierId(s.metadata?.tier);
          if (tier) update.role = tier;
          await supabase.from("profiles").update(update).eq("id", profileId);
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const deleted = event.type === "customer.subscription.deleted";
        const active = sub.status === "active" || sub.status === "trialing";

        const update: Record<string, unknown> = {
          subscription_status: deleted ? "canceled" : sub.status,
          payment_complete: deleted ? false : active,
          stripe_subscription_id: sub.id,
          updated_at: new Date().toISOString(),
        };

        // Prefer profileId from metadata; fall back to matching customer id.
        const profileId = sub.metadata?.profileId;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer?.id;

        // Keep role in sync if the tier metadata or price reveals it.
        const priceId = sub.items?.data?.[0]?.price?.id;
        const tier =
          asTierId(sub.metadata?.tier) ?? (priceId ? tierForPriceId(priceId) : null);
        if (tier && !deleted) update.role = tier;

        if (profileId) {
          await supabase.from("profiles").update(update).eq("id", profileId);
        } else if (customerId) {
          await supabase
            .from("profiles")
            .update(update)
            .eq("stripe_customer_id", customerId);
        }
        break;
      }

      default:
        // Ignore other events.
        break;
    }
  } catch (err) {
    console.error("Stripe webhook handler error:", err);
    return new Response("Handler error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
