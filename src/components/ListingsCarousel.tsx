"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Listing } from "@/data/site";

const gradients = [
  "from-cyan-900 via-cyan-700 to-emerald-300",
  "from-slate-900 via-blue-700 to-amber-200",
  "from-stone-900 via-emerald-700 to-lime-200",
  "from-zinc-900 via-slate-600 to-orange-200",
];

function isPromoted(listing: Listing): boolean {
  return listing.presentationStyle === "immersive" || Boolean(listing.listedBy?.immersiveEnabled);
}

function CarouselCard({ listing, index }: { listing: Listing; index: number }) {
  const promoted = isPromoted(listing);

  return (
    <Link
      href={`/listings/${listing.slug}`}
      className="group relative w-[85%] shrink-0 snap-start overflow-hidden rounded-[1.35rem] bg-white shadow-[0_10px_35px_rgba(15,23,42,0.08)] ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-[0_16px_45px_rgba(15,23,42,0.14)] sm:w-[46%] lg:w-[31%] xl:w-[23.5%]"
    >
      <div className={`relative h-36 bg-gradient-to-br ${gradients[index % gradients.length]}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_26%),linear-gradient(135deg,transparent_35%,rgba(255,255,255,0.18)_35%,rgba(255,255,255,0.18)_42%,transparent_42%)]" />
        {promoted ? (
          <span className="absolute left-3 top-3 rounded-full bg-amber-400 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-amber-950 shadow-sm">
            ★ Sponsored
          </span>
        ) : (
          <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase text-slate-900 shadow-sm">
            {listing.status}
          </span>
        )}
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

export function ListingsCarousel({ listings }: { listings: Listing[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  // Promoted/sponsored listings surface first.
  const ordered = [...listings].sort(
    (a, b) => Number(isPromoted(b)) - Number(isPromoted(a)),
  );

  const scrollByCard = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("a");
    const step = card ? card.offsetWidth + 16 : track.clientWidth * 0.8;
    track.scrollBy({ left: step * direction, behavior: "smooth" });
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let paused = false;
    const pause = () => (paused = true);
    const resume = () => (paused = false);
    track.addEventListener("pointerenter", pause);
    track.addEventListener("pointerleave", resume);
    track.addEventListener("focusin", pause);
    track.addEventListener("focusout", resume);

    const timer = setInterval(() => {
      if (paused) return;
      const card = track.querySelector<HTMLElement>("a");
      const step = card ? card.offsetWidth + 16 : track.clientWidth * 0.8;
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
      if (atEnd) {
        track.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        track.scrollBy({ left: step, behavior: "smooth" });
      }
    }, 4000);

    return () => {
      clearInterval(timer);
      track.removeEventListener("pointerenter", pause);
      track.removeEventListener("pointerleave", resume);
      track.removeEventListener("focusin", pause);
      track.removeEventListener("focusout", resume);
    };
  }, []);

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {ordered.map((listing, index) => (
          <CarouselCard listing={listing} index={index} key={listing.id} />
        ))}
      </div>

      <button
        type="button"
        aria-label="Previous listings"
        onClick={() => scrollByCard(-1)}
        className="absolute left-0 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full bg-white text-lg font-black text-slate-800 shadow-[0_8px_24px_rgba(15,23,42,0.18)] ring-1 ring-slate-200 transition hover:bg-slate-950 hover:text-white sm:grid"
      >
        ‹
      </button>
      <button
        type="button"
        aria-label="Next listings"
        onClick={() => scrollByCard(1)}
        className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-1/2 grid h-11 w-11 place-items-center rounded-full bg-white text-lg font-black text-slate-800 shadow-[0_8px_24px_rgba(15,23,42,0.18)] ring-1 ring-slate-200 transition hover:bg-slate-950 hover:text-white sm:grid"
      >
        ›
      </button>
    </div>
  );
}
