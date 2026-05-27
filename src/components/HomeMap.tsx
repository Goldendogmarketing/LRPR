"use client";

import { useState } from "react";
import Link from "next/link";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import type { Listing } from "@/data/site";

const LAKE_REGION_CENTER = { lat: 29.74, lng: -81.99 };
const DEFAULT_ZOOM = 10;
// DEMO_MAP_ID is Google's documented placeholder that allows AdvancedMarker
// to render without provisioning a custom Map ID in Cloud Console.
// Swap for a real Map ID later if you want custom map styling.
const MAP_ID = "DEMO_MAP_ID";

function pinBgColor(listing: Listing): string {
  if (listing.status === "sold" || listing.status === "archived") return "#0f172a"; // slate-900
  if (listing.type === "for-rent") return "#059669"; // emerald-600
  return "#0e7490"; // cyan-700
}

type Props = {
  listings: Listing[];
};

export function HomeMap({ listings }: Props) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [activeId, setActiveId] = useState<number | null>(null);

  if (!apiKey) {
    return (
      <div className="grid h-full min-h-[620px] place-items-center bg-[radial-gradient(circle_at_top_left,_rgba(14,116,144,0.25),_transparent_32%),linear-gradient(135deg,_#0f172a,_#164e63)] p-6 text-center text-white">
        <div>
          <p className="text-3xl font-black">Interactive map</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/75">
            Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local (with Maps
            JavaScript API enabled) to render the live Lake Region map.
          </p>
        </div>
      </div>
    );
  }

  const activeListing =
    activeId !== null ? listings.find((l) => l.id === activeId) ?? null : null;

  return (
    <APIProvider apiKey={apiKey}>
      <div className="relative h-full min-h-[620px] overflow-hidden">
        <Map
          defaultCenter={LAKE_REGION_CENTER}
          defaultZoom={DEFAULT_ZOOM}
          mapId={MAP_ID}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={false}
          style={{ width: "100%", height: "100%" }}
        >
          {listings.map((listing) => (
            <AdvancedMarker
              key={listing.id}
              position={{ lat: listing.latitude, lng: listing.longitude }}
              onClick={() => setActiveId(listing.id)}
            >
              <div
                className="rounded-full px-3 py-1.5 text-xs font-black text-white shadow-[0_10px_25px_rgba(15,23,42,0.25)] ring-2 ring-white transition hover:scale-110"
                style={{ backgroundColor: pinBgColor(listing) }}
              >
                {listing.price}
              </div>
            </AdvancedMarker>
          ))}

          {activeListing && (
            <InfoWindow
              position={{
                lat: activeListing.latitude,
                lng: activeListing.longitude,
              }}
              onCloseClick={() => setActiveId(null)}
              pixelOffset={[0, -16]}
            >
              <div className="max-w-[220px] space-y-1 p-1 text-slate-900">
                <p className="text-sm font-black">{activeListing.price}</p>
                <p className="text-xs font-bold">{activeListing.address}</p>
                <p className="text-xs text-slate-500">
                  {activeListing.city}, {activeListing.state} ·{" "}
                  {activeListing.county}
                </p>
                {activeListing.detail && (
                  <p className="text-xs text-slate-600">
                    {activeListing.detail}
                  </p>
                )}
                <Link
                  href={`/listings/${activeListing.slug}`}
                  className="mt-2 inline-block text-xs font-black text-cyan-800 underline"
                >
                  View listing →
                </Link>
              </div>
            </InfoWindow>
          )}
        </Map>

        {/* Decorative city labels overlay (purely visual, doesn't block map interaction) */}
        <div className="pointer-events-none absolute left-8 top-6 flex gap-3">
          <div className="rounded-full bg-white/95 px-4 py-2 text-xs font-black text-slate-800 shadow-sm">
            {listings.length} mapped listings
          </div>
        </div>
      </div>
    </APIProvider>
  );
}
