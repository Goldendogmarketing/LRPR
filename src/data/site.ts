export type ListingStatus = "active" | "pending" | "sold" | "archived";
export type ListingType = "for-sale" | "for-rent";

export type Listing = {
  id: number;
  slug: string;
  address: string;
  city: string;
  county: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  type: ListingType;
  status: ListingStatus;
  category: string;
  price: string;
  beds?: number;
  baths?: number;
  detail: string;
  description: string;
};

export const siteUrl = "https://lakeregionpropertyresource.com";

export const counties = [
  {
    name: "Ramsey County",
    slug: "ramsey-county",
    state: "ND",
    description: "Homes, rentals, land, resources, and real-estate service providers around Devils Lake and Ramsey County.",
  },
  {
    name: "Benson County",
    slug: "benson-county",
    state: "ND",
    description: "Regional property resources, local contacts, and service professionals for Benson County communities.",
  },
];

export const cities = [
  {
    name: "Devils Lake",
    slug: "devils-lake",
    county: "Ramsey County",
    state: "ND",
    latitude: 48.1128,
    longitude: -98.8651,
    description: "Local listings, rentals, service providers, utilities, and property resources for Devils Lake, North Dakota.",
  },
  {
    name: "Minnewaukan",
    slug: "minnewaukan",
    county: "Benson County",
    state: "ND",
    latitude: 48.0711,
    longitude: -99.2526,
    description: "Lake Region property resources, local services, and useful municipal contacts for Minnewaukan.",
  },
];

// Sample local seed records. Replace coordinates with Google Geocoding API results when real listings are added.
export const listings: Listing[] = [
  {
    id: 1,
    slug: "421-lakeview-drive-devils-lake-nd",
    address: "421 Lakeview Drive",
    city: "Devils Lake",
    county: "Ramsey County",
    state: "ND",
    postalCode: "58301",
    latitude: 48.1184,
    longitude: -98.8617,
    type: "for-sale",
    status: "active",
    category: "Lakefront Homes",
    price: "$489,000",
    beds: 3,
    baths: 2,
    detail: "3 bed · 2 bath · private dock access",
    description: "A Lake Region property record with lakefront positioning, local category links, and map-ready coordinates.",
  },
  {
    id: 2,
    slug: "118-5th-street-ne-devils-lake-nd",
    address: "118 5th Street NE",
    city: "Devils Lake",
    county: "Ramsey County",
    state: "ND",
    postalCode: "58301",
    latitude: 48.1142,
    longitude: -98.8629,
    type: "for-sale",
    status: "pending",
    category: "Single-Family Homes",
    price: "$249,500",
    beds: 4,
    baths: 2,
    detail: "4 bed · 2 bath · near schools",
    description: "Pending single-family home record connected to Devils Lake and Ramsey County internal SEO hubs.",
  },
  {
    id: 3,
    slug: "77-prairie-ridge-road-lake-region-nd",
    address: "77 Prairie Ridge Road",
    city: "Devils Lake",
    county: "Ramsey County",
    state: "ND",
    postalCode: "58301",
    latitude: 48.0963,
    longitude: -98.8775,
    type: "for-sale",
    status: "sold",
    category: "Land & Acreage",
    price: "$172,000",
    detail: "12 acres · shop-ready site",
    description: "Sold land record retained for market history, search completeness, and local relevance.",
  },
  {
    id: 4,
    slug: "205-marina-bay-unit-3-devils-lake-nd",
    address: "205 Marina Bay Unit 3",
    city: "Devils Lake",
    county: "Ramsey County",
    state: "ND",
    postalCode: "58301",
    latitude: 48.1101,
    longitude: -98.8562,
    type: "for-rent",
    status: "active",
    category: "Apartments & Condos",
    price: "$1,450/mo",
    beds: 2,
    baths: 2,
    detail: "2 bed · 2 bath · water views",
    description: "Active rental listing with address-level map data and links into Devils Lake rental categories.",
  },
  {
    id: 5,
    slug: "912-college-avenue-devils-lake-nd",
    address: "912 College Avenue",
    city: "Devils Lake",
    county: "Ramsey County",
    state: "ND",
    postalCode: "58301",
    latitude: 48.1093,
    longitude: -98.8714,
    type: "for-rent",
    status: "archived",
    category: "Single-Family Rentals",
    price: "$1,200/mo",
    beds: 3,
    baths: 1,
    detail: "3 bed · 1 bath · archived record",
    description: "Archived rental record kept searchable by address for complete property-resource history.",
  },
];

export const saleCategories = ["Lakefront Homes", "Single-Family Homes", "Land & Acreage", "Commercial Property"];
export const rentCategories = ["Apartments & Condos", "Single-Family Rentals", "Short-Term / Seasonal", "Commercial Lease"];
export const resources = ["Utilities", "Municipal contacts", "County offices", "Schools", "Emergency numbers", "Permits & zoning"];
export const servicePros = ["Plumbing", "Electrical", "HVAC", "Landscaping", "Roofing", "Inspection", "Cleaning & staging", "Property management"];

export const statusLabels: Record<ListingStatus, string> = {
  active: "Active",
  pending: "Pending",
  sold: "Sold",
  archived: "Archived",
};

export const typeLabels: Record<ListingType, string> = {
  "for-sale": "For Sale",
  "for-rent": "For Rent",
};

export function getListingsByType(type: ListingType) {
  return listings.filter((listing) => listing.type === type);
}

export function getListingsByCity(city: string) {
  return listings.filter((listing) => listing.city.toLowerCase() === city.toLowerCase());
}

export function getListingsByCounty(county: string) {
  return listings.filter((listing) => listing.county.toLowerCase() === county.toLowerCase());
}

export function getGoogleMapsUrl(listing: Pick<Listing, "latitude" | "longitude" | "address" | "city" | "state">) {
  const query = encodeURIComponent(`${listing.latitude},${listing.longitude} (${listing.address}, ${listing.city}, ${listing.state})`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}
