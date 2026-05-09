import assert from "node:assert/strict";
import test from "node:test";

import {
  buildResendEmailRequest,
  buildStripeCheckoutSessionRequest,
  buildSupabaseInsertRequest,
  buildSupabaseSelectRequest,
  normalizeSupabaseUrl,
} from "../scripts/lib/integration-clients.mjs";

test("normalizeSupabaseUrl removes trailing slashes", () => {
  assert.equal(normalizeSupabaseUrl("https://abc.supabase.co///"), "https://abc.supabase.co");
});

test("buildSupabaseInsertRequest creates authenticated REST insert request", () => {
  const result = buildSupabaseInsertRequest({
    url: "https://abc.supabase.co/",
    serviceRoleKey: "service-key",
    table: "submissions",
    payload: { id: "lrpr_1", status: "pending_review" },
  });

  assert.equal(result.ready, true);
  assert.equal(result.request.url, "https://abc.supabase.co/rest/v1/submissions");
  assert.equal(result.request.method, "POST");
  assert.equal(result.request.headers.Authorization, "Bearer service-key");
  assert.match(result.request.body, /pending_review/);
});

test("buildSupabaseSelectRequest creates queue select request", () => {
  const result = buildSupabaseSelectRequest({
    url: "https://abc.supabase.co",
    serviceRoleKey: "service-key",
    table: "submissions",
    query: "select=id,status&status=eq.pending_review",
  });

  assert.equal(result.ready, true);
  assert.equal(result.request.url, "https://abc.supabase.co/rest/v1/submissions?select=id,status&status=eq.pending_review");
});

test("buildResendEmailRequest requires email config and creates API request", () => {
  const missing = buildResendEmailRequest({ apiKey: "", from: "", to: "admin@example.com", subject: "New", html: "<p>Hi</p>" });
  const ready = buildResendEmailRequest({ apiKey: "resend-key", from: "LRPR <noreply@example.com>", to: "admin@example.com", subject: "New LRPR submission", html: "<p>Hi</p>" });

  assert.equal(missing.ready, false);
  assert.equal(ready.ready, true);
  assert.equal(ready.request.url, "https://api.resend.com/emails");
  assert.match(ready.request.body, /New LRPR submission/);
});

test("buildStripeCheckoutSessionRequest includes metadata in urlencoded body", () => {
  const result = buildStripeCheckoutSessionRequest({
    secretKey: "sk_test",
    priceId: "price_123",
    successUrl: "https://lrpr.test/success",
    cancelUrl: "https://lrpr.test/cancel",
    metadata: { submissionId: "lrpr_1", type: "standard-sale-listing" },
  });

  assert.equal(result.ready, true);
  assert.equal(result.request.method, "POST");
  assert.match(result.request.body, /line_items%5B0%5D%5Bprice%5D=price_123/);
  assert.match(result.request.body, /metadata%5BsubmissionId%5D=lrpr_1/);
});
