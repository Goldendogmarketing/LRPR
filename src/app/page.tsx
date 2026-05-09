import Link from "next/link";
import { Header } from "@/components/Header";
import { InternalLinkHub } from "@/components/InternalLinkHub";
import { listings, resources } from "@/data/site";

const mapPins = [
  { label: "$489K", className: "left-[34%] top-[31%] bg-cyan-700" },
  { label: "$249K", className: "left-[57%] top-[23%] bg-cyan-700" },
  { label: "$172K", className: "left-[48%] top-[47%] bg-emerald-600" },
  { label: "$1.4K/mo", className: "left-[67%] top-[62%] bg-emerald-600" },
  { label: "$1.2K/mo", className: "left-[42%] top-[70%] bg-emerald-600" },
  { label: "Lakefront", className: "left-[20%] top-[54%] bg-slate-900" },
  { label: "Land", className: "left-[72%] top-[35%] bg-slate-900" },
];

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

function MiniListingCard({ listing, index }: { listing: (typeof listings)[number]; index: number }) {
  const gradients = [
    "from-cyan-900 via-cyan-700 to-emerald-300",
    "from-slate-900 via-blue-700 to-amber-200",
    "from-stone-900 via-emerald-700 to-lime-200",
    "from-zinc-900 via-slate-600 to-orange-200",
  ];

  return (
    <Link href={`/listings/${listing.slug}`} className="group overflow-hidden rounded-[1.35rem] bg-white shadow-[0_10px_35px_rgba(15,23,42,0.08)] ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-[0_16px_45px_rgba(15,23,42,0.14)]">
      <div className={`relative h-36 bg-gradient-to-br ${gradients[index % gradients.length]}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_26%),linear-gradient(135deg,transparent_35%,rgba(255,255,255,0.18)_35%,rgba(255,255,255,0.18)_42%,transparent_42%)]" />
        <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase text-slate-900 shadow-sm">{listing.status}</span>
        <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-slate-700 shadow-sm">♡</span>
        <div className="absolute bottom-3 left-3 rounded-2xl bg-white/90 px-3 py-2 text-xs font-black text-slate-900 shadow-sm">{listing.category}</div>
      </div>
      <div className="p-4">
        <p className="text-lg font-black tracking-tight text-slate-950">{listing.price}</p>
        <p className="mt-1 text-sm font-bold text-slate-800">{listing.address}</p>
        <p className="mt-1 text-xs font-semibold text-slate-500">{listing.city}, {listing.state} · {listing.county}</p>
        <div className="mt-4 flex items-center gap-4 text-xs font-bold text-slate-600">
          <span>{listing.beds ?? "—"} bd</span>
          <span>{listing.baths ?? "—"} ba</span>
          <span>Map-ready</span>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f4ed] text-slate-950">
      <Header />

      <section className="mx-auto max-w-[1440px] px-3 py-5 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-white bg-white shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
          <div className="grid min-h-[620px] lg:grid-cols-[390px_1fr]">
            <aside className="relative z-10 border-b border-slate-200 bg-white p-5 lg:border-b-0 lg:border-r lg:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">Lake Region search</p>
              <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl">Find local property with verified Lake Region context.</h1>
              <p className="mt-4 text-sm leading-7 text-slate-600">Homes, rentals, land, public data, county links, and trusted service pros across Keystone Heights, Starke, Melrose, Hawthorne, Interlachen, Florahome, and Hampton.</p>

              <div className="mt-6 space-y-5 rounded-[1.5rem] bg-[#f8faf9] p-4 ring-1 ring-slate-200">
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Location</span>
                  <input className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-cyan-700" placeholder="City, address, ZIP, lake, or county" />
                </label>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Property type</p>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs font-black">
                    {['All', 'House', 'Lakefront', 'Land', 'Rental', 'Commercial'].map((type, index) => (
                      <button className={`rounded-xl px-3 py-2 ${index === 0 ? 'bg-slate-950 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200'}`} key={type}>{type}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Transaction</p>
                  <div className="mt-2 flex gap-3 text-sm font-bold text-slate-700">
                    <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> For Sale</label>
                    <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> For Rent</label>
                    <label className="flex items-center gap-2"><input type="checkbox" /> Sold</label>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.16em] text-slate-500"><span>Price range</span><span>$100K — $1.5M+</span></div>
                  <div className="mt-3 h-2 rounded-full bg-slate-200"><div className="h-2 w-3/4 rounded-full bg-cyan-700" /></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <select className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-700"><option>Beds: Any</option></select>
                  <select className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-700"><option>Baths: Any</option></select>
                </div>

                <button className="w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white shadow-lg shadow-slate-900/15">Apply Filters</button>
              </div>
            </aside>

            <div className="relative min-h-[620px] overflow-hidden bg-[#dfeee5]">
              <div className="absolute inset-0 opacity-90 [background-image:linear-gradient(25deg,rgba(34,197,94,0.16)_12%,transparent_12%,transparent_45%,rgba(14,165,233,0.14)_45%,rgba(14,165,233,0.14)_53%,transparent_53%),linear-gradient(115deg,transparent_0_20%,rgba(255,255,255,0.55)_20%_22%,transparent_22%_50%,rgba(255,255,255,0.45)_50%_52%,transparent_52%),linear-gradient(90deg,rgba(15,23,42,0.10)_1px,transparent_1px),linear-gradient(0deg,rgba(15,23,42,0.10)_1px,transparent_1px)] [background-size:100%_100%,100%_100%,72px_72px,72px_72px]" />
              <div className="absolute left-[13%] top-[18%] text-xs font-black text-emerald-900/45">Keystone Heights</div>
              <div className="absolute right-[17%] top-[18%] text-xs font-black text-emerald-900/45">Starke</div>
              <div className="absolute left-[43%] top-[44%] text-3xl font-black tracking-tight text-slate-950/75">Lake Region</div>
              <div className="absolute left-[44%] top-[50%] text-sm font-black uppercase tracking-[0.22em] text-slate-700/60">Florida</div>
              <div className="absolute bottom-[21%] left-[25%] text-xs font-black text-emerald-900/45">Melrose</div>
              <div className="absolute bottom-[19%] right-[23%] text-xs font-black text-emerald-900/45">Interlachen</div>

              <div className="absolute left-8 top-6 flex gap-3">
                <button className="rounded-full bg-white px-4 py-2 text-sm font-black text-slate-800 shadow-sm">✎ Draw Search</button>
                <button className="rounded-full bg-white px-4 py-2 text-sm font-black text-slate-800 shadow-sm">Map ▾</button>
              </div>
              <div className="absolute bottom-6 right-6 overflow-hidden rounded-2xl bg-white shadow-lg">
                <button className="grid h-11 w-11 place-items-center border-b border-slate-200 text-xl font-black">+</button>
                <button className="grid h-11 w-11 place-items-center text-xl font-black">−</button>
              </div>

              {mapPins.map((pin) => (
                <Link href="/for-sale" className={`absolute rounded-full px-3 py-1.5 text-xs font-black text-white shadow-[0_10px_25px_rgba(15,23,42,0.25)] ${pin.className}`} key={pin.label}>{pin.label}</Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black text-orange-500">🔥 New & local listings</p>
            <h2 className="mt-1 text-3xl font-black tracking-[-0.03em] text-slate-950">Approved Lake Region records, not scraped feed noise.</h2>
            <p className="mt-2 text-sm text-slate-600">Demo records shown for design; real inventory will be owner, agent, manager, or LRPR verified.</p>
          </div>
          <Link href="/for-sale" className="hidden text-sm font-black text-cyan-800 sm:block">View all listings →</Link>
          <Link href="/submit-listing" className="hidden rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white sm:block">Submit listing</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {listings.slice(0, 4).map((listing, index) => <MiniListingCard index={index} listing={listing} key={listing.id} />)}
        </div>
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
