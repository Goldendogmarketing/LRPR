import type { SupabaseClient } from "@supabase/supabase-js";

export type VendorFavoriteRow = {
  id: string;
  vendor_id: string;
  vendor_name: string | null;
  vendor_category: string | null;
  created_at: string;
};

export type NoteRow = {
  id: string;
  title: string | null;
  body: string;
  created_at: string;
  updated_at: string;
};

/** Number of listings the profile has favorited. Resilient to a missing DB. */
export async function getListingFavoriteCount(
  supabase: SupabaseClient,
  profileId: string,
): Promise<number> {
  const { count } = await supabase
    .from("favorites")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profileId);
  return count ?? 0;
}

export async function getVendorFavorites(
  supabase: SupabaseClient,
  profileId: string,
): Promise<VendorFavoriteRow[]> {
  const { data } = await supabase
    .from("vendor_favorites")
    .select("id, vendor_id, vendor_name, vendor_category, created_at")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });
  return (data as VendorFavoriteRow[] | null) ?? [];
}

export async function getVendorFavoriteIds(
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
  const { data } = await supabase
    .from("vendor_favorites")
    .select("vendor_id")
    .eq("profile_id", profile.id);
  return new Set((data ?? []).map((r) => r.vendor_id as string));
}

export async function getNotes(
  supabase: SupabaseClient,
  profileId: string,
): Promise<NoteRow[]> {
  const { data } = await supabase
    .from("account_notes")
    .select("id, title, body, created_at, updated_at")
    .eq("profile_id", profileId)
    .order("updated_at", { ascending: false });
  return (data as NoteRow[] | null) ?? [];
}

export async function getSavedToolKeys(
  supabase: SupabaseClient,
  profileId: string,
): Promise<string[]> {
  const { data } = await supabase
    .from("saved_tools")
    .select("tool_key")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((r) => r.tool_key as string);
}
