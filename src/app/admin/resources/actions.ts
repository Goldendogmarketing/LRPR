"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const user = await currentUser();
  if (user?.publicMetadata?.role !== "admin") {
    redirect("/");
  }
  return user;
}

export async function upsertResourceAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const resource_type = String(formData.get("resource_type") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const county = String(formData.get("county") ?? "").trim();
  const official_url = String(formData.get("official_url") ?? "").trim();
  const source_name = String(formData.get("source_name") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const admin_approved = formData.get("admin_approved") === "on";

  const now = new Date().toISOString();

  const payload: Record<string, unknown> = {
    title,
    resource_type,
    city,
    county,
    official_url: official_url || null,
    source_name: source_name || null,
    notes: notes || null,
    admin_approved,
    published_at: admin_approved ? now : null,
    updated_at: now,
  };

  const supabase = createSupabaseServerClient();

  let error: { message: string } | null = null;

  if (id) {
    const { error: updateError } = await supabase
      .from("local_resources")
      .update(payload)
      .eq("id", id);
    error = updateError;
  } else {
    const { error: insertError } = await supabase
      .from("local_resources")
      .insert(payload);
    error = insertError;
  }

  if (error) {
    redirect(`/admin/resources?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/resources");
  revalidatePath("/resources");
  redirect("/admin/resources?saved=1");
}

export async function deleteResourceAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/resources");

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("local_resources")
    .delete()
    .eq("id", id);

  if (error) {
    redirect(`/admin/resources?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/resources");
  revalidatePath("/resources");
  redirect("/admin/resources");
}
