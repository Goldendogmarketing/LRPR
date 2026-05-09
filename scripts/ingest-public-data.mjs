import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createPublicDataCache } from "./lib/public-data-cache.mjs";
import { lrprRegion } from "./data/lrpr-region.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const outputPath = path.join(projectRoot, "src", "data", "generated", "public-data-cache.json");

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 10_000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Lake Region Property Resource dataset ingestion (local development)",
        Accept: "application/json",
        ...(options.headers || {}),
      },
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function formatNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return new Intl.NumberFormat("en-US").format(number);
}

async function fetchCountyCensusProfiles(counties) {
  const results = {};
  await Promise.all(
    counties.map(async (county) => {
      const url = new URL("https://api.census.gov/data/2022/acs/acs5/profile");
      url.searchParams.set("get", "NAME,DP05_0001E,DP03_0062E,DP04_0001E");
      url.searchParams.set("for", `county:${county.fips}`);
      url.searchParams.set("in", "state:12");
      try {
        const rows = await fetchJson(url.toString());
        const [headers, values] = rows;
        const record = Object.fromEntries(headers.map((header, index) => [header, values[index]]));
        const population = formatNumber(record.DP05_0001E);
        const medianIncome = formatNumber(record.DP03_0062E);
        const housingUnits = formatNumber(record.DP04_0001E);
        results[county.slug] = {
          sourceUrl: url.toString(),
          summary: `${record.NAME}: ${population || "population pending"} residents, ${housingUnits || "housing units pending"} housing units, and median household income ${medianIncome ? `$${medianIncome}` : "pending"} per ACS 5-year profile.`,
        };
      } catch (error) {
        results[county.slug] = {
          sourceUrl: url.toString(),
          summary: `ACS county profile configured for ${county.name}; live pull failed during this run (${error.message}).`,
        };
      }
    }),
  );
  return results;
}

async function fetchNwsPointMetadata(cities) {
  const results = {};
  await Promise.all(
    cities.map(async (city) => {
      const url = `https://api.weather.gov/points/${city.latitude},${city.longitude}`;
      try {
        const data = await fetchJson(url);
        const officeUrl = data?.properties?.forecastOffice || "";
        results[city.slug] = {
          sourceUrl: url,
          forecastOffice: officeUrl.split("/").filter(Boolean).at(-1) || null,
          gridId: data?.properties?.gridId || null,
          forecastUrl: data?.properties?.forecast || null,
        };
      } catch (error) {
        results[city.slug] = {
          sourceUrl: url,
          forecastOffice: null,
          error: error.message,
        };
      }
    }),
  );
  return results;
}

async function main() {
  const generatedAt = new Date().toISOString();
  const [censusByCounty, weatherByCity] = await Promise.all([
    fetchCountyCensusProfiles(lrprRegion.counties),
    fetchNwsPointMetadata(lrprRegion.cities),
  ]);

  const cache = createPublicDataCache(lrprRegion, {
    generatedAt,
    censusByCounty,
    weatherByCity,
  });

  cache.livePulls = {
    censusByCounty,
    weatherByCity,
  };

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(cache, null, 2)}\n`);
  console.log(`Wrote ${path.relative(projectRoot, outputPath)}`);
  console.log(`Generated ${Object.keys(cache.cityFacts).length} city fact groups, ${Object.keys(cache.countyFacts).length} county fact groups, and ${Object.keys(cache.listingFacts).length} listing fact groups.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
