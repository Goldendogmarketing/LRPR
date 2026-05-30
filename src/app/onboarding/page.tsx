import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { TIERS, VISIBLE_TIER_IDS, TIER_ACCENT_CLASSES } from "@/lib/tiers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { setTierAction } from "./actions";

export const metadata = {
  title: "Pick your account type | Lake Region Property Resource",
  description: "Choose your LRPR account tier after signing up.",
};

// Force dynamic — depends on the authenticated user + their current profile.
export const dynamic = "force-dynamic";

type OnboardingPageProps = {
  searchParams?: Promise<{ error?: string; reselect?: string }>;
};

export default async function OnboardingPage({
  searchParams,
}: OnboardingPageProps) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in?redirect_url=/onboarding");
  }

  const params = await searchParams;
  const error = params?.error;
  const reselect = params?.reselect === "1";

  // If the user has already completed onboarding, send them home — unless
  // they explicitly want to re-pick (e.g. they were bounced from a tier-
  // gated page and want to upgrade).
  const supabase = createSupabaseServerClient();
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("tier_selected_at, role")
    .eq("clerk_user_id", user.id)
    .maybeSingle();

  if (existingProfile?.tier_selected_at && !reselect) {
    redirect("/?welcome=back");
  }

  const greeting =
    user.firstName || user.emailAddresses[0]?.emailAddress?.split("@")[0] ||
    "there";

  return (
    <main className="min-h-screen bg-[#f7f4ed] text-slate-950">
      <Header />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">
            One last step
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
            Welcome to LRPR, {greeting}.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Pick the account type that best describes how you&apos;ll use Lake
            Region Property Resource. You can change this later — and admins
            verify paid roles before unlocking premium features.
          </p>
        </div>

        {error ? (
          <div className="mx-auto mt-6 max-w-2xl rounded-3xl bg-rose-50 p-4 text-sm font-bold text-rose-950 ring-1 ring-rose-100">
            {error}
          </div>
        ) : null}

        <div className="mt-10 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {VISIBLE_TIER_IDS.map((tierId) => {
            const tier = TIERS[tierId];
            const accent = TIER_ACCENT_CLASSES[tier.accent];
            return (
              <article
                key={tier.id}
                className={`flex flex-col rounded-[2rem] bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] ring-1 ${accent.ring}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] ${accent.chip}`}
                    >
                      {tier.requiresPayment ? "Paid tier" : "Free"}
                    </span>
                    <h2 className="mt-3 text-2xl font-black tracking-[-0.03em]">
                      {tier.label}
                    </h2>
                    <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                      {tier.audience}
                    </p>
                  </div>
                  <p className="text-right text-sm font-black text-slate-900">
                    {tier.price}
                  </p>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {tier.blurb}
                </p>

                <ul className="mt-4 space-y-2 text-sm font-semibold text-slate-700">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="mt-0.5 text-cyan-700">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <form action={setTierAction} className="mt-auto pt-6">
                  <input type="hidden" name="tier" value={tier.id} />
                  <button
                    type="submit"
                    className={`w-full rounded-2xl px-5 py-3 text-sm font-black shadow-sm transition ${accent.button}`}
                  >
                    {tier.cta}
                  </button>
                </form>
              </article>
            );
          })}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-xs font-semibold text-slate-500">
          Admin access is granted manually by LRPR staff, not selectable here.
          If you&apos;re LRPR staff, finish picking a base tier and then
          coordinate with the team to lift you to admin.
        </p>
      </section>
    </main>
  );
}
