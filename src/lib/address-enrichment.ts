/**
 * Address enrichment via free, no-key public APIs.
 * Each API call is isolated in its own try/catch with an AbortController
 * timeout so a slow or failing API can never block the publish flow.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EnrichmentFact = {
  label: string;
  value: string;
  sourceName: string;
  sourceUrl: string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TIMEOUT_MS = 8_000;

function makeSignal(): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), TIMEOUT_MS);
  return controller.signal;
}

// ---------------------------------------------------------------------------
// enrichAddress
// ---------------------------------------------------------------------------

export async function enrichAddress({
  latitude,
  longitude,
}: {
  latitude: number | null;
  longitude: number | null;
  // address is accepted by callers but enrichment is purely coordinate-based.
  address?: string;
}): Promise<EnrichmentFact[]> {
  if (!latitude || !longitude || latitude === 0 || longitude === 0) {
    return [];
  }

  const facts: EnrichmentFact[] = [];

  // ── 1. FCC Area API ──────────────────────────────────────────────────────
  try {
    const signal = makeSignal();
    const url = `https://geo.fcc.gov/api/census/area?lat=${latitude}&lon=${longitude}&format=json`;
    const res = await fetch(url, { cache: "no-store", signal });
    if (res.ok) {
      const json = (await res.json()) as {
        results?: { county_name?: string; state_code?: string }[];
      };
      const first = json.results?.[0];
      if (first?.county_name) {
        facts.push({
          label: "County",
          value: first.county_name,
          sourceName: "FCC Area API",
          sourceUrl: "https://geo.fcc.gov/api/census/area",
        });
      }
      if (first?.state_code) {
        facts.push({
          label: "State",
          value: first.state_code,
          sourceName: "FCC Area API",
          sourceUrl: "https://geo.fcc.gov/api/census/area",
        });
      }
    }
  } catch (err) {
    console.warn("[enrichAddress] FCC Area API failed:", err);
  }

  // ── 2. US Census Geocoder ────────────────────────────────────────────────
  try {
    const signal = makeSignal();
    const url =
      `https://geocoding.geo.census.gov/geocoder/geographies/coordinates` +
      `?x=${longitude}&y=${latitude}` +
      `&benchmark=Public_AR_Current&vintage=Current_Current&format=json` +
      `&layers=Census%20Tracts`;
    const res = await fetch(url, { cache: "no-store", signal });
    if (res.ok) {
      const json = (await res.json()) as {
        result?: {
          geographies?: {
            "Census Tracts"?: { NAME?: string; TRACT?: string }[];
          };
        };
      };
      const tract = json.result?.geographies?.["Census Tracts"]?.[0];
      const tractValue = tract?.NAME ?? tract?.TRACT;
      if (tractValue) {
        facts.push({
          label: "Census Tract",
          value: tractValue,
          sourceName: "US Census Geocoder",
          sourceUrl: "https://geocoding.geo.census.gov",
        });
      }
    }
  } catch (err) {
    console.warn("[enrichAddress] US Census Geocoder failed:", err);
  }

  // ── 3. FEMA National Flood Hazard Layer ─────────────────────────────────
  try {
    const signal = makeSignal();
    const url =
      `https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/28/query` +
      `?where=1%3D1` +
      `&geometry=${longitude},${latitude}` +
      `&geometryType=esriGeometryPoint` +
      `&inSR=4326` +
      `&spatialRel=esriSpatialRelIntersects` +
      `&outFields=FLD_ZONE,ZONE_SUBTY` +
      `&returnGeometry=false` +
      `&f=json`;
    const res = await fetch(url, { cache: "no-store", signal });
    if (res.ok) {
      const json = (await res.json()) as {
        features?: { attributes?: { FLD_ZONE?: string; ZONE_SUBTY?: string } }[];
      };
      const feature = json.features?.[0];
      let floodValue: string;
      if (feature?.attributes?.FLD_ZONE) {
        const zone = feature.attributes.FLD_ZONE;
        const subtype = feature.attributes.ZONE_SUBTY;
        floodValue = subtype ? `${zone} (${subtype})` : zone;
      } else {
        floodValue = "Zone X / no mapped flood hazard";
      }
      facts.push({
        label: "FEMA Flood Zone",
        value: floodValue,
        sourceName: "FEMA National Flood Hazard Layer",
        sourceUrl: "https://hazards.fema.gov",
      });
    }
  } catch (err) {
    console.warn("[enrichAddress] FEMA NFHL API failed:", err);
  }

  return facts;
}
