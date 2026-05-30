import Link from "next/link";
import { Header } from "@/components/Header";
import { HomeHero } from "@/components/HomeHero";
import { ListingsCarousel } from "@/components/ListingsCarousel";
import { InternalLinkHub } from "@/components/InternalLinkHub";
import { listings, resources } from "@/data/site";

const quickFilters = [
  ["Lakefront Homes", "Lake Geneva, Lake Santa Fe, Brooklyn Lake", "/for-sale"],
  ["Land & Acreage", "Rural tracts, parcels, and build sites", "/for-sale"],
  ["Homes for Rent", "Keystone Heights to Interlachen rentals", "/for-rent"],
  ["Parcel Lookup", "County appraiser and cadastral links", "/data-sources"],
  ["Flood Map Resources", "FEMA NFHL lookup-ready context", "/resources"],
  ["Recently Sold / Archived", "Local property history pages", "/for-sale"],
];

const resourceCards = [
  ["Buying Guide", "Local due-diligence checklist for Lake Region buyers", "/resources"],
  ["Renting Guide", "Utilities, deposits, neighborhoods, and contacts", "/resources"],
  ["County Offices", "Clay, Bradford, Putnam, and Alachua links", "/resources"],
  ["Flood & Parcel Guide", "Official data sources before you make decisions", "/data-sources"],
  ["City Guides", "Keystone Heights, Starke, Melrose, and more", "/cities/keystone-heights"],
];

const vendorCategories = [
  ["Real Estate Agents", "List local, verified agent profiles"],
  ["Mortgage Lenders", "Compare financing options"],
  ["Home Inspectors", "Pre-purchase confidence"],
  ["Contractors", "Build, repair, renovate"],
  ["Septic & Well Services", "Critical rural property support"],
  ["Insurance Agents", "Flood, home, and landlord coverage"],
  ["Property Management", "Rentals, turns, and tenant support"],
  ["Landscaping", "Outdoor and lake-property upkeep"],
  ["HVAC / Electrical", "Trusted trade professionals"],
  ["Photographers", "Listing media and drone-ready shoots"],
  ["Cleaning & Staging", "Move-in, move-out, show-ready"],
  ["Surveyors", "Boundaries, lots, and acreage clarity"],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f4ed] text-slate-950">
      <Header />

      <HomeHero />

      <section className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black tracking-[-0.03em] text-slate-950 sm:text-3xl">New &amp; Local Listings</h2>
          <Link
            href="/for-sale"
            className="shrink-0 rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-slate-800"
          >
            View all listings →
          </Link>
        </div>
        <ListingsCarousel listings={listings} />
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="rounded-[2rem] bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)] ring-1 ring-slate-200">
          <div className="mb-5 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-50 text-cyan-800">⌁</span><h2 className="text-xl font-black">Quick Filters</h2></div>
          <div className="divide-y divide-slate-100">
            {quickFilters.map(([title, copy, href]) => (
              <Link className="flex items-center justify-between gap-4 py-4" href={href} key={title}>
                <span><span className="block text-sm font-black text-slate-900">{title}</span><span className="mt-1 block text-xs font-semibold text-slate-500">{copy}</span></span>
                <span className="text-xl text-slate-400">›</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)] ring-1 ring-slate-200">
          <div className="mb-5 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-800">▣</span><h2 className="text-xl font-black">Resources</h2></div>
          <div className="divide-y divide-slate-100">
            {resourceCards.map(([title, copy, href]) => (
              <Link className="flex items-center justify-between gap-4 py-4" href={href} key={title}>
                <span><span className="block text-sm font-black text-slate-900">{title}</span><span className="mt-1 block text-xs font-semibold text-slate-500">{copy}</span></span>
                <span className="text-xl text-slate-400">›</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">
        <div className="rounded-[2.25rem] bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)] ring-1 ring-slate-200 sm:p-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">Vendor network</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.03em]">Trusted service pros by category.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">This becomes the Lake Region service marketplace: vendors, verification, lead forms, sponsorships, and local resource pages.</p>
            </div>
            <Link href="/service-pros" className="hidden text-sm font-black text-cyan-800 sm:block">View all vendors →</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {vendorCategories.map(([title, copy]) => (
              <Link href={`/service-pros#${title.toLowerCase().replaceAll(" & ", "-").replaceAll(" ", "-")}`} className="rounded-3xl bg-[#f8faf9] p-5 ring-1 ring-slate-100 transition hover:-translate-y-1 hover:bg-cyan-50" key={title}>
                <div className="mb-5 grid h-11 w-11 place-items-center rounded-2xl bg-white text-cyan-800 shadow-sm">◇</div>
                <h3 className="text-sm font-black text-slate-950">{title}</h3>
                <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">{copy}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">
        <div className="rounded-[2.25rem] bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Official local data layer</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-[-0.03em] sm:text-4xl">Every page gets useful context from public sources, not duplicate portal copy.</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {resources.slice(0, 8).map((resource) => <Link className="rounded-2xl bg-white/10 p-4 text-sm font-bold text-white ring-1 ring-white/10" href="/resources" key={resource}>{resource}</Link>)}
          </div>
        </div>
      </section>

      <InternalLinkHub />
    </main>
  );
}
