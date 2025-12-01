"use client";

import { useState } from "react";
import { 
  Filter, Layers, Map as MapIcon, 
  Droplets, Activity, Users, AlertTriangle 
} from "lucide-react";
import MapWrapper from "../components/dashboard/MapWrapper";

export default function MapPage() {
  const [activeLayer, setActiveLayer] = useState("all");

  return (
    <div className="flex h-[calc(100vh-2rem)] gap-6 flex-col lg:flex-row">
      
      {/* 1. Control Panel (Sidebar) */}
      <div className="w-full lg:w-80 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden shrink-0">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Filter size={18} />
            Map Filters
          </h2>
        </div>
        
        <div className="p-4 space-y-6 overflow-y-auto flex-1">
          {/* Layer Selection */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">
              Data Layers
            </label>
            <div className="space-y-2">
              <LayerButton 
                label="All Data Points" 
                icon={Layers} 
                id="all" 
                active={activeLayer} 
                set={setActiveLayer} 
              />
              <LayerButton 
                label="Water Access (WASH)" 
                icon={Droplets} 
                id="wash" 
                active={activeLayer} 
                set={setActiveLayer} 
                color="text-brand-wash"
              />
              <LayerButton 
                label="Disease Outbreaks" 
                icon={Activity} 
                id="health" 
                active={activeLayer} 
                set={setActiveLayer} 
                color="text-red-600"
              />
              <LayerButton 
                label="Vulnerable Households" 
                icon={Users} 
                id="vulnerable" 
                active={activeLayer} 
                set={setActiveLayer} 
                color="text-brand-live"
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">
              Region Select
            </label>
            <select className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20">
              <option>Gulu District (All)</option>
              <option>Omoro County</option>
              <option>Aswa County</option>
            </select>
          </div>

          {/* Legend */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <h4 className="text-xs font-bold text-gray-700 mb-2">Legend</h4>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span> High Risk Household
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-500"></span> Medium Risk
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border-2 border-blue-600"></span> Functional Water Point
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border-2 border-red-500 border-dashed"></span> Broken Water Point
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <button className="w-full bg-brand-blue text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm">
            Export Map Data (GIS)
          </button>
        </div>
      </div>

      {/* 2. Main Map View */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm p-1 relative z-0">
        <div className="w-full h-full rounded-lg overflow-hidden relative">
          <MapWrapper />
          
          {/* Floating Overlay Stats */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-3 rounded-lg shadow-md border border-gray-200 z-[400] text-sm">
            <p className="font-bold text-gray-900">Gulu District</p>
            <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
              <MapIcon size={12} /> 82,450 Households Mapped
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

// --- Helper Component ---

interface LayerButtonProps {
  label: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
  id: string;
  active: string;
  set: (id: string) => void;
  color?: string;
}

function LayerButton({ label, icon: Icon, id, active, set, color }: LayerButtonProps) {
  const isActive = active === id;
  return (
    <button
      onClick={() => set(id)}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
        isActive 
          ? "bg-gray-100 text-gray-900 font-medium" 
          : "text-gray-600 hover:bg-gray-50"
      }`}
    >
      <Icon size={16} className={isActive ? color || "text-gray-900" : "text-gray-400"} />
      {label}
      {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-blue"></div>}
    </button>
  );
}