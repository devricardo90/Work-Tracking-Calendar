const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY?.trim() ?? "";
const geocodingCache = new Map<string, { lng: number; lat: number } | null>();

type MapTilerFeature = {
  center?: [number, number];
  place_name?: string;
};

type MapTilerGeocodingResponse = {
  features?: MapTilerFeature[];
};

export function hasMapTilerKey() {
  return MAPTILER_KEY.length > 0;
}

export function getMapStyleUrl() {
  if (!hasMapTilerKey()) {
    return null;
  }

  return `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`;
}

export async function geocodeLocation(location: string) {
  if (!hasMapTilerKey()) {
    return null;
  }

  const normalizedLocation = location.trim();

  if (geocodingCache.has(normalizedLocation)) {
    return geocodingCache.get(normalizedLocation) ?? null;
  }

  const encodedLocation = encodeURIComponent(location);
  const response = await fetch(
    `https://api.maptiler.com/geocoding/${encodedLocation}.json?limit=1&key=${MAPTILER_KEY}`,
    { cache: "force-cache" },
  );

  if (!response.ok) {
    throw new Error("Could not translate the saved location into map coordinates.");
  }

  const payload = (await response.json()) as MapTilerGeocodingResponse;
  const coordinates = payload.features?.[0]?.center;

  if (!coordinates) {
    geocodingCache.set(normalizedLocation, null);
    return null;
  }

  const resolvedCoordinates = {
    lng: coordinates[0],
    lat: coordinates[1],
  };

  geocodingCache.set(normalizedLocation, resolvedCoordinates);
  return resolvedCoordinates;
}

export async function searchLocationSuggestions(query: string) {
  if (!hasMapTilerKey()) {
    return [];
  }

  const normalizedQuery = query.trim();

  if (normalizedQuery.length < 3) {
    return [];
  }

  const encodedQuery = encodeURIComponent(normalizedQuery);
  const response = await fetch(
    `https://api.maptiler.com/geocoding/${encodedQuery}.json?autocomplete=true&limit=5&key=${MAPTILER_KEY}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error("Could not load location suggestions.");
  }

  const payload = (await response.json()) as MapTilerGeocodingResponse;

  return Array.from(
    new Set(
      (payload.features ?? [])
        .map((feature) => feature.place_name?.trim())
        .filter((placeName): placeName is string => Boolean(placeName)),
    ),
  );
}

export function getExternalMapUrl(location: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.trim())}`;
}
