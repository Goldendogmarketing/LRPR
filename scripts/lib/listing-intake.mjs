export const listingIntakeSourceTypes = [
  {
    id: "owner",
    label: "Owner submitted",
    description: "The property owner submits the listing directly and confirms LRPR can display it.",
  },
  {
    id: "agent",
    label: "Agent submitted",
    description: "A licensed agent or brokerage submits the listing with permission from the owner/client.",
  },
  {
    id: "property-manager",
    label: "Property manager submitted",
    description: "A rental or property manager submits an available rental, lease, or managed property.",
  },
  {
    id: "lrpr-verified",
    label: "LRPR verified",
    description: "LRPR staff manually verifies and approves the record before publishing.",
  },
];

export const listingIntakeStatuses = [
  { id: "active", label: "Active" },
  { id: "pending", label: "Pending" },
  { id: "sold", label: "Sold" },
  { id: "archived", label: "Archived / historical" },
];

export const listingSubmissionTypes = [
  {
    id: "free-draft-review",
    label: "Free draft review",
    priceLabel: "Free",
    audience: "Owners, agents, managers",
    description: "Submit property basics so LRPR can review fit, source, and permission before requesting payment.",
    requiresAccount: true,
    requiresPayment: false,
    badge: "Account required",
  },
  {
    id: "standard-sale-listing",
    label: "Standard sale listing",
    priceLabel: "Paid",
    audience: "Owners and agents",
    description: "Publish an approved home, land, lakefront, or commercial sale listing after validation.",
    requiresAccount: true,
    requiresPayment: true,
    badge: "Best for active sale inventory",
  },
  {
    id: "featured-sale-listing",
    label: "Featured sale listing",
    priceLabel: "Premium",
    audience: "Agents, owners, builders",
    description: "Priority homepage/category placement for approved sale listings with enhanced visibility.",
    requiresAccount: true,
    requiresPayment: true,
    badge: "Sponsored placement",
  },
  {
    id: "rental-listing",
    label: "Rental listing",
    priceLabel: "Paid",
    audience: "Property managers and landlords",
    description: "Publish an approved long-term, seasonal, residential, or commercial rental record.",
    requiresAccount: true,
    requiresPayment: true,
    badge: "Rental lane",
  },
  {
    id: "sold-archive-record",
    label: "Sold / archived record",
    priceLabel: "Low-cost or free",
    audience: "Agents and local property owners",
    description: "Add local historical context for closed, sold, or archived records when reuse rights are clear.",
    requiresAccount: true,
    requiresPayment: true,
    badge: "Market context",
  },
  {
    id: "vendor-service-pro",
    label: "Vendor / Service Pro profile",
    priceLabel: "Paid",
    audience: "Local service businesses",
    description: "Create a verified service-provider profile for contractors, inspectors, lenders, managers, and trades.",
    requiresAccount: true,
    requiresPayment: true,
    badge: "Service marketplace",
  },
];

export const paymentGateRequirements = [
  "Create or sign into a validated account before saving a submission.",
  "Verify email and basic contact identity before checkout or admin review.",
  "Collect payment for paid submission types before public publishing eligibility.",
  "Keep every submission in admin approval until LRPR verifies permission, facts, and source quality.",
  "Only publish after account validation, payment status, and admin approval are all complete.",
];

export function getListingIntakeChecklist() {
  return [
    "Confirm the submitter has permission to advertise or submit this property.",
    "Collect the full street address, city, county, state, ZIP, and listing status.",
    "Require original or authorized listing photos before publishing.",
    "Attach parcel-source context from the relevant county or Florida cadastral fallback.",
    "Attach FEMA flood-map lookup status when coordinates or parcel geometry are available.",
    "Review contact details, asking price/rent, property type, beds, baths, acreage, and disclosure notes.",
  ];
}
