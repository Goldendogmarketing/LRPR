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

/**
 * One panel in the immersive listing's scrolling feature reel.
 * Maps to the "FEATURES" array in the BW immersive JSX reference —
 * a parallax photo with a label, headline, narrative, and a stat callout.
 */
export type ImmersiveFeature = {
  label: string;
  /** Two-line title. Use \n for the line break. */
  title: string;
  body: string;
  /** Big number/word in the stat block, e.g. "10 ft", "Granite". */
  stat: string;
  statLabel: string;
  /** Optional photo override; falls back to listing.photos[index]. */
  photo?: string;
};

/**
 * Per-listing agent / seller block. When a paid user (fsbo / agent)
 * customizes their profile, those fields override anything stored on
 * the listing record itself so changes propagate to every listing
 * they own without editing each row.
 */
export type ListedBy = {
  displayName?: string;
  brokerage?: string;
  phone?: string;
  email?: string;
  /** Public URL of the agent's headshot uploaded to Supabase Storage. */
  headshotUrl?: string;
  /** Short bio / tagline, max ~240 chars. Shown in the CTA card. */
  tagline?: string;
  /**
   * Accent color (hex with leading #). The immersive template tints
   * nav, headlines, stat numbers, and CTA buttons with this color.
   * Falls back to the gold #c8a97e from the BW reference.
   */
  accentColor?: string;
  /**
   * Future: link to a Supabase profiles.id so we can server-side
   * fetch up-to-date customization on every render. Hardcoded for
   * the demo listings below.
   */
  profileId?: string;
  /**
   * The agent's per-account "immersive presentation" upgrade flag.
   * Resolved from profiles.immersive_enabled by resolveListedBy().
   * When true, every listing this agent owns renders with the BW-style
   * immersive template instead of the classic layout — unless the
   * listing itself overrides via `Listing.presentationStyle`.
   */
  immersiveEnabled?: boolean;
};

/**
 * Which template renders the listing detail page.
 *  - "classic"   = the original light-theme card layout (default)
 *  - "immersive" = the BW black/gold parallax presentation
 *
 * If unset, the page consults the listed-by profile's `immersive_enabled`
 * upgrade flag. Explicitly setting it on a listing overrides the agent's
 * default (useful for a one-off boost or for opting a specific listing
 * back to classic).
 */
export type PresentationStyle = "classic" | "immersive";

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
  // ─── Immersive listing template fields ────────────────────────────
  // All optional so legacy callers (and any non-immersive renders)
  // keep type-checking. The /listings/[slug] page degrades gracefully
  // by reusing the hero photo for any section that's missing imagery.
  /** Primary lake/exterior shot used in the hero parallax. */
  heroPhoto?: string;
  /** Aerial / drone shot used in the "Nearly 2.5 Acres" section. */
  aerialPhoto?: string;
  /** Additional gallery shots; FeatureSection picks from this in order. */
  photos?: string[];
  sqft?: string;
  lot?: string;
  yearBuilt?: number;
  mls?: string;
  /** Two-line tagline shown over the aerial section. */
  tagline?: string;
  /** Short labels in the aerial-section pill rail. */
  taglineHighlights?: string[];
  /** Feature reel sections — usually 3–4 entries. */
  features?: ImmersiveFeature[];
  /** Agent / owner card shown in nav, CTA, and footer. */
  listedBy?: ListedBy;
  /**
   * Per-listing override of the presentation template. Leave undefined
   * to inherit from the listed-by agent's `immersive_enabled` flag.
   */
  presentationStyle?: PresentationStyle;
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

