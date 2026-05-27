import assert from "node:assert/strict";
import test from "node:test";

import {
  buildAdminDecisionWorkflow,
  buildPublishGateChecklist,
  normalizeAdminDecisionInput,
} from "../scripts/lib/admin-workflow.mjs";

const reviewableSubmission = {
  id: "lrpr_1778356800000",
  submissionType: "residential-sale",
  status: "pending_review",
  contactName: "Jordan Owner",
  propertyAddress: "123 Lake Region Rd, Keystone Heights, FL",
  accountValidated: true,
  paymentRequired: false,
  paymentComplete: false,
  adminApproved: false,
  permissionConfirmed: true,
};

test("normalizeAdminDecisionInput defaults invalid decisions to changes_requested", () => {
  const decision = normalizeAdminDecisionInput({
    submissionId: reviewableSubmission.id,
    decision: "publish-now",
    reviewerId: "admin@example.com",
  });

  assert.equal(decision.decision, "changes_requested");
  assert.equal(decision.submissionId, reviewableSubmission.id);
  assert.equal(decision.reviewerId, "admin@example.com");
});

test("buildPublishGateChecklist keeps submissions private until all gates pass", () => {
  const checklist = buildPublishGateChecklist({
    ...reviewableSubmission,
    accountValidated: false,
    permissionConfirmed: false,
  });

  assert.equal(checklist.canPublish, false);
  assert.deepEqual(
    checklist.missingGateIds,
    ["account_validated", "permission_confirmed", "admin_approved"],
  );
});

test("buildAdminDecisionWorkflow creates review, event, and publish-ready update for approved submissions", () => {
  const workflow = buildAdminDecisionWorkflow({
    submission: reviewableSubmission,
    decisionInput: {
      submissionId: reviewableSubmission.id,
      decision: "approved",
      reviewerId: "branden-admin",
      notes: "Permission verified by owner email.",
    },
    now: new Date("2026-05-12T22:15:00.000Z"),
  });

  assert.equal(workflow.ok, true);
  assert.equal(workflow.submissionUpdate.status, "publish_ready");
  assert.equal(workflow.submissionUpdate.adminApproved, true);
  assert.equal(workflow.publishGate.canPublish, true);
  assert.equal(workflow.reviewRecord.decision, "approved");
  assert.equal(workflow.eventRecord.eventType, "admin_review.approved");
  assert.equal(workflow.notification.templateKey, "property_submission.approved");
});

test("buildAdminDecisionWorkflow records changes requested without approving or publishing", () => {
  const workflow = buildAdminDecisionWorkflow({
    submission: reviewableSubmission,
    decisionInput: {
      submissionId: reviewableSubmission.id,
      decision: "changes_requested",
      reviewerId: "branden-admin",
      notes: "Need parcel proof and fresh exterior photos.",
    },
    now: new Date("2026-05-12T22:20:00.000Z"),
  });

  assert.equal(workflow.ok, true);
  assert.equal(workflow.submissionUpdate.status, "changes_requested");
  assert.equal(workflow.submissionUpdate.adminApproved, false);
  assert.equal(workflow.publishGate.canPublish, false);
  assert.equal(workflow.reviewRecord.notes, "Need parcel proof and fresh exterior photos.");
  assert.equal(workflow.eventRecord.eventType, "admin_review.changes_requested");
});

test("buildAdminDecisionWorkflow rejects mismatched submission ids", () => {
  const workflow = buildAdminDecisionWorkflow({
    submission: reviewableSubmission,
    decisionInput: {
      submissionId: "LRPR-404",
      decision: "approved",
      reviewerId: "branden-admin",
    },
  });

  assert.equal(workflow.ok, false);
  assert.match(workflow.errors.join(" "), /submissionId does not match/);
});
