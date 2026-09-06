"use client";

import dynamic from "next/dynamic";
import type { MapLayers } from "./MapCanvas";
import type { Household, Facility } from "../lib/types";

export type { MapLayers };

const MapCanvas = dynamic(() => import("./MapCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400">
      Loading map…
    </div>
  ),
});

export default function MapCanvasWrapper(props: {
  center: [number, number];
  zoom: number;
  households: Household[];
  facilities: Facility[];
  layers: MapLayers;
}) {
  return <MapCanvas {...props} />;
}