// ─── Placeholder photo URLs ────────────────────────────────────────────
// Demo listings use stable Unsplash photo IDs. Real listings will replace
// these with uploads from src/components/PhotoUpload.tsx -> Supabase Storage
// bucket "listing-photos". The unsplash params are sized for parallax hero
// usage (2400px wide @ q=80). The immersive template falls back to a solid
// charcoal background if a photo URL 404s.
const PH = {
  lakeHero: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=2400&q=80",
  lakeAerial: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=2400&q=80",
  living: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=80",
  kitchen: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=2400&q=80",
  poolNight: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=2400&q=80",
  poolDay: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=2400&q=80",
  doorsToPool: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2400&q=80",
  farmhouse: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=2400&q=80",
  farmhouseInterior: "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=2400&q=80",
  starkeKitchen: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=2400&q=80",
  starkePorch: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=2400&q=80",
  landAerial: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2400&q=80",
  landForest: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2400&q=80",
  landLake: "https://images.unsplash.com/photo-1542317854-43b87fe19ce4?auto=format&fit=crop&w=2400&q=80",
  rentalExterior: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=2400&q=80",
  rentalLiving: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=2400&q=80",
  rentalKitchen: "https://images.unsplash.com/photo-1556909114-44e3e9399a2d?auto=format&fit=crop&w=2400&q=80",
  condoExterior: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2400&q=80",
  condoInterior: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=2400&q=80",
} as const;

