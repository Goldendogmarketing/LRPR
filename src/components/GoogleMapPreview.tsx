import { Listing, getGoogleMapsUrl } from "@/data/site";

export function GoogleMapPreview({ listing }: { listing: Listing }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const label = `${listing.address}, ${listing.city}, ${listing.state}`;
  const embedSrc = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${listing.latitude},${listing.longitude}&zoom=15`
    : undefined;

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">Google Maps coordinates</p>
          <h2 className="text-xl font-black text-slate-950">{label}</h2>
        </div>
        <a className="rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white" href={getGoogleMapsUrl(listing)} target="_blank" rel="noreferrer">Open map</a>
      </div>

      {embedSrc ? (
        <iframe className="h-80 w-full rounded-[1.5rem] border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={embedSrc} title={`Google Map for ${label}`} />
      ) : (
        <div className="grid h-80 place-items-center rounded-[1.5rem] bg-[radial-gradient(circle_at_top_left,_rgba(14,116,144,0.25),_transparent_32%),linear-gradient(135deg,_#0f172a,_#164e63)] p-6 text-center text-white">
          <div>
            <p className="text-3xl font-black">{listing.latitude.toFixed(4)}, {listing.longitude.toFixed(4)}</p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/75">Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local to render the embedded Google Map. Coordinates are already stored for structured SEO and map links.</p>
          </div>
        </div>
      )}
    </section>
  );
}
