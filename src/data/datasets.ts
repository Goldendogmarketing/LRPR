export type DatasetCadence = "live" | "daily" | "weekly" | "monthly" | "quarterly" | "semiannual" | "annual" | "manual-review";

export type DatasetSource = {
  id: string;
  name: string;
  sourceType: "api" | "arcgis" | "download" | "official-page";
  url: string;
  coverage: string[];
  enriches: Array<"listing" | "city" | "county" | "resource" | "service-pro" | "map">;
  contentUse: string;
  cadence: DatasetCadence;
  implementationNote: string;
};

export const datasetSources: DatasetSource[] = [
  {
    id: "census-acs-profile",
    name: "U.S. Census ACS 5-Year Profile API",
    sourceType: "api",
    url: "https://api.census.gov/data/2022/acs/acs5/profile",
    coverage: ["Clay County", "Bradford County", "Putnam County", "Alachua County"],
    enriches: ["city", "county", "listing"],
    contentUse: "Population, housing, tenure, income, commute, age, and local demographic summaries.",
    cadence: "annual",
    implementationNote: "Attach GEOIDs to city/county pages and eventually tracts/block groups for listing-area summaries.",
  },
  {
    id: "census-geocoder",
    name: "U.S. Census Geocoder Geographies API",
    sourceType: "api",
    url: "https://geocoding.geo.census.gov/geocoder/geographies/address",
    coverage: ["All LRPR addresses"],
    enriches: ["listing", "map"],
    contentUse: "Address-to-county/place/tract/block-group lookup for local SEO and dataset joins.",
    cadence: "annual",
    implementationNote: "Use with Google Geocoding: Google for map coordinates, Census for official geography/GEOIDs.",
  },
  {
    id: "florida-statewide-cadastral",
    name: "Florida Statewide Cadastral FeatureServer",
    sourceType: "arcgis",
    url: "https://services9.arcgis.com/Gh9awoU677aKree0/arcgis/rest/services/Florida_Statewide_Cadastral/FeatureServer",
    coverage: ["All Florida counties"],
    enriches: ["listing", "city", "county", "map"],
    contentUse: "Parcel boundaries and public tax-roll context for property and map pages.",
    cadence: "annual",
    implementationNote: "Use as statewide fallback; prefer direct county parcel FeatureServer where available.",
  },
  {
    id: "clay-parcels",
    name: "Clay County Property Appraiser Parcel FeatureServer",
    sourceType: "arcgis",
    url: "https://services2.arcgis.com/kQPfxbSKhIDcSFXL/ArcGIS/rest/services/ClayCountyParcel/FeatureServer",
    coverage: ["Clay County", "Keystone Heights", "Melrose area"],
    enriches: ["listing", "city", "county", "map"],
    contentUse: "Parcel context for Clay County properties and city pages.",
    cadence: "manual-review",
    implementationNote: "Confirm layer schema and cache parcel facts; do not imply listing status.",
  },
  {
    id: "putnam-parcels",
    name: "Putnam County Property Appraiser CadastralData FeatureServer",
    sourceType: "arcgis",
    url: "https://pamap.putnam-fl.gov/server/rest/services/CadastralData/FeatureServer",
    coverage: ["Putnam County", "Interlachen", "Florahome", "Melrose area"],
    enriches: ["listing", "city", "county", "map"],
    contentUse: "Parcel context, subdivisions, lots, blocks, and cadastral map data.",
    cadence: "manual-review",
    implementationNote: "Useful for Putnam-side Lake Region land and rural property pages.",
  },
  {
    id: "alachua-parcels",
    name: "Alachua County PublicParcel FeatureServer",
    sourceType: "arcgis",
    url: "https://services.arcgis.com/cNo3jpluyt69V8Ek/arcgis/rest/services/PublicParcel/FeatureServer",
    coverage: ["Alachua County", "Hawthorne", "Melrose area"],
    enriches: ["listing", "city", "county", "map"],
    contentUse: "Public parcel polygons and local property map context.",
    cadence: "manual-review",
    implementationNote: "Pair with Alachua zoning and official county GIS layers.",
  },
  {
    id: "fema-nfhl",
    name: "FEMA National Flood Hazard Layer",
    sourceType: "arcgis",
    url: "https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer",
    coverage: ["All LRPR communities"],
    enriches: ["listing", "city", "county", "map"],
    contentUse: "Flood zone, FIRM panel, floodway, and related official flood-map context.",
    cadence: "monthly",
    implementationNote: "Spatial join listing point/parcel to flood zones; include disclaimer and official FEMA link.",
  },
  {
    id: "fdep-open-data",
    name: "Florida DEP Geospatial Open Data",
    sourceType: "arcgis",
    url: "https://geo-fdep.opendata.arcgis.com/",
    coverage: ["Florida", "Lake Santa Fe", "Lake Geneva", "Brooklyn Lake", "Lake Grandin"],
    enriches: ["city", "county", "resource", "map"],
    contentUse: "Waterbodies, wetlands, conservation lands, parks, impaired waters, and environmental context.",
    cadence: "quarterly",
    implementationNote: "Use for unique lake/community sections and environmental resource pages.",
  },
  {
    id: "fdot-gis",
    name: "FDOT GIS and Transportation Data",
    sourceType: "download",
    url: "https://www.fdot.gov/statistics/gis/default.shtm",
    coverage: ["Florida", "US-301", "SR-100", "SR-20", "SR-26"],
    enriches: ["city", "county", "listing", "map"],
    contentUse: "Roads, traffic counts, commute corridor context, bridges, and transportation layers.",
    cadence: "annual",
    implementationNote: "Use for corridor and commute snippets on city/listing pages.",
  },
  {
    id: "nces-schools",
    name: "NCES Common Core of Data / School Search",
    sourceType: "download",
    url: "https://nces.ed.gov/ccd/files.asp",
    coverage: ["Clay County", "Bradford County", "Putnam County", "Alachua County"],
    enriches: ["city", "listing", "resource"],
    contentUse: "Nearby public schools, districts, grades, addresses, and annual enrollment facts.",
    cadence: "annual",
    implementationNote: "Do not publish school ratings unless licensed from a source that permits it.",
  },
  {
    id: "nws-api",
    name: "National Weather Service API",
    sourceType: "api",
    url: "https://api.weather.gov/points/{latitude},{longitude}",
    coverage: ["All LRPR city coordinates"],
    enriches: ["city", "listing", "resource"],
    contentUse: "Forecast office, weather alerts, local forecast, and climate/resource widgets.",
    cadence: "live",
    implementationNote: "Cache short term; include NWS attribution. Good for useful non-duplicate city content.",
  },
  {
    id: "sunbiz-business-data",
    name: "Florida Sunbiz Data Downloads",
    sourceType: "download",
    url: "https://dos.fl.gov/sunbiz/other-services/data-downloads/",
    coverage: ["Florida businesses"],
    enriches: ["service-pro", "city", "county"],
    contentUse: "Business entity validation and vendor-directory seed research.",
    cadence: "weekly",
    implementationNote: "Validate service area and active status; do not imply endorsement or scrape private directories.",
  },
];

export function getDatasetsForCity(cityName: string) {
  return datasetSources.filter((source) => source.coverage.some((item) => item === "Florida" || item === "All LRPR communities" || item.includes(cityName)) || source.enriches.includes("city"));
}

export function getDatasetsForCounty(countyName: string) {
  return datasetSources.filter((source) => source.coverage.some((item) => item === "Florida" || item === "All Florida counties" || item === countyName || item === "All LRPR communities") || source.enriches.includes("county"));
}
