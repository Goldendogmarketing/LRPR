import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { Header } from "@/components/Header";
import { PhotoUpload } from "@/components/PhotoUpload";
import { NotesManager } from "@/components/account/NotesManager";
import { SavedToolsManager } from "@/components/account/SavedToolsManager";
import { VendorFavoriteButton } from "@/components/VendorFavoriteButton";
import { DEFAULT_ACCENT } from "@/components/immersive";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  PAID_TIER_IDS,
  TIERS,
  deriveAccountType,
  type AccountType,
  type TierId,
} from "@/lib/tiers";
import {
  getListingFavoriteCount,
  getNotes,
  getSavedToolKeys,
  getVendorFavorites,
} from "@/lib/account-data";
import { createPortalSession, updateProfileAction } from "./actions";

export const metadata = {
  title: "My Account — LRPR",
  description: "Manage your Lake Region Property Resource account.",
};

export const dynamic = "force-dynamic";

const ACCENT_PRESETS: { hex: string; label: string }[] = [
  { hex: "#c8a97e", label: "Lakefront gold" },
  { hex: "#0e7490", label: "LRPR cyan" },
  { hex: "#047857", label: "Pine emerald" },
  { hex: "#b45309", label: "Sunset amber" },
  { hex: "#be123c", label: "Hibiscus rose" },
  { hex: "#475569", label: "Storm slate" },
];

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  admin: "Administrator",
  professional: "Professional",
  fsbo: "For sale by owner",
  public: "Free account",
};

type ProfileRow = {
  id: string;
  email: string;
  role: string;
  full_name: string | null;
  display_name: string | null;
  brokerage: string | null;
  phone: string | null;
  tagline: string | null;
  headshot_url: string | null;
  accent_color: string | null;
  brand_initials: string | null;
  immersive_enabled: boolean | null;
  subscription_status: string | null;
  stripe_customer_id: string | null;
  payment_complete: boolean | null;
};

type SearchParams = Promise<{
  saved?: string;
  error?: string;
  checkout?: string;
}>;

