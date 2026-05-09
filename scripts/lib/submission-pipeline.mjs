import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const REQUIRED_FIELDS = ["submissionType", "contactName", "contactMethod", "sourceType", "propertyAddress", "propertyType"];

export const submissionTypePaymentPolicy = {
  "free-draft-review": { requiresPayment: false, priceEnvKey: null },
  "standard-sale-listing": { requiresPayment: true, priceEnvKey: "STRIPE_STANDARD_LISTING_PRICE_ID" },
  "featured-sale-listing": { requiresPayment: true, priceEnvKey: "STRIPE_FEATURED_LISTING_PRICE_ID" },
  "rental-listing": { requiresPayment: true, priceEnvKey: "STRIPE_RENTAL_LISTING_PRICE_ID" },
  "sold-archive-record": { requiresPayment: true, priceEnvKey: "STRIPE_ARCHIVE_RECORD_PRICE_ID" },
  "vendor-service-pro": { requiresPayment: true, priceEnvKey: "STRIPE_VENDOR_PROFILE_PRICE_ID" },
};

export function normalizeSubmissionPayload(input) {
  const get = (key) => String(input?.[key] ?? "").trim();
  const submissionType = get("submissionType") || "free-draft-review";
  const paymentPolicy = submissionTypePaymentPolicy[submissionType] ?? submissionTypePaymentPolicy["free-draft-review"];

  return {
    id: get("id"),
    submissionType,
    contactName: get("contactName"),
    contactMethod: get("contactMethod"),
    sourceType: get("sourceType") || "owner",
    listingStatus: get("listingStatus") || "active",
    propertyAddress: get("propertyAddress"),
    propertyType: get("propertyType") || "house",
    priceOrRent: get("priceOrRent"),
    beds: get("beds"),
    baths: get("baths"),
    notes: get("notes"),
    accountValidated: Boolean(input?.accountValidated),
    paymentRequired: paymentPolicy.requiresPayment,
    paymentComplete: Boolean(input?.paymentComplete),
    adminApproved: Boolean(input?.adminApproved),
    permissionConfirmed: Boolean(input?.permissionConfirmed),
  };
}

export function validateSubmissionPayload(payload) {
  const errors = [];
  for (const field of REQUIRED_FIELDS) {
    if (!payload[field]) errors.push(`${field} is required`);
  }

  if (!submissionTypePaymentPolicy[payload.submissionType]) {
    errors.push("submissionType is not supported");
  }

  if (payload.contactMethod && !/[0-9@.a-z-]/i.test(payload.contactMethod)) {
    errors.push("contactMethod must include an email or phone value");
  }

  return { ok: errors.length === 0, errors };
}

export function createSubmissionRecord(payload, now = new Date()) {
  const normalized = normalizeSubmissionPayload(payload);
  const validation = validateSubmissionPayload(normalized);

  if (!validation.ok) {
    return { ok: false, errors: validation.errors, record: null };
  }

  const id = normalized.id || `lrpr_${now.getTime()}`;
  const status = !normalized.accountValidated ? "account_pending" : normalized.paymentRequired && !normalized.paymentComplete ? "payment_pending" : "pending_review";

  return {
    ok: true,
    errors: [],
    record: {
      ...normalized,
      id,
      status,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
  };
}

export function buildAdminNotification(record) {
  return {
    to: process.env.LRPR_ADMIN_EMAIL || "admin@lrpr.local",
    subject: `New LRPR submission: ${record.submissionType}`,
    preview: `${record.contactName} submitted ${record.propertyAddress || record.propertyType} for ${record.status}.`,
    templateKey: "submission.created",
    payload: {
      submissionId: record.id,
      submissionType: record.submissionType,
      status: record.status,
      contactName: record.contactName,
      propertyAddress: record.propertyAddress,
    },
  };
}

export function buildCheckoutIntent(record, env = process.env) {
  const policy = submissionTypePaymentPolicy[record.submissionType] ?? submissionTypePaymentPolicy["free-draft-review"];

  if (!policy.requiresPayment) {
    return { required: false, status: "not_required", priceId: null };
  }

  const priceId = policy.priceEnvKey ? env[policy.priceEnvKey] : null;

  return {
    required: true,
    status: priceId ? "ready" : "missing_price_id",
    priceId: priceId || null,
    priceEnvKey: policy.priceEnvKey,
  };
}

export async function appendLocalSubmission(record, options = {}) {
  const filePath = options.filePath || path.join(process.cwd(), ".lrpr-local", "submissions.jsonl");
  await mkdir(path.dirname(filePath), { recursive: true });

  let existing = "";
  try {
    existing = await readFile(filePath, "utf8");
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }

  await writeFile(filePath, `${existing}${JSON.stringify(record)}\n`);
  return { filePath, id: record.id };
}
