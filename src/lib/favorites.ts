import type { SupabaseClient } from "@supabase/supabase-js";

export type FavoriteRow = {
  id: string;
  profile_id: string;
  listing_slug: string;
  created_at: string;
};

/**
 * Returns the set of listing slugs the given Clerk user has favorited.
 * Returns an empty set when:
 *   - clerkUserId is null/undefined (anonymous visitor)
 *   - the profile row doesn't exist yet (signed in but never took any action)
 *   - the user simply has no favorites yet
 *
 * Callers pass this set down into ListingCard / FavoriteButton so each card
 * can render the correct save/unsave state without N+1 queries.
 */
export async function getFavoriteSlugsForClerkUser(
  supabase: SupabaseClient,
  clerkUserId: string | null | undefined,
): Promise<Set<string>> {
  if (!clerkUserId) return new Set();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle();

  if (!profile) return new Set();

  const { data: rows } = await supabase
    .from("favorites")
    .select("listing_slug")
    .eq("profile_id", profile.id);

  return new Set((rows ?? []).map((r) => r.listing_slug as string));
}
