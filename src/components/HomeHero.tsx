"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { HomeMap } from "@/components/HomeMap";
import { StatusBadge } from "@/components/ListingCard";
import { listings, typeLabels, type Listing, type ListingType, type ListingStatus } from "@/data/site";

type TypeFilter = "all" | ListingType;
type StatusFilter = "all" | ListingStatus;
type BedsFilter = "any" | 1 | 2 | 3 | 4;

const typeFilters: [TypeFilter, string][] = [
  ["all", "All"],
  ["for-sale", "For Sale"],
  ["for-rent", "For Rent"],
];

const statusFilters: [StatusFilter, string][] = [
  ["all", "Any status"],
  ["active", "Active"],
  ["pending", "Pending"],
  ["sold", "Sold"],
  ["archived", "Archived"],
];

const bedsFilters: [BedsFilter, string][] = [
  ["any", "Any"],
  [1, "1+"],
  [2, "2+"],
  [3, "3+"],
  [4, "4+"],
];

function FilterPill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-2 text-sm font-bold transition ${
        active
          ? "bg-slate-950 text-white shadow-sm"
          : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

export function HomeHero() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TypeFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [beds, setBeds] = useState<BedsFilter>("any");

  const filtered = useMemo<Listing[]>(() => {
    const q = query.trim().toLowerCase();
    return listings.filter((listing) => {
      if (type !== "all" && listing.type !== type) return false;
      if (status !== "all" && listing.status !== status) return false;
      if (beds !== "any" && (listing.beds ?? 0) < beds) return false;
      if (q) {
        const haystack = `${listing.address} ${listing.city} ${listing.county} ${listing.status}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [query, type, status, beds]);

  const suggestions = query.trim() ? filtered.slice(0, 5) : [];

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-5 lg:grid-cols-2 lg:grid-rows-[auto_1fr]">
        {/* 1 — Search (first in DOM = first on mobile) */}
        <div className="lg:col-start-1 lg:row-start-1">
          <form action="/search" method="get" className="rounded-[1.75rem] border border-white/80 bg-white p-3 shadow-[0_12px_40px_rgba(15,23,42,0.08)] ring-1 ring-slate-100">
            <label htmlFor="address-search" className="sr-only">Search the Lake Region database</label>
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
                <input
                  id="address-search"
                  name="q"
                  className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-10 pr-4 text-base font-semibold outline-none transition placeholder:text-slate-400 focus:border-cyan-700 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                  placeholder="Search address, city, or county"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  autoComplete="off"
                />
              </div>
              <button type="submit" className="rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-slate-950/20 transition hover:bg-cyan-950">
                Search
              </button>
            </div>

            {suggestions.length > 0 && (
              <div className="mt-2.5 overflow-hidden rounded-2xl border border-slate-100 bg-white">
                {suggestions.map((listing) => (
                  <Link
                    className="flex w-full flex-col gap-1.5 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-cyan-50/70 sm:flex-row sm:items-center sm:justify-between"
                    href={`/listings/${listing.slug}`}
                    key={listing.id}
                  >
                    <span>
                      <span className="block text-sm font-black text-slate-950">{listing.address}</span>
                      <span className="block text-xs font-semibold text-slate-500">
                        {listing.city}, {listing.state} · {typeLabels[listing.type]} · {listing.category}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <StatusBadge status={listing.status} />
                      <span className="text-sm font-black text-slate-900">{listing.price}</span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </form>
        </div>

        {/* 2 — Map (right column on desktop, directly below search on mobile) */}
        <div className="overflow-hidden rounded-[1.75rem] border border-white bg-white shadow-[0_20px_80px_rgba(15,23,42,0.08)] lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div className="h-[360px] sm:h-[460px] lg:h-full lg:min-h-[520px]">
            <HomeMap listings={filtered} />
          </div>
        </div>

        {/* 3 — Filters (below search on left; below map on mobile) */}
        <div className="rounded-[1.75rem] bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)] ring-1 ring-slate-200 lg:col-start-1 lg:row-start-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-black text-slate-950">Filter listings</h2>
            <span className="text-xs font-bold text-slate-500">{filtered.length} shown on map</span>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-slate-400">Listing type</p>
              <div className="flex flex-wrap gap-2">
                {typeFilters.map(([value, label]) => (
                  <FilterPill key={value} active={type === value} onClick={() => setType(value)}>
                    {label}
                  </FilterPill>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-slate-400">Bedrooms</p>
              <div className="flex flex-wrap gap-2">
                {bedsFilters.map(([value, label]) => (
                  <FilterPill key={String(value)} active={beds === value} onClick={() => setBeds(value)}>
                    {label}
                  </FilterPill>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-slate-400">Status</p>
              <div className="flex flex-wrap gap-2">
                {statusFilters.map(([value, label]) => (
                  <FilterPill key={value} active={status === value} onClick={() => setStatus(value)}>
                    {label}
                  </FilterPill>
                ))}
              </div>
            </div>

            {(type !== "all" || status !== "all" || beds !== "any" || query) && (
              <button
                type="button"
                onClick={() => {
                  setType("all");
                  setStatus("all");
                  setBeds("any");
                  setQuery("");
                }}
                className="text-xs font-black text-cyan-800 underline underline-offset-2"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
