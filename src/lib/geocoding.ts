/**
 * geocoding.ts — SERVER-ONLY module
 *
 * Provides address geocoding via the Google Maps Geocoding API.
 * Import this only in server actions, route handlers, or other server-side
 * code (never in client components or pages that ship to the browser).
 *
 * Usage:
 *   import { geocodeAddress } from "@/lib/geocoding";
 *   const geo = await geocodeAddress("123 Main St, Clermont, FL 34711");
 *   if (geo.ok) { // use geo.latitude, geo.longitude, geo.city, etc. }
 *
 * Requires env var: GOOGLE_MAPS_GEOCODING_API_KEY
 */

export type GeocodeResult =
  | {
      ok: true;
      latitude: number;
      longitude: number;
      formattedAddress: string;
      city: string | null;
      county: string | null;
      state: string | null;
      postalCode: string | null;
    }
  | { ok: false; reason: string };

interface GoogleAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GoogleGeocodeResult {
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components: GoogleAddressComponent[];
}

interface GoogleGeocodeResponse {
  status: string;
  results: GoogleGeocodeResult[];
}

export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  const apiKey = process.env.GOOGLE_MAPS_GEOCODING_API_KEY;
  if (!apiKey) {
    return { ok: false, reason: "no_api_key" };
  }

  if (!address || !address.trim()) {
    return { ok: false, reason: "empty_address" };
  }

  let data: GoogleGeocodeResponse;
  try {
    const url =
      `https://maps.googleapis.com/maps/api/geocode/json` +
      `?address=${encodeURIComponent(address)}` +
      `&components=country:US` +
      `&key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(url, { cache: "no-store" });
    data = (await response.json()) as GoogleGeocodeResponse;
  } catch {
    return { ok: false, reason: "fetch_error" };
  }

  if (data.status !== "OK" || !data.results || data.results.length === 0) {
    return { ok: false, reason: data.status || "no_results" };
  }

  const result = data.results[0];
  const { lat, lng } = result.geometry.location;
  const components = result.address_components;

  function findComponent(type: string, nameKey: "long_name" | "short_name"): string | null {
    const comp = components.find((c) => c.types.includes(type));
    return comp ? comp[nameKey] : null;
  }

  const city = findComponent("locality", "long_name");
  // Google returns the full county name including "County" suffix — keep it as-is.
  const county = findComponent("administrative_area_level_2", "long_name");
  // Use short_name for state so we get the abbreviation, e.g. "FL".
  const state = findComponent("administrative_area_level_1", "short_name");
  const postalCode = findComponent("postal_code", "long_name");

  return {
    ok: true,
    latitude: lat,
    longitude: lng,
    formattedAddress: result.formatted_address,
    city,
    county,
    state,
    postalCode,
  };
}
