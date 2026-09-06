"use client";

import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";

const LocationPickerMap = dynamic(() => import("./LocationPickerMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[220px] w-full rounded-lg bg-gray-100 animate-pulse flex items-center justify-center text-gray-400 text-sm">
      Loading map…
    </div>
  ),
});

interface LocationPickerProps {
  value: { lat: number; lng: number } | null;
  center: [number, number];
  onChange: (lat: number, lng: number) => void;
}

export default function LocationPicker({ value, center, onChange }: LocationPickerProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-bold text-gray-700 flex items-center gap-1.5">
          <MapPin size={12} /> Household Location
        </label>
        {value && (
          <span className="text-[10px] font-mono text-gray-400">
            {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
          </span>
        )}
      </div>
      <LocationPickerMap value={value} center={center} onChange={onChange} />
      <p className="text-[11px] text-gray-400 mt-1">
        {value ? "Drag the pin or click elsewhere to adjust." : "Click the map to drop a pin at the household's location."}
      </p>
    </div>
  );
}
