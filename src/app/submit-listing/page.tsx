import Link from "next/link";
import { Header } from "@/components/Header";

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

export const metadata = {
  title: "Submit a Lake Region Property | LRPR",
  description: "Submit an owner, agent, or property-manager listing for Lake Region Property Resource review.",
};

export default function SubmitListingPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ed] text-slate-950">
      <Header />
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="rounded-[2.5rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-900/15 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Approved listings only</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] sm:text-6xl">Submit a Lake Region property.</h1>
          <p className="mt-5 text-base leading-8 text-slate-200">LRPR is built for real local inventory, not scraped Zillow-style feeds. Submit property records from owners, agents, property managers, or LRPR-verified sources so every listing can be accurate, map-ready, and enriched with official public data.</p>
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

        <form className="rounded-[2.5rem] bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] ring-1 ring-slate-200 sm:p-7">
          <div className="mb-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Listing intake</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.03em]">Start the review packet</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">This first version is the front-end intake surface. Next we wire submissions to storage, notifications, approval, and geocoding when API access is ready.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-black text-slate-800">Your name<input className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-cyan-700" placeholder="Full name" /></label>
            <label className="block text-sm font-black text-slate-800">Email or phone<input className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-cyan-700" placeholder="Best contact" /></label>
            <label className="block text-sm font-black text-slate-800">Submission source<select className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-cyan-700"><option>Owner submitted</option><option>Agent submitted</option><option>Property manager submitted</option><option>LRPR verified</option></select></label>
            <label className="block text-sm font-black text-slate-800">Listing status<select className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-cyan-700"><option>Active</option><option>Pending</option><option>Sold</option><option>Archived / historical</option></select></label>
            <label className="block text-sm font-black text-slate-800 sm:col-span-2">Property address<input className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-cyan-700" placeholder="Street, city, FL ZIP" /></label>
            <label className="block text-sm font-black text-slate-800">Property type<select className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-cyan-700"><option>House</option><option>Lakefront</option><option>Land & acreage</option><option>Rental</option><option>Commercial</option><option>Mobile / manufactured</option></select></label>
            <label className="block text-sm font-black text-slate-800">Price or rent<input className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-cyan-700" placeholder="$489,000 or $1,450/mo" /></label>
            <label className="block text-sm font-black text-slate-800">Beds<input className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-cyan-700" placeholder="3" /></label>
            <label className="block text-sm font-black text-slate-800">Baths<input className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-cyan-700" placeholder="2" /></label>
            <label className="block text-sm font-black text-slate-800 sm:col-span-2">Notes<textarea className="mt-2 min-h-32 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-cyan-700" placeholder="Lake access, acreage, condition, lease terms, showing notes, source links, or anything LRPR should verify." /></label>
          </div>

          <button type="button" className="mt-6 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white shadow-lg shadow-slate-900/15">Save intake draft</button>
          <p className="mt-3 text-center text-xs font-semibold text-slate-500">Draft UI only for now — no data is submitted until storage is connected.</p>
        </form>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
          <div className="rounded-[2rem] bg-white p-6 ring-1 ring-slate-200 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Review checklist</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.03em]">What LRPR verifies before publishing</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {checklist.map((item) => <div className="rounded-2xl bg-[#f8faf9] p-4 text-sm font-bold leading-6 text-slate-700" key={item}>✓ {item}</div>)}
            </div>
          </div>
          <div className="rounded-[2rem] bg-cyan-950 p-6 text-white sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">What happens next</p>
            <ol className="mt-5 space-y-4 text-sm font-semibold leading-7 text-cyan-50/85">
              <li><strong className="text-white">1. Intake:</strong> collect source, contact, property basics, and permission.</li>
              <li><strong className="text-white">2. Review:</strong> approve photos, facts, status, and publish-ready copy.</li>
              <li><strong className="text-white">3. Enrich:</strong> attach geocoding, parcel source, flood lookup, Census/county context.</li>
              <li><strong className="text-white">4. Publish:</strong> create listing page, map pin, city/county links, and vendor/resource paths.</li>
            </ol>
          </div>
        </div>
      </section>
    </main>
  );
}
