"use client";

import { useState } from "react";
import { 
  Filter, Layers, Map as MapIcon, 
  Droplets, Activity, Users, ChevronLeft, ChevronRight,
  Maximize2, Info, CheckCircle2
} from "lucide-react";
import MapWrapper from "../components/dashboard/MapWrapper";

// --- Configuration ---
type MapLayer = typeof MAP_LAYERS[number];

const MAP_LAYERS = [
  { id: "all", label: "Composite View", icon: Layers, description: "All data points merged", color: "text-gray-900" },
  { id: "wash", label: "WASH Infrastructure", icon: Droplets, description: "Boreholes & latrines", color: "text-blue-500" },
  { id: "health", label: "Epidemiology", icon: Activity, description: "Active disease vectors", color: "text-red-500" },
  { id: "vulnerable", label: "Vulnerability Index", icon: Users, description: "At-risk households", color: "text-purple-600" },
] as const;

export default function MapPage() {
  const [activeLayer, setActiveLayer] = useState<string>("all");
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    // ERGONOMICS: Use h-[calc] to ensure the map fills the view without scrolling the page
    <div className="relative flex h-[calc(100vh-1rem)] bg-gray-50 overflow-hidden rounded-xl border border-gray-200 shadow-2xl mx-4 mb-4">
      
      {/* 1. Intelligent Sidebar 
          - Collapsible to maximize map real estate
          - Semantic <aside> for accessibility
      */}
      <aside 
        className={`
          relative bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out z-20
          ${isSidebarCollapsed ? "w-0 opacity-0 md:w-16 md:opacity-100" : "w-80"}
        `}
        aria-label="Map Controls"
      >
        {/* Toggle Button (Ergonomics: Placed for easy thumb reach on overlay or click) */}
        <button
          onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-6 bg-white border border-gray-200 rounded-full p-1 shadow-sm text-gray-500 hover:text-blue-600 z-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Sidebar Content Container */}
        <div className={`flex flex-col h-full ${isSidebarCollapsed ? "hidden md:flex md:items-center md:pt-6" : ""}`}>
          
          {/* Header */}
          {!isSidebarCollapsed && (
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Filter size={18} className="text-brand-blue" />
                <span>Map Intelligence</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">Configure visible data layers.</p>
            </div>
          )}

          {/* Controls Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-8">
            
            {/* A. Layer Selection (Radio Group Pattern) */}
            <div role="radiogroup" aria-labelledby="layer-label">
              {!isSidebarCollapsed && (
                <label id="layer-label" className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">
                  Active Data Layer
                </label>
              )}
              
              <div className="space-y-2">
                {MAP_LAYERS.map((layer) => (
                  <LayerOption
                    key={layer.id}
                    layer={layer}
                    isActive={activeLayer === layer.id}
                    onClick={() => setActiveLayer(layer.id)}
                    collapsed={isSidebarCollapsed}
                  />
                ))}
              </div>
            </div>

            {/* B. Region Context (Hidden when collapsed) */}
            {!isSidebarCollapsed && (
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">
                  Geographic Filter
                </label>
                <div className="relative group">
                  <select className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm cursor-pointer hover:bg-white">
                    <option>Gulu District (Entire Region)</option>
                    <option>Omoro County</option>
                    <option>Aswa County</option>
                  </select>
                  {/* Custom Arrow for Styling */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <ChevronRight size={14} className="rotate-90" />
                  </div>
                </div>
              </div>
            )}

            {/* C. Dynamic Legend (Context-Aware) */}
            {!isSidebarCollapsed && (
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                <div className="flex items-center gap-2 mb-3 text-blue-800">
                  <Info size={14} />
                  <h4 className="text-xs font-bold uppercase tracking-wide">Key Legend</h4>
                </div>
                <LegendContent layerId={activeLayer} />
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {!isSidebarCollapsed && (
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
              <button className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 hover:text-gray-900 transition shadow-sm">
                <Maximize2 size={16} />
                Enter Fullscreen Mode
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* 2. Map Canvas (The Stage) */}
      <main className="flex-1 relative z-0 bg-gray-200/50">
        <MapWrapper />
        
        {/* Floating Data Card: The "Heads Up Display" */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-100 z-10 max-w-xs animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Live Feed</p>
          </div>
          <h1 className="text-lg font-bold text-gray-900 leading-tight">Gulu District</h1>
          <p className="text-sm text-gray-500 mt-1">
            Displaying <span className="font-semibold text-gray-900">82,450</span> households across 3 sub-counties.
          </p>
        </div>
      </main>

    </div>
  );
}

// --- Sub-Components for Clean Architecture ---
// 1. Layer Option: Handles the visual state of buttons
function LayerOption({ layer, isActive, onClick, collapsed }: { layer: MapLayer, isActive: boolean, onClick: () => void, collapsed: boolean }) {
  const Icon = layer.icon;
  
  if (collapsed) {
    return (
      <button 
        onClick={onClick}
        title={layer.label}
        className={`w-10 h-10 mx-auto rounded-lg flex items-center justify-center transition-all ${
          isActive ? "bg-blue-50 text-blue-600 shadow-sm" : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
        }`}
      >
        <Icon size={20} />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      role="radio"
      aria-checked={isActive}
      className={`
        group w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all border
        ${isActive 
          ? "bg-white border-blue-200 shadow-md ring-1 ring-blue-100" 
          : "bg-transparent border-transparent hover:bg-gray-100 text-gray-500"
        }
      `}
    >
      <div className={`mt-0.5 shrink-0 transition-colors ${isActive ? layer.color : "text-gray-400 group-hover:text-gray-600"}`}>
        <Icon size={18} />
      </div>
      <div>
        <div className={`text-sm font-semibold transition-colors ${isActive ? "text-gray-900" : "text-gray-600"}`}>
          {layer.label}
        </div>
        <div className="text-[10px] text-gray-400 mt-0.5 font-medium">
          {layer.description}
        </div>
      </div>
      {isActive && (
        <CheckCircle2 size={16} className="ml-auto text-blue-600 mt-0.5" />
      )}
    </button>
  );
}

// 2. Legend Content: dynamic based on selection to reduce cognitive load
function LegendContent({ layerId }: { layerId: string }) {
  // In a real app, this would switch based on layerId
  // For now, we show a clean static example that fits the "Wash" or "All" context
  return (
    <div className="space-y-2.5">
      <LegendItem color="bg-red-500" label="Critical Risk (Household)" />
      <LegendItem color="bg-orange-400" label="Moderate Risk" />
      <div className="h-px bg-blue-200/50 my-2" />
      <LegendItem color="border-2 border-blue-600 bg-white" label="Functional Water Point" isBox />
      <LegendItem color="border-2 border-red-500 border-dashed bg-white" label="Broken Infrastructure" isBox />
    </div>
  );
}

function LegendItem({ color, label, isBox }: { color: string, label: string, isBox?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={`w-3 h-3 rounded-full shadow-sm ${color} ${isBox ? 'rounded-sm' : ''}`} />
      <span className="text-xs text-gray-600 font-medium">{label}</span>
    </div>
  );
}