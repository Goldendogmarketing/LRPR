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
  submissionType: "residential-sale",
  contactName: "Jordan Owner",
  contactMethod: "jordan@example.com",
  sourceType: "owner",
  listingStatus: "active",
  propertyAddress: "123 Lake Region Rd, Keystone Heights, FL",
  propertyType: "residential",
  priceOrRent: "$489,000",
  accountValidated: true,
};

test("normalizeSubmissionPayload assigns no checkout policy for public MVP listing types", () => {
  const residential = normalizeSubmissionPayload(validInput);
  const land = normalizeSubmissionPayload({ ...validInput, submissionType: "land-listing", propertyType: "land-acreage" });
  const rental = normalizeSubmissionPayload({ ...validInput, submissionType: "rental-listing", propertyType: "rental" });

  assert.equal(residential.paymentRequired, false);
  assert.equal(land.paymentRequired, false);
  assert.equal(rental.paymentRequired, false);
});

test("validateSubmissionPayload requires core intake fields", () => {
  const invalid = normalizeSubmissionPayload({ submissionType: "residential-sale" });
  const validation = validateSubmissionPayload(invalid);

  assert.equal(validation.ok, false);
  assert.match(validation.errors.join(" "), /contactName/);
  assert.match(validation.errors.join(" "), /propertyAddress/);
});

test("createSubmissionRecord moves validated property submissions to pending_review", () => {
  const result = createSubmissionRecord(validInput, new Date("2026-05-09T20:00:00.000Z"));

  assert.equal(result.ok, true);
  assert.equal(result.record.status, "pending_review");
  assert.equal(result.record.id, "lrpr_1778356800000");
});

test("createSubmissionRecord blocks unvalidated accounts before review", () => {
  const result = createSubmissionRecord({ ...validInput, accountValidated: false });

  assert.equal(result.ok, true);
  assert.equal(result.record.status, "account_pending");
});

test("buildCheckoutIntent reports no checkout for public property submission MVP", () => {
  const record = createSubmissionRecord(validInput).record;
  const intent = buildCheckoutIntent(record, {});

  assert.equal(intent.required, false);
  assert.equal(intent.status, "not_required");
  assert.equal(intent.priceEnvKey, null);
});

test("buildAdminNotification creates a property_submission.created payload", () => {
  const record = createSubmissionRecord(validInput).record;
  const notification = buildAdminNotification(record);

  assert.equal(notification.templateKey, "property_submission.created");
  assert.match(notification.subject, /New LRPR property submission/);
  assert.equal(notification.payload.submissionId, record.id);
});

test("appendLocalSubmission writes jsonl fallback storage", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "lrpr-submissions-"));
  const filePath = path.join(dir, "submissions.jsonl");
  const record = createSubmissionRecord(validInput).record;

  await appendLocalSubmission(record, { filePath });
  const content = await readFile(filePath, "utf8");

  assert.match(content, /residential-sale/);
  assert.match(content, new RegExp(record.id));

  await rm(dir, { recursive: true, force: true });
});
