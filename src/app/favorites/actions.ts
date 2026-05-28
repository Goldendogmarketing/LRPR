"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createSupabaseServerClient,
  getOrCreateProfile,
} from "@/lib/supabase/server";

export async function toggleFavoriteAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) {
    return;
  }

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

  // Check current saved state
  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("profile_id", profile.id)
    .eq("listing_slug", slug)
    .maybeSingle();

  if (existing) {
    await supabase.from("favorites").delete().eq("id", existing.id);
  } else {
    const { error } = await supabase.from("favorites").insert({
      profile_id: profile.id,
      listing_slug: slug,
    });
    if (error && error.code !== "23505") {
      // 23505 = unique violation (already saved, race). Ignore that.
      console.error("Favorite insert failed:", error);
    }
  }

  // Refresh anywhere that renders favorite state.
  revalidatePath("/favorites");
  revalidatePath(`/listings/${slug}`);
}
