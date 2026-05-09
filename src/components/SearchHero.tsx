"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { listings, typeLabels } from "@/data/site";
import { StatusBadge } from "@/components/ListingCard";

export function SearchHero() {
  const [query, setQuery] = useState("");
  const matches = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return listings.slice(0, 4);
    return listings.filter((listing) => `${listing.address} ${listing.city} ${listing.county} ${listing.status}`.toLowerCase().includes(normalizedQuery)).slice(0, 6);
  }, [query]);

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,116,144,0.22),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(34,197,94,0.20),_transparent_28%)]" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:pb-20 lg:pt-16">
        <div className="relative z-10 flex flex-col justify-center">
          <p className="mb-4 w-fit rounded-full border border-white/70 bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-900 shadow-sm">Local listings · city pages · county resources</p>
          <h1 className="max-w-3xl text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-6xl lg:text-7xl">Find property and trusted contacts across the Lake Region.</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">Growth-driven, flat local architecture for homes, rentals, land, resources, service pros, city pages, county pages, and address-level map data.</p>

          <div className="mt-8 rounded-[2rem] border border-white/80 bg-white/90 p-3 shadow-2xl shadow-slate-900/10 backdrop-blur">
            <label htmlFor="address-search" className="sr-only">Search an address in the LRPR database</label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
                <input id="address-search" className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-base font-semibold outline-none transition placeholder:text-slate-400 focus:border-cyan-700 focus:bg-white focus:ring-4 focus:ring-cyan-100" placeholder="Type an address — active, pending, sold, archived" value={query} onChange={(event) => setQuery(event.target.value)} />
              </div>
              <button className="h-14 rounded-2xl bg-slate-950 px-6 text-sm font-black text-white shadow-lg shadow-slate-950/20 transition hover:bg-cyan-950">Search</button>
            </div>

            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-100 bg-white">
              {matches.length > 0 ? matches.map((listing) => (
                <Link className="flex w-full flex-col gap-2 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-cyan-50/70 sm:flex-row sm:items-center sm:justify-between" href={`/listings/${listing.slug}`} key={listing.id}>
                  <span><span className="block text-sm font-black text-slate-950">{listing.address}</span><span className="block text-xs font-semibold text-slate-500">{listing.city}, {listing.state} · {typeLabels[listing.type]} · {listing.category}</span></span>
                  <span className="flex items-center gap-2"><StatusBadge status={listing.status} /><span className="text-sm font-black text-slate-900">{listing.price}</span></span>
                </Link>
              )) : <div className="px-4 py-4 text-sm font-semibold text-slate-500">No matching address in the local LRPR database.</div>}
            </div>
          </div>
        </div>

        <div className="relative z-10 min-h-[420px] rounded-[2.5rem] border border-white/70 bg-slate-950 p-4 shadow-2xl shadow-slate-900/20 sm:min-h-[520px]">
          <div className="absolute inset-4 rounded-[2rem] bg-[linear-gradient(135deg,_rgba(14,116,144,0.72),_rgba(15,23,42,0.5)),url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center" />
          <div className="relative flex h-full min-h-[390px] flex-col justify-between rounded-[2rem] border border-white/20 p-5 text-white sm:min-h-[490px] sm:p-7">
            <div className="flex items-center justify-between"><span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] backdrop-blur">Lake Region link graph</span><span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-black text-emerald-950">SEO-first</span></div>
            <div className="grid gap-3 sm:grid-cols-2">
              {listings.slice(0, 4).map((listing) => (
                <Link className="rounded-3xl border border-white/15 bg-white/15 p-4 backdrop-blur-xl transition hover:bg-white/25" href={`/listings/${listing.slug}`} key={listing.id}>
                  <div className="mb-3 flex items-center justify-between gap-2"><span className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100">{typeLabels[listing.type]}</span><StatusBadge status={listing.status} /></div>
                  <h2 className="text-sm font-black">{listing.address}</h2>
                  <p className="mt-1 text-xs leading-5 text-white/75">{listing.detail}</p>
                  <p className="mt-3 text-lg font-black">{listing.price}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
