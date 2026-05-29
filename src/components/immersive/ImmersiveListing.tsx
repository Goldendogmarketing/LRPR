"use client";

import type { ReactNode } from "react";
import type { Listing, ListedBy } from "@/data/site";
import { DEFAULT_ACCENT, ImmersiveStyles, ScrollBar } from "./primitives";
import {
  ImmersiveAerial,
  ImmersiveCTA,
  ImmersiveFeatureSection,
  ImmersiveFooter,
  ImmersiveHero,
  ImmersiveMortgageCalc,
  ImmersiveNav,
  ImmersiveResources,
  parsePriceNumeric,
} from "./sections";

type Props = {
  listing: Listing;
  /** Resolved agent block — merged from listing.listedBy + profile customization. */
  agent: ListedBy;
  isSignedIn: boolean;
  isSaved: boolean;
  /**
   * Optional slot rendered between the buyer-resources grid and the footer.
   * Use this for SEO-critical content like public-data facts and related
   * listings that don't fit the parallax visual language of the rest of
   * the page. Pass server-component output here.
   */
  belowResources?: ReactNode;
};

/**
 * Composes the full immersive listing page from the BW reference into a
 * single client component. The server page (/listings/[slug]/page.tsx)
 * fetches the listing, looks up the agent's profile customization, and
 * hands the merged data here as plain JSON.
 *
 * Sections degrade gracefully:
 *  - Missing photos -> reuse hero photo for each section
 *  - Missing features -> skip the feature reel entirely
 *  - For-rent listings -> mortgage calc auto-hides
 *  - Missing agent fields -> CTA falls back to bare form
 */
export function ImmersiveListing({ listing, agent, isSignedIn, isSaved, belowResources }: Props) {
  const accent = agent.accentColor ?? DEFAULT_ACCENT;

  // Stable initials for nav/footer monogram. Prefer agent display name,
  // fall back to "LR" for Lake Region Property Resource.
  const initials = (() => {
    if (agent.displayName) {
      const parts = agent.displayName.trim().split(/\s+/);
      return (parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "");
    }
    return "LR";
  })()
    .toUpperCase()
    .slice(0, 2);

  const brand = agent.brokerage ?? "Lake Region Property Resource";

  // Fall back to hero photo if dedicated section photos are missing.
  const hero = listing.heroPhoto ?? listing.photos?.[0] ?? "";
  const aerial = listing.aerialPhoto ?? hero;
  const ctaPhoto = listing.photos?.[listing.photos.length - 1] ?? hero;
  const featurePhotos = listing.photos ?? [];

  // Build the hero stats row. Only include rows we have data for so
  // 3-bed rentals don't show a blank "Lot" tile.
  const heroStats: { val: React.ReactNode; label: string }[] = [];
  if (listing.beds != null) heroStats.push({ val: listing.beds, label: "Bedrooms" });
  if (listing.baths != null) heroStats.push({ val: listing.baths, label: "Bathrooms" });
  if (listing.sqft) heroStats.push({ val: listing.sqft, label: "Sq Ft" });
  if (listing.lot) heroStats.push({ val: listing.lot, label: "Lot" });
  // Always show at least the year if we have nothing else.
  if (heroStats.length === 0 && listing.yearBuilt) {
    heroStats.push({ val: listing.yearBuilt, label: "Year Built" });
  }

  const street = `${listing.city}, ${listing.state} ${listing.postalCode}`.trim();
  const priceNumeric = parsePriceNumeric(listing.price);
  const monthlyRent = listing.type === "for-rent" ? listing.price : null;

  return (
    <div
      className="immersive-listing"
      style={{ ["--immersive-accent" as never]: accent }}
    >
      <ImmersiveStyles />
      <ScrollBar color={accent} />
      <ImmersiveNav
        initials={initials}
        brand={brand}
        accent={accent}
        isSignedIn={isSignedIn}
        isSaved={isSaved}
        listingSlug={listing.slug}
      />
      <ImmersiveHero
        photo={hero}
        price={listing.price}
        mls={listing.mls}
        address={listing.address}
        street={street}
        stats={heroStats}
        accent={accent}
      />
      <ImmersiveAerial
        photo={aerial}
        tagline={listing.tagline}
        description={listing.description}
        category={`${listing.category} · ${listing.city}`}
        highlights={listing.taglineHighlights}
        accent={accent}
      />
      {(listing.features ?? []).map((feature, i) => (
        <ImmersiveFeatureSection
          key={i}
          feature={feature}
          index={i}
          fallbackPhoto={featurePhotos[i] ?? hero}
          accent={accent}
        />
      ))}
      <ImmersiveCTA
        photo={ctaPhoto}
        price={listing.price}
        address={listing.address}
        street={street}
        agent={agent}
        accent={accent}
      />
      <ImmersiveMortgageCalc
        priceNumeric={priceNumeric}
        monthlyRent={monthlyRent}
        accent={accent}
      />
      <ImmersiveResources accent={accent} />
      {belowResources}
      <ImmersiveFooter initials={initials} brand={brand} agent={agent} accent={accent} />
    </div>
  );
}
