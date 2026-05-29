import type { SupabaseClient } from "@supabase/supabase-js";

export const LISTING_PHOTOS_BUCKET = "listing-photos";
export const PROFILE_ASSETS_BUCKET = "profile-assets";

export type StoredPhoto = {
  url: string;
  /** Storage key, used to delete the object later. */
  key: string;
  /** MIME content type as reported by the browser. */
  contentType?: string;
};

/**
 * Server-only helper for uploading a single File/Blob to a Supabase
 * Storage bucket and returning its permanent public URL.
 *
 * Call from server actions only — uses the service role client.
 * Throws on upload failure rather than returning a partial result, so
 * the caller can short-circuit and surface the error to the user.
 */
export async function uploadToBucket(
  supabase: SupabaseClient,
  args: {
    bucket: string;
    /**
     * Key prefix — usually a profile id or submission id so each user's
     * files live under their own folder. Should NOT have a trailing slash.
     */
    prefix: string;
    file: File | Blob;
    /** Original filename, used to derive the extension. */
    originalName: string;
  },
): Promise<StoredPhoto> {
  const { bucket, prefix, file, originalName } = args;

  // Build a unique key inside the prefix folder.
  const ext = extractExtension(originalName);
  const random = crypto.randomUUID();
  const key = `${prefix}/${random}${ext}`;

  const contentType =
    "type" in file && typeof file.type === "string" && file.type
      ? file.type
      : "application/octet-stream";

  const { error } = await supabase.storage.from(bucket).upload(key, file, {
    contentType,
    upsert: false,
    cacheControl: "public, max-age=31536000, immutable",
  });

  if (error) {
    throw new Error(`Storage upload failed (${bucket}): ${error.message}`);
  }

  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(key);
  return { url: pub.publicUrl, key, contentType };
}

/**
 * Best-effort delete by storage key. Swallows errors and returns boolean
 * because the caller usually doesn't care whether the object was already
 * gone or not (e.g. when removing a photo from a draft submission).
 */
export async function deleteFromBucket(
  supabase: SupabaseClient,
  bucket: string,
  key: string,
): Promise<boolean> {
  const { error } = await supabase.storage.from(bucket).remove([key]);
  if (error) {
    console.warn(`Storage delete failed (${bucket}/${key}):`, error.message);
    return false;
  }
  return true;
}

/** Extract the lowercased extension (".jpg") from a filename, or "". */
function extractExtension(name: string) {
  const dot = name.lastIndexOf(".");
  if (dot < 0 || dot === name.length - 1) return "";
  return name.slice(dot).toLowerCase();
}

/**
 * Sanity-check a File against our allowed types and size limits before
 * upload. Returns null if OK, otherwise a human-readable error message.
 *
 * Allowed: JPEG / PNG / WebP, up to 12 MB. Matches what the immersive
 * parallax sections can comfortably serve without auto-conversion.
 */
export function validatePhotoFile(file: File): string | null {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) {
    return `Unsupported file type: ${file.type || "unknown"}. Use JPEG, PNG, or WebP.`;
  }
  const max = 12 * 1024 * 1024;
  if (file.size > max) {
    return `File ${file.name} is ${(file.size / 1024 / 1024).toFixed(1)} MB. Max is 12 MB.`;
  }
  return null;
}
