import { Webhook } from "svix";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type ClerkEmail = { id: string; email_address: string };
type ClerkWebhookEvent = {
  type: string;
  data: {
    id: string;
    email_addresses?: ClerkEmail[];
    primary_email_address_id?: string | null;
    first_name?: string | null;
    last_name?: string | null;
  };
};

export async function POST(req: Request) {
  // --- Guard: webhook secret must be configured ---
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[clerk-webhook] CLERK_WEBHOOK_SECRET is not set");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  // --- Read raw body (must happen before any JSON.parse for svix to verify) ---
  const payload = await req.text();

  // --- Read svix headers ---
  const id = req.headers.get("svix-id");
  const ts = req.headers.get("svix-timestamp");
  const sig = req.headers.get("svix-signature");

  if (!id || !ts || !sig) {
    return new Response("Missing svix headers", { status: 400 });
  }

  // --- Verify signature ---
  const wh = new Webhook(secret);
  let evt: ClerkWebhookEvent;
  try {
    evt = wh.verify(payload, {
      "svix-id": id,
      "svix-timestamp": ts,
      "svix-signature": sig,
    }) as ClerkWebhookEvent;
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  // --- Handle events ---
  const { type, data } = evt;

  if (type === "user.created" || type === "user.updated") {
    // Derive primary email
    const emails = data.email_addresses ?? [];
    const primaryEmail =
      emails.find((e) => e.id === data.primary_email_address_id)
        ?.email_address ??
      emails[0]?.email_address ??
      "unknown@lrpr.local";

    // Derive full name
    const fullName =
      [data.first_name, data.last_name].filter(Boolean).join(" ") || null;

    try {
      const supabase = createSupabaseServerClient();
      const { error } = await supabase.from("profiles").upsert(
        {
          clerk_user_id: data.id,
          email: primaryEmail,
          full_name: fullName,
          account_validated: true,
        },
        { onConflict: "clerk_user_id" },
      );

      if (error) {
        console.error(
          `[clerk-webhook] DB upsert error for ${type} (user ${data.id}):`,
          error.message,
        );
        // Return 200 so Clerk does not infinitely retry on transient DB issues
        return Response.json({ received: true });
      }

      console.info(
        `[clerk-webhook] Profile synced for ${type} (user ${data.id}, email ${primaryEmail})`,
      );
    } catch (err) {
      console.error(
        `[clerk-webhook] Unexpected error for ${type} (user ${data.id}):`,
        err,
      );
      // Return 200 to avoid Clerk retry loops on transient errors
      return Response.json({ received: true });
    }
  } else if (type === "user.deleted") {
    // Do NOT delete the profile — favorites/submissions reference it
    console.info(
      `[clerk-webhook] Ignoring user.deleted for user ${data.id} — profile retained`,
    );
  }
  // All other events: fall through and return 200 (ignored)

  return Response.json({ received: true });
}
