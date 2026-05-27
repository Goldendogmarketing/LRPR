const DECISIONS = {
  approved: "approved",
  changes_requested: "changes_requested",
  rejected: "rejected",
};

const DECISION_LABELS = {
  approved: "approved",
  changes_requested: "changes requested",
  rejected: "rejected",
};

const DECISION_STATUSES = {
  approved: "approved",
  changes_requested: "changes_requested",
  rejected: "rejected",
};

function trim(value) {
  return String(value ?? "").trim();
}

function normalizeDecision(value) {
  return DECISIONS[value] ? value : "changes_requested";
}

export function normalizeAdminDecisionInput(input = {}) {
  return {
    submissionId: trim(input.submissionId),
    decision: normalizeDecision(trim(input.decision)),
    reviewerId: trim(input.reviewerId) || "admin-scaffold",
    notes: trim(input.notes),
  };
}

export function buildPublishGateChecklist(submission = {}) {
  const paymentSatisfied = !submission.paymentRequired || Boolean(submission.paymentComplete);
  const gates = [
    {
      id: "account_validated",
      label: "Account/email validated",
      passed: Boolean(submission.accountValidated),
      blockingStatus: "account_pending",
    },
    {
      id: "payment_satisfied",
      label: "Payment complete or not required",
      passed: paymentSatisfied,
      blockingStatus: "payment_pending",
    },
    {
      id: "permission_confirmed",
      label: "Permission/source documented",
      passed: Boolean(submission.permissionConfirmed),
      blockingStatus: "changes_requested",
    },
    {
      id: "admin_approved",
      label: "Admin approval recorded",
      passed: Boolean(submission.adminApproved),
      blockingStatus: "pending_review",
    },
  ];

  const missingGates = gates.filter((gate) => !gate.passed);

  return {
    canPublish: missingGates.length === 0,
    gates,
    missingGateIds: missingGates.map((gate) => gate.id),
    nextBlockingStatus: missingGates[0]?.blockingStatus ?? "publish_ready",
  };
}

export function buildAdminDecisionWorkflow({ submission, decisionInput, now = new Date() } = {}) {
  const normalizedDecision = normalizeAdminDecisionInput(decisionInput);
  const errors = [];

  if (!submission?.id) errors.push("submission is required");
  if (!normalizedDecision.submissionId) errors.push("submissionId is required");
  if (submission?.id && normalizedDecision.submissionId && submission.id !== normalizedDecision.submissionId) {
    errors.push("submissionId does not match submission record");
  }

  if (errors.length) {
    return { ok: false, errors };
  }

  const reviewedAt = now.toISOString();
  const approved = normalizedDecision.decision === "approved";
  const rejected = normalizedDecision.decision === "rejected";
  const status = DECISION_STATUSES[normalizedDecision.decision];

  const provisionalSubmission = {
    ...submission,
    adminApproved: approved,
    status,
    updatedAt: reviewedAt,
  };
  const publishGate = buildPublishGateChecklist(provisionalSubmission);
  const finalStatus = approved && publishGate.canPublish ? "publish_ready" : status;
  const submissionUpdate = {
    id: submission.id,
    status: finalStatus,
    adminApproved: approved,
    updatedAt: reviewedAt,
  };

  const reviewRecord = {
    id: `review_${submission.id}_${now.getTime()}`,
    submissionId: submission.id,
    reviewerId: normalizedDecision.reviewerId,
    decision: normalizedDecision.decision,
    decisionLabel: DECISION_LABELS[normalizedDecision.decision],
    notes: normalizedDecision.notes,
    createdAt: reviewedAt,
  };

  const eventRecord = {
    id: `event_${submission.id}_${now.getTime()}`,
    submissionId: submission.id,
    eventType: `admin_review.${normalizedDecision.decision}`,
    actorId: normalizedDecision.reviewerId,
    metadata: {
      decision: normalizedDecision.decision,
      notes: normalizedDecision.notes,
      nextStatus: finalStatus,
      canPublish: publishGate.canPublish,
    },
    createdAt: reviewedAt,
  };

  const notification = {
    to: submission.contactMethod || null,
    subject: `LRPR submission ${DECISION_LABELS[normalizedDecision.decision]}: ${submission.propertyAddress || submission.id}`,
    preview: approved
      ? "Your LRPR property submission passed admin review."
      : rejected
        ? "Your LRPR property submission was not approved for publication."
        : "LRPR needs a few changes before review can continue.",
    templateKey: `property_submission.${normalizedDecision.decision}`,
    payload: {
      submissionId: submission.id,
      decision: normalizedDecision.decision,
      status: finalStatus,
      notes: normalizedDecision.notes,
    },
  };

  return {
    ok: true,
    errors: [],
    decision: normalizedDecision,
    submissionUpdate,
    reviewRecord,
    eventRecord,
    publishGate: buildPublishGateChecklist({ ...provisionalSubmission, status: finalStatus }),
    notification,
  };
}
