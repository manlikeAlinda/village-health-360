"use client";

import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// 1. Mock Data: Simulating households in Gulu District [cite: 485-486]
const households = [
  { id: 1, lat: 2.772, lng: 32.288, risk: "high", name: "Okelo Family", issue: "Malaria Risk" },
  { id: 2, lat: 2.775, lng: 32.291, risk: "low", name: "Akello Family", issue: "Stable" },
  { id: 3, lat: 2.771, lng: 32.295, risk: "medium", name: "Mugisha Family", issue: "Unsafe Water" },
  { id: 4, lat: 2.768, lng: 32.284, risk: "high", name: "Opio Family", issue: "Pregnancy/Anemia" },
  { id: 5, lat: 2.779, lng: 32.282, risk: "low", name: "Laker Family", issue: "Stable" },
];

// Water Points (Boreholes) [cite: 13-17]
const waterPoints = [
  { id: 101, lat: 2.774, lng: 32.289, status: "functional", type: "Borehole" },
  { id: 102, lat: 2.769, lng: 32.293, status: "broken", type: "Protected Spring" },
];

export default function MapLogic() {
  // Color coding based on risk [cite: 485]
  const getColor = (risk: string) => {
    switch (risk) {
      case "high": return "#EF4444"; // Red (Brand Alert)
      case "medium": return "#F97316"; // Orange (Brand WASH)
      case "low": return "#22C55E"; // Green (Brand Agri)
      default: return "#9CA3AF";
    }
  };

  return (
    <MapContainer 
      center={[2.772, 32.288]} // Coordinates for Gulu, Uganda
      zoom={15} 
      style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
    >
      {/* Light Mode Map Tiles (OpenStreetMap) */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Render Households as Colored Dots */}
      {households.map((h) => (
        <CircleMarker
          key={h.id}
          center={[h.lat, h.lng]}
          radius={8}
          pathOptions={{ 
            color: "white", 
            weight: 2, 
            fillColor: getColor(h.risk), 
            fillOpacity: 1 
          }}
        >
          <Popup>
            <div className="p-1">
              <h3 className="font-bold text-sm">{h.name}</h3>
              <p className="text-xs text-gray-600">Status: <span className="font-medium">{h.issue}</span></p>
              <button className="mt-2 text-xs bg-brand-blue text-white px-2 py-1 rounded w-full">
                View Profile
              </button>
            </div>
          </Popup>
          <Tooltip direction="top" offset={[0, -10]} opacity={1}>
            {h.name} ({h.risk.toUpperCase()})
          </Tooltip>
        </CircleMarker>
      ))}

      {/* Render Water Points as Blue Circles with Rings */}
      {waterPoints.map((w) => (
        <CircleMarker
          key={w.id}
          center={[w.lat, w.lng]}
          radius={6}
          pathOptions={{ 
            color: w.status === "broken" ? "red" : "#004AAD", // Blue or Red based on status
            weight: 3, 
            fillColor: "white", 
            fillOpacity: 1,
            dashArray: w.status === "broken" ? "4, 4" : undefined // Dashed line if broken
          }}
        >
          <Popup>
            <div className="text-xs font-bold">{w.type}</div>
            <div className={w.status === "broken" ? "text-red-500 text-xs" : "text-green-600 text-xs"}>
              {w.status.toUpperCase()}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}