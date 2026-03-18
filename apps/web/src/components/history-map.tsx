"use client";

import { format } from "date-fns";
import { LoaderCircle, MapPinned } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { geocodeLocation, getMapStyleUrl, hasMapTilerKey } from "@/lib/maptiler";
import type { Entry } from "@/lib/entries";

type MarkerData = {
  location: string;
  hoursWorked: number;
  entriesCount: number;
  dates: string[];
  lng: number;
  lat: number;
};

type MapState = "idle" | "loading" | "ready" | "error";

type HistoryMapProps = {
  entries: Entry[];
};

export function HistoryMap({ entries }: HistoryMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("maplibre-gl").Map | null>(null);
  const markersRef = useRef<import("maplibre-gl").Marker[]>([]);
  const [mapState, setMapState] = useState<MapState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const monthLabel = useMemo(() => {
    const firstEntry = entries[0];

    if (!firstEntry) {
      return null;
    }

    return format(new Date(`${firstEntry.workDate}T00:00:00`), "MMMM yyyy");
  }, [entries]);

  const locations = useMemo(() => {
    const grouped = new Map<
      string,
      {
        location: string;
        hoursWorked: number;
        entriesCount: number;
        dates: string[];
      }
    >();

    for (const entry of entries) {
      const locationKey = entry.location.trim();
      const current = grouped.get(locationKey);

      if (current) {
        current.hoursWorked += entry.hoursWorked;
        current.entriesCount += 1;
        current.dates.push(entry.workDate);
        continue;
      }

      grouped.set(locationKey, {
        location: locationKey,
        hoursWorked: entry.hoursWorked,
        entriesCount: 1,
        dates: [entry.workDate],
      });
    }

    return Array.from(grouped.values());
  }, [entries]);

  const [markerData, setMarkerData] = useState<MarkerData[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function resolveLocations() {
      if (!locations.length) {
        setMarkerData([]);
        setMapState("idle");
        setErrorMessage(null);
        return;
      }

      if (!hasMapTilerKey()) {
        setMarkerData([]);
        setMapState("error");
        setErrorMessage("Configure NEXT_PUBLIC_MAPTILER_KEY para exibir o mapa real.");
        return;
      }

      setMapState("loading");
      setErrorMessage(null);

      try {
        const resolved = await Promise.all(
          locations.map(async (location) => {
            const coordinates = await geocodeLocation(location.location);

            if (!coordinates) {
              return null;
            }

            return {
              ...location,
              lng: coordinates.lng,
              lat: coordinates.lat,
            } satisfies MarkerData;
          }),
        );

        if (!isMounted) {
          return;
        }

        const nextMarkers = resolved.filter((marker): marker is MarkerData => marker !== null);
        setMarkerData(nextMarkers);
        setMapState(nextMarkers.length ? "ready" : "error");
        setErrorMessage(
          nextMarkers.length
            ? null
            : "Nao foi possivel localizar os enderecos salvos deste mes no mapa.",
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setMapState("error");
        setErrorMessage(error instanceof Error ? error.message : "Could not load the map.");
      }
    }

    void resolveLocations();

    return () => {
      isMounted = false;
    };
  }, [locations]);

  useEffect(() => {
    let isDisposed = false;

    async function renderMap() {
      if (mapState !== "ready" || !mapContainerRef.current || !markerData.length) {
        return;
      }

      const styleUrl = getMapStyleUrl();

      if (!styleUrl) {
        return;
      }

      const maplibre = await import("maplibre-gl");

      if (isDisposed || !mapContainerRef.current) {
        return;
      }

      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      if (!mapRef.current) {
        mapRef.current = new maplibre.Map({
          container: mapContainerRef.current,
          style: styleUrl,
          center: [markerData[0].lng, markerData[0].lat],
          zoom: 10,
        });

        mapRef.current.addControl(new maplibre.NavigationControl(), "top-right");
      }

      const bounds = new maplibre.LngLatBounds();

      for (const markerDataItem of markerData) {
        const popup = new maplibre.Popup({ offset: 20 }).setHTML(
          `<div style="min-width:180px">
            <strong>${markerDataItem.location}</strong>
            <div>${markerDataItem.hoursWorked.toFixed(1).replace(".0", "")}h total</div>
            <div>${markerDataItem.entriesCount} registro(s)</div>
          </div>`,
        );

        const markerElement = document.createElement("div");
        markerElement.className =
          "flex h-4 w-4 rounded-full border-2 border-white bg-stone-900 shadow-[0_8px_24px_rgba(20,20,20,0.22)]";

        const marker = new maplibre.Marker({ element: markerElement })
          .setLngLat([markerDataItem.lng, markerDataItem.lat])
          .setPopup(popup)
          .addTo(mapRef.current);

        markersRef.current.push(marker);
        bounds.extend([markerDataItem.lng, markerDataItem.lat]);
      }

      if (!bounds.isEmpty()) {
        mapRef.current.fitBounds(bounds, {
          padding: 48,
          maxZoom: markerData.length === 1 ? 13 : 11,
        });
      }
    }

    void renderMap();

    return () => {
      isDisposed = true;
    };
  }, [mapState, markerData]);

  useEffect(() => {
    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-stone-200/80 bg-white/92 shadow-[0_20px_44px_-34px_rgba(50,35,20,0.3)]">
      <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-stone-900">Work Map</p>
          <p className="text-xs text-stone-500">
            {monthLabel ? `Locais usados em ${monthLabel}` : "Locais do mes selecionado"}
          </p>
        </div>
        <div className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
          {locations.length} local{locations.length === 1 ? "" : "s"}
        </div>
      </div>

      {mapState === "loading" ? (
        <div className="flex h-64 items-center justify-center text-stone-500">
          <LoaderCircle className="size-5 animate-spin" />
        </div>
      ) : mapState === "ready" ? (
        <div ref={mapContainerRef} className="h-72 w-full bg-stone-100" />
      ) : (
        <div className="flex h-64 flex-col items-center justify-center gap-3 bg-[linear-gradient(135deg,#dfe5ec_0%,#ece6dc_55%,#dbe7db_100%)] px-6 text-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-white/90 shadow">
            <MapPinned className="size-5 text-stone-700" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-stone-900">Mapa indisponivel</p>
            <p className="text-sm text-stone-600">
              {errorMessage ?? "Salve locais validos neste mes para exibir o mapa real aqui."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
