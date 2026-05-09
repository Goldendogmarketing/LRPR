import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCountyParcelSources,
  buildOfficialContacts,
  buildPageFacts,
  createPublicDataCache,
} from "../scripts/lib/public-data-cache.mjs";

const sampleRegion = {
  generatedAt: "2026-05-08T00:00:00.000Z",
  cities: [
    {
      name: "Keystone Heights",
      slug: "keystone-heights",
      primaryCounty: "Clay County",
      counties: ["Clay County", "Bradford County"],
      latitude: 29.7861,
      longitude: -82.0315,
      officialUrl: "https://www.keystoneheights.us/",
    },
  ],
  counties: [
    {
      name: "Clay County",
      slug: "clay-county",
      officialUrl: "https://www.claycountygov.com/",
      parcelSource: "Clay County Property Appraiser Parcel FeatureServer",
      parcelUrl: "https://services2.arcgis.com/kQPfxbSKhIDcSFXL/ArcGIS/rest/services/ClayCountyParcel/FeatureServer/6",
    },
    {
      name: "Bradford County",
      slug: "bradford-county",
      officialUrl: "https://bradfordcountyfl.gov/",
      parcelSource: "Florida Statewide Cadastral fallback",
      parcelUrl: "https://services9.arcgis.com/Gh9awoU677aKree0/arcgis/rest/services/Florida_Statewide_Cadastral/FeatureServer",
    },
  ],
  listings: [
    {
      slug: "demo-lake-geneva-road-keystone-heights-fl",
      address: "Demo Lake Geneva Road",
      city: "Keystone Heights",
      county: "Clay County",
      latitude: 29.7861,
      longitude: -82.0315,
    },
  ],
};

test("buildOfficialContacts creates city and county official contacts", () => {
  const contacts = buildOfficialContacts(sampleRegion);

  assert.equal(contacts.cities["keystone-heights"].name, "Keystone Heights");
  assert.equal(contacts.cities["keystone-heights"].officialUrl, "https://www.keystoneheights.us/");
  assert.equal(contacts.counties["clay-county"].name, "Clay County");
});

test("buildCountyParcelSources maps county parcel source and statewide fallback", () => {
  const parcelSources = buildCountyParcelSources(sampleRegion.counties);

  assert.equal(parcelSources["clay-county"].sourceName, "Clay County Property Appraiser Parcel FeatureServer");
  assert.equal(parcelSources["bradford-county"].sourceName, "Florida Statewide Cadastral fallback");
  assert.equal(parcelSources["bradford-county"].isFallback, true);
});

test("createPublicDataCache includes the five initial enrichment groups", () => {
  const cache = createPublicDataCache(sampleRegion, { generatedAt: sampleRegion.generatedAt });

  assert.deepEqual(Object.keys(cache.enrichmentGroups).sort(), [
    "census",
    "flood",
    "officialContacts",
    "parcels",
    "weather",
  ]);
  assert.ok(cache.cityFacts["keystone-heights"].facts.length >= 5);
  assert.ok(cache.countyFacts["clay-county"].facts.some((fact) => fact.label === "Parcel data"));
  assert.ok(cache.listingFacts["demo-lake-geneva-road-keystone-heights-fl"].facts.some((fact) => fact.label === "Flood map lookup"));
});

test("buildPageFacts returns page-ready facts with source URLs", () => {
  const cache = createPublicDataCache(sampleRegion, { generatedAt: sampleRegion.generatedAt });
  const facts = buildPageFacts(cache, "city", "keystone-heights");

  assert.ok(facts.length >= 5);
  assert.ok(facts.every((fact) => fact.label && fact.value && fact.sourceUrl));
});
