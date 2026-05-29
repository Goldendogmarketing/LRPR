import Script from "next/script";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { FavoriteButton } from "@/components/FavoriteButton";
import { GoogleMapPreview } from "@/components/GoogleMapPreview";
import { Header } from "@/components/Header";
import { InternalLinkHub } from "@/components/InternalLinkHub";
import { ListingCard, StatusBadge } from "@/components/ListingCard";
import { PublicDataFacts } from "@/components/PublicDataFacts";
import { ImmersiveListing } from "@/components/immersive";
import {
  listings,
  statusLabels,
  typeLabels,
  type ListedBy,
} from "@/data/site";
import {
  getAllListings,
  getListingBySlug,
} from "@/lib/listings-source";
import {
  getListingPublicDataFacts,
  getPublicDataGeneratedAt,
} from "@/lib/public-data-enrichment";
import {
  decidePresentation,
  resolveListedBy,
} from "@/lib/listing-presentation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getFavoriteSlugsForClerkUser } from "@/lib/favorites";

export function generateStaticParams() {
  return listings.map((listing) => ({ slug: listing.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const listing = listings.find((item) => item.slug === slug);
  if (!listing) return {};
  return {
    title: `${listing.address}, ${listing.city} ${listing.state} | ${typeLabels[listing.type]} | LRPR`,
    description: `${listing.address} in ${listing.city}, ${listing.county}. ${listing.detail}. Status: ${statusLabels[listing.status]}.`,
  };
}

type SearchParams = Promise<{ preview?: string }>;

export default async function ListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: SearchParams;
}) {
  const [{ slug }, { preview }] = await Promise.all([params, searchParams]);

  // Create the Supabase client early so it can be reused for the listing
  // lookup, related listings, and favorites in a single request.
  const supabase = createSupabaseServerClient();

  const listing = await getListingBySlug(supabase, slug);
  if (!listing) notFound();

  const allListings = await getAllListings(supabase);
  const related = allListings
    .filter(
      (item) =>
        item.slug !== listing.slug &&
        (item.city === listing.city || item.county === listing.county),
    )
    .slice(0, 3);
  // Prefer enrichment facts computed at publish time (real DB listings);
  // fall back to the static-by-slug cache for demo listings.
  const publicDataFacts =
    listing.publicDataFacts && listing.publicDataFacts.length > 0
      ? listing.publicDataFacts
      : getListingPublicDataFacts(listing.slug);

  // Personalization for save buttons.
  const { userId } = await auth();
  const isSignedIn = Boolean(userId);
  const savedSlugs = await getFavoriteSlugsForClerkUser(supabase, userId);
  const isThisSaved = savedSlugs.has(listing.slug);

  // Resolve the agent block (overlays profile customization + upgrade flag).
  const agent: ListedBy = await resolveListedBy(supabase, listing.listedBy);

  // Dispatcher: classic (default) vs immersive (paid upgrade) vs preview.
  const presentation = decidePresentation({
    listing,
    agent,
    previewParam: preview,
  });

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

  // ─── Immersive branch ────────────────────────────────────────────────
  if (presentation.style === "immersive") {
    return (
      <>
        <Script
          id="listing-json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {presentation.isPreview ? (
          <PreviewBanner targetStyle="classic" slug={listing.slug} />
        ) : null}
        <ImmersiveListing
          listing={listing}
          agent={agent}
          isSignedIn={isSignedIn}
          isSaved={isThisSaved}
          belowResources={
            <>
              {publicDataFacts.length > 0 ? (
                <section
                  style={{
                    background: "#08080a",
                    padding: "clamp(60px, 10vh, 120px) clamp(28px, 5vw, 80px)",
                    borderTop: "1px solid rgba(200,169,126,0.06)",
                  }}
                >
                  <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <PublicDataFacts
                      title="Address-level public data joins"
                      description="Real LRPR listings are enriched from official public data after the address is approved/submitted, not copied from unreliable third-party listing portals."
                      facts={publicDataFacts}
                      generatedAt={getPublicDataGeneratedAt()}
                    />
                  </div>
                </section>
              ) : null}

              {related.length > 0 ? (
                <section
                  style={{
                    background: "#08080a",
                    padding: "clamp(60px, 10vh, 120px) clamp(28px, 5vw, 80px)",
                    borderTop: "1px solid rgba(200,169,126,0.06)",
                  }}
                >
                  <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        marginBottom: 32,
                        gap: 16,
                        flexWrap: "wrap",
                      }}
                    >
                      <h2
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: "clamp(28px, 4vw, 44px)",
                          fontWeight: 700,
                          color: "#fff",
                          margin: 0,
                        }}
                      >
                        Related local records
                      </h2>
                      <Link
                        href={`/${listing.type}`}
                        style={{
                          fontSize: 11,
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          color: "rgba(200,169,126,0.8)",
                        }}
                      >
                        Browse all {typeLabels[listing.type]} &rarr;
                      </Link>
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gap: 16,
                        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                      }}
                    >
                      {related.map((item) => (
                        <ListingCard
                          listing={item}
                          key={item.id}
                          isSignedIn={isSignedIn}
                          isSaved={savedSlugs.has(item.slug)}
                        />
                      ))}
                    </div>
                  </div>
                </section>
              ) : null}
            </>
          }
        />
      </>
    );
  }

  // ─── Classic branch (default) ────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#f7f3eb] text-slate-950">
      <Header />
      <Script
        id="listing-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {presentation.isPreview ? (
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
          <PreviewBanner targetStyle="immersive" slug={listing.slug} inline />
        </div>
      ) : null}
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.82fr] lg:px-8">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-800">
            {typeLabels[listing.type]}
          </p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
            {listing.address}
          </h1>
          <p className="mt-3 text-xl font-bold text-slate-600">
            {listing.city}, {listing.state} · {listing.county}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <StatusBadge status={listing.status} />
            <span className="text-2xl font-black">{listing.price}</span>
            <span className="rounded-full bg-white px-3 py-1 text-sm font-black">
              {listing.category}
            </span>
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
            <Link
              href={`/listings/${listing.slug}?preview=immersive`}
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
              title="Preview the BW-style cinematic listing template"
            >
              Preview immersive ✨
            </Link>
          </div>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            {listing.description}
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl bg-white p-5">
              <p className="text-xs font-black uppercase text-slate-400">Status</p>
              <p className="mt-1 font-black">{statusLabels[listing.status]}</p>
            </div>
            <div className="rounded-3xl bg-white p-5">
              <p className="text-xs font-black uppercase text-slate-400">
                Coordinates
              </p>
              <p className="mt-1 font-black">
                {listing.latitude}, {listing.longitude}
              </p>
            </div>
            <div className="rounded-3xl bg-white p-5">
              <p className="text-xs font-black uppercase text-slate-400">
                Local hubs
              </p>
              <p className="mt-1 font-black">
                <a
                  href={`/cities/${listing.city.toLowerCase().replaceAll(" ", "-")}`}
                >
                  {listing.city}
                </a>{" "}
                ·{" "}
                <a
                  href={`/counties/${listing.county.toLowerCase().replaceAll(" ", "-")}`}
                >
                  {listing.county}
                </a>
              </p>
            </div>
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
        <h2 className="text-3xl font-black tracking-tight">
          Related local records
        </h2>
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

      {/* Upgrade nudge — small, end-of-page. Free / non-agent users land
          on /account where the page gates them with "upgrade your tier
          first." Paid-tier agents land directly on the toggle. */}
      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">
                Agent upgrade · optional
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight">
                Want this address in the cinematic immersive layout?
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                Paid agent profiles can flip every listing they own to the
                BW-style black/gold parallax presentation with hero, mortgage
                estimator, and branded agent card. Free and unpaid profiles
                stay on this classic layout.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Link
                href={`/listings/${listing.slug}?preview=immersive`}
                className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950"
              >
                Preview the upgrade ↗
              </Link>
              <Link
                href="/account"
                className="rounded-full bg-amber-400 px-5 py-3 text-sm font-black text-slate-950 hover:bg-amber-300"
              >
                Enable in my account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <InternalLinkHub />
    </main>
  );
}

