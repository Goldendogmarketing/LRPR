import Link from "next/link";
import { Header } from "@/components/Header";
import { submitListingAction } from "./actions";

const sourceTypes = [
  ["Owner submitted", "For owners who want to submit a sale, rental, land, or archived/historical property record."],
  ["Agent submitted", "For licensed agents or brokerages with permission to market the property."],
  ["Property manager submitted", "For rentals, lease listings, and managed residential or commercial property."],
  ["LRPR verified", "For records reviewed by LRPR before becoming public on the site."],
];

const checklist = [
  "Permission to advertise or submit the property",
  "Full address, city, county, ZIP, and current status",
  "Original or authorized photos and property notes",
  "Price/rent, beds, baths, acreage, type, and disclosures",
  "Parcel, flood, Census, and local resource enrichment after approval",
];

const submissionTypes = [
  ["Free draft review", "Free", "Account required", "Submit property basics so LRPR can review fit, source, and permission before a paid publish step."],
  ["Standard sale listing", "Paid", "Homes, land, lakefront, commercial", "Publish an approved sale listing after validation, payment, and admin approval."],
  ["Featured sale listing", "Premium", "Homepage/category placement", "Priority visibility for approved listings with enhanced placement and local links."],
  ["Rental listing", "Paid", "Managers and landlords", "Publish an approved long-term, seasonal, residential, or commercial rental record."],
  ["Sold / archived record", "Low-cost or free", "Market context", "Add closed or historical records when reuse rights and facts are clear."],
  ["Vendor / Service Pro profile", "Paid", "Service marketplace", "Verified category profile for local contractors, inspectors, lenders, trades, and managers."],
];

const paymentGateSteps = [
  "Create or sign into a validated LRPR account",
  "Verify email/contact identity before checkout",
  "Choose a submission type and complete payment if required",
  "Admin review confirms permission, source quality, photos, and facts",
  "Only then does LRPR publish the listing, vendor profile, or archive record",
];

export const metadata = {
  title: "Submit a Lake Region Property | LRPR",
  description: "Submit an owner, agent, or property-manager listing for Lake Region Property Resource review.",
};

type SubmitListingPageProps = {
  searchParams?: Promise<{ submitted?: string; status?: string; checkout?: string; error?: string }>;
};

