import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Listing,
  ListedBy,
  PresentationStyle,
} from "@/data/site";

/**
 * Merge a listing's hardcoded `listedBy` block with the live profile
 * customization for the same agent, if any.
 *
 * Resolution order (later wins):
 *  1. Empty defaults
 *  2. listing.listedBy (hardcoded in site.ts for demo data — eventually
 *     denormalized from a submission's `listed_by` snapshot)
 *  3. profiles row keyed by listing.listedBy.profileId — this lets a
 *     paid user edit their phone/brokerage/headshot/accent once and
 *     have it propagate to every listing they own without re-editing
 *     each listing record.
 *
 * Also surfaces the paid `immersive_enabled` upgrade flag, which the
 * page-level dispatcher reads to decide between classic and immersive.
 *
 * Defensive: if the new columns don't exist yet (pre-migration), the
 * try/catch swallows the error and we keep the listing-only data.
 */
export async function resolveListedBy(
  supabase: SupabaseClient,
  listingListedBy?: ListedBy,
): Promise<ListedBy> {
  const base: ListedBy = listingListedBy ?? {};
  if (!base.profileId) return base;

  try {
    const { data } = await supabase
      .from("profiles")
      .select(
        "full_name, display_name, brokerage, phone, email, headshot_url, tagline, accent_color, immersive_enabled",
      )
      .eq("id", base.profileId)
      .maybeSingle();

    if (!data) return base;

    return {
      ...base,
      displayName: data.display_name ?? data.full_name ?? base.displayName,
      brokerage: data.brokerage ?? base.brokerage,
      phone: data.phone ?? base.phone,
      email: data.email ?? base.email,
      headshotUrl: data.headshot_url ?? base.headshotUrl,
      tagline: data.tagline ?? base.tagline,
      accentColor: data.accent_color ?? base.accentColor,
      immersiveEnabled:
        typeof data.immersive_enabled === "boolean"
          ? data.immersive_enabled
          : base.immersiveEnabled,
      profileId: base.profileId,
    };
  } catch {
    return base;
  }
}

/**
 * Decide which presentation template should render this listing.
 *
 * Precedence (most specific wins):
 *  1. URL ?preview=classic|immersive   — temporary preview, never persisted.
 *      Useful for agents previewing the upgrade or admins QAing a layout.
 *  2. listing.presentationStyle         — per-listing explicit override.
 *      Lets a single listing opt-up (or opt-out) regardless of the agent's
 *      account-wide setting.
 *  3. agent.immersiveEnabled === true   — agent-level paid upgrade.
 *      Flips every listing this agent owns to the immersive template.
 *  4. Default                           — "classic".
 */
export function decidePresentation(args: {
  listing: Pick<Listing, "presentationStyle">;
  agent: Pick<ListedBy, "immersiveEnabled">;
  /** Raw ?preview= value from the URL, untrusted. */
  previewParam?: string;
}): { style: PresentationStyle; isPreview: boolean } {
  const { listing, agent, previewParam } = args;

  if (previewParam === "immersive" || previewParam === "classic") {
    return { style: previewParam, isPreview: true };
  }

  if (listing.presentationStyle) {
    return { style: listing.presentationStyle, isPreview: false };
  }

  if (agent.immersiveEnabled) {
    return { style: "immersive", isPreview: false };
  }

  return { style: "classic", isPreview: false };
}
