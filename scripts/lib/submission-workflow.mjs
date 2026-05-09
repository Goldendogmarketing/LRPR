export const submissionWorkflowStatuses = [
  { id: "draft", label: "Draft", description: "Saved by the submitter before checkout or review." },
  { id: "account_pending", label: "Account pending", description: "Submission exists, but account/email validation is incomplete." },
  { id: "payment_pending", label: "Payment pending", description: "Paid submission type selected, but Stripe payment is incomplete." },
  { id: "pending_review", label: "Pending review", description: "Ready for LRPR admin review." },
  { id: "changes_requested", label: "Changes requested", description: "Admin requested corrections, proof, or additional details." },
  { id: "approved", label: "Approved", description: "Admin approved; ready to publish or activate." },
  { id: "published", label: "Published", description: "Visible on public listing/vendor/resource pages." },
  { id: "rejected", label: "Rejected", description: "Declined due to permission, quality, duplicate, or policy issue." },
];

export const adminReviewChecklist = [
  "Validated account/email is attached to the submission.",
  "Submitter source and permission to advertise are documented.",
  "Payment is complete for paid submission types or waived by admin.",
  "Address, city, county, ZIP, property type, price/rent, and status are complete.",
  "Photos/copy are original, authorized, or safe to publish.",
  "Parcel, flood, Census, map, and local data enrichment are queued or complete.",
  "Admin approval is recorded before public publish.",
];

export const adminRoles = [
  { id: "owner", label: "Owner", permissions: ["view", "edit", "approve", "publish", "billing", "settings"] },
  { id: "reviewer", label: "Reviewer", permissions: ["view", "edit", "approve"] },
  { id: "support", label: "Support", permissions: ["view", "edit"] },
];

export function canPublishSubmission({ accountValidated, paymentRequired, paymentComplete, adminApproved }) {
  return Boolean(accountValidated && (!paymentRequired || paymentComplete) && adminApproved);
}

export function nextSubmissionStatus({ accountValidated, paymentRequired, paymentComplete, adminApproved, published }) {
  if (published) return "published";
  if (!accountValidated) return "account_pending";
  if (paymentRequired && !paymentComplete) return "payment_pending";
  if (!adminApproved) return "pending_review";
  return "approved";
}

export function roleCan(roleId, permission) {
  const role = adminRoles.find((candidate) => candidate.id === roleId);
  return Boolean(role?.permissions.includes(permission));
}
