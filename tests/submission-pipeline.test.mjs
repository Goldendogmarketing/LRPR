import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  appendLocalSubmission,
  buildAdminNotification,
  buildCheckoutIntent,
  createSubmissionRecord,
  normalizeSubmissionPayload,
  validateSubmissionPayload,
} from "../scripts/lib/submission-pipeline.mjs";

const validInput = {
  submissionType: "standard-sale-listing",
  contactName: "Jordan Owner",
  contactMethod: "jordan@example.com",
  sourceType: "owner",
  listingStatus: "active",
  propertyAddress: "123 Lake Region Rd, Keystone Heights, FL",
  propertyType: "lakefront",
  priceOrRent: "$489,000",
  accountValidated: true,
};

test("normalizeSubmissionPayload assigns payment policy by submission type", () => {
  const standard = normalizeSubmissionPayload(validInput);
  const free = normalizeSubmissionPayload({ ...validInput, submissionType: "free-draft-review" });

  assert.equal(standard.paymentRequired, true);
  assert.equal(free.paymentRequired, false);
});

test("validateSubmissionPayload requires core intake fields", () => {
  const invalid = normalizeSubmissionPayload({ submissionType: "standard-sale-listing" });
  const validation = validateSubmissionPayload(invalid);

  assert.equal(validation.ok, false);
  assert.match(validation.errors.join(" "), /contactName/);
  assert.match(validation.errors.join(" "), /propertyAddress/);
});

test("createSubmissionRecord moves valid paid submissions to payment_pending until payment completes", () => {
  const result = createSubmissionRecord(validInput, new Date("2026-05-09T20:00:00.000Z"));

  assert.equal(result.ok, true);
  assert.equal(result.record.status, "payment_pending");
  assert.equal(result.record.id, "lrpr_1778356800000");
});

test("createSubmissionRecord moves free validated submissions to pending_review", () => {
  const result = createSubmissionRecord({ ...validInput, submissionType: "free-draft-review" });

  assert.equal(result.ok, true);
  assert.equal(result.record.status, "pending_review");
});

test("buildCheckoutIntent reports missing Stripe price ids before live config", () => {
  const record = createSubmissionRecord(validInput).record;
  const intent = buildCheckoutIntent(record, {});

  assert.equal(intent.required, true);
  assert.equal(intent.status, "missing_price_id");
  assert.equal(intent.priceEnvKey, "STRIPE_STANDARD_LISTING_PRICE_ID");
});

test("buildAdminNotification creates a submission.created payload", () => {
  const record = createSubmissionRecord({ ...validInput, paymentComplete: true }).record;
  const notification = buildAdminNotification(record);

  assert.equal(notification.templateKey, "submission.created");
  assert.match(notification.subject, /New LRPR submission/);
  assert.equal(notification.payload.submissionId, record.id);
});

test("appendLocalSubmission writes jsonl fallback storage", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "lrpr-submissions-"));
  const filePath = path.join(dir, "submissions.jsonl");
  const record = createSubmissionRecord({ ...validInput, submissionType: "free-draft-review" }).record;

  await appendLocalSubmission(record, { filePath });
  const content = await readFile(filePath, "utf8");

  assert.match(content, /free-draft-review/);
  assert.match(content, new RegExp(record.id));

  await rm(dir, { recursive: true, force: true });
});
