export type SubmissionTypeId = "residential-sale" | "land-listing" | "rental-listing";

export type SubmissionRecord = {
  id: string;
  submissionType: SubmissionTypeId;
  contactName: string;
  contactMethod: string;
  sourceType: string;
  listingStatus: string;
  propertyAddress: string;
  propertyType: string;
  priceOrRent: string;
  beds: string;
  baths: string;
  notes: string;
  accountValidated: boolean;
  paymentRequired: boolean;
  paymentComplete: boolean;
  adminApproved: boolean;
  permissionConfirmed: boolean;
  status: "account_pending" | "payment_pending" | "pending_review";
  createdAt: string;
  updatedAt: string;
};

type SubmissionInput = Record<string, FormDataEntryValue | string | boolean | undefined>;

const requiredFields = ["submissionType", "contactName", "contactMethod", "sourceType", "propertyAddress", "propertyType"];

export const submissionTypePaymentPolicy: Record<SubmissionTypeId, { requiresPayment: boolean; priceEnvKey: string | null }> = {
  "residential-sale": { requiresPayment: false, priceEnvKey: null },
  "land-listing": { requiresPayment: false, priceEnvKey: null },
  "rental-listing": { requiresPayment: false, priceEnvKey: null },
};

function isSubmissionType(value: string): value is SubmissionTypeId {
  return value in submissionTypePaymentPolicy;
}

export function formDataToSubmissionInput(formData: FormData): SubmissionInput {
  return {
    submissionType: formData.get("submissionType") ?? undefined,
    contactName: formData.get("contactName") ?? undefined,
    contactMethod: formData.get("contactMethod") ?? undefined,
    sourceType: formData.get("sourceType") ?? undefined,
    listingStatus: formData.get("listingStatus") ?? undefined,
    propertyAddress: formData.get("propertyAddress") ?? undefined,
    propertyType: formData.get("propertyType") ?? undefined,
    priceOrRent: formData.get("priceOrRent") ?? undefined,
    beds: formData.get("beds") ?? undefined,
    baths: formData.get("baths") ?? undefined,
    notes: formData.get("notes") ?? undefined,
  };
}

export function normalizeSubmissionPayload(input: SubmissionInput) {
  const get = (key: string) => String(input?.[key] ?? "").trim();
  const rawSubmissionType = get("submissionType") || "residential-sale";
  const submissionType = isSubmissionType(rawSubmissionType) ? rawSubmissionType : "residential-sale";
  const paymentPolicy = submissionTypePaymentPolicy[submissionType];

  return {
    submissionType,
    contactName: get("contactName"),
    contactMethod: get("contactMethod"),
    sourceType: get("sourceType") || "owner",
    listingStatus: get("listingStatus") || "active",
    propertyAddress: get("propertyAddress"),
    propertyType: get("propertyType") || (submissionType === "land-listing" ? "land-acreage" : "residential"),
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

export function validateSubmissionPayload(payload: ReturnType<typeof normalizeSubmissionPayload>) {
  const errors: string[] = [];
  for (const field of requiredFields) {
    if (!payload[field as keyof typeof payload]) errors.push(`${field} is required`);
  }

  return { ok: errors.length === 0, errors };
}

export function createSubmissionRecord(input: SubmissionInput, now = new Date()) {
  const normalized = normalizeSubmissionPayload(input);
  const validation = validateSubmissionPayload(normalized);

  if (!validation.ok) {
    return { ok: false as const, errors: validation.errors, record: null };
  }

  const id = `lrpr_${now.getTime()}`;
  const status = !normalized.accountValidated ? "account_pending" : normalized.paymentRequired && !normalized.paymentComplete ? "payment_pending" : "pending_review";

  return {
    ok: true as const,
    errors: [],
    record: {
      ...normalized,
      id,
      status,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    } satisfies SubmissionRecord,
  };
}

export function buildCheckoutIntent(record: SubmissionRecord, env: Record<string, string | undefined> = process.env) {
  const policy = submissionTypePaymentPolicy[record.submissionType];

  if (!policy.requiresPayment) return { required: false, status: "not_required", priceId: null, priceEnvKey: null };

  const priceId = policy.priceEnvKey ? env[policy.priceEnvKey] : undefined;
  return {
    required: true,
    status: priceId ? "ready" : "missing_price_id",
    priceId: priceId || null,
    priceEnvKey: policy.priceEnvKey,
  };
}

export function buildAdminNotification(record: SubmissionRecord) {
  return {
    to: process.env.LRPR_ADMIN_EMAIL || "admin@lrpr.local",
    subject: `New LRPR property submission: ${record.submissionType}`,
    preview: `${record.contactName} submitted ${record.propertyAddress || record.propertyType} for ${record.status}.`,
    templateKey: "property_submission.created",
    payload: {
      submissionId: record.id,
      submissionType: record.submissionType,
      status: record.status,
      contactName: record.contactName,
      propertyAddress: record.propertyAddress,
    },
  };
}

export async function appendLocalSubmission(record: SubmissionRecord, options: { filePath?: string } = {}) {
  // Runtime placeholder until Supabase credentials are available. The tested Node script version writes JSONL;
  // the app version avoids filesystem tracing in Next builds and returns a stable persistence handle.
  return { filePath: options.filePath || "supabase:pending", id: record.id };
}
