"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type AddressMapPickerProps = {
  latitude: number;
  longitude: number;
  onPositionChange: (latitude: number, longitude: number) => void;
};

export function AddressMapPicker({
  latitude,
  longitude,
  onPositionChange,
}: AddressMapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const callbackRef = useRef(onPositionChange);

  useEffect(() => {
    callbackRef.current = onPositionChange;
  }, [onPositionChange]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [latitude, longitude],
      zoom: 18,
      zoomControl: true,
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    map.on("moveend", () => {
      const center = map.getCenter();
      callbackRef.current(center.lat, center.lng);
    });

    mapRef.current = map;
    window.setTimeout(() => map.invalidateSize(), 0);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border-strong">
      <div
        ref={containerRef}
        className="h-64 w-full"
        aria-label="Mapa para ajustar a localização do endereço"
      />
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-[500] -translate-x-1/2 -translate-y-full">
        <div className="h-8 w-8 rounded-full rounded-bl-none border-4 border-white bg-primary-500 shadow-md [transform:rotate(-45deg)]" />
        <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
      </div>
    </div>
  );
}
