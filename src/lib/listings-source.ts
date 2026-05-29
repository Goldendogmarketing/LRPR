import type { SupabaseClient } from "@supabase/supabase-js";
import { listings, type Listing, type ListingType } from "@/data/site";

/**
 * Fetch all published_listings from the DB and map each row's listing_data
 * field to a Listing object. Rows without a slug are skipped.
 *
 * Returns an empty array on any DB error so the site never breaks.
 */
async function fetchDbListings(supabase: SupabaseClient): Promise<Listing[]> {
  try {
    const { data, error } = await supabase
      .from("published_listings")
      .select("listing_data");

    if (error) {
      console.warn("[listings-source] DB query failed — using static only:", error.message);
      return [];
    }

    if (!data) return [];

    const result: Listing[] = [];
    for (const row of data) {
      const candidate = row.listing_data as unknown as Listing;
      if (!candidate?.slug) continue;
      result.push(candidate);
    }
    return result;
  } catch (err) {
    console.warn("[listings-source] Unexpected error fetching DB listings:", err);
    return [];
  }
}

/**
 * Merge the static demo listings with DB published_listings.
 *
 * Merge order: static FIRST, then DB rows. Static slugs win on collision —
 * any DB row whose slug matches a static listing is dropped.
 */
export async function getAllListings(supabase: SupabaseClient): Promise<Listing[]> {
  const dbListings = await fetchDbListings(supabase);

  // Build a Set of static slugs for O(1) dedup lookups.
  const staticSlugs = new Set(listings.map((l) => l.slug));

  // Keep only DB rows whose slugs do not collide with static slugs.
  const uniqueDbListings = dbListings.filter((l) => !staticSlugs.has(l.slug));

  return [...listings, ...uniqueDbListings];
}

/**
 * Look up a single listing by slug. Checks the static array first (fast, no
 * DB round-trip). Falls back to a targeted DB query if not found statically.
 */
export async function getListingBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<Listing | undefined> {
  // Fast path: static array.
  const staticMatch = listings.find((l) => l.slug === slug);
  if (staticMatch) return staticMatch;

  // DB path: fetch only the matching row.
  try {
    const { data, error } = await supabase
      .from("published_listings")
      .select("listing_data")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.warn("[listings-source] DB slug lookup failed:", error.message);
      return undefined;
    }

    if (!data) return undefined;

    const candidate = data.listing_data as unknown as Listing;
    if (!candidate?.slug) return undefined;
    return candidate;
  } catch (err) {
    console.warn("[listings-source] Unexpected error in getListingBySlug:", err);
    return undefined;
  }
}

/**
 * Return all listings (static + DB) filtered to the given ListingType.
 */
export async function getListingsByTypeMerged(
  supabase: SupabaseClient,
  type: ListingType,
): Promise<Listing[]> {
  const all = await getAllListings(supabase);
  return all.filter((l) => l.type === type);
}
