type RequestBuildResult = {
  ready: boolean;
  reason: string | null;
  request: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: string;
  } | null;
};

export function normalizeSupabaseUrl(url = "") {
  return url.replace(/\/+$/, "");
}

export function buildSupabaseInsertRequest({
  url,
  serviceRoleKey,
  table,
  payload,
}: {
  url?: string;
  serviceRoleKey?: string;
  table: string;
  payload: unknown;
}): RequestBuildResult {
  const cleanUrl = normalizeSupabaseUrl(url ?? "");
  if (!cleanUrl || !serviceRoleKey || !table) {
    return { ready: false, reason: "missing_supabase_config", request: null };
  }

  return {
    ready: true,
    reason: null,
    request: {
      url: `${cleanUrl}/rest/v1/${table}`,
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(payload),
    },
  };
}

export function buildResendEmailRequest({
  apiKey,
  from,
  to,
  subject,
  html,
}: {
  apiKey?: string;
  from?: string;
  to?: string;
  subject: string;
  html: string;
}): RequestBuildResult {
  if (!apiKey || !from || !to || !subject || !html) {
    return { ready: false, reason: "missing_resend_config", request: null };
  }

  return {
    ready: true,
    reason: null,
    request: {
      url: "https://api.resend.com/emails",
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    },
  };
}

export function buildStripeCheckoutSessionRequest({
  secretKey,
  priceId,
  successUrl,
  cancelUrl,
  metadata = {},
}: {
  secretKey?: string;
  priceId?: string;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, string>;
}): RequestBuildResult {
  if (!secretKey || !priceId || !successUrl || !cancelUrl) {
    return { ready: false, reason: "missing_stripe_checkout_config", request: null };
  }

  const body = new URLSearchParams();
  body.set("mode", "payment");
  body.set("line_items[0][price]", priceId);
  body.set("line_items[0][quantity]", "1");
  body.set("success_url", successUrl);
  body.set("cancel_url", cancelUrl);
  Object.entries(metadata).forEach(([key, value]) => body.set(`metadata[${key}]`, value));

  return {
    ready: true,
    reason: null,
    request: {
      url: "https://api.stripe.com/v1/checkout/sessions",
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    },
  };
}
