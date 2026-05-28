import Script from "next/script";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { GoogleMapPreview } from "@/components/GoogleMapPreview";
import { Header } from "@/components/Header";
import { InternalLinkHub } from "@/components/InternalLinkHub";
import { ListingCard, StatusBadge } from "@/components/ListingCard";
import { FavoriteButton } from "@/components/FavoriteButton";
import { PublicDataFacts } from "@/components/PublicDataFacts";
import { listings, statusLabels, typeLabels } from "@/data/site";
import { getListingPublicDataFacts, getPublicDataGeneratedAt } from "@/lib/public-data-enrichment";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getFavoriteSlugsForClerkUser } from "@/lib/favorites";

export function generateStaticParams() {
  return listings.map((listing) => ({ slug: listing.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = listings.find((item) => item.slug === slug);
  if (!listing) return {};
  return {
    title: `${listing.address}, ${listing.city} ${listing.state} | ${typeLabels[listing.type]} | LRPR`,
    description: `${listing.address} in ${listing.city}, ${listing.county}. ${listing.detail}. Status: ${statusLabels[listing.status]}.`,
  };
}

export default async function ListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = listings.find((item) => item.slug === slug);
  if (!listing) notFound();
  const related = listings.filter((item) => item.slug !== listing.slug && (item.city === listing.city || item.county === listing.county)).slice(0, 3);
  const publicDataFacts = getListingPublicDataFacts(listing.slug);

  // Personalization: figure out which related listings (and this one) are
  // already in the user's favorites so the hearts render correctly.
  const { userId } = await auth();
  const isSignedIn = Boolean(userId);
  const supabase = createSupabaseServerClient();
  const savedSlugs = await getFavoriteSlugsForClerkUser(supabase, userId);
  const isThisSaved = savedSlugs.has(listing.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Residence",
    name: `${listing.address}, ${listing.city}, ${listing.state}`,
    description: listing.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: listing.address,
      addressLocality: listing.city,
      addressRegion: listing.state,
      postalCode: listing.postalCode,
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: listing.latitude,
      longitude: listing.longitude,
    },
    url: `/listings/${listing.slug}`,
  };

  return (
    <main className="min-h-screen bg-[#f7f3eb] text-slate-950">
      <Header />
      <Script id="listing-json-ld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.82fr] lg:px-8">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-800">{typeLabels[listing.type]}</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">{listing.address}</h1>
          <p className="mt-3 text-xl font-bold text-slate-600">{listing.city}, {listing.state} · {listing.county}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <StatusBadge status={listing.status} />
            <span className="text-2xl font-black">{listing.price}</span>
            <span className="rounded-full bg-white px-3 py-1 text-sm font-black">{listing.category}</span>
            <FavoriteButton
              listingSlug={listing.slug}
              isSaved={isThisSaved}
              isSignedIn={isSignedIn}
              variant="label"
            />
            {!isSignedIn ? (
              <Link
                href="/sign-in"
                className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50"
              >
                Sign in to save ♡
              </Link>
            ) : null}
          </div>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">{listing.description}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl bg-white p-5"><p className="text-xs font-black uppercase text-slate-400">Status</p><p className="mt-1 font-black">{statusLabels[listing.status]}</p></div>
            <div className="rounded-3xl bg-white p-5"><p className="text-xs font-black uppercase text-slate-400">Coordinates</p><p className="mt-1 font-black">{listing.latitude}, {listing.longitude}</p></div>
            <div className="rounded-3xl bg-white p-5"><p className="text-xs font-black uppercase text-slate-400">Local hubs</p><p className="mt-1 font-black"><a href={`/cities/${listing.city.toLowerCase().replaceAll(" ", "-")}`}>{listing.city}</a> · <a href={`/counties/${listing.county.toLowerCase().replaceAll(" ", "-")}`}>{listing.county}</a></p></div>
          </div>
        </div>
        <GoogleMapPreview listing={listing} />
      </section>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PublicDataFacts
          title="Address-level public data joins"
          description="Real LRPR listings will be enriched from official public data after the address is approved/submitted, not copied from unreliable third-party listing portals."
          facts={publicDataFacts}
          generatedAt={getPublicDataGeneratedAt()}
        />
      </section>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black tracking-tight">Related local records</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {related.map((item) => (
            <ListingCard
              listing={item}
              key={item.id}
              isSignedIn={isSignedIn}
              isSaved={savedSlugs.has(item.slug)}
            />
          ))}
        </div>
      </section>
      <InternalLinkHub />
    </main>
  );
}
