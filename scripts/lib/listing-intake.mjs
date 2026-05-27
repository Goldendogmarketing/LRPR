export const publicListingSubmissionTypes = [
  {
    id: "residential-sale",
    label: "Residential property for sale",
    priceLabel: "Admin reviewed",
    audience: "Owners and licensed agents",
    description: "Submit a home for sale in the Florida Lake Region. LRPR verifies permission, facts, photos, and local context before anything publishes.",
    requiresAccount: true,
    requiresPayment: false,
    adminManaged: false,
  },
  {
    id: "land-listing",
    label: "Land / lot listing",
    priceLabel: "Admin reviewed",
    audience: "Owners, agents, and land sellers",
    description: "Submit acreage, vacant land, lake-area lots, or rural build sites with parcel and county context queued for review.",
    requiresAccount: true,
    requiresPayment: false,
    adminManaged: false,
  },
  {
    id: "rental-listing",
    label: "Rental listing",
    priceLabel: "Admin reviewed",
    audience: "Landlords and property managers",
    description: "Submit a residential rental packet for LRPR review, including lease terms, availability, photos, and manager/owner permission.",
    requiresAccount: true,
    requiresPayment: false,
    adminManaged: false,
  },
];

export const listingSubmissionTypes = publicListingSubmissionTypes;

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
    description: "A rental or property manager submits an available residential rental or managed property.",
  },
];

export const listingIntakeStatuses = [
  { id: "active", label: "Active" },
  { id: "pending", label: "Pending / coming soon" },
];

export const adminManagedContentTypes = [
  {
    id: "service-provider-profile",
    label: "Service provider profile",
    owner: "admin",
    requiresPayment: true,
    requiresApproval: true,
    publicSubmission: false,
    description: "LRPR admin creates/updates paid service-provider profiles after payment and admin approval.",
  },
  {
    id: "local-resource",
    label: "Local resource",
    owner: "admin",
    requiresPayment: false,
    requiresApproval: true,
    publicSubmission: false,
    description: "LRPR admin adds city, county, utility, permit, school, park, lake, and official data resources directly.",
  },
];

export const paymentGateRequirements = [
  "Public property submissions require a validated account before saving or review.",
  "Residential sale, land, and rental submissions remain private until LRPR admin review is complete.",
  "Service-provider profiles are admin-uploaded, paid placements and require admin approval before publish.",
  "Local resources are admin-added data records, not public submissions.",
  "Nothing publishes until permission, source quality, and admin approval gates are satisfied.",
];

export function getListingIntakeChecklist() {
  return [
    "Confirm the submitter has permission to advertise or submit this property.",
    "Collect the full street address, city, county, state, ZIP, and listing status.",
    "Classify the request as residential sale, land/lot, or rental.",
    "Require original or authorized listing photos before publishing.",
    "Attach parcel-source context from the relevant county or Florida cadastral fallback.",
    "Attach FEMA flood-map lookup status when coordinates or parcel geometry are available.",
    "Review contact details, asking price/rent, beds, baths, acreage, lease terms, and disclosure notes.",
  ];
}