/**
 * Thin floating/inline banner shown when the page is rendering a
 * non-default presentation via `?preview=...`. Lets the visitor get
 * back to the live layout in one click without manually editing the URL.
 *
 * `inline` renders it as a static info bar on the classic layout; the
 * floating variant overlays the immersive page so it stays visible on
 * the dark background.
 */
function PreviewBanner({
  targetStyle,
  slug,
  inline = false,
}: {
  targetStyle: "classic" | "immersive";
  slug: string;
  inline?: boolean;
}) {
  const label =
    targetStyle === "immersive" ? "Preview: Immersive" : "Preview: Classic";
  const description =
    targetStyle === "immersive"
      ? "You're seeing the classic layout. Click below to preview the immersive upgrade."
      : "You're previewing the immersive upgrade. Click below to return to the live classic layout.";
  const ctaHref =
    targetStyle === "immersive"
      ? `/listings/${slug}?preview=immersive`
      : `/listings/${slug}`;
  const ctaLabel =
    targetStyle === "immersive" ? "Switch to immersive →" : "Return to classic →";

  if (inline) {
    return (
      <div className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-800">
              {label}
            </p>
            <p className="mt-1 text-sm text-amber-900">{description}</p>
          </div>
          <Link
            href={ctaHref}
            className="shrink-0 rounded-full bg-amber-600 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white hover:bg-amber-700"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 200,
        background: "rgba(8,8,10,0.92)",
        color: "#fff",
        border: "1px solid rgba(200,169,126,0.4)",
        backdropFilter: "blur(20px)",
        borderRadius: 999,
        padding: "10px 18px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        fontFamily: "'Inter', sans-serif",
        fontSize: 12,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
      }}
    >
      <span style={{ color: "#c8a97e", fontWeight: 700 }}>{label}</span>
      <Link
        href={ctaHref}
        style={{
          color: "#08080a",
          background: "#c8a97e",
          padding: "6px 14px",
          borderRadius: 999,
          fontWeight: 700,
        }}
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
