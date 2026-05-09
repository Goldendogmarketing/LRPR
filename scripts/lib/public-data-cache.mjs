const FEMA_NFHL_URL = "https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer";
const CENSUS_ACS_PROFILE_URL = "https://api.census.gov/data/2022/acs/acs5/profile";
const NWS_POINTS_URL = "https://api.weather.gov/points";

export function buildOfficialContacts(region) {
  return {
    cities: Object.fromEntries(
      region.cities.map((city) => [
        city.slug,
        {
          name: city.name,
          type: "city",
          officialUrl: city.officialUrl || null,
          sourceUrl: city.officialUrl || "https://www.usa.gov/local-governments",
          note: city.officialUrl ? `Official municipal resource for ${city.name}.` : `${city.name} is served through county and regional official resources.`,
        },
      ]),
    ),
    counties: Object.fromEntries(
      region.counties.map((county) => [
        county.slug,
        {
          name: county.name,
          type: "county",
          officialUrl: county.officialUrl,
          sourceUrl: county.officialUrl,
          note: `Official county resource for property, permitting, utilities, public notices, and local departments in ${county.name}.`,
        },
      ]),
    ),
  };
}

export function buildCountyParcelSources(counties) {
  return Object.fromEntries(
    counties.map((county) => [
      county.slug,
      {
        county: county.name,
        sourceName: county.parcelSource,
        sourceUrl: county.parcelUrl,
        isFallback: county.parcelSource.toLowerCase().includes("fallback"),
        note: county.parcelSource.toLowerCase().includes("fallback")
          ? `${county.name} uses the Florida statewide cadastral layer until a direct official county parcel endpoint is approved or confirmed.`
          : `${county.name} has a direct public parcel/GIS source for parcel-context enrichment.`,
      },
    ]),
  );
}

function countyByName(region, countyName) {
  return region.counties.find((county) => county.name === countyName);
}

function makeFact(label, value, sourceName, sourceUrl) {
  return { label, value, sourceName, sourceUrl };
}

function buildCensusFactForCity(city, county) {
  const geography = city.censusPlaceCode
    ? `ACS place profile configured for ${city.name}, FL plus ${county?.name || city.primaryCounty} county fallback.`
    : `ACS county profile fallback configured through ${county?.name || city.primaryCounty}; city/CDP boundary should be confirmed before publishing place-level stats.`;

  return makeFact("Census profile", geography, "U.S. Census ACS 5-Year Profile API", CENSUS_ACS_PROFILE_URL);
}

function buildWeatherFactForCity(city, weatherMetadata = {}) {
  const office = weatherMetadata.forecastOffice ? ` Forecast office: ${weatherMetadata.forecastOffice}.` : "";
  return makeFact(
    "Weather office",
    `NWS point lookup configured for ${city.latitude}, ${city.longitude}.${office}`,
    "National Weather Service API",
    `${NWS_POINTS_URL}/${city.latitude},${city.longitude}`,
  );
}

function buildFloodFactForPoint(point) {
  return makeFact(
    "Flood map lookup",
    `FEMA NFHL spatial lookup configured for ${point.latitude}, ${point.longitude}; publish flood-zone labels only after cache has matched the official NFHL layer.`,
    "FEMA National Flood Hazard Layer",
    FEMA_NFHL_URL,
  );
}

