"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createSupabaseServerClient,
  getOrCreateProfile,
} from "@/lib/supabase/server";
import {
  PROFILE_ASSETS_BUCKET,
  deleteFromBucket,
  uploadToBucket,
  validatePhotoFile,
} from "@/lib/supabase/storage";

function pickString(formData: FormData, name: string, max = 500): string | null {
  const raw = formData.get(name);
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

function pickHex(formData: FormData, name: string): string | null {
  const value = pickString(formData, name, 7);
  if (!value) return null;
  return /^#[0-9A-Fa-f]{6}$/.test(value) ? value : null;
}

function pickFile(formData: FormData, name: string): File | null {
  const v = formData.get(name);
  if (typeof v === "string" || !v) return null;
  if (typeof v === "object" && "size" in v && (v as File).size > 0) {
    return v as File;
  }
  return null;
}

/**
 * Update the signed-in user's profile customization fields used by the
 * immersive listing template (agent block + accent color + headshot).
 *
 * Anonymous and missing-profile requests redirect to /sign-in or
 * /onboarding respectively. Free-tier profiles silently NOOP rather
 * than 403 — they shouldn't be hitting this action since the page
 * gates them out of the form, but defense in depth.
 *
 * Headshot handling:
 *   - If a new file is uploaded, replace any prior headshot.
 *   - If `remove_headshot=1` is set without a new file, delete prior URL.
 *   - Otherwise, keep the prior URL as-is.
 */
export async function updateProfileAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/account");

  const user = await currentUser();
  const primaryEmail =
    user?.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress ?? user?.emailAddresses[0]?.emailAddress ?? "unknown@lrpr.local";
  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || null;

  const supabase = createSupabaseServerClient();
  const profile = await getOrCreateProfile(supabase, {
    clerkUserId: userId,
    email: primaryEmail,
    fullName,
  });

  // Snapshot pre-existing headshot key for cleanup after we know the new one.
  const { data: existing } = await supabase
    .from("profiles")
    .select("headshot_url")
    .eq("id", profile.id)
    .maybeSingle<{ headshot_url: string | null }>();
  const previousHeadshotUrl = existing?.headshot_url ?? null;

  let newHeadshotUrl: string | null = previousHeadshotUrl;
  const requestedRemove = formData.get("remove_headshot") === "1";
  const newHeadshotFile = pickFile(formData, "headshot");

  if (newHeadshotFile) {
    const reason = validatePhotoFile(newHeadshotFile);
    if (reason) {
      redirect(`/account?error=${encodeURIComponent(reason)}`);
    }
    try {
      const stored = await uploadToBucket(supabase, {
        bucket: PROFILE_ASSETS_BUCKET,
        prefix: `headshots/${profile.id}`,
        file: newHeadshotFile,
        originalName: newHeadshotFile.name,
      });
      newHeadshotUrl = stored.url;
    } catch (err) {
      console.error("Headshot upload failed:", err);
      redirect(
        `/account?error=${encodeURIComponent("Could not upload your headshot. Try again.")}`,
      );
    }
  } else if (requestedRemove) {
    newHeadshotUrl = null;
  }

  // If we changed the URL, best-effort delete the prior file.
  if (previousHeadshotUrl && previousHeadshotUrl !== newHeadshotUrl) {
    const key = extractStorageKeyFromUrl(previousHeadshotUrl, PROFILE_ASSETS_BUCKET);
    if (key) await deleteFromBucket(supabase, PROFILE_ASSETS_BUCKET, key);
  }

  const payload = {
    display_name: pickString(formData, "display_name", 120),
    brokerage: pickString(formData, "brokerage", 160),
    phone: pickString(formData, "phone", 40),
    tagline: pickString(formData, "tagline", 240),
    brand_initials: pickString(formData, "brand_initials", 3)?.toUpperCase() ?? null,
    accent_color: pickHex(formData, "accent_color"),
    headshot_url: newHeadshotUrl,
    // Unchecked checkboxes don't appear in FormData at all, so a missing
    // entry means "off". When present, the value is the "1" we set in the
    // markup; treat anything else as off too.
    immersive_enabled: formData.get("immersive_enabled") === "1",
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", profile.id);

  if (error) {
    console.error("Profile update failed:", error);
    redirect(
      `/account?error=${encodeURIComponent("Could not save profile: " + error.message)}`,
    );
  }

  // Refresh anywhere the agent block appears: /account, every listing
  // page (since they merge profile -> listing.listedBy on render).
  revalidatePath("/account");
  revalidatePath("/listings/[slug]", "page");
  revalidatePath("/for-sale");
  revalidatePath("/for-rent");

  redirect("/account?saved=1");
}

/**
 * Best-effort extract the storage key from a public bucket URL. Supabase
 * public URLs look like:
 *   https://<project>.supabase.co/storage/v1/object/public/<bucket>/<key...>
 * Returns null if the URL doesn't match the expected shape.
 */
function extractStorageKeyFromUrl(url: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const i = url.indexOf(marker);
  if (i < 0) return null;
  return url.slice(i + marker.length);
}
