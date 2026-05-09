export type ListingStatus = "active" | "pending" | "sold" | "archived";
export type ListingType = "for-sale" | "for-rent";

export type County = {
  name: string;
  slug: string;
  state: "FL";
  description: string;
  officialUrl: string;
};

export type City = {
  name: string;
  slug: string;
  counties: string[];
  primaryCounty: string;
  state: "FL";
  latitude: number;
  longitude: number;
  description: string;
  officialUrl?: string;
  localAngles: string[];
};

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

export const counties: County[] = [
  {
    name: "Clay County",
    slug: "clay-county",
    state: "FL",
    description: "Homes, rentals, lake property, utilities, parks, services, and local contacts around Keystone Heights and Clay County's Lake Region communities.",
    officialUrl: "https://www.claycountygov.com/",
  },
  {
    name: "Bradford County",
    slug: "bradford-county",
    state: "FL",
    description: "Property resources, municipal contacts, services, and market context for Starke, Hampton, and Bradford County communities.",
    officialUrl: "https://bradfordcountyfl.gov/",
  },
  {
    name: "Putnam County",
    slug: "putnam-county",
    state: "FL",
    description: "Lake Region property resources for Interlachen, Florahome, Melrose-area communities, local services, parcels, parks, and utilities.",
    officialUrl: "https://www.putnam-fl.gov/",
  },
  {
    name: "Alachua County",
    slug: "alachua-county",
    state: "FL",
    description: "Local property resources, service providers, utilities, zoning, parks, and city links for Hawthorne and Alachua County's eastern Lake Region area.",
    officialUrl: "https://alachuacounty.us/",
  },
];

export const cities: City[] = [
  {
    name: "Keystone Heights",
    slug: "keystone-heights",
    counties: ["Clay County", "Bradford County"],
    primaryCounty: "Clay County",
    state: "FL",
    latitude: 29.7861,
    longitude: -82.0315,
    description: "Lake Region property resources for Keystone Heights, Florida, including homes, rentals, lake access, utilities, local contacts, and real-estate service providers.",
    officialUrl: "https://www.keystoneheights.us/",
    localAngles: ["Lake Geneva", "Brooklyn Lake", "Clay County services", "Bradford County edge communities"],
  },
  {
    name: "Starke",
    slug: "starke",
    counties: ["Bradford County"],
    primaryCounty: "Bradford County",
    state: "FL",
    latitude: 29.9441,
    longitude: -82.1098,
    description: "Homes, rentals, local resources, municipal contacts, and property services for Starke, Florida and Bradford County.",
    officialUrl: "https://www.cityofstarke.org/",
    localAngles: ["Bradford County courthouse area", "US-301 corridor", "local utilities", "county services"],
  },
  {
    name: "Melrose",
    slug: "melrose",
    counties: ["Alachua County", "Bradford County", "Clay County", "Putnam County"],
    primaryCounty: "Putnam County",
    state: "FL",
    latitude: 29.7108,
    longitude: -82.0498,
    description: "Cross-county Lake Region resources for Melrose, Florida, including Lake Santa Fe area property context, utilities, service pros, and county links.",
    localAngles: ["Lake Santa Fe", "cross-county services", "rural lake property", "Putnam/Alachua/Bradford/Clay context"],
  },
  {
    name: "Hawthorne",
    slug: "hawthorne",
    counties: ["Alachua County"],
    primaryCounty: "Alachua County",
    state: "FL",
    latitude: 29.5919,
    longitude: -82.0873,
    description: "Property resources, rentals, zoning links, parks, lakes, schools, and real-estate service providers for Hawthorne, Florida.",
    officialUrl: "https://www.cityofhawthorne.net/",
    localAngles: ["Alachua County zoning", "lakes and conservation", "Gainesville commute context", "local utilities"],
  },
  {
    name: "Interlachen",
    slug: "interlachen",
    counties: ["Putnam County"],
    primaryCounty: "Putnam County",
    state: "FL",
    latitude: 29.6236,
    longitude: -81.8904,
    description: "Lake Region property, parcel, resource, utility, and vendor information for Interlachen, Florida and Putnam County.",
    officialUrl: "https://www.interlachen-fl.gov/",
    localAngles: ["Putnam County parcels", "rural property", "lakes and wetlands", "local municipal services"],
  },
  {
    name: "Florahome",
    slug: "florahome",
    counties: ["Putnam County"],
    primaryCounty: "Putnam County",
    state: "FL",
    latitude: 29.7311,
    longitude: -81.8859,
    description: "Local property resources for Florahome, Florida, including land, homes, utilities, environmental context, and Putnam County services.",
    localAngles: ["George's Lake area", "land and acreage", "Putnam County services", "rural vendors"],
  },
  {
    name: "Hampton",
    slug: "hampton",
    counties: ["Bradford County"],
    primaryCounty: "Bradford County",
    state: "FL",
    latitude: 29.8655,
    longitude: -82.1357,
    description: "Homes, rentals, county contacts, utilities, and property resources for Hampton, Florida and surrounding Bradford County areas.",
    officialUrl: "https://www.hamptonfl.com/",
    localAngles: ["Bradford County", "US-301 access", "small-town services", "nearby lake communities"],
  },
];

