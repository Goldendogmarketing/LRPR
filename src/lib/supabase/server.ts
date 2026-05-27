import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client using the SERVICE ROLE key.
 *
 * ⚠️ Bypasses Row Level Security. Use ONLY in:
 *   - Server actions
 *   - Route handlers
 *   - Server components
 *
 * Never import this into a "use client" component or expose it to the browser.
 */
export function createSupabaseServerClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase server env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Row shape for the `submissions` table — kept in sync with supabase/schema.sql.
 * Keep this narrow: only fields we actually read or write from app code.
 */
export type ProfileRow = {
  id: string;
  clerk_user_id: string;
  email: string;
  full_name: string | null;
  role: string;
  account_validated: boolean;
  created_at: string;
  updated_at: string;
};

/**
 * Find a Supabase profile row for a Clerk user, or create one if missing.
 *
 * Called lazily from server actions — when the authenticated user takes any
 * action that needs to be linked to a profile (e.g. submitting a listing),
 * we sync them into our `profiles` table. A webhook-based sync can replace
 * this later for instant sync on Clerk user.created.
 */
export async function getOrCreateProfile(
  supabase: SupabaseClient,
  params: { clerkUserId: string; email: string; fullName?: string | null },
): Promise<ProfileRow> {
  const { clerkUserId, email, fullName } = params;

  const { data: existing, error: findErr } = await supabase
    .from("profiles")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle();

  if (findErr) {
    throw new Error(`Profile lookup failed: ${findErr.message}`);
  }
  if (existing) return existing as ProfileRow;

  const { data: created, error: insertErr } = await supabase
    .from("profiles")
    .insert({
      clerk_user_id: clerkUserId,
      email,
      full_name: fullName ?? null,
      account_validated: true, // Clerk validates email/phone, so trust it
    })
    .select("*")
    .single();

  if (insertErr || !created) {
    throw new Error(
      `Profile create failed: ${insertErr?.message ?? "unknown error"}`,
    );
  }

  return created as ProfileRow;
}

export type SubmissionRow = {
  id: string;
  submission_type: "residential-sale" | "land-listing" | "rental-listing";
  status:
    | "draft"
    | "account_pending"
    | "payment_pending"
    | "pending_review"
    | "changes_requested"
    | "approved"
    | "published"
    | "rejected";
  source_type: string;
  listing_status: string | null;
  property_type: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address_line: string | null;
  city: string | null;
  county: string | null;
  state: string;
  postal_code: string | null;
  price_or_rent: string | null;
  beds: number | null;
  baths: number | null;
  acreage: number | null;
  notes: string | null;
  permission_confirmed: boolean;
  account_validated: boolean;
  payment_required: boolean;
  payment_complete: boolean;
  admin_approved: boolean;
  geocoding_status: string;
  enrichment_status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};
