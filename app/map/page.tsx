"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  Filter, Layers, Map as MapIcon,
  Droplets, Activity, Users, ChevronLeft, ChevronRight,
  Maximize2, Info, CheckCircle2, Calendar, AlertTriangle,
  Play, Pause, Sliders, Menu, X, Heart, TrendingUp, DollarSign, Utensils, Wrench,
  LucideIcon, Search, ChevronDown, Globe, MapPin, School, Home,
  Download, Share2, Loader2
} from "lucide-react";
import Link from "next/link";
import DemoDataBadge from "../components/ui/DemoDataBadge";
import { getAllDistricts, getSubcounties, getDistrictCenter } from "../lib/adminData";
import { useHouseholdsStore } from "../store/householdsStore";
import { api } from "../lib/api";
import type { Facility } from "../lib/types";
import MapCanvasWrapper, { type MapLayers } from "./MapCanvasWrapper";

// --- Domain Configuration ---
const PRIMARY_COLOR = "text-[#004AAD]";
const PRIMARY_BG = "bg-[#004AAD]";
const SECONDARY_BG = "bg-[#7c3aed]";

const SAFE_WATER_KEYWORDS = ["borehole", "tap", "protected", "safe"];

// --- Components ---

// 2. Combobox Component (Left Panel)
const FilterSelect = ({ label, options, value, onChange, disabled, placeholder }: any) => {
  return (
    <div className="mb-3">
      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <select
          disabled={disabled}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#004AAD] focus:border-[#004AAD] block p-2.5 appearance-none ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white transition-colors'}`}
        >
          <option value="">{placeholder}</option>
          {options.map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
          <ChevronDown size={14} />
        </div>
      </div>
    </div>
  )
}

// 3. Checkbox Group Component (Left Panel) — decorative, not yet wired to the map (out of this pass's scope)
const CheckboxGroup = ({ title, options, colorClass = "text-[#004AAD]" }: any) => (
  <div className="mb-6">
    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">{title}</h3>
    <div className="space-y-2">
      {options.map((opt: any) => (
        <label key={opt.label} className="flex items-center space-x-2 cursor-pointer group">
          <input type="checkbox" defaultChecked={opt.checked} className={`w-4 h-4 rounded border-gray-300 ${colorClass} focus:ring-[#004AAD]`} />
          <span className="text-sm text-gray-600 group-hover:text-gray-900">{opt.label}</span>
        </label>
      ))}
    </div>
  </div>
)

// --- Main Component ---
export default function GeospatialHub() {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedSubcounty, setSelectedSubcounty] = useState<string | null>(null);

  const [mapLayers, setMapLayers] = useState<MapLayers>({
    households: true,
    waterPoints: true,
    healthFacilities: true,
    schools: false,
    latrines: false
  });

  const allDistricts = useMemo(() => getAllDistricts(), []);
  const subcounties = useMemo(() => getSubcounties(selectedDistrict), [selectedDistrict]);
  const mapCenter = useMemo(() => getDistrictCenter(selectedDistrict), [selectedDistrict]);
  const mapZoom = selectedDistrict ? 12 : 7;

  const { households, loading: householdsLoading, fetchAll } = useHouseholdsStore();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(true);

  useEffect(() => {
    fetchAll({ district: selectedDistrict || undefined, subcounty: selectedSubcounty || undefined });
  }, [selectedDistrict, selectedSubcounty, fetchAll]);

  useEffect(() => {
    setFacilitiesLoading(true);
    const params = selectedDistrict ? `?district=${encodeURIComponent(selectedDistrict)}` : "";
    api.get<{ data: Facility[] }>(`/api/facilities${params}`)
      .then(({ data }) => setFacilities(data))
      .finally(() => setFacilitiesLoading(false));
  }, [selectedDistrict]);

  // --- Real Quick Stats, derived from the fetched households/facilities ---
  const geolocatedHouseholds = households.filter((h) => h.lat != null && h.lng != null);
  const safeWaterCount = households.filter((h) => SAFE_WATER_KEYWORDS.some((kw) => h.waterSource.toLowerCase().includes(kw)) && !h.waterSource.toLowerCase().includes("unsafe")).length;
  const safeWaterPct = households.length > 0 ? Math.round((safeWaterCount / households.length) * 100) : null;

  const latrineFacilities = facilities.filter((f) => f.type === "latrine");
  const functionalLatrinePct = latrineFacilities.length > 0
    ? Math.round((latrineFacilities.filter((f) => f.status === "functional").length / latrineFacilities.length) * 100)
    : null;

  const criticalHouseholds = households.filter((h) => h.riskLevel === "Critical").slice(0, 3);

  const brokenFacilities = facilities.filter((f) => f.status === "broken");

  const loading = householdsLoading || facilitiesLoading;

  return (
    <div className="min-h-screen bg-[#F7F8F9] font-sans text-slate-800 p-4 md:p-8 mt-16 flex flex-col h-screen overflow-hidden">

      {/* 1. Executive Header */}
      <header className="flex flex-col gap-6 border-b border-gray-200 pb-6 shrink-0">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Geospatial Hub</h1>
            <p className="text-gray-500 font-medium mt-1">
              Live map for <strong className="text-gray-900">{selectedDistrict || "National"}</strong>
            </p>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 text-sm shadow-sm transition-all">
              <Download size={16} /> Export Map
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#004AAD] text-white font-bold rounded-lg hover:bg-blue-800 text-sm shadow-md transition-all">
              <Share2 size={16} /> Share View
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Map Layout */}
      <div className="flex flex-1 overflow-hidden border border-gray-200 rounded-xl shadow-sm bg-white mt-4">

        {/* 2.1 Left Panel: Data Filters */}
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col z-20 shadow-sm shrink-0 h-full overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-[#004AAD]" />
              <h2 className="font-bold text-gray-800 text-sm">Data Filters</h2>
            </div>
            <button className="text-gray-400 hover:text-gray-600"><ChevronLeft size={16} /></button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
            {/* Location Hierarchy */}
            <div className="mb-6 pb-6 border-b border-gray-100">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Location</h3>
              <FilterSelect
                label="District"
                placeholder="Select District"
                options={allDistricts}
                value={selectedDistrict}
                onChange={(val: string) => { setSelectedDistrict(val); setSelectedSubcounty(null); }}
              />
              <FilterSelect
                label="Subcounty"
                placeholder="Select Subcounty"
                options={subcounties}
                value={selectedSubcounty}
                onChange={setSelectedSubcounty}
                disabled={!selectedDistrict}
              />
              <FilterSelect label="Parish" placeholder="Not available yet" options={[]} disabled={true} />
              <FilterSelect label="Village" placeholder="Not available yet" options={[]} disabled={true} />
            </div>

            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Other Filters</h3>
              <DemoDataBadge label="Not wired yet" />
            </div>

            {/* Vulnerability Score */}
            <CheckboxGroup
              title="Vulnerability Score"
              options={[
                { label: "High Risk (Score 8-10)", checked: true },
                { label: "Moderate (Score 5-7)", checked: false },
                { label: "Low (Score 0-4)", checked: false }
              ]}
              colorClass="text-purple-600"
            />

            {/* Disease Risks */}
            <CheckboxGroup
              title="Disease Risks"
              options={[
                { label: "Malaria Hotspots", checked: true },
                { label: "Diarrhea", checked: false },
                { label: "Respiratory Infections", checked: false }
              ]}
            />

            {/* Household Status */}
            <CheckboxGroup
              title="Household Status"
              options={[
                { label: "Poor WASH Status", checked: false },
                { label: "Pregnant Member", checked: false },
                { label: "Low Income (<$1/day)", checked: false }
              ]}
            />
          </div>
        </aside>

        {/* 2.2 Center Panel: Operational Map */}
        <main className="flex-1 relative bg-slate-200 flex flex-col min-w-0">
          {/* Floating Layer Control (Top Right) */}
          <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur rounded-xl border border-gray-200 shadow-lg p-3 w-48">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Map Layers</h4>
            <div className="space-y-1.5">
              {[
                { key: 'households', label: 'Households', color: 'bg-purple-500' },
                { key: 'waterPoints', label: 'Water Points', color: 'bg-blue-500' },
                { key: 'healthFacilities', label: 'Health Facilities', color: 'bg-orange-500' },
                { key: 'schools', label: 'Schools', color: 'bg-yellow-500' },
                { key: 'latrines', label: 'Latrines', color: 'bg-emerald-800' },
              ].map((layer) => (
                <label key={layer.key} className="flex items-center justify-between cursor-pointer group p-1 hover:bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={mapLayers[layer.key as keyof MapLayers]}
                      onChange={() => setMapLayers(prev => ({ ...prev, [layer.key]: !prev[layer.key as keyof MapLayers] }))}
                      className="rounded border-gray-300 text-[#004AAD] focus:ring-[#004AAD] w-3.5 h-3.5"
                    />
                    <span className="text-xs font-medium text-gray-700">{layer.label}</span>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${layer.color}`} />
                </label>
              ))}
            </div>
          </div>

          {/* Map Canvas */}
          <div className="w-full h-full relative">
            <MapCanvasWrapper
              center={mapCenter}
              zoom={mapZoom}
              households={households}
              facilities={facilities}
              layers={mapLayers}
            />
            {loading && (
              <div className="absolute top-4 left-4 z-[500] bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2 text-xs text-gray-600">
                <Loader2 size={14} className="animate-spin" /> Loading data…
              </div>
            )}
            {!loading && geolocatedHouseholds.length === 0 && households.length === 0 && facilities.length === 0 && (
              <div className="absolute inset-x-0 top-4 z-[500] flex justify-center pointer-events-none">
                <div className="bg-white/95 backdrop-blur px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-xs text-gray-500">
                  {selectedDistrict ? `No mapped data for ${selectedDistrict} yet.` : "Select a district to see mapped data, or register households with a location."}
                </div>
              </div>
            )}
          </div>

          {/* Legend (Bottom Left) */}
          <div className="absolute bottom-6 left-6 z-[500] bg-white/95 backdrop-blur p-4 rounded-xl border border-gray-200 shadow-lg w-44">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">Legend</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#DC2626" }}></div>
                <span className="text-xs text-gray-600">Household (Critical)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#22C55E" }}></div>
                <span className="text-xs text-gray-600">Household (Low Risk)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                <span className="text-xs text-gray-600">Water Point</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                <span className="text-xs text-gray-600">Health Facility</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                <span className="text-xs text-gray-600">School</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#065F46" }}></div>
                <span className="text-xs text-gray-600">Latrine</span>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                <div className="w-2.5 h-0 border-t-2 border-dashed border-red-600"></div>
                <span className="text-xs text-gray-600">Broken/Dashed = needs repair</span>
              </div>
            </div>
          </div>
        </main>

        {/* 2.3 Right Panel: Quick Stats */}
        <aside className="w-[300px] bg-white border-l border-gray-200 flex flex-col z-20 shadow-sm shrink-0 overflow-y-auto custom-scrollbar">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between gap-2">
            <h2 className="font-bold text-gray-800 text-sm">Quick Stats {selectedDistrict ? `— ${selectedDistrict}` : "(National)"}</h2>
          </div>

          <div className="p-5 space-y-6">
            {/* Households Mapped */}
            <div>
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Households Mapped</h3>
              <div className="text-3xl font-extrabold text-gray-900 tracking-tight">{geolocatedHouseholds.length.toLocaleString()}</div>
              <p className="text-[11px] text-gray-400 mt-1">of {households.length.toLocaleString()} registered in scope</p>
            </div>

            {/* WASH Coverage */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">WASH Coverage</h3>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium text-gray-700">
                  <span>Access to Clean Water</span>
                  <span>{safeWaterPct != null ? `${safeWaterPct}%` : "—"}</span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${safeWaterPct ?? 0}%` }}></div>
                </div>
                {safeWaterPct == null && <p className="text-[10px] text-gray-400 mt-1">No households in scope yet</p>}
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium text-gray-700">
                  <span>Functional Latrines</span>
                  <span>{functionalLatrinePct != null ? `${functionalLatrinePct}%` : "—"}</span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${functionalLatrinePct ?? 0}%` }}></div>
                </div>
                {functionalLatrinePct == null && <p className="text-[10px] text-gray-400 mt-1">No latrine facilities in scope yet</p>}
              </div>
            </div>

            {/* Critical Households (real) */}
            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
              <h3 className="text-[10px] font-bold text-red-800 uppercase tracking-widest mb-3 flex items-center gap-1">
                Critical Priority Households
              </h3>
              {criticalHouseholds.length > 0 ? (
                <div className="space-y-3">
                  {criticalHouseholds.map((h) => (
                    <Link key={h.id} href={`/households/${h.id}`} className="flex gap-2 group">
                      <AlertTriangle size={14} className="text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-red-900 group-hover:underline">{h.head}</div>
                        <div className="text-[11px] text-red-700 leading-tight">{h.village}, {h.parish}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-red-700/70">No critical-priority households in scope.</p>
              )}
            </div>

            {/* Broken infrastructure (real) */}
            <div className="pt-2">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Facilities Needing Repair</h3>
              {brokenFacilities.length > 0 ? (
                <div className="space-y-2">
                  {brokenFacilities.slice(0, 4).map((f) => (
                    <div key={f.id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <div className="p-1 bg-red-100 rounded text-red-600"><Wrench size={12} /></div>
                        <span className="text-xs">{f.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No broken facilities in scope.</p>
              )}
            </div>

          </div>
        </aside>

      </div>
    </div>
  );
}
