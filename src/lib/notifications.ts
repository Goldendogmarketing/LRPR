/**
 * Server-only module for transactional email via Resend + notification_outbox.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface SendEmailResult {
  ok: boolean;
  id?: string;
  skipped?: boolean;
  error?: string;
}

export interface NotifyOptions extends SendEmailOptions {
  submissionId?: string;
  templateKey: string;
  payload?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// sendEmail
// ---------------------------------------------------------------------------

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailOptions): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(
      "[notifications] RESEND_API_KEY is not set — email skipped (queued for later delivery).",
    );
    return { ok: false, skipped: true };
  }

  const from =
    process.env.RESEND_FROM_EMAIL || "LRPR <onboarding@resend.dev>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ from, to: [to], subject, html, text }),
    });

    if (res.ok) {
      let id: string | undefined;
      try {
        const json = (await res.json()) as { id?: string };
        id = json.id;
      } catch {
        // JSON parse failure is non-fatal — we still sent the email.
      }
      return { ok: true, id };
    }

    let errorBody = "";
    try {
      errorBody = await res.text();
    } catch {
      // ignore
    }
    return {
      ok: false,
      error: `Resend API returned ${res.status}: ${errorBody}`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// notify — sends email + inserts into notification_outbox
// ---------------------------------------------------------------------------

export async function notify(
  supabase: SupabaseClient,
  {
    submissionId,
    to,
    subject,
    html,
    text,
    templateKey,
    payload,
  }: NotifyOptions,
): Promise<void> {
  try {
    const result = await sendEmail({ to, subject, html, text });

    let status: string;
    if (result.ok) {
      status = "sent";
    } else if (result.skipped) {
      status = "queued";
    } else {
      status = "failed";
    }

    const sentAt = result.ok ? new Date().toISOString() : null;

    const { error: insertErr } = await supabase
      .from("notification_outbox")
      .insert({
        submission_id: submissionId ?? null,
        recipient_email: to,
        template_key: templateKey,
        payload: payload ?? {},
        status,
        sent_at: sentAt,
      });

    if (insertErr) {
      console.error(
        "[notifications] Failed to insert into notification_outbox:",
        insertErr,
      );
    }
  } catch (err) {
    // Notifications must never break the calling server action.
    console.error("[notifications] Unexpected error in notify():", err);
  }
}

// ---------------------------------------------------------------------------
// Email builders
// ---------------------------------------------------------------------------

export function buildSubmissionAdminEmail({
  submissionId,
  address,
  contactName,
  submissionType,
}: {
  submissionId: string;
  address: string;
  contactName: string;
  submissionType: string;
}): { subject: string; html: string; text: string } {
  const subject = `[LRPR] New ${submissionType} submission: ${address}`;

  const adminUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://lakeregionpropertyresource.com"}/admin`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>${subject}</title></head>
<body style="font-family:sans-serif;color:#1a1a1a;background:#fff;padding:32px;">
  <h1 style="color:#b8860b;margin-bottom:8px;">Lake Region Property Resource</h1>
  <p style="margin:0 0 16px;font-size:16px;">A new property submission has arrived and is awaiting your review.</p>
  <table style="border-collapse:collapse;width:100%;max-width:480px;margin-bottom:24px;">
    <tr>
      <td style="padding:8px 12px;font-weight:600;background:#f5f5f5;border:1px solid #e0e0e0;width:160px;">Submission ID</td>
      <td style="padding:8px 12px;border:1px solid #e0e0e0;">${submissionId}</td>
    </tr>
    <tr>
      <td style="padding:8px 12px;font-weight:600;background:#f5f5f5;border:1px solid #e0e0e0;">Address</td>
      <td style="padding:8px 12px;border:1px solid #e0e0e0;">${address}</td>
    </tr>
    <tr>
      <td style="padding:8px 12px;font-weight:600;background:#f5f5f5;border:1px solid #e0e0e0;">Contact</td>
      <td style="padding:8px 12px;border:1px solid #e0e0e0;">${contactName}</td>
    </tr>
    <tr>
      <td style="padding:8px 12px;font-weight:600;background:#f5f5f5;border:1px solid #e0e0e0;">Type</td>
      <td style="padding:8px 12px;border:1px solid #e0e0e0;">${submissionType}</td>
    </tr>
  </table>
  <a href="${adminUrl}" style="display:inline-block;background:#b8860b;color:#fff;text-decoration:none;padding:12px 24px;border-radius:4px;font-weight:600;">Review in Admin</a>
  <p style="margin-top:32px;font-size:12px;color:#888;">Lake Region Property Resource &mdash; automated notification</p>
</body>
</html>
`.trim();

  const text = [
    "LAKE REGION PROPERTY RESOURCE",
    "New Property Submission",
    "",
    `Submission ID : ${submissionId}`,
    `Address       : ${address}`,
    `Contact       : ${contactName}`,
    `Type          : ${submissionType}`,
    "",
    `Review it here: ${adminUrl}`,
    "",
    "— LRPR automated notification",
  ].join("\n");

  return { subject, html, text };
}

export function buildDecisionEmail({
  decision,
  address,
  notes,
}: {
  decision: string;
  address: string;
  notes?: string | null;
}): { subject: string; html: string; text: string } {
  const decisionLabels: Record<string, string> = {
    approved: "Approved",
    published: "Published",
    changes_requested: "Changes Requested",
    rejected: "Not Approved",
  };
  const label = decisionLabels[decision] ?? decision;

  const subject = `[LRPR] Your listing update: ${label} — ${address}`;

  const notesBlock = notes?.trim()
    ? `<p style="margin:16px 0;padding:12px 16px;background:#f9f9f9;border-left:4px solid #b8860b;font-size:14px;"><strong>Notes from reviewer:</strong><br/>${notes.trim()}</p>`
    : "";

  const notesText = notes?.trim()
    ? `\nNotes from reviewer:\n${notes.trim()}\n`
    : "";

  const bodyLine: Record<string, string> = {
    approved: "Great news — your listing has been approved and will be live shortly.",
    published: "Your listing is now live on the Lake Region Property Resource website.",
    changes_requested:
      "Our team has reviewed your listing and is requesting some changes before it can go live.",
    rejected:
      "After review, we were unable to approve your listing at this time. Please contact us if you have questions.",
  };
  const bodyText =
    bodyLine[decision] ?? "Your listing has been reviewed. Please see the notes below.";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>${subject}</title></head>
<body style="font-family:sans-serif;color:#1a1a1a;background:#fff;padding:32px;">
  <h1 style="color:#b8860b;margin-bottom:8px;">Lake Region Property Resource</h1>
  <h2 style="margin:0 0 16px;font-size:18px;">Listing Status: ${label}</h2>
  <p style="font-size:15px;margin:0 0 8px;"><strong>Property:</strong> ${address}</p>
  <p style="font-size:15px;margin:0 0 16px;">${bodyText}</p>
  ${notesBlock}
  <p style="margin-top:32px;font-size:12px;color:#888;">Lake Region Property Resource &mdash; automated notification</p>
</body>
</html>
`.trim();

  const text = [
    "LAKE REGION PROPERTY RESOURCE",
    `Listing Status: ${label}`,
    "",
    `Property: ${address}`,
    bodyText,
    notesText,
    "— LRPR automated notification",
  ].join("\n");

  return { subject, html, text };
}
