const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY?.trim() ?? "";
const geocodingCache = new Map<string, { lng: number; lat: number } | null>();
const MAPTILER_LANGUAGES = "sv,en";
const MAPTILER_COUNTRY = "se";

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

function buildGeocodingUrl(query: string, extraParams?: Record<string, string>) {
  const params = new URLSearchParams({
    key: MAPTILER_KEY,
    language: MAPTILER_LANGUAGES,
    country: MAPTILER_COUNTRY,
    ...extraParams,
  });

  return `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?${params.toString()}`;
}

export async function geocodeLocation(location: string) {
  if (!hasMapTilerKey()) {
    return null;
  }

  const normalizedLocation = location.trim();

  if (geocodingCache.has(normalizedLocation)) {
    return geocodingCache.get(normalizedLocation) ?? null;
  }

  const response = await fetch(buildGeocodingUrl(normalizedLocation, { limit: "1" }), {
    cache: "force-cache",
  });

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

  const response = await fetch(
    buildGeocodingUrl(normalizedQuery, {
      autocomplete: "true",
      limit: "5",
    }),
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
