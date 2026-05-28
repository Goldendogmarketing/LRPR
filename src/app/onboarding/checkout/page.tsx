import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { TIERS, isTierId, TIER_ACCENT_CLASSES } from "@/lib/tiers";

export const metadata = {
  title: "Complete your paid account | Lake Region Property Resource",
};

export const dynamic = "force-dynamic";

type CheckoutPageProps = {
  searchParams?: Promise<{ tier?: string }>;
};

export default async function CheckoutPlaceholderPage({
  searchParams,
}: CheckoutPageProps) {
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
            Almost done — Stripe checkout is wiring up next sprint.
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Your account is saved with the{" "}
            <span className="font-black text-slate-900">{tier.label}</span>{" "}
            tier. Once we wire Stripe in the next sprint, you&apos;ll come back
            here and pay to unlock these features:
          </p>

          <ul className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-700">
            {tier.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <span className="mt-0.5 text-cyan-700">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 rounded-2xl bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-950 ring-1 ring-amber-100">
            <p className="font-black text-amber-950">⏳ Payment pending</p>
            <p className="mt-1">
              Your account is marked as{" "}
              <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs">
                payment_required = true, payment_complete = false
              </code>
              . Premium {tier.label.toLowerCase()} features stay locked until
              checkout is complete.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white"
            >
              Continue to LRPR
            </Link>
            <Link
              href="/onboarding"
              className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200"
            >
              ← Pick a different tier
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
