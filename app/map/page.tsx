"use client";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import {
  Filter, Layers, Map as MapIcon,
  Droplets, Activity, Users, ChevronLeft, ChevronRight,
  Maximize2, Info, CheckCircle2, Calendar, AlertTriangle,
  Play, Pause, Sliders, Menu, X
} from "lucide-react";
import MapWrapper from "../components/dashboard/MapWrapper";
// --- Domain Configuration ---
// Structured to demonstrate data taxonomy to investors
const MAP_LAYERS = [
  {
    id: "composite",
    label: "Composite Risk Model",
    icon: Layers,
    description: "Multi-variate risk stratification (WASH + Health + Poverty)",
    color: "text-gray-900",
    freshness: "Real-time"
  },
  {
    id: "wash",
    label: "WASH Infrastructure",
    icon: Droplets,
    description: "Functional status of boreholes & latrines",
    color: "text-blue-500",
    freshness: "Last 24h"
  },
  {
    id: "health",
    label: "Epidemiological Surveillance",
    icon: Activity,
    description: "Active disease vectors & immunization gaps",
    color: "text-red-500",
    freshness: "Live Stream"
  },
  {
    id: "vulnerable",
    label: "Vulnerability Index",
    icon: Users,
    description: "Household economic resilience scoring",
    color: "text-purple-600",
    freshness: "Weekly Sync"
  },
] as const;
export default function GeospatialHub() {
  const [activeLayer, setActiveLayer] = useState<string>("composite");
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    const media = window.matchMedia('(max-width: 768px)');
    return !media.matches;
  });
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const listener = (e: MediaQueryListEvent) => setIsSidebarOpen(!e.matches);
    
    media.addListener(listener);
    return () => media.removeListener(listener);
  }, []);

  useEffect(() => {
    if (!isSidebarOpen) return;
    interface ClickEvent extends MouseEvent {
      target: EventTarget | null;
    }

    const handleClickOutside = (event: ClickEvent): void => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        if (window.innerWidth <= 768) {
          setIsSidebarOpen(false);
        }
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isSidebarOpen]);

  const [isPlaying, setIsPlaying] = useState(false);
  return (
    <div className="relative flex h-screen md:h-[calc(100vh-1rem)] bg-gray-50 overflow-hidden rounded-none md:rounded-xl border-none md:border md:border-gray-200 shadow-none md:shadow-2xl mx-0 md:mx-4 mb-0 md:mb-4 font-sans">
     
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-4 right-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg md:hidden hover:bg-blue-700 transition-all active:scale-95"
        aria-label="Open navigation menu"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 1. Control Plane (Sidebar)
          Designed as a 'Mission Control' panel rather than simple navigation.
      */}
      <aside
        ref={sidebarRef}
        className={`
          fixed inset-y-0 left-0 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] z-50 overflow-hidden
          md:relative md:z-30 md:translate-x-0 md:flex md:opacity-100
          ${isSidebarOpen ? 'translate-x-0 w-80' : '-translate-x-full w-0 md:w-16'}
          md:w-72
        `}
        aria-label="Geospatial Controls"
      >
        {/* Close button for Mobile */}
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 md:hidden"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>

        {/* Ergonomic Toggle for desktop */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-6 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm text-gray-500 hover:text-blue-600 z-50 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:scale-105 transition-transform hidden md:block"
          aria-label={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
        <div className={`flex flex-col h-full ${!isSidebarOpen ? "hidden md:flex md:items-center md:pt-6" : ""}`}>
         
          {/* Header: System Identity */}
          {isSidebarOpen && (
            <div className="p-4 md:p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-bold text-gray-900 flex items-center gap-2 text-lg tracking-tight">
                <MapIcon size={20} className="text-blue-600" />
                <span>Geospatial Intelligence</span>
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <p className="text-xs text-gray-500 font-medium font-mono">SYSTEM ONLINE | GULU NODE</p>
              </div>
            </div>
          )}
          {/* Scrollable Controls */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-6 md:space-y-8">
           
            {/* A. Data Layer Selector */}
            <section role="radiogroup" aria-labelledby="layer-label">
              {isSidebarOpen && (
                <div className="flex justify-between items-center mb-4">
                   <label id="layer-label" className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    Data Layer Configuration
                  </label>
                  <Sliders size={14} className="text-gray-400 cursor-pointer hover:text-gray-600" />
                </div>
              )}
             
              <div className="space-y-3">
                {MAP_LAYERS.map((layer) => (
                  <LayerOption
                    key={layer.id}
                    layer={layer}
                    isActive={activeLayer === layer.id}
                    onClick={() => setActiveLayer(layer.id)}
                    collapsed={!isSidebarOpen}
                  />
                ))}
              </div>
            </section>
            {/* B. Domain Context Injection
                CRITICAL FOR INVESTORS: This demonstrates that the software is mapped
                to real-world institutional frameworks, reducing adoption risk.
            */}
            {isSidebarOpen && activeLayer === 'health' && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="flex items-center gap-2 mb-3">
                  <Info size={14} className="text-blue-600" />
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    System Alignment
                  </label>
                </div>
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-gray-600">
                  <p className="mb-2">
                    Surveillance data maps directly to the national referral hierarchy, ensuring VHT alerts reach the correct administrative level.
                  </p>
                  {/* VISUAL PROOF OF DOMAIN EXPERTISE */}
                  <div className="rounded-lg overflow-hidden border border-blue-200 mt-2 opacity-90 hover:opacity-100 transition-opacity">
                    <img 
                      src="https://www.researchgate.net/publication/279181159/figure/fig1/AS:669282157490176@1536580709027/The-Uganda-Health-System-Structure-and-Levels-of-Government.png" 
                      alt="Uganda health system structure" 
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </div>
              </div>
            )}
             {isSidebarOpen && activeLayer === 'vulnerable' && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                 <div className="flex items-center gap-2 mb-3">
                  <Info size={14} className="text-purple-600" />
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    Methodology
                  </label>
                </div>
                <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 text-xs text-gray-600">
                  <p className="mb-2">
                    Risk scoring utilizes the standardized Household Vulnerability Assessment Tool (HVAT) to ensure donor compliance.
                  </p>
                  {/* VISUAL PROOF OF RIGOR */}
                   <div className="rounded-lg overflow-hidden border border-purple-200 mt-2 opacity-90 hover:opacity-100 transition-opacity">
                    <img 
                      src="https://www.ashe.org/sites/default/files/2022-05/Hazard%20Vulnerability%20Assessment%20Tool%20Thumb_1.png" 
                      alt="Household Vulnerability Assessment Tool" 
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </div>
              </div>
            )}
            {/* C. Operational Context (Legend) */}
            {isSidebarOpen && (
              <div className="bg-gray-50 p-4 md:p-5 rounded-xl border border-gray-200">
                <h4 className="text-xs font-bold text-gray-900 mb-4 uppercase tracking-wide">
                  Active Symbology
                </h4>
                <LegendContent layerId={activeLayer} />
              </div>
            )}
          </div>
        </div>
      </aside>
      {/* 2. Visualization Canvas */}
      <main className="flex-1 relative z-0 bg-slate-100">
        <MapWrapper />
       
        {/* A. Heads-Up Display (HUD): High-Level Metrics */}
        <div className="absolute top-4 md:top-6 right-4 md:right-6 flex flex-col items-end gap-3 z-10 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-md p-3 md:p-4 rounded-xl shadow-lg border border-gray-200 max-w-xs pointer-events-auto w-full md:max-w-xs">
            <h1 className="text-base md:text-lg font-bold text-gray-900 leading-tight">Gulu District</h1>
            <div className="flex items-center gap-2 mt-1 mb-2 md:mb-3">
              <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                UG-112
              </span>
              <span className="text-xs text-gray-500">
                82,450 Households Mapped
              </span>
            </div>
            <div className="flex gap-2 flex-col md:flex-row">
              <button className="flex-1 bg-gray-900 text-white text-xs font-bold py-2 rounded-lg hover:bg-gray-800 transition shadow-sm">
                Generate Report
              </button>
              <button className="flex-1 bg-white border border-gray-200 text-gray-700 text-xs font-bold py-2 rounded-lg hover:bg-gray-50 transition shadow-sm">
                Filter Region
              </button>
            </div>
          </div>
        </div>
        {/* B. Temporal Control Bar (Time Series Analysis)
            Demonstrates to investors that we handle historical data and forecasting.
        */}
        <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xl md:max-w-2xl px-2 md:px-4 z-10 pointer-events-auto">
          <div className="bg-white/90 backdrop-blur-md border border-gray-200 p-2 rounded-2xl shadow-xl flex items-center gap-4">
             <button
               onClick={() => setIsPlaying(!isPlaying)}
               className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition shadow-md shrink-0"
             >
               {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
             </button>
             
             <div className="flex-1">
               <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                 <span>Jan 2024</span>
                 <span className="text-blue-600">Current View: Oct 2024</span>
                 <span>Dec 2024</span>
               </div>
               <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
                 <div className="absolute top-0 left-0 h-full w-3/4 bg-blue-600 rounded-full"></div>
               </div>
             </div>
             <div className="px-2 md:px-3 py-1 bg-gray-100 rounded-lg border border-gray-200 shrink-0">
               <span className="text-xs font-mono font-medium text-gray-600">Q4</span>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
// --- Component Architecture ---
type MapLayer = typeof MAP_LAYERS[number];
function LayerOption({ layer, isActive, onClick, collapsed }: { layer: MapLayer, isActive: boolean, onClick: () => void, collapsed: boolean }) {
  const Icon = layer.icon;
 
  // Collapsed View: Icon Only (Tooltips implied)
  if (collapsed) {
    return (
      <button
        onClick={onClick}
        className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center transition-all duration-200 ${
          isActive ? "bg-blue-600 text-white shadow-md scale-110" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        }`}
      >
        <Icon size={20} />
      </button>
    );
  }
  // Expanded View: Rich Information Card
  return (
    <button
      onClick={onClick}
      role="radio"
      aria-checked={isActive}
      className={`
        group w-full flex items-start gap-3.5 p-3.5 rounded-xl text-left transition-all duration-200 border
        ${isActive
          ? "bg-white border-blue-600/30 shadow-md ring-1 ring-blue-500/20"
          : "bg-transparent border-transparent hover:bg-gray-50 text-gray-500 hover:border-gray-200"
        }
      `}
    >
      <div className={`
        p-2 rounded-lg shrink-0 transition-colors duration-200
        ${isActive ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-400 group-hover:text-gray-600"}
      `}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold transition-colors ${isActive ? "text-gray-900" : "text-gray-600"}`}>
            {layer.label}
          </span>
          {isActive && <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>}
        </div>
        <p className="text-xs text-gray-400 mt-0.5 font-medium truncate pr-2">
          {layer.description}
        </p>
        <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
          <Calendar size={10} /> Sync: {layer.freshness}
        </div>
      </div>
      {isActive && (
        <CheckCircle2 size={18} className="ml-auto text-blue-600 self-center" />
      )}
    </button>
  );
}
function LegendContent({ layerId }: { layerId: string }) {
  // Strategic Switch: Demonstrates depth of data model to investors
  switch (layerId) {
    case 'wash':
      return (
        <div className="space-y-3">
          <LegendItem color="bg-blue-500" label="Functional Borehole" count={1240} />
          <LegendItem color="bg-orange-400" label="Requires Maintenance" count={85} />
          <LegendItem color="bg-red-500" label="Critical Failure (<3 Days)" count={12} />
        </div>
      );
    case 'health':
      return (
        <div className="space-y-3">
          <LegendItem color="bg-red-100 border-red-500 border" label="Outbreak Zone (Cholera)" count={3} />
          <LegendItem color="bg-purple-100 border-purple-500 border" label="High Maternal Risk" count={142} />
          <LegendItem color="bg-green-500" label="VHT Active Coverage" count={89} />
        </div>
      );
    default:
      return (
        <div className="space-y-3">
          <LegendItem color="bg-gray-900" label="Household Cluster" />
          <LegendItem color="bg-red-500" label="Priority Alert" />
          <div className="h-px bg-gray-200 my-2" />
          <p className="text-[10px] text-gray-400 italic">
            *Composite view aggregates signals from Health, WASH, and Economic modules.
          </p>
        </div>
      );
  }
}
function LegendItem({ color, label, count }: { color: string, label: string, count?: number }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className={`w-3 h-3 rounded-full shadow-sm ${color}`} />
        <span className="text-xs text-gray-600 font-medium">{label}</span>
      </div>
      {count !== undefined && (
        <span className="text-[10px] font-mono font-bold text-gray-400 bg-gray-100 px-1.5 rounded">
          {count}
        </span>
      )}
    </div>
  );
}