export type GoogleGeocodeResult = {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  placeId: string;
};

/**
 * Server-side Google Geocoding API helper.
 * Use this when creating/importing real listings so each address stores exact lat/lng once.
 * Do not call this from the browser. Keep GOOGLE_MAPS_GEOCODING_API_KEY private.
 */
export async function geocodeAddress(address: string): Promise<GoogleGeocodeResult | null> {
  const apiKey = process.env.GOOGLE_MAPS_GEOCODING_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GOOGLE_MAPS_GEOCODING_API_KEY");
  }

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", address);
  url.searchParams.set("key", apiKey);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Google Geocoding API failed: ${response.status}`);
  }

  const payload = await response.json() as {
    status: string;
    results?: Array<{
      formatted_address: string;
      place_id: string;
      geometry: { location: { lat: number; lng: number } };
    }>;
  };

  if (payload.status !== "OK" || !payload.results?.[0]) {
    return null;
  }

  const result = payload.results[0];

  return {
    latitude: result.geometry.location.lat,
    longitude: result.geometry.location.lng,
    formattedAddress: result.formatted_address,
    placeId: result.place_id,
  };
}
