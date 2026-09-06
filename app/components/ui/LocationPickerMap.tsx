"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Inline SVG pin instead of Leaflet's default marker images, which need extra
// bundler config to resolve correctly (a well-known react-leaflet gotcha).
const pinIcon = L.divIcon({
  html: `<svg width="28" height="28" viewBox="0 0 24 24" fill="#7C3AED" stroke="white" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C7.58 2 4 5.58 4 10c0 5.25 7 12 8 12s8-6.75 8-12c0-4.42-3.58-8-8-8z"/>
    <circle cx="12" cy="10" r="3" fill="white"/>
  </svg>`,
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

interface LocationPickerMapProps {
  value: { lat: number; lng: number } | null;
  center: [number, number];
  onChange: (lat: number, lng: number) => void;
}

function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPickerMap({ value, center, onChange }: LocationPickerMapProps) {
  return (
    <MapContainer
      center={value ? [value.lat, value.lng] : center}
      zoom={value ? 15 : 12}
      style={{ height: "220px", width: "100%", borderRadius: "0.5rem" }}
      key={`${center[0]}-${center[1]}`}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onChange={onChange} />
      {value && (
        <Marker
          position={[value.lat, value.lng]}
          icon={pinIcon}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const marker = e.target;
              const pos = marker.getLatLng();
              onChange(pos.lat, pos.lng);
            },
          }}
        />
      )}
    </MapContainer>
  );
}
