import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { TIERS, isTierId, TIER_ACCENT_CLASSES, type TierId } from "@/lib/tiers";
import { hasAnyPrice, isSubscriptionTier } from "@/lib/stripe";
import { createCheckoutSession } from "./actions";

export const metadata = {
  title: "Complete your paid account | Lake Region Property Resource",
};

export const dynamic = "force-dynamic";

type CheckoutPageProps = {
  searchParams?: Promise<{ tier?: string; error?: string; checkout?: string }>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const tierParam = params?.tier ?? "";
  if (!isTierId(tierParam) || !TIERS[tierParam].requiresPayment) {
    redirect("/onboarding");
  }
  const tier = TIERS[tierParam];
  const accent = TIER_ACCENT_CLASSES[tier.accent];
  const isSub = isSubscriptionTier(tierParam as TierId);
  // Whether a Stripe Price ID is configured for this subscription tier yet.
  const priceReady = isSub && hasAnyPrice(tierParam as TierId);

  return (
    <main className="min-h-screen bg-[#f7f4ed] text-slate-950">
      <Header />
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[2.5rem] bg-white p-8 shadow-[0_18px_60px_rgba(15,23,42,0.08)] ring-1 ring-slate-200 sm:p-10">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] ${accent.chip}`}
          >
            {tier.label}
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
            Subscribe to {tier.label}
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            You&apos;re subscribing to the{" "}
            <span className="font-black text-slate-900">{tier.label}</span> tier.
            You&apos;ll be redirected to Stripe&apos;s secure checkout to complete
            payment. Your subscription unlocks:
          </p>

          <ul className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-700">
            {tier.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <span className="mt-0.5 text-cyan-700">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {params?.checkout === "cancelled" ? (
            <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-950 ring-1 ring-amber-100">
              Checkout was cancelled — you have not been charged. You can try again
              whenever you&apos;re ready.
            </div>
          ) : null}
          {params?.error ? (
            <div className="mt-6 rounded-2xl bg-rose-50 p-4 text-sm font-bold leading-6 text-rose-950 ring-1 ring-rose-100">
              {params.error}
            </div>
          ) : null}

          {!isSub ? (
            // FSBO (and any non-subscription paid tier): per-listing model.
            <div className="mt-8">
              <div className="rounded-2xl bg-cyan-50 p-4 text-sm font-bold leading-6 text-cyan-950 ring-1 ring-cyan-100">
                💡 {tier.label} listings are paid <strong>per listing</strong> —
                you&apos;ll pay a one-time fee when you submit a property, not a
                recurring subscription. Your free account is ready now; the
                listing fee is collected at submission.
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/submit-listing"
                  className="rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white hover:bg-slate-800"
                >
                  Submit a listing →
                </Link>
                <Link
                  href="/onboarding"
                  className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200"
                >
                  ← Pick a different tier
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-8">
                {priceReady ? (
                  <form action={createCheckoutSession}>
                    <input type="hidden" name="tier" value={tierParam} />
                    {/* Monthly / Annual cadence selector */}
                    <fieldset className="flex flex-wrap gap-3">
                      <legend className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                        Billing cadence
                      </legend>
                      <label className="flex cursor-pointer items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold ring-1 ring-slate-200 has-[:checked]:ring-2 has-[:checked]:ring-slate-900">
                        <input
                          type="radio"
                          name="cadence"
                          value="monthly"
                          defaultChecked
                        />
                        Monthly
                      </label>
                      <label className="flex cursor-pointer items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold ring-1 ring-slate-200 has-[:checked]:ring-2 has-[:checked]:ring-slate-900">
                        <input type="radio" name="cadence" value="annual" />
                        Annual{" "}
                        <span className="text-xs font-bold text-emerald-700">
                          (best value)
                        </span>
                      </label>
                    </fieldset>
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <button
                        type="submit"
                        className="rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-lg shadow-slate-900/15 hover:bg-slate-800"
                      >
                        Continue to secure checkout →
                      </button>
                      <Link
                        href="/onboarding"
                        className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200"
                      >
                        ← Pick a different tier
                      </Link>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="rounded-2xl bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-950 ring-1 ring-amber-100">
                      ⏳ Pricing for this tier isn&apos;t configured yet. Check
                      back shortly — the Stripe price is being set up.
                    </div>
                    <Link
                      href="/onboarding"
                      className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200"
                    >
                      ← Pick a different tier
                    </Link>
                  </div>
                )}
              </div>

              <p className="mt-4 text-xs text-slate-500">
                Secure payment processed by Stripe. Manage or cancel anytime from
                your account.
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
