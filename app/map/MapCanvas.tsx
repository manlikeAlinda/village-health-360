"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Household, Facility, RiskLevel } from "../lib/types";

export interface MapLayers {
  households: boolean;
  waterPoints: boolean;
  healthFacilities: boolean;
  schools: boolean;
  latrines: boolean;
}

const RISK_COLOR: Record<RiskLevel, string> = {
  Critical: "#DC2626",
  High: "#F97316",
  Medium: "#EAB308",
  Low: "#22C55E",
};

const WATER_TYPES = new Set(["borehole", "tap_stand", "protected_spring", "rain_tank"]);

interface MapCanvasProps {
  center: [number, number];
  zoom: number;
  households: Household[];
  facilities: Facility[];
  layers: MapLayers;
}

export default function MapCanvas({ center, zoom, households, facilities, layers }: MapCanvasProps) {
  const geolocatedHouseholds = households.filter((h) => h.lat != null && h.lng != null);

  return (
    <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} key={`${center[0]}-${center[1]}-${zoom}`}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {layers.households && geolocatedHouseholds.map((h) => (
        <CircleMarker
          key={h.id}
          center={[h.lat!, h.lng!]}
          radius={7}
          pathOptions={{ color: "white", weight: 2, fillColor: RISK_COLOR[h.riskLevel], fillOpacity: 1 }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-bold">{h.head}</p>
              <p className="text-xs text-gray-600">{h.village}, {h.parish}</p>
              <p className="text-xs mt-1">Risk: <span className="font-semibold">{h.riskLevel}</span></p>
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {facilities.map((f) => {
        const isWater = WATER_TYPES.has(f.type);
        const isHealth = f.type === "health_center";
        const isSchool = f.type === "school";
        const isLatrine = f.type === "latrine";
        const visible =
          (isWater && layers.waterPoints) ||
          (isHealth && layers.healthFacilities) ||
          (isSchool && layers.schools) ||
          (isLatrine && layers.latrines);
        if (!visible) return null;

        const color = isWater ? "#3B82F6" : isHealth ? "#F97316" : isSchool ? "#EAB308" : "#065F46";

        return (
          <CircleMarker
            key={f.id}
            center={[f.lat, f.lng]}
            radius={6}
            pathOptions={{
              color: f.status === "broken" ? "#DC2626" : color,
              weight: 3,
              fillColor: "white",
              fillOpacity: 1,
              dashArray: f.status === "broken" ? "4, 4" : undefined,
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-bold">{f.name}</p>
                <p className="text-xs text-gray-600 capitalize">{f.type.replace("_", " ")}</p>
                <p className={`text-xs mt-1 font-semibold ${f.status === "broken" ? "text-red-600" : "text-green-600"}`}>
                  {f.status.toUpperCase()}
                </p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
