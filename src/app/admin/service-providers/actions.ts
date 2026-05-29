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

export async function upsertServiceProviderAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const business_name = String(formData.get("business_name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const county = String(formData.get("county") ?? "").trim();
  const contact_email = String(formData.get("contact_email") ?? "").trim();
  const contact_phone = String(formData.get("contact_phone") ?? "").trim();
  const website_url = String(formData.get("website_url") ?? "").trim();
  const verified = formData.get("verified") === "on";
  const sponsored = formData.get("sponsored") === "on";
  const admin_approved = formData.get("admin_approved") === "on";

  const now = new Date().toISOString();

  const payload: Record<string, unknown> = {
    business_name,
    category,
    city,
    county,
    contact_email: contact_email || null,
    contact_phone: contact_phone || null,
    website_url: website_url || null,
    verified,
    sponsored,
    admin_approved,
    published_at: admin_approved ? now : null,
    updated_at: now,
  };

  const supabase = createSupabaseServerClient();

  let error: { message: string } | null = null;

  if (id) {
    const { error: updateError } = await supabase
      .from("service_provider_profiles")
      .update(payload)
      .eq("id", id);
    error = updateError;
  } else {
    const { error: insertError } = await supabase
      .from("service_provider_profiles")
      .insert(payload);
    error = insertError;
  }

  if (error) {
    redirect(
      `/admin/service-providers?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/admin/service-providers");
  revalidatePath("/service-pros");
  redirect("/admin/service-providers?saved=1");
}

export async function deleteServiceProviderAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/service-providers");

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("service_provider_profiles")
    .delete()
    .eq("id", id);

  if (error) {
    redirect(
      `/admin/service-providers?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/admin/service-providers");
  revalidatePath("/service-pros");
  redirect("/admin/service-providers");
}