// Default listed-by used for demo records. Once profile customization is
// live, paid users get their own block via listing.listedBy.profileId.
const DEMO_AGENT: ListedBy = {
  displayName: "Branden Waters",
  brokerage: "Trevor Waters Realty, Inc.",
  phone: "352-222-2888",
  email: "branden@ihelpbuild.com",
  tagline: "Lake Region specialist. Born and raised in Clay County, working with owners and buyers across the four-county Lake Region.",
  accentColor: "#c8a97e",
};

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
    heroPhoto: PH.lakeHero,
    aerialPhoto: PH.lakeAerial,
    photos: [PH.living, PH.kitchen, PH.poolNight, PH.doorsToPool],
    sqft: "2,072",
    lot: "2.48 Acres",
    yearBuilt: 2004,
    mls: "MLS# DEMO-2137168",
    tagline: "Nearly 2.5 Acres\nof Lakefront Privacy",
    taglineHighlights: ["Lake Geneva", "Heated Pool & Spa", "2.48 Acres", "New Roof 2026"],
    features: [
      {
        label: "Living",
        title: "Soaring Ceilings,\nLake Views",
        body: "Step inside and stunning views of the pool, lake, and private backyard greet you immediately. The spacious living room features soaring 10-foot ceilings, a wood-burning fireplace, hardwood floors, and French doors opening directly to the screened pool area and lake beyond.",
        stat: "10 ft",
        statLabel: "Ceilings",
      },
      {
        label: "Kitchen",
        title: "A Kitchen Built\nfor Gathering",
        body: "Abundant wood cabinetry with glass-front uppers, granite countertops, stainless steel appliances, and a breakfast bar with pendant lighting. Hardwood flooring flows from the living spaces into a kitchen designed for both daily life and entertaining.",
        stat: "Granite",
        statLabel: "Countertops",
      },
      {
        label: "Pool",
        title: "Resort Living,\nEvery Night",
        body: "The screened lanai houses a heated free-form pool with integrated spa, waterfall feature, and expansive deck — all glowing under ambient lighting at dusk. A recent oversized Pentair pool heater means year-round enjoyment.",
        stat: "Heated",
        statLabel: "Pool & Spa",
      },
      {
        label: "Indoor-Outdoor",
        title: "Where Inside\nMeets Outside",
        body: "Tall French doors and transom windows dissolve the boundary between the home's interior and the screened outdoor living space. The view stretches past the pool, through the mature oaks, and all the way to the lake.",
        stat: "Lakefront",
        statLabel: "Setting",
      },
    ],
    // Demo flag: Lake Geneva renders as the immersive black/gold parallax
    // template out of the box so reviewers can see what the paid upgrade
    // looks like without flipping a profile toggle. The other 4 demo
    // listings stay on the classic layout.
    presentationStyle: "immersive",
    listedBy: DEMO_AGENT,
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
    heroPhoto: PH.farmhouse,
    aerialPhoto: PH.lakeAerial,
    photos: [PH.farmhouseInterior, PH.starkeKitchen, PH.starkePorch],
    sqft: "1,840",
    lot: "0.34 Acres",
    yearBuilt: 1998,
    mls: "MLS# DEMO-2148022",
    tagline: "Quiet Bradford County\nFamily Living",
    taglineHighlights: ["4 Bedrooms", "Covered Porch", "Walkable to Town", "Pending"],
    features: [
      {
        label: "Living",
        title: "Open Living,\nWarm Light",
        body: "A spacious open plan combines living, dining, and kitchen with abundant natural light. New luxury vinyl plank flooring runs throughout, and a brick fireplace anchors the family room.",
        stat: "1,840",
        statLabel: "Sq Ft",
      },
      {
        label: "Kitchen",
        title: "Updated Kitchen,\nTimeless Bones",
        body: "Newer shaker cabinetry, butcher-block counters, and a deep farmhouse sink keep the kitchen feeling fresh while honoring the home's traditional Bradford County roots.",
        stat: "Renovated",
        statLabel: "2022",
      },
      {
        label: "Outdoor",
        title: "Covered Porch,\nFenced Yard",
        body: "A full-width covered porch faces the morning sun. The backyard is fully fenced and shaded by mature pecans — room for kids, dogs, and a garden.",
        stat: "0.34",
        statLabel: "Acres",
      },
    ],
    listedBy: DEMO_AGENT,
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
    heroPhoto: PH.landAerial,
    aerialPhoto: PH.landLake,
    photos: [PH.landForest, PH.landLake],
    lot: "5.12 Acres",
    mls: "MLS# DEMO-LAND-1108",
    tagline: "Lake Santa Fe Adjacent\nBuildable Acreage",
    taglineHighlights: ["5.12 Acres", "Putnam County", "Cleared Trail", "Sold"],
    features: [
      {
        label: "Land",
        title: "Cleared and\nReady to Build",
        body: "A graded driveway leads back to a cleared building pad with cleared sightlines through mature oak and pine. Septic and well location identified in seller's site plan.",
        stat: "5.12",
        statLabel: "Acres",
      },
      {
        label: "Setting",
        title: "Lake Santa Fe,\nMinutes Away",
        body: "Public boat ramps on Lake Santa Fe are a short drive. The parcel itself sits in a quiet cross-county pocket surrounded by other large lots — privacy without isolation.",
        stat: "Near",
        statLabel: "Lake Santa Fe",
      },
    ],
    listedBy: DEMO_AGENT,
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
    heroPhoto: PH.rentalExterior,
    aerialPhoto: PH.lakeAerial,
    photos: [PH.rentalLiving, PH.rentalKitchen],
    sqft: "1,180",
    lot: "0.22 Acres",
    yearBuilt: 1986,
    mls: "MLS# DEMO-RENT-4204",
    tagline: "Move-In Ready\nPutnam County Rental",
    taglineHighlights: ["2 Bed / 2 Bath", "Fenced Yard", "Available Now", "12-Month Lease"],
    features: [
      {
        label: "Living",
        title: "Open Floor Plan,\nNatural Light",
        body: "Updated paint, new ceiling fans, and a comfortable open living-dining layout. The galley kitchen opens straight onto the back patio.",
        stat: "1,180",
        statLabel: "Sq Ft",
      },
      {
        label: "Outdoor",
        title: "Fully Fenced,\nPet Friendly",
        body: "Fenced backyard with mature shade trees. Small dogs and cats welcome with deposit.",
        stat: "Yes",
        statLabel: "Pets OK",
      },
    ],
    listedBy: DEMO_AGENT,
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
    heroPhoto: PH.condoExterior,
    aerialPhoto: PH.lakeAerial,
    photos: [PH.condoInterior, PH.rentalKitchen],
    sqft: "980",
    yearBuilt: 1979,
    mls: "MLS# DEMO-RENT-2218",
    tagline: "Hawthorne Apartment\nClose to Gainesville",
    taglineHighlights: ["3 Bedrooms", "Off-Street Parking", "Walk to Schools", "Archived"],
    features: [
      {
        label: "Living",
        title: "Three Bedrooms,\nUpdated Bath",
        body: "Three good-sized bedrooms with closet space, a single recently renovated bathroom, and a galley kitchen open to the dining area.",
        stat: "3 / 1",
        statLabel: "Bed / Bath",
      },
      {
        label: "Location",
        title: "Hawthorne Quiet,\nGainesville Close",
        body: "Quiet residential block on Johnson Street, with easy access to SR-20 for the Gainesville commute. School bus stop on the corner.",
        stat: "20 min",
        statLabel: "To UF",
      },
    ],
    listedBy: DEMO_AGENT,
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