export default async function SubmitListingPage({ searchParams }: SubmitListingPageProps) {
  const params = await searchParams;
  const submittedId = params?.submitted;
  const error = params?.error;
  const status = params?.status;
  const checkout = params?.checkout;

  return (
    <main className="min-h-screen bg-[#f7f4ed] text-slate-950">
      <Header />
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="rounded-[2.5rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-900/15 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Approved listings only</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] sm:text-6xl">Submit a Lake Region property.</h1>
          <p className="mt-5 text-base leading-8 text-slate-200">LRPR is built for real local inventory, not scraped Zillow-style feeds. Submissions should be accessible to start, then gated by a validated account, payment when required, and admin approval before anything goes public.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
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
          {submittedId ? (
            <div className="mb-5 rounded-3xl bg-emerald-50 p-4 text-sm font-bold leading-6 text-emerald-950 ring-1 ring-emerald-100">
              Draft saved locally as <span className="font-black">{submittedId}</span>. Current status: <span className="font-black">{status}</span>. Checkout: <span className="font-black">{checkout}</span>. Next: wire this to Supabase/Clerk/Stripe when keys are available.
            </div>
          ) : null}
          {error ? (
            <div className="mb-5 rounded-3xl bg-rose-50 p-4 text-sm font-bold leading-6 text-rose-950 ring-1 ring-rose-100">{error}</div>
          ) : null}
          <div className="mb-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Listing intake</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.03em]">Start the review packet</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">This first version is the front-end intake surface. Next we wire submissions to storage, notifications, approval, and geocoding when API access is ready.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-black text-slate-800 sm:col-span-2">Submission type<select name="submissionType" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-cyan-700"><option value="free-draft-review">Free draft review</option><option value="standard-sale-listing">Standard sale listing</option><option value="featured-sale-listing">Featured sale listing</option><option value="rental-listing">Rental listing</option><option value="sold-archive-record">Sold / archived record</option><option value="vendor-service-pro">Vendor / Service Pro profile</option></select></label>
            <label className="block text-sm font-black text-slate-800">Your name<input name="contactName" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-cyan-700" placeholder="Full name" /></label>
            <label className="block text-sm font-black text-slate-800">Email or phone<input name="contactMethod" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-cyan-700" placeholder="Best contact" /></label>
            <label className="block text-sm font-black text-slate-800">Submission source<select name="sourceType" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-cyan-700"><option value="owner">Owner submitted</option><option value="agent">Agent submitted</option><option value="property-manager">Property manager submitted</option><option value="lrpr-verified">LRPR verified</option></select></label>
            <label className="block text-sm font-black text-slate-800">Listing status<select name="listingStatus" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-cyan-700"><option value="active">Active</option><option value="pending">Pending</option><option value="sold">Sold</option><option value="archived">Archived / historical</option></select></label>
            <label className="block text-sm font-black text-slate-800 sm:col-span-2">Property address<input name="propertyAddress" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-cyan-700" placeholder="Street, city, FL ZIP" /></label>
            <label className="block text-sm font-black text-slate-800">Property type<select name="propertyType" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-cyan-700"><option value="house">House</option><option value="lakefront">Lakefront</option><option value="land-acreage">Land & acreage</option><option value="rental">Rental</option><option value="commercial">Commercial</option><option value="mobile-manufactured">Mobile / manufactured</option></select></label>
            <label className="block text-sm font-black text-slate-800">Price or rent<input name="priceOrRent" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-cyan-700" placeholder="$489,000 or $1,450/mo" /></label>
            <label className="block text-sm font-black text-slate-800">Beds<input name="beds" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-cyan-700" placeholder="3" /></label>
            <label className="block text-sm font-black text-slate-800">Baths<input name="baths" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-cyan-700" placeholder="2" /></label>
            <label className="block text-sm font-black text-slate-800 sm:col-span-2">Notes<textarea name="notes" className="mt-2 min-h-32 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-cyan-700" placeholder="Lake access, acreage, condition, lease terms, showing notes, source links, or anything LRPR should verify." /></label>
          </div>

          <button type="submit" className="mt-6 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white shadow-lg shadow-slate-900/15">Save intake draft</button>
          <p className="mt-3 text-center text-xs font-semibold text-slate-500">Saves to local JSONL fallback now; Supabase, Clerk, Stripe, and Resend are ready to wire when keys are available.</p>
        </form>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="rounded-[2.25rem] bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] ring-1 ring-slate-200 sm:p-8">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Submission types</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.03em]">Accessible to start. Account-validated before publish.</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">A visitor can understand the options, but saving drafts, checkout, and publishing should require a validated account. Paid options still stay behind admin approval so LRPR controls quality.</p>
            </div>
            <div className="rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-black text-cyan-900">Future: Clerk + Stripe + Admin queue</div>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
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
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Account + payment gate</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.03em]">Submission workflow</h2>
            <ol className="mt-5 space-y-4 text-sm font-semibold leading-7 text-cyan-50/85">
              {paymentGateSteps.map((step, index) => <li key={step}><strong className="text-white">{index + 1}.</strong> {step}</li>)}
            </ol>
            <div className="mt-6 rounded-2xl bg-white/10 p-4 text-sm font-semibold leading-6 text-cyan-50 ring-1 ring-white/10">Recommended stack: Clerk for validated accounts, Stripe Checkout for paid submission types, Resend for notifications, and database-backed admin approval.</div>
          </div>
        </div>
      </section>
    </main>
  );
}
