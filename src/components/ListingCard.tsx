import Link from "next/link";
import { getGoogleMapsUrl, Listing, statusLabels, typeLabels } from "@/data/site";
import { FavoriteButton } from "./FavoriteButton";

const statusStyles = {
  active: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  pending: "bg-amber-100 text-amber-800 ring-amber-200",
  sold: "bg-slate-200 text-slate-700 ring-slate-300",
  archived: "bg-zinc-200 text-zinc-700 ring-zinc-300",
};

export function StatusBadge({ status }: { status: Listing["status"] }) {
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-black uppercase ring-1 ${statusStyles[status]}`}>{statusLabels[status]}</span>;
}

type ListingCardProps = {
  listing: Listing;
  /** When provided, the save-favorite button is rendered. */
  isSignedIn?: boolean;
  /** Whether this listing is in the current user's favorites. Defaults to false. */
  isSaved?: boolean;
};

export function ListingCard({ listing, isSignedIn = false, isSaved = false }: ListingCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-xs font-black uppercase tracking-[0.16em] text-cyan-800">{typeLabels[listing.type]}</span>
        <div className="flex items-center gap-2">
          <StatusBadge status={listing.status} />
          <FavoriteButton listingSlug={listing.slug} isSaved={isSaved} isSignedIn={isSignedIn} />
        </div>
      </div>
      <h2 className="text-xl font-black text-slate-950"><Link href={`/listings/${listing.slug}`}>{listing.address}</Link></h2>
      <p className="mt-1 text-sm font-semibold text-slate-500">{listing.city}, {listing.state} · {listing.county}</p>
      <p className="mt-3 text-sm leading-6 text-slate-600">{listing.detail}</p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-lg font-black text-slate-950">{listing.price}</p>
        <Link className="rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white" href={`/listings/${listing.slug}`}>View</Link>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
        <Link className="rounded-full bg-slate-100 px-3 py-1" href={`/cities/${listing.city.toLowerCase().replaceAll(" ", "-")}`}>{listing.city}</Link>
        <Link className="rounded-full bg-slate-100 px-3 py-1" href={`/counties/${listing.county.toLowerCase().replaceAll(" ", "-")}`}>{listing.county}</Link>
        <a className="rounded-full bg-cyan-50 px-3 py-1 text-cyan-800" href={getGoogleMapsUrl(listing)} target="_blank" rel="noreferrer">Map</a>
      </div>
    </article>
  );
}
