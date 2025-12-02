"use client";

import { useState, useMemo } from "react";
import { 
  Users, MapPin, Search, Phone, 
  Mail, X, ArrowDownUp, Filter, Info,
  ChevronRight, Briefcase
} from "lucide-react";

import UgandaMap from "./UgandaMap";
import personnelDataRaw from "./personnel_data.json";

// --- Data Contracts ---
interface PersonnelEntry {
  name: string;
  phone: string;
  email: string;
  role: string;
  level: string;
  district: string;
  subcounty: string;
  region: string;
  constituency?: string;
}

// Data Casting & Validation
const personnelData = personnelDataRaw as unknown as PersonnelEntry[];

export default function ContingentPage() {
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Handle interactions
  const handleMapClick = (districtTitle: string) => {
    if (selectedDistrict === districtTitle && isDrawerOpen) {
      // If clicking the same district, toggle drawer
      setIsDrawerOpen(!isDrawerOpen);
    } else {
      setSelectedDistrict(districtTitle);
      setIsDrawerOpen(true);
    }
  };

  const closeDrawer = () => setIsDrawerOpen(false);

  // Memoized Data Filtering
  const staffData = useMemo(() => {
    if (!selectedDistrict) return [];
    
    if (!Array.isArray(personnelData)) {
      console.error("Data Integrity Error: Source is not an array.");
      return [];
    }

    return personnelData.filter(p => 
      p.district && p.district.toLowerCase() === selectedDistrict.toLowerCase()
    );
  }, [selectedDistrict]);

  return (
    <main className="space-y-6 h-full flex flex-col max-w-[1600px] mx-auto w-full p-6">
      
      {/* 1. Header: Operational Control */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 uppercase tracking-wide">
               Module: Human Resources
             </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Personnel Roster & GIS</h1>
          <p className="text-gray-500 font-medium mt-1">
            Geospatial deployment map. Select a district to view active field agents.
          </p>
        </div>
        
        {/* Legend / Status Widget */}
        <div className="flex items-center gap-4 text-xs font-medium bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
           <div className="flex items-center gap-1.5">
             <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse"></span>
             <span className="text-gray-700">Active Deployment</span>
           </div>
           <div className="w-px h-4 bg-gray-200"></div>
           <div className="flex items-center gap-1.5">
             <span className="w-2.5 h-2.5 bg-gray-300 rounded-full"></span>
             <span className="text-gray-500">No Data / Inactive</span>
           </div>
        </div>
      </header>
       
      {/* 2. Main Visualization Container */}
      <section className="flex-1 bg-gray-100 rounded-2xl border border-gray-200 shadow-inner overflow-hidden relative min-h-[650px] flex">
        
        {/* A. The Map Stage */}
        <div className="flex-1 relative z-0">
          
          {/* Floating HUD */}
          <div className="absolute top-6 left-6 z-10 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-gray-100 max-w-xs pointer-events-none transition-all duration-300">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <MapPin size={16} className="text-blue-600"/> 
              {selectedDistrict ? `${selectedDistrict} District` : "Select a Zone"}
            </h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              {selectedDistrict 
                ? `Accessed ${staffData.length} records in this jurisdiction.` 
                : "Navigate the map to load personnel manifests."}
            </p>
          </div>

          <div className="w-full h-full p-4 md:p-12 transition-transform duration-700 ease-in-out">
            <UgandaMap 
              activeDistrict={selectedDistrict} 
              onSelect={handleMapClick} 
            />
          </div>
        </div>

        {/* B. The Slide-Over Drawer (Replaces Modal) */}
        <div 
          className={`
            absolute top-0 right-0 h-full bg-white shadow-2xl z-20 transition-all duration-500 ease-in-out border-l border-gray-200 flex flex-col
            ${isDrawerOpen ? "translate-x-0 w-full md:w-[450px]" : "translate-x-full w-full md:w-[450px] opacity-0"}
          `}
          aria-hidden={!isDrawerOpen}
        >
          {selectedDistrict && (
            <RosterDrawerContent 
              staff={staffData} 
              area={selectedDistrict} 
              onClose={closeDrawer} 
            />
          )}
        </div>
        
      </section>
    </main>
  );
}

// --- Drawer Logic & UI ---

interface RosterProps {
  staff: PersonnelEntry[];
  area: string;
  onClose: () => void;
}

function RosterDrawerContent({ staff, area, onClose }: RosterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  
  // Robust Filtering
  const filteredStaff = staff.filter(p => {
    const term = searchTerm.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(term)) ||
      (p.role && p.role.toLowerCase().includes(term)) ||
      (p.subcounty && p.subcounty.toLowerCase().includes(term))
    );
  });

  // Safe Sorting
  const sortedStaff = [...filteredStaff].sort((a, b) => {
    const key = sortBy as keyof PersonnelEntry;
    const valA = String(a[key] || "").toLowerCase();
    const valB = String(b[key] || "").toLowerCase();
    return valA.localeCompare(valB);
  });

  // Color Logic for Visual Scannability
  const getRoleIndicator = (role: string | null | undefined) => {
    const r = String(role).toLowerCase();
    if (r.includes("health")) return "bg-rose-500";
    if (r.includes("vht")) return "bg-emerald-500";
    if (r.includes("chair") || r.includes("lead")) return "bg-blue-600";
    if (r.includes("secretary") || r.includes("admin")) return "bg-purple-500";
    return "bg-slate-400";
  };

  return (
    <>
      {/* Drawer Header */}
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              {area} Roster
              <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 text-xs font-bold">
                {staff.length}
              </span>
            </h2>
            <p className="text-xs text-gray-500 mt-1">Authorized personnel list.</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            aria-label="Close panel"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search roster..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Role Legend (Contextual Education) */}
      <div className="px-6 py-3 bg-white border-b border-gray-100 flex gap-4 overflow-x-auto no-scrollbar">
        <LegendItem color="bg-rose-500" label="Medical" />
        <LegendItem color="bg-emerald-500" label="VHT" />
        <LegendItem color="bg-blue-600" label="Leadership" />
        <LegendItem color="bg-purple-500" label="Admin" />
      </div>

      {/* Roster List */}
      <div className="flex-1 overflow-y-auto bg-white p-2">
        {sortedStaff.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-center px-6">
            <Filter size={32} className="opacity-20 mb-3" />
            <p className="text-sm font-medium">No personnel found</p>
            <p className="text-xs mt-1">Try adjusting your search terms.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {sortedStaff.map((p, idx) => (
              <div 
                key={idx} 
                className="group flex gap-4 p-3 hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-100"
              >
                {/* Visual Role Indicator */}
                <div className="flex flex-col items-center gap-1 shrink-0 mt-1">
                   <div className={`w-2 h-2 rounded-full ${getRoleIndicator(p.role)} shadow-sm`}></div>
                   <div className="w-px h-full bg-gray-100 group-hover:bg-gray-200"></div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-bold text-gray-900 truncate pr-2">{p.name}</h3>
                    <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 rounded">{p.subcounty}</span>
                  </div>
                  
                  {/* Role is hidden in column, but visible here in detail */}
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                    <Briefcase size={10} /> {p.role || "Unspecified Role"}
                  </p>

                  {/* Quick Actions Footer */}
                  <div className="flex items-center gap-3 mt-3 pt-2 border-t border-gray-50 opacity-60 group-hover:opacity-100 transition-opacity">
                    {p.phone ? (
                      <a href={`tel:${p.phone}`} className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-blue-600 bg-white border border-gray-200 px-2 py-1 rounded shadow-sm hover:shadow">
                        <Phone size={10} /> Call
                      </a>
                    ) : (
                      <span className="text-[10px] text-gray-300 select-none">No Phone</span>
                    )}
                    
                    {p.email && (
                      <a href={`mailto:${p.email}`} className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-blue-600 bg-white border border-gray-200 px-2 py-1 rounded shadow-sm hover:shadow">
                        <Mail size={10} /> Email
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
        <div className="inline-flex items-center gap-1.5 text-[10px] text-gray-400 hover:text-blue-500 cursor-pointer transition-colors group">
          <Info size={12} />
          <span>Learn about District Hierarchy</span>
          {/* Trigger for Contextual Diagram */}
          

[Image of Uganda health system structure]

        </div>
      </div>
    </>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <div className={`w-2 h-2 rounded-full ${color}`}></div>
      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
    </div>
  );
}