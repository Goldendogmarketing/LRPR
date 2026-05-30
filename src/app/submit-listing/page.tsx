import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { Header } from "@/components/Header";
import { PhotoUpload } from "@/components/PhotoUpload";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  TIERS,
  SUBMITTER_TIERS,
  canSubmitListings,
  type TierId,
} from "@/lib/tiers";
import { submitListingAction, retryListingPayment } from "./actions";

const sourceTypes = [
  ["Owner submitted", "For property owners submitting a residential sale, land/lot, or rental record they have permission to advertise."],
  ["Agent submitted", "For licensed agents or brokerages submitting a residential sale or land listing with owner/client permission."],
  ["Property manager submitted", "For managers or landlords submitting residential rentals with permission and current availability details."],
];

const checklist = [
  "Permission to advertise or submit the property",
  "Full address, city, county, ZIP, and current active/pending status",
  "Original or authorized photos and property notes",
  "Price/rent, beds, baths, acreage, type, lease terms, and disclosures",
  "Parcel, flood, Census, and local resource enrichment after approval",
];

const submissionTypes = [
  ["Residential property for sale", "Public intake", "Owners and agents", "Submit a home for sale in the Florida Lake Region for LRPR review before publishing."],
  ["Land / lot listing", "Public intake", "Owners, agents, land sellers", "Submit acreage, vacant land, rural lots, or lake-area build sites with parcel context queued for admin review."],
  ["Rental listing", "Public intake", "Landlords and managers", "Submit residential rentals with lease terms, availability, and manager/owner permission details."],
];

const adminOnlyTypes = [
  ["Service providers", "Admin uploaded + paywall", "Paid service-provider profiles are created/updated by LRPR admin, then approved before publishing."],
  ["Local resources", "Admin added data", "City, county, utility, permit, school, park, lake, and official data resources are curated by LRPR admin."],
];

const workflowSteps = [
  "Submit residential sale, land, or rental details",
  "Create or sign into a validated LRPR account before saving/review",
  "Admin review confirms permission, source quality, photos, and facts",
  "LRPR enriches the approved record with parcel, flood, city/county, and local-resource context",
  "Only then does LRPR publish the property record",
];

export const metadata = {
  title: "Submit a Lake Region Property | LRPR",
  description: "Submit a residential sale, land, or rental property for Lake Region Property Resource review.",
};

type SubmitListingPageProps = {
  searchParams?: Promise<{
    submitted?: string;
    status?: string;
    checkout?: string;
    error?: string;
    paid?: string;
    payment_cancelled?: string;
    payment_error?: string;
  }>;
};

export default async function SubmitListingPage({ searchParams }: SubmitListingPageProps) {
  const params = await searchParams;
  const submittedId = params?.submitted;
  const error = params?.error;
  const status = params?.status;
  const paidId = params?.paid;
  const cancelledId = params?.payment_cancelled;
  const paymentError = params?.payment_error;

  // Tier gate: middleware already enforced "signed in." Here we additionally
  // enforce "tier is FSBO, Agent, or Admin."
  const user = await currentUser();
  const isAdmin = user?.publicMetadata?.role === "admin";

  const supabase = createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, tier_selected_at")
    .eq("clerk_user_id", user!.id)
    .maybeSingle();

  // No profile yet OR onboarding incomplete → send to onboarding to pick a tier.
  if (!profile?.tier_selected_at) {
    redirect("/onboarding");
  }

  if (!canSubmitListings({ profileRole: profile.role, isAdmin })) {
    const currentTier = profile.role in TIERS ? TIERS[profile.role as TierId] : null;
    return (
      <main className="min-h-screen bg-[#f7f4ed] text-slate-950">
        <Header />
        <section className="mx-auto grid max-w-3xl gap-6 px-4 py-20 sm:px-6 lg:px-8">
          <div className="rounded-[2.5rem] bg-white p-8 shadow-[0_18px_60px_rgba(15,23,42,0.08)] ring-1 ring-slate-200 sm:p-10">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">
              Upgrade required
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
              Property submissions are limited to FSBO and Agent / Broker tiers.
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              You&apos;re currently signed up as{" "}
              <span className="font-black text-slate-900">
                {currentTier?.label ?? profile.role}
              </span>
              . That tier is for{" "}
              <span className="font-semibold">
                {currentTier?.audience ?? "browsing"}
              </span>{" "}
              — not for listing property.
            </p>

            <div className="mt-6 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <p className="text-sm font-black text-slate-900">
                Tiers that can submit property:
              </p>
              <ul className="mt-3 space-y-2 text-sm font-semibold text-slate-700">
                {SUBMITTER_TIERS.map((tierId) => (
                  <li key={tierId} className="flex items-start gap-2">
                    <span className="mt-0.5 text-cyan-700">✓</span>
                    <span>
                      <span className="font-black">{TIERS[tierId].label}</span>{" "}
                      — {TIERS[tierId].audience}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/onboarding?reselect=1"
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-900/15"
              >
                Change my tier
              </Link>
              <Link
                href="/"
                className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200"
              >
                ← Back to home
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f4ed] text-slate-950">
      <Header />
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="rounded-[2.5rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-900/15 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Public property intake</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] sm:text-6xl">Submit residential sale, land, or rental property.</h1>
          <p className="mt-5 text-base leading-8 text-slate-200">LRPR accepts focused property submissions for the Florida Lake Region. Service providers and local resource records are handled by admin so the public intake stays clean and trusted.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {sourceTypes.map(([title, copy]) => (
              <article className="rounded-3xl bg-white/10 p-4 ring-1 ring-white/10" key={title}>
                <h2 className="font-black text-white">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{copy}</p>
              </article>
            ))}
          </div>
          <Link href="/data-sources" className="mt-8 inline-flex rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950">See public data layer →</Link>
        </div>

        <form action={submitListingAction} className="rounded-[2.5rem] bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] ring-1 ring-slate-200 sm:p-7">
          {paidId ? (
            <div className="mb-5 rounded-3xl bg-emerald-50 p-4 text-sm font-bold leading-6 text-emerald-950 ring-1 ring-emerald-100">
              ✅ Payment received — your listing fee is paid and the submission is now in the <Link href="/admin" className="underline">review queue</Link>. We&apos;ll email you when it&apos;s approved and published.
            </div>
          ) : null}
          {cancelledId ? (
            <div className="mb-5 rounded-3xl bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-950 ring-1 ring-amber-100">
              <p>Checkout was cancelled — you haven&apos;t been charged. Your listing is saved as <span className="font-black">pending payment</span>. Complete the one-time listing fee to send it to review:</p>
              <form action={retryListingPayment} className="mt-3">
                <input type="hidden" name="submissionId" value={cancelledId} />
                <button type="submit" className="rounded-full bg-slate-950 px-5 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-white hover:bg-slate-800">
                  Complete payment →
                </button>
              </form>
            </div>
          ) : null}
          {paymentError ? (
            <div className="mb-5 rounded-3xl bg-rose-50 p-4 text-sm font-bold leading-6 text-rose-950 ring-1 ring-rose-100">
              Your listing was saved, but we couldn&apos;t start checkout. Please try the &ldquo;Complete payment&rdquo; option or resubmit.
            </div>
          ) : null}
          {submittedId && !paidId && !cancelledId ? (
            <div className="mb-5 rounded-3xl bg-emerald-50 p-4 text-sm font-bold leading-6 text-emerald-950 ring-1 ring-emerald-100">
              ✅ Submission saved as <span className="font-black">{submittedId}</span>. Current status: <span className="font-black">{status}</span>. It will appear in the <Link href="/admin" className="underline">admin review queue</Link> for permission verification, source quality, and final approval before publishing.
            </div>
          ) : null}
          {error ? (
            <div className="mb-5 rounded-3xl bg-rose-50 p-4 text-sm font-bold leading-6 text-rose-950 ring-1 ring-rose-100">{error}</div>
          ) : null}
          <div className="mb-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Property intake</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.03em]">Start the review packet</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">This skeleton captures the three public MVP lanes only: residential property for sale, land, and rentals.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-black text-slate-800 sm:col-span-2">Submission type<select name="submissionType" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-cyan-700"><option value="residential-sale">Residential property for sale</option><option value="land-listing">Land / lot listing</option><option value="rental-listing">Rental listing</option></select></label>
            <label className="block text-sm font-black text-slate-800">Your name<input name="contactName" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-cyan-700" placeholder="Full name" /></label>
            <label className="block text-sm font-black text-slate-800">Email or phone<input name="contactMethod" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-cyan-700" placeholder="Best contact" /></label>
            <label className="block text-sm font-black text-slate-800">Submission source<select name="sourceType" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-cyan-700"><option value="owner">Owner submitted</option><option value="agent">Agent submitted</option><option value="property-manager">Property manager submitted</option></select></label>
            <label className="block text-sm font-black text-slate-800">Listing status<select name="listingStatus" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-cyan-700"><option value="active">Active</option><option value="pending">Pending / coming soon</option></select></label>
            <label className="block text-sm font-black text-slate-800 sm:col-span-2">Property address<input name="propertyAddress" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-cyan-700" placeholder="Street, city, FL ZIP" /></label>
            <label className="block text-sm font-black text-slate-800">Property type<select name="propertyType" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-cyan-700"><option value="residential">Residential home</option><option value="lakefront-residential">Lakefront residential</option><option value="land-acreage">Land / acreage</option><option value="rental">Rental</option><option value="mobile-manufactured">Mobile / manufactured residential</option></select></label>
            <label className="block text-sm font-black text-slate-800">Price or rent<input name="priceOrRent" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-cyan-700" placeholder="$489,000 or $1,450/mo" /></label>
            <label className="block text-sm font-black text-slate-800">Beds<input name="beds" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-cyan-700" placeholder="3" /></label>
            <label className="block text-sm font-black text-slate-800">Baths<input name="baths" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-cyan-700" placeholder="2" /></label>
            <label className="block text-sm font-black text-slate-800 sm:col-span-2">Notes<textarea name="notes" className="mt-2 min-h-32 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-cyan-700" placeholder="Lake access, acreage, condition, lease terms, showing notes, source links, or anything LRPR should verify." /></label>
          </div>

          {/* Photo upload — feeds the immersive listing template once
              the submission is approved + published. The first photo
              becomes the parallax hero. */}
          <div className="mt-6">
            <p className="text-sm font-black text-slate-800">Property photos</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Upload your own or your client&apos;s photos. The first one becomes the immersive hero shot. Order matters: the rest fill the aerial, feature, and CTA sections in sequence.
            </p>
            <div className="mt-3">
              <PhotoUpload
                name="photos"
                max={12}
                helpText="By uploading, you confirm you own or have written permission from the owner/agent to advertise these photos. LRPR admin reviews every photo before publishing."
              />
            </div>
          </div>

          {/* Permission attestation. This is the publish gate: a submission
              cannot reach "published" until permission_confirmed is true.
              Required, so the form won't submit without it. */}
          <label className="mt-6 flex items-start gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <input
              type="checkbox"
              name="permissionConfirmed"
              required
              className="mt-0.5 h-5 w-5 shrink-0 rounded border-slate-300 text-cyan-700 focus:ring-cyan-700"
            />
            <span className="text-sm font-semibold leading-6 text-slate-700">
              I confirm I own this property, or have written authorization from
              the owner or listing agent, to advertise it (and the uploaded
              photos) on Lake Region Property Resource.{" "}
              <span className="text-rose-600">*</span>
            </span>
          </label>

          <button type="submit" className="mt-6 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white shadow-lg shadow-slate-900/15">Submit property for review</button>
          <p className="mt-3 text-center text-xs font-semibold text-slate-500">Saved to Supabase. Clerk account validation and Resend admin notifications wire in next sprints.</p>
        </form>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="rounded-[2.25rem] bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] ring-1 ring-slate-200 sm:p-8">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">MVP submission lanes</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.03em]">Public submits property only. Admin controls providers and resources.</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">This keeps LRPR focused: property inventory can come in from owners/agents/managers, while paid service-provider profiles and local resources stay admin-managed.</p>
            </div>
            <div className="rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-black text-cyan-900">Next: database-backed intake</div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {submissionTypes.map(([title, price, audience, copy]) => (
              <article className="rounded-3xl bg-[#f8faf9] p-5 ring-1 ring-slate-100" key={title}>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-black text-slate-950">{title}</h3>
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase text-cyan-800 shadow-sm">{price}</span>
                </div>
                <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500">{audience}</p>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{copy}</p>
              </article>
            ))}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {adminOnlyTypes.map(([title, badge, copy]) => (
              <article className="rounded-3xl bg-slate-950 p-5 text-white" key={title}>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-black uppercase text-cyan-100 ring-1 ring-white/10">{badge}</span>
                <h3 className="mt-4 text-lg font-black">{title}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr] lg:items-start">
          <div className="rounded-[2rem] bg-white p-6 ring-1 ring-slate-200 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Review checklist</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.03em]">What LRPR verifies before publishing</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {checklist.map((item) => <div className="rounded-2xl bg-[#f8faf9] p-4 text-sm font-bold leading-6 text-slate-700" key={item}>✓ {item}</div>)}
            </div>
          </div>
          <div className="rounded-[2rem] bg-cyan-950 p-6 text-white sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Publish workflow</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.03em]">No auto-publishing.</h2>
            <ol className="mt-5 space-y-4 text-sm font-semibold leading-7 text-cyan-50/85">
              {workflowSteps.map((step, index) => <li key={step}><strong className="text-white">{index + 1}.</strong> {step}</li>)}
            </ol>
            <div className="mt-6 rounded-2xl bg-white/10 p-4 text-sm font-semibold leading-6 text-cyan-50 ring-1 ring-white/10">Recommended next wiring: Clerk/Supabase account + submission storage, Resend admin notification, and an admin-only provider/resource editor.</div>
          </div>
        </div>
      </section>
    </main>
  );
}
