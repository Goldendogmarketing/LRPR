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
