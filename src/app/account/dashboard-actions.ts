"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createSupabaseServerClient,
  getOrCreateProfile,
} from "@/lib/supabase/server";
import { isToolKey } from "@/data/tools";

/** Resolve (or lazily create) the signed-in user's profile, or redirect. */
async function requireProfileId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/account");

  const user = await currentUser();
  const primaryEmail =
    user?.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress ??
    user?.emailAddresses[0]?.emailAddress ??
    "unknown@lrpr.local";
  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || null;

  const supabase = createSupabaseServerClient();
  const profile = await getOrCreateProfile(supabase, {
    clerkUserId: userId,
    email: primaryEmail,
    fullName,
  });
  return profile.id;
}

function str(formData: FormData, name: string, max = 2000): string {
  const raw = formData.get(name);
  if (typeof raw !== "string") return "";
  const trimmed = raw.trim();
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

/* ─── Vendor favorites ─────────────────────────────────────────────── */

export async function toggleVendorFavoriteAction(formData: FormData) {
  const vendorId = str(formData, "vendor_id", 100);
  if (!vendorId) return;
  const vendorName = str(formData, "vendor_name", 160) || null;
  const vendorCategory = str(formData, "vendor_category", 80) || null;
  const redirectTo = str(formData, "redirect_to", 200);

  const profileId = await requireProfileId();
  const supabase = createSupabaseServerClient();

  const { data: existing } = await supabase
    .from("vendor_favorites")
    .select("id")
    .eq("profile_id", profileId)
    .eq("vendor_id", vendorId)
    .maybeSingle();

  if (existing) {
    await supabase.from("vendor_favorites").delete().eq("id", existing.id);
  } else {
    const { error } = await supabase.from("vendor_favorites").insert({
      profile_id: profileId,
      vendor_id: vendorId,
      vendor_name: vendorName,
      vendor_category: vendorCategory,
    });
    if (error && error.code !== "23505") {
      console.error("Vendor favorite insert failed:", error);
    }
  }

  revalidatePath("/account");
  revalidatePath("/service-pros");
  if (redirectTo.startsWith("/")) redirect(redirectTo);
}

/* ─── Notes ────────────────────────────────────────────────────────── */

export async function createNoteAction(formData: FormData) {
  const title = str(formData, "title", 120) || null;
  const body = str(formData, "body", 8000);
  if (!title && !body) return;

  const profileId = await requireProfileId();
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("account_notes").insert({
    profile_id: profileId,
    title,
    body,
  });
  if (error) console.error("Note insert failed:", error);
  revalidatePath("/account");
}

export async function updateNoteAction(formData: FormData) {
  const id = str(formData, "id", 100);
  if (!id) return;
  const title = str(formData, "title", 120) || null;
  const body = str(formData, "body", 8000);

  const profileId = await requireProfileId();
  const supabase = createSupabaseServerClient();
  // Scope by profile_id so a user can only edit their own notes.
  const { error } = await supabase
    .from("account_notes")
    .update({ title, body, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("profile_id", profileId);
  if (error) console.error("Note update failed:", error);
  revalidatePath("/account");
}

export async function deleteNoteAction(formData: FormData) {
  const id = str(formData, "id", 100);
  if (!id) return;

  const profileId = await requireProfileId();
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("account_notes")
    .delete()
    .eq("id", id)
    .eq("profile_id", profileId);
  if (error) console.error("Note delete failed:", error);
  revalidatePath("/account");
}

/* ─── Saved tools ──────────────────────────────────────────────────── */

export async function toggleSavedToolAction(formData: FormData) {
  const toolKey = str(formData, "tool_key", 80);
  if (!toolKey || !isToolKey(toolKey)) return;

  const profileId = await requireProfileId();
  const supabase = createSupabaseServerClient();

  const { data: existing } = await supabase
    .from("saved_tools")
    .select("id")
    .eq("profile_id", profileId)
    .eq("tool_key", toolKey)
    .maybeSingle();

  if (existing) {
    await supabase.from("saved_tools").delete().eq("id", existing.id);
  } else {
    const { error } = await supabase
      .from("saved_tools")
      .insert({ profile_id: profileId, tool_key: toolKey });
    if (error && error.code !== "23505") {
      console.error("Saved tool insert failed:", error);
    }
  }
  revalidatePath("/account");
}
