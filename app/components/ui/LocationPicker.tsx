"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { LocateFixed, Loader2, MapPin } from "lucide-react";

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
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const [flyToSignal, setFlyToSignal] = useState(0);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocateError("Geolocation isn't supported on this device/browser.");
      return;
    }
    setLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(pos.coords.latitude, pos.coords.longitude);
        setFlyToSignal((n) => n + 1);
        setLocating(false);
      },
      (err) => {
        setLocateError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied — enable it in your browser/device settings, or drop a pin manually."
            : "Couldn't get your current location. Drop a pin on the map instead."
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

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
      <LocationPickerMap value={value} center={center} onChange={onChange} flyToSignal={flyToSignal} />
      <div className="flex items-center justify-between mt-1.5 gap-3">
        <p className="text-[11px] text-gray-400">
          {value ? "Drag the pin or click elsewhere to adjust." : "Click the map to drop a pin, or use your current location."}
        </p>
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={locating}
          className="shrink-0 flex items-center gap-1.5 text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 disabled:opacity-60 px-2.5 py-1.5 rounded-lg border border-purple-200 transition-colors"
        >
          {locating ? <Loader2 size={12} className="animate-spin" /> : <LocateFixed size={12} />}
          {locating ? "Locating…" : "Use My Location"}
        </button>
      </div>
      {locateError && <p className="text-[11px] text-red-600 mt-1">{locateError}</p>}
    </div>
  );
}