export function createPublicDataCache(region, options = {}) {
  const generatedAt = options.generatedAt || new Date().toISOString();
  const officialContacts = buildOfficialContacts(region);
  const parcelSources = buildCountyParcelSources(region.counties);
  const weatherByCity = options.weatherByCity || {};
  const censusByCounty = options.censusByCounty || {};

  const cityFacts = Object.fromEntries(
    region.cities.map((city) => {
      const primaryCounty = countyByName(region, city.primaryCounty);
      const parcelSource = parcelSources[primaryCounty?.slug];
      const contact = officialContacts.cities[city.slug];
      const countyCensus = censusByCounty[primaryCounty?.slug];
      const censusValue = countyCensus?.summary
        ? countyCensus.summary
        : buildCensusFactForCity(city, primaryCounty).value;

      return [
        city.slug,
        {
          name: city.name,
          slug: city.slug,
          generatedAt,
          facts: [
            makeFact("Census profile", censusValue, "U.S. Census ACS 5-Year Profile API", CENSUS_ACS_PROFILE_URL),
            buildWeatherFactForCity(city, weatherByCity[city.slug]),
            buildFloodFactForPoint(city),
            makeFact("Parcel data", parcelSource?.note || "Parcel source pending.", parcelSource?.sourceName || "County parcel source", parcelSource?.sourceUrl || "https://floridarevenue.com/property/Pages/Cofficial_OfficialCountyAppraiserSites.aspx"),
            makeFact("Official contact", contact.note, contact.name, contact.sourceUrl),
          ],
        },
      ];
    }),
  );

  const countyFacts = Object.fromEntries(
    region.counties.map((county) => {
      const parcelSource = parcelSources[county.slug];
      const contact = officialContacts.counties[county.slug];
      const census = censusByCounty[county.slug];
      return [
        county.slug,
        {
          name: county.name,
          slug: county.slug,
          generatedAt,
          facts: [
            makeFact("Census profile", census?.summary || `ACS county profile configured for ${county.name}, Florida.`, "U.S. Census ACS 5-Year Profile API", CENSUS_ACS_PROFILE_URL),
            makeFact("Parcel data", parcelSource.note, parcelSource.sourceName, parcelSource.sourceUrl),
            makeFact("Flood map coverage", `FEMA NFHL coverage configured for ${county.name} property and city pages.`, "FEMA National Flood Hazard Layer", FEMA_NFHL_URL),
            makeFact("Official county contact", contact.note, contact.name, contact.sourceUrl),
          ],
        },
      ];
    }),
  );

  const listingFacts = Object.fromEntries(
    region.listings.map((listing) => {
      const county = countyByName(region, listing.county);
      const parcelSource = county ? parcelSources[county.slug] : null;
      return [
        listing.slug,
        {
          name: `${listing.address}, ${listing.city}`,
          slug: listing.slug,
          generatedAt,
          facts: [
            makeFact("Census geocoder", `Address-to-tract/block-group join configured for ${listing.city}, ${listing.county}; use only approved listing addresses.`, "U.S. Census Geocoder Geographies API", "https://geocoding.geo.census.gov/geocoder/geographies/address"),
            buildFloodFactForPoint(listing),
            makeFact("Parcel data", parcelSource?.note || "Parcel source pending.", parcelSource?.sourceName || "County parcel source", parcelSource?.sourceUrl || "https://floridarevenue.com/property/Pages/Cofficial_OfficialCountyAppraiserSites.aspx"),
            makeFact("Weather context", `NWS point metadata configured for ${listing.latitude}, ${listing.longitude}.`, "National Weather Service API", `${NWS_POINTS_URL}/${listing.latitude},${listing.longitude}`),
          ],
        },
      ];
    }),
  );

  return {
    version: 1,
    generatedAt,
    region: "Florida Lake Region",
    enrichmentGroups: {
      census: { sourceName: "U.S. Census ACS 5-Year Profile API", sourceUrl: CENSUS_ACS_PROFILE_URL },
      weather: { sourceName: "National Weather Service API", sourceUrl: NWS_POINTS_URL },
      flood: { sourceName: "FEMA National Flood Hazard Layer", sourceUrl: FEMA_NFHL_URL },
      parcels: { sourceName: "County parcel GIS + Florida statewide cadastral fallback", sourceUrl: "https://floridarevenue.com/property/Pages/Cofficial_OfficialCountyAppraiserSites.aspx" },
      officialContacts,
    },
    parcelSources,
    cityFacts,
    countyFacts,
    listingFacts,
  };
}

export function buildPageFacts(cache, pageType, slug) {
  if (pageType === "city") return cache.cityFacts?.[slug]?.facts || [];
  if (pageType === "county") return cache.countyFacts?.[slug]?.facts || [];
  if (pageType === "listing") return cache.listingFacts?.[slug]?.facts || [];
  return [];
}