function Card({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)] ring-1 ring-slate-200">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-black text-slate-950">{title}</h2>
      </div>
      {hint ? <p className="mt-1 text-sm text-slate-500">{hint}</p> : null}
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const user = await currentUser();
  if (!user) redirect("/sign-in?redirect_url=/account");

  const supabase = createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, email, role, full_name, display_name, brokerage, phone, tagline, headshot_url, accent_color, brand_initials, immersive_enabled, subscription_status, stripe_customer_id, payment_complete",
    )
    .eq("clerk_user_id", user.id)
    .maybeSingle<ProfileRow>();

  // No profile yet → bounce through onboarding to pick a tier first.
  if (!profile) redirect("/onboarding");

  const isAdmin = user.publicMetadata?.role === "admin";
  const accountType = deriveAccountType({ role: profile.role, isAdmin });
  const isPaidTier = (PAID_TIER_IDS as readonly string[]).includes(profile.role);
  const showProfessional = isPaidTier || isAdmin;

  const [favCount, vendorFavs, notes, savedToolKeys] = await Promise.all([
    getListingFavoriteCount(supabase, profile.id),
    getVendorFavorites(supabase, profile.id),
    getNotes(supabase, profile.id),
    getSavedToolKeys(supabase, profile.id),
  ]);

  const accent = profile.accent_color ?? DEFAULT_ACCENT;
  const displayName = profile.display_name ?? profile.full_name ?? "";
  const initials = (() => {
    if (profile.brand_initials) return profile.brand_initials;
    if (displayName) {
      const parts = displayName.trim().split(/\s+/);
      return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
    }
    return "LR";
  })().slice(0, 2);

  const greetingName =
    profile.full_name || user.firstName || profile.email.split("@")[0];

  return (
    <main className="min-h-screen bg-[#f7f4ed] text-slate-950">
      <Header />

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Account header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-cyan-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-900">
              {ACCOUNT_TYPE_LABELS[accountType]}
            </span>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.03em] sm:text-5xl">
              {greetingName}&apos;s account
            </h1>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              {profile.email}
            </p>
          </div>
          {isAdmin ? (
            <Link
              href="/admin"
              className="self-start rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800 sm:self-auto"
            >
              Open Admin Dashboard →
            </Link>
          ) : null}
        </div>

        {/* Status messages */}
        {params.saved ? (
          <div className="mt-6 rounded-3xl bg-emerald-50 p-4 text-sm font-bold text-emerald-950 ring-1 ring-emerald-200">
            ✅ Profile saved. Your listings will reflect the new agent block on
            their next page load.
          </div>
        ) : null}
        {params.error ? (
          <div className="mt-6 rounded-3xl bg-rose-50 p-4 text-sm font-bold text-rose-950 ring-1 ring-rose-200">
            {params.error}
          </div>
        ) : null}
        {params.checkout === "success" ? (
          <div className="mt-6 rounded-3xl bg-emerald-50 p-4 text-sm font-bold text-emerald-950 ring-1 ring-emerald-200">
            ✅ Subscription active — thank you! Your{" "}
            {TIERS[profile.role as TierId]?.label ?? profile.role} plan is now
            unlocked.
          </div>
        ) : null}

        {/* ── Universal dashboard (all account types) ───────────────── */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card title="Saved listings" hint="Properties you've hearted across the site.">
            <div className="flex items-center justify-between">
              <p className="text-3xl font-black text-slate-950">{favCount}</p>
              <Link
                href="/favorites"
                className="rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white transition hover:bg-slate-800"
              >
                View favorites →
              </Link>
            </div>
          </Card>

          <Card title="Saved vendors" hint="Service pros you've saved for later.">
            {vendorFavs.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm font-semibold text-slate-500">
                No saved vendors yet. Save pros from{" "}
                <Link href="/service-pros" className="font-black text-cyan-800 underline">
                  Service Pros
                </Link>
                .
              </p>
            ) : (
              <ul className="space-y-2">
                {vendorFavs.map((v) => (
                  <li
                    key={v.id}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-900">
                        {v.vendor_name ?? "Vendor"}
                      </p>
                      {v.vendor_category ? (
                        <p className="truncate text-xs font-semibold text-slate-500">
                          {v.vendor_category}
                        </p>
                      ) : null}
                    </div>
                    <VendorFavoriteButton
                      vendorId={v.vendor_id}
                      vendorName={v.vendor_name}
                      vendorCategory={v.vendor_category}
                      isSaved
                      isSignedIn
                      redirectTo="/account"
                    />
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="My notes" hint="Private notes — only you can see these.">
            <NotesManager notes={notes} />
          </Card>

          <Card title="Tools & resources" hint="Pin calculators and resources for quick access.">
            <SavedToolsManager savedKeys={savedToolKeys} />
          </Card>
        </div>

        {/* ── Public-tier upgrade nudge ─────────────────────────────── */}
        {accountType === "public" ? (
          <div className="mt-6 flex flex-col gap-4 rounded-[2rem] bg-slate-950 p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">
                Have property to list?
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.02em]">
                Upgrade to list your own property or claim a pro profile.
              </h2>
            </div>
            <Link
              href="/onboarding?reselect=1"
              className="shrink-0 rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-slate-200"
            >
              View account types →
            </Link>
          </div>
        ) : null}

        {/* ── FSBO upgrade / listing section ────────────────────────── */}
        {accountType === "fsbo" ? (
          <div className="mt-6 rounded-[2rem] bg-white p-6 ring-1 ring-slate-200 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">
              For sale by owner
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.02em]">
              List and manage your own property
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              FSBO accounts include a one-time account setup fee plus a
              per-listing FSBO fee. Submit your home, land, or rental — LRPR
              admin reviews each submission for accuracy and permission before
              publishing.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/submit-listing"
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
              >
                Submit a listing
              </Link>
            </div>
          </div>
        ) : null}

        {/* ── Professional / paid customization + billing ───────────── */}
        {showProfessional ? (
          <>
            <div className="mt-10 flex flex-col gap-4 rounded-3xl bg-white p-6 ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">
                  Billing
                </p>
                <p className="mt-1 text-lg font-black text-slate-900">
                  {TIERS[profile.role as TierId]?.label ?? profile.role} plan
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-600">
                  Status:{" "}
                  <span
                    className={
                      profile.payment_complete ? "text-emerald-700" : "text-amber-700"
                    }
                  >
                    {profile.subscription_status
                      ? profile.subscription_status
                      : profile.payment_complete
                        ? "active"
                        : "not subscribed"}
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {profile.stripe_customer_id ? (
                  <form action={createPortalSession}>
                    <button
                      type="submit"
                      className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800"
                    >
                      Manage subscription
                    </button>
                  </form>
                ) : (
                  <Link
                    href={`/onboarding/checkout?tier=${profile.role}`}
                    className="rounded-full bg-cyan-700 px-5 py-3 text-sm font-black text-white hover:bg-cyan-800"
                  >
                    Complete checkout
                  </Link>
                )}
              </div>
            </div>

            <div className="mt-8">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-800">
                Listing presentation
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.02em]">
                Customize how you appear on every listing
              </h2>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">
                These fields populate the agent/contact block on every property
                you submit. Update once — your existing listings refresh on next
                render.
              </p>
            </div>

            <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <form
                action={updateProfileAction}
                className="rounded-[2.5rem] bg-white p-6 ring-1 ring-slate-200 sm:p-8"
              >
                <fieldset className="grid gap-4 sm:grid-cols-2">
                  <legend className="sr-only">Agent block</legend>
                  <label className="block text-sm font-black text-slate-800">
                    Display name
                    <input
                      name="display_name"
                      defaultValue={profile.display_name ?? profile.full_name ?? ""}
                      placeholder="Branden Waters"
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-cyan-700"
                    />
                  </label>
                  <label className="block text-sm font-black text-slate-800">
                    Brokerage / company
                    <input
                      name="brokerage"
                      defaultValue={profile.brokerage ?? ""}
                      placeholder="Trevor Waters Realty, Inc."
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-cyan-700"
                    />
                  </label>
                  <label className="block text-sm font-black text-slate-800">
                    Phone
                    <input
                      name="phone"
                      defaultValue={profile.phone ?? ""}
                      placeholder="352-222-2888"
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-cyan-700"
                    />
                  </label>
                  <label className="block text-sm font-black text-slate-800">
                    Brand initials (nav monogram)
                    <input
                      name="brand_initials"
                      defaultValue={profile.brand_initials ?? ""}
                      maxLength={3}
                      placeholder={initials}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold uppercase outline-none focus:border-cyan-700"
                    />
                  </label>
                  <label className="block text-sm font-black text-slate-800 sm:col-span-2">
                    Tagline / bio
                    <textarea
                      name="tagline"
                      defaultValue={profile.tagline ?? ""}
                      maxLength={240}
                      placeholder="Lake Region specialist. Born and raised in Clay County, working with owners and buyers across the four-county Lake Region."
                      className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-cyan-700"
                    />
                    <span className="mt-1 block text-xs text-slate-500">
                      Max 240 characters. Shown under your name in the listing CTA card.
                    </span>
                  </label>
                </fieldset>

                <div className="mt-8">
                  <p className="text-sm font-black text-slate-800">Headshot</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Square works best. Shown as a 56px circle in the listing CTA section.
                  </p>
                  {profile.headshot_url ? (
                    <div className="mt-3 flex items-center gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={profile.headshot_url}
                        alt={displayName || "Current headshot"}
                        className="h-14 w-14 rounded-full object-cover"
                      />
                      <div className="flex-1 text-xs text-slate-600">
                        Current headshot. Upload a new one to replace it.
                      </div>
                      <label className="inline-flex items-center gap-2 text-xs font-bold text-rose-700">
                        <input type="checkbox" name="remove_headshot" value="1" />
                        Remove
                      </label>
                    </div>
                  ) : null}
                  <div className="mt-3">
                    <PhotoUpload
                      name="headshot"
                      max={1}
                      helpText="One photo only. Square crop recommended."
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <p className="text-sm font-black text-slate-800">Accent color</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Tints the headline reveals, stat numbers, CTA buttons, and nav
                    monogram in the immersive template.
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {ACCENT_PRESETS.map((p) => (
                      <label
                        key={p.hex}
                        className="flex cursor-pointer items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200 hover:bg-slate-50"
                        style={{ borderLeft: `8px solid ${p.hex}` }}
                      >
                        <input
                          type="radio"
                          name="accent_color"
                          value={p.hex}
                          defaultChecked={
                            (profile.accent_color ?? DEFAULT_ACCENT).toLowerCase() ===
                            p.hex.toLowerCase()
                          }
                        />
                        <div className="flex-1">
                          <div className="text-sm font-black text-slate-900">{p.label}</div>
                          <div className="font-mono text-xs text-slate-500">{p.hex}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div
                  className="mt-8 rounded-2xl p-5 ring-1"
                  style={{
                    background: profile.immersive_enabled
                      ? `linear-gradient(135deg, #08080a 0%, #18181b 100%)`
                      : "#f8fafc",
                    borderColor: profile.immersive_enabled ? accent : "#e2e8f0",
                    color: profile.immersive_enabled ? "#fff" : undefined,
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p
                        className="text-xs font-black uppercase tracking-[0.18em]"
                        style={{ color: profile.immersive_enabled ? accent : "#0e7490" }}
                      >
                        {profile.immersive_enabled
                          ? "Immersive presentation active"
                          : "Optional upgrade"}
                      </p>
                      <p
                        className="mt-1 text-base font-black"
                        style={{ color: profile.immersive_enabled ? "#fff" : undefined }}
                      >
                        Immersive listing template
                      </p>
                      <p
                        className="mt-2 max-w-md text-xs leading-5"
                        style={{
                          color: profile.immersive_enabled
                            ? "rgba(255,255,255,0.6)"
                            : "#475569",
                        }}
                      >
                        Flips every listing you own to the cinematic black/gold
                        parallax presentation — hero parallax, scrolling feature
                        sections, mortgage estimator, branded agent card. Turn off
                        to revert to the standard layout.
                      </p>
                    </div>
                    <label className="inline-flex shrink-0 items-center gap-2 text-xs font-black uppercase tracking-[0.14em]">
                      <input
                        type="checkbox"
                        name="immersive_enabled"
                        value="1"
                        defaultChecked={Boolean(profile.immersive_enabled)}
                        className="peer sr-only"
                      />
                      <span
                        className="relative inline-block h-7 w-12 rounded-full bg-slate-300 transition peer-checked:bg-emerald-600"
                        aria-hidden
                      >
                        <span className="absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white transition peer-checked:translate-x-5" />
                      </span>
                      <span style={{ color: profile.immersive_enabled ? "#fff" : "#0f172a" }}>
                        {profile.immersive_enabled ? "On" : "Off"}
                      </span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-8 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white shadow-lg shadow-slate-900/15"
                >
                  Save profile customization
                </button>
              </form>

              <aside className="rounded-[2.5rem] bg-slate-950 p-6 text-white sm:p-8">
                <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: accent }}>
                  Live preview
                </p>
                <h2 className="mt-2 text-2xl font-black">How your listings will show you</h2>

                <div
                  className="mt-6 flex items-center justify-between rounded-2xl p-3"
                  style={{ background: "rgba(8,8,10,0.6)", border: `1px solid ${accent}30` }}
                >
                  <div className="flex items-center gap-2">
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: accent }}>
                      {initials}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.3em]" style={{ color: `${accent}aa` }}>
                      {profile.brokerage || "Real Estate"}
                    </span>
                  </div>
                  <span
                    className="rounded-md px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em]"
                    style={{ background: accent, color: "#08080a" }}
                  >
                    Schedule Showing
                  </span>
                </div>

                <div className="mt-6 flex items-center gap-4">
                  {profile.headshot_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.headshot_url}
                      alt={displayName || "Agent"}
                      className="h-14 w-14 rounded-full object-cover ring-1"
                      style={{ borderColor: accent }}
                    />
                  ) : (
                    <div
                      className="grid h-14 w-14 place-items-center rounded-full text-sm font-black uppercase tracking-widest"
                      style={{ background: `${accent}20`, color: accent }}
                    >
                      {initials}
                    </div>
                  )}
                  <div>
                    <div className="text-lg font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {displayName || "Your display name"}
                    </div>
                    {profile.brokerage ? (
                      <div className="text-[10px] uppercase tracking-[0.18em]" style={{ color: `${accent}cc` }}>
                        {profile.brokerage}
                      </div>
                    ) : null}
                    {profile.phone ? (
                      <div className="mt-1 text-xs text-white/60">{profile.phone}</div>
                    ) : null}
                  </div>
                </div>

                {profile.tagline ? (
                  <p className="mt-4 text-xs leading-6 text-white/50">{profile.tagline}</p>
                ) : (
                  <p className="mt-4 text-xs leading-6 text-white/30 italic">
                    Your tagline shows here after you save.
                  </p>
                )}
              </aside>
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}
