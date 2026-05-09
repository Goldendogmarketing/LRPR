import publicDataCache from "@/data/generated/public-data-cache.json";

export type PublicDataFact = {
  label: string;
  value: string;
  sourceName: string;
  sourceUrl: string;
};

type FactBucket = {
  name: string;
  slug: string;
  generatedAt: string;
  facts: PublicDataFact[];
};

type PublicDataCache = {
  version: number;
  generatedAt: string;
  region: string;
  enrichmentGroups: Record<string, unknown>;
  cityFacts: Record<string, FactBucket>;
  countyFacts: Record<string, FactBucket>;
  listingFacts: Record<string, FactBucket>;
};

const cache = publicDataCache as PublicDataCache;

export function getPublicDataCache() {
  return cache;
}

export function getCityPublicDataFacts(slug: string) {
  return cache.cityFacts[slug]?.facts ?? [];
}

export function getCountyPublicDataFacts(slug: string) {
  return cache.countyFacts[slug]?.facts ?? [];
}

export function getListingPublicDataFacts(slug: string) {
  return cache.listingFacts[slug]?.facts ?? [];
}

export function getPublicDataGeneratedAt() {
  return cache.generatedAt;
}
