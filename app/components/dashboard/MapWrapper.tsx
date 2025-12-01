"use client";

import dynamic from "next/dynamic";

// Dynamically import the MapLogic component with SSR disabled
const MapLogic = dynamic(() => import("./MapLogic"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400 rounded-lg">
      <p>Loading Geospatial Data...</p>
    </div>
  )
});

export default function MapWrapper() {
  return <MapLogic />;
}