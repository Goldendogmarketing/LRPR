"use client";

import { useMemo, useState } from "react";

type ListingStatus = "active" | "pending" | "sold" | "archived";
type ListingType = "For Sale" | "For Rent";

type Listing = {
  id: number;
  address: string;
  city: string;
  type: ListingType;
  status: ListingStatus;
  category: string;
  price: string;
  detail: string;
};

const listings: Listing[] = [
  {
    id: 1,
    address: "421 Lakeview Drive",
    city: "Devils Lake, ND",
    type: "For Sale",
    status: "active",
    category: "Lakefront Homes",
    price: "$489,000",
    detail: "3 bed · 2 bath · private dock access",
  },
  {
    id: 2,
    address: "118 5th Street NE",
    city: "Devils Lake, ND",
    type: "For Sale",
    status: "pending",
    category: "Single-Family Homes",
    price: "$249,500",
    detail: "4 bed · 2 bath · near schools",
  },
  {
    id: 3,
    address: "77 Prairie Ridge Road",
    city: "Lake Region, ND",
    type: "For Sale",
    status: "sold",
    category: "Acreage & Land",
    price: "$172,000",
    detail: "12 acres · shop-ready site",
  },
  {
    id: 4,
    address: "205 Marina Bay Unit 3",
    city: "Devils Lake, ND",
    type: "For Rent",
    status: "active",
    category: "Apartments & Condos",
    price: "$1,450/mo",
    detail: "2 bed · 2 bath · water views",
  },
  {
    id: 5,
    address: "912 College Avenue",
    city: "Devils Lake, ND",
    type: "For Rent",
    status: "archived",
    category: "Single-Family Rentals",
    price: "$1,200/mo",
    detail: "3 bed · 1 bath · archived record",
  },
];

const saleCategories = [
  "Lakefront Homes",
  "Single-Family Homes",
  "Land & Acreage",
  "Commercial Property",
];

const rentCategories = [
  "Apartments & Condos",
  "Single-Family Rentals",
  "Short-Term / Seasonal",
  "Commercial Lease",
];

const resources = [
  "Utilities",
  "Municipal contacts",
  "County offices",
  "Schools",
  "Emergency numbers",
  "Permits & zoning",
];

const servicePros = [
  "Plumbing",
  "Electrical",
  "HVAC",
  "Landscaping",
  "Roofing",
  "Inspection",
  "Cleaning & staging",
  "Property management",
];

const navItems = ["For Sale", "For Rent", "Resources", "Service Pros"];

const statusStyles: Record<ListingStatus, string> = {
  active: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  pending: "bg-amber-100 text-amber-800 ring-amber-200",
  sold: "bg-slate-200 text-slate-700 ring-slate-300",
  archived: "bg-zinc-200 text-zinc-700 ring-zinc-300",
};

export default function Home() {
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return listings.slice(0, 4);
    }

    return listings
      .filter((listing) =>
        `${listing.address} ${listing.city}`.toLowerCase().includes(normalizedQuery),
      )
      .slice(0, 5);
  }, [query]);

  return (
    <main className="min-h-screen bg-[#f7f3eb] text-slate-950">
      <header className="sticky top-0 z-50 border-b border-white/60 bg-[#f7f3eb]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <a href="#top" className="flex items-center gap-2" aria-label="Lake Region Property Resource home">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-slate-950 text-sm font-bold text-white shadow-sm">
              LR
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-black tracking-tight sm:text-base">Lake Region</span>
              <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Property Resource
              </span>
            </span>
          </a>

          <nav className="hidden items-center rounded-full border border-slate-200 bg-white/75 p-1 shadow-sm md:flex">
            {navItems.map((item) => (
              <a
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-950 hover:text-white"
                href={`#${item.toLowerCase().replaceAll(" ", "-")}`}
                key={item}
              >
                {item}
              </a>
            ))}
          </nav>

          <button className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-800 shadow-sm md:hidden">
            Menu
          </button>
        </div>
      </header>

      <section id="top" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,116,144,0.22),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(34,197,94,0.20),_transparent_28%)]" />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:pb-24 lg:pt-20">
          <div className="relative z-10 flex flex-col justify-center">
            <p className="mb-4 w-fit rounded-full border border-white/70 bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-900 shadow-sm">
              Local listings · local resources · local pros
            </p>
            <h1 className="max-w-3xl text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-6xl lg:text-7xl">
              Find property and trusted contacts across the Lake Region.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-650 sm:text-lg">
              Search homes, rentals, land, past records, utilities, municipal contacts, and real-estate service providers from one simple local hub.
            </p>

            <div className="mt-8 rounded-[2rem] border border-white/80 bg-white/90 p-3 shadow-2xl shadow-slate-900/10 backdrop-blur">
              <label htmlFor="address-search" className="sr-only">
                Search an address in the LRPR database
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
                  <input
                    id="address-search"
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-base font-semibold outline-none transition placeholder:text-slate-400 focus:border-cyan-700 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                    placeholder="Type an address — only database listings appear"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>
                <button className="h-14 rounded-2xl bg-slate-950 px-6 text-sm font-black text-white shadow-lg shadow-slate-950/20 transition hover:bg-cyan-950">
                  Search
                </button>
              </div>

              <div className="mt-3 overflow-hidden rounded-2xl border border-slate-100 bg-white">
                {matches.length > 0 ? (
                  matches.map((listing) => (
                    <button
                      className="flex w-full flex-col gap-2 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-cyan-50/70 sm:flex-row sm:items-center sm:justify-between"
                      key={listing.id}
                    >
                      <span>
                        <span className="block text-sm font-black text-slate-950">{listing.address}</span>
                        <span className="block text-xs font-semibold text-slate-500">
                          {listing.city} · {listing.type} · {listing.category}
                        </span>
                      </span>
                      <span className="flex items-center gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-black uppercase ring-1 ${statusStyles[listing.status]}`}>
                          {listing.status}
                        </span>
                        <span className="text-sm font-black text-slate-900">{listing.price}</span>
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-4 text-sm font-semibold text-slate-500">
                    No matching address in the local LRPR database.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="relative z-10 min-h-[420px] rounded-[2.5rem] border border-white/70 bg-slate-950 p-4 shadow-2xl shadow-slate-900/20 sm:min-h-[520px]">
            <div className="absolute inset-4 rounded-[2rem] bg-[linear-gradient(135deg,_rgba(14,116,144,0.72),_rgba(15,23,42,0.5)),url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center" />
            <div className="relative flex h-full min-h-[390px] flex-col justify-between rounded-[2rem] border border-white/20 p-5 text-white sm:min-h-[490px] sm:p-7">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] backdrop-blur">
                  Lake Region map preview
                </span>
                <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-black text-emerald-950">
                  Live concept
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {listings.slice(0, 4).map((listing) => (
                  <article className="rounded-3xl border border-white/15 bg-white/15 p-4 backdrop-blur-xl" key={listing.id}>
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100">{listing.type}</span>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ring-1 ${statusStyles[listing.status]}`}>
                        {listing.status}
                      </span>
                    </div>
                    <h2 className="text-sm font-black">{listing.address}</h2>
                    <p className="mt-1 text-xs leading-5 text-white/75">{listing.detail}</p>
                    <p className="mt-3 text-lg font-black">{listing.price}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-4 lg:px-8">
        {[
          ["Database statuses", "Active, pending, sold, and archived records stay searchable."],
          ["Listing directions", "Clear paths for properties for sale and properties for rent."],
          ["Resource hub", "Utilities, municipal numbers, local contacts, and buyer/seller basics."],
          ["Service Pros", "Real-estate vendors for repairs, maintenance, inspection, and projects."],
        ].map(([title, copy]) => (
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm" key={title}>
            <h2 className="text-base font-black text-slate-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:px-8" id="for-sale">
        <CategoryPanel
          eyebrow="For Sale"
          title="Browse sale categories without getting lost."
          copy="Start with the high-intent paths buyers actually understand, then add deeper filters once the database grows."
          categories={saleCategories}
        />
        <CategoryPanel
          eyebrow="For Rent"
          title="Rental search gets its own clean lane."
          copy="Renters should not have to fight through sale inventory. Rental categories can later power alerts and applications."
          categories={rentCategories}
          id="for-rent"
        />
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8" id="resources">
        <div className="rounded-[2rem] bg-cyan-950 p-6 text-white sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Resources</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Local numbers and contacts in one place.</h2>
          <p className="mt-4 text-sm leading-7 text-cyan-50/80">
            This tab will hold the practical Lake Region info people repeatedly need during buying, selling, renting, moving, and maintaining property.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {resources.map((resource) => (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 font-bold text-slate-800 shadow-sm" key={resource}>
              {resource}
              <p className="mt-2 text-sm font-medium leading-6 text-slate-500">Directory-ready placeholder for names, phone numbers, links, and notes.</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 pb-16 sm:px-6 lg:px-8" id="service-pros">
        <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-800">Service Pros</p>
              <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">
                Vendors for real-estate service work.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                I’d name this tab <strong>Service Pros</strong>. It is short, clear on mobile, and can include plumbing, electrical, HVAC, landscaping, inspections, property management, and more.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600">
              CTA intentionally reserved for later
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {servicePros.map((service) => (
              <div className="rounded-3xl bg-[#f7f3eb] p-5" key={service}>
                <div className="mb-6 h-10 w-10 rounded-2xl bg-slate-950" />
                <h3 className="font-black text-slate-950">{service}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Future vendor cards, featured placements, contact forms, and reviews.</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function CategoryPanel({
  eyebrow,
  title,
  copy,
  categories,
  id,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  categories: string[];
  id?: string;
}) {
  return (
    <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8" id={id}>
      <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-800">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">{copy}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {categories.map((category) => (
          <button className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left text-sm font-black text-slate-800 transition hover:border-cyan-700 hover:bg-cyan-50" key={category}>
            {category}
          </button>
        ))}
      </div>
    </article>
  );
}
