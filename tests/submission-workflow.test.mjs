import assert from "node:assert/strict";
import test from "node:test";

import {
  adminReviewChecklist,
  applyAdminDecision,
  canPublishSubmission,
  nextSubmissionStatus,
  roleCan,
  submissionWorkflowStatuses,
} from "../scripts/lib/submission-workflow.mjs";

test("submission workflow has draft through published/rejected states", () => {
  const statusIds = submissionWorkflowStatuses.map((status) => status.id);

  assert.deepEqual(statusIds, [
    "draft",
    "account_pending",
    "payment_pending",
    "pending_review",
    "changes_requested",
    "approved",
    "published",
    "rejected",
  ]);
});

test("submission cannot publish unless account, payment, and admin gates pass", () => {
  assert.equal(canPublishSubmission({ accountValidated: false, paymentRequired: false, paymentComplete: false, adminApproved: true }), false);
  assert.equal(canPublishSubmission({ accountValidated: true, paymentRequired: true, paymentComplete: false, adminApproved: true }), false);
  assert.equal(canPublishSubmission({ accountValidated: true, paymentRequired: true, paymentComplete: true, adminApproved: false }), false);
  assert.equal(canPublishSubmission({ accountValidated: true, paymentRequired: true, paymentComplete: true, adminApproved: true }), true);
  assert.equal(canPublishSubmission({ accountValidated: true, paymentRequired: false, paymentComplete: false, adminApproved: true }), true);
});

test("nextSubmissionStatus returns the blocking gate state", () => {
  assert.equal(nextSubmissionStatus({ accountValidated: false, paymentRequired: false, paymentComplete: false, adminApproved: false }), "account_pending");
  assert.equal(nextSubmissionStatus({ accountValidated: true, paymentRequired: true, paymentComplete: false, adminApproved: false }), "payment_pending");
  assert.equal(nextSubmissionStatus({ accountValidated: true, paymentRequired: true, paymentComplete: true, adminApproved: false }), "pending_review");
  assert.equal(nextSubmissionStatus({ accountValidated: true, paymentRequired: true, paymentComplete: true, adminApproved: true }), "approved");
  assert.equal(nextSubmissionStatus({ accountValidated: true, paymentRequired: true, paymentComplete: true, adminApproved: true, published: true }), "published");
});

test("admin review checklist includes account, payment, permission, data enrichment, and approval", () => {
  const checklistText = adminReviewChecklist.join(" ").toLowerCase();

  assert.match(checklistText, /account/);
  assert.match(checklistText, /payment/);
  assert.match(checklistText, /permission/);
  assert.match(checklistText, /parcel/);
  assert.match(checklistText, /approval/);
});

test("admin roles separate owner, reviewer, and support permissions", () => {
  assert.equal(roleCan("owner", "billing"), true);
  assert.equal(roleCan("reviewer", "approve"), true);
  assert.equal(roleCan("reviewer", "billing"), false);
  assert.equal(roleCan("support", "approve"), false);
});

test("applyAdminDecision updates status only for approval-capable roles", () => {
  const submission = { id: "lrpr_test", status: "pending_review", adminApproved: false };

  const approved = applyAdminDecision(submission, "approved", "reviewer");
  const blocked = applyAdminDecision(submission, "approved", "support");
  const changes = applyAdminDecision(submission, "changes_requested", "owner");

  assert.equal(approved.ok, true);
  assert.equal(approved.submission.status, "approved");
  assert.equal(approved.submission.adminApproved, true);
  assert.equal(blocked.ok, false);
  assert.equal(blocked.submission.status, "pending_review");
  assert.equal(changes.submission.status, "changes_requested");
});