// Demo records for design/development only. Replace with approved real listings and geocode each address before launch.
export const listings: Listing[] = [
  {
    id: 1,
    slug: "demo-lake-geneva-road-keystone-heights-fl",
    address: "Demo Lake Geneva Road",
    city: "Keystone Heights",
    county: "Clay County",
    state: "FL",
    postalCode: "32656",
    latitude: 29.7861,
    longitude: -82.0315,
    type: "for-sale",
    status: "active",
    category: "Lakefront Homes",
    price: "$489,000",
    beds: 3,
    baths: 2,
    detail: "3 bed · 2 bath · lake-area property record",
    description: "A demo Keystone Heights property record with Lake Region category links, city/county context, and map-ready coordinates.",
  },
  {
    id: 2,
    slug: "demo-walnut-street-starke-fl",
    address: "Demo Walnut Street",
    city: "Starke",
    county: "Bradford County",
    state: "FL",
    postalCode: "32091",
    latitude: 29.9441,
    longitude: -82.1098,
    type: "for-sale",
    status: "pending",
    category: "Single-Family Homes",
    price: "$249,500",
    beds: 4,
    baths: 2,
    detail: "4 bed · 2 bath · near Bradford County services",
    description: "Pending demo single-family record connected to Starke and Bradford County internal SEO hubs.",
  },
  {
    id: 3,
    slug: "demo-lake-santa-fe-area-melrose-fl",
    address: "Demo Lake Santa Fe Area",
    city: "Melrose",
    county: "Putnam County",
    state: "FL",
    postalCode: "32666",
    latitude: 29.7108,
    longitude: -82.0498,
    type: "for-sale",
    status: "sold",
    category: "Land & Acreage",
    price: "$172,000",
    detail: "Acreage · cross-county Lake Region context",
    description: "Sold demo land record retained for market-history UX, search completeness, and local relevance around Melrose.",
  },
  {
    id: 4,
    slug: "demo-main-street-interlachen-fl",
    address: "Demo Main Street",
    city: "Interlachen",
    county: "Putnam County",
    state: "FL",
    postalCode: "32148",
    latitude: 29.6236,
    longitude: -81.8904,
    type: "for-rent",
    status: "active",
    category: "Single-Family Rentals",
    price: "$1,450/mo",
    beds: 2,
    baths: 2,
    detail: "2 bed · 2 bath · Putnam County rental record",
    description: "Active demo rental listing with address-level map data and links into Interlachen rental/resource categories.",
  },
  {
    id: 5,
    slug: "demo-johnson-street-hawthorne-fl",
    address: "Demo Johnson Street",
    city: "Hawthorne",
    county: "Alachua County",
    state: "FL",
    postalCode: "32640",
    latitude: 29.5919,
    longitude: -82.0873,
    type: "for-rent",
    status: "archived",
    category: "Apartments & Condos",
    price: "$1,200/mo",
    beds: 3,
    baths: 1,
    detail: "3 bed · 1 bath · archived Alachua County record",
    description: "Archived demo rental record kept searchable by address for complete property-resource history.",
  },
];

export const saleCategories = ["Lakefront Homes", "Single-Family Homes", "Land & Acreage", "Commercial Property"];
export const rentCategories = ["Apartments & Condos", "Single-Family Rentals", "Short-Term / Seasonal", "Commercial Lease"];
export const resources = ["Utilities", "Municipal contacts", "County offices", "Schools", "Emergency numbers", "Permits & zoning", "Flood maps", "Parks & lakes"];
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

export function slugify(value: string) {
  return value.toLowerCase().replaceAll("&", "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function getListingsByType(type: ListingType) {
  return listings.filter((listing) => listing.type === type);
}

export function getListingsByCity(city: string) {
  return listings.filter((listing) => listing.city.toLowerCase() === city.toLowerCase());
}

export function getListingsByCounty(county: string) {
  return listings.filter((listing) => listing.county.toLowerCase() === county.toLowerCase());
}

export function getCityBySlug(slug: string) {
  return cities.find((city) => city.slug === slug);
}

export function getCountyBySlug(slug: string) {
  return counties.find((county) => county.slug === slug);
}

export function getGoogleMapsUrl(listing: Pick<Listing, "latitude" | "longitude" | "address" | "city" | "state">) {
  const query = encodeURIComponent(`${listing.latitude},${listing.longitude} (${listing.address}, ${listing.city}, ${listing.state})`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}
