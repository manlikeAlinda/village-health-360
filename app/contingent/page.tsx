"use client";

import { useState, useMemo } from "react";
import { 
  Users, MapPin, Search, Phone, 
  Mail, X, ArrowDownUp
} from "lucide-react";

import UgandaMap from "./UgandaMap";
import personnelDataRaw from "./personnel_data.json";

// 1. Define the shape of your data FIRST so we can use it below
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

// 2. Cast the imported JSON to your specific type
const personnelData = personnelDataRaw as unknown as PersonnelEntry[];

export default function ContingentPage() {
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const handleMapClick = (districtTitle: string) => {
    setSelectedDistrict(districtTitle);
  };

  const handleClose = () => {
    setSelectedDistrict("");
  };

  const staffData = useMemo(() => {
    if (!selectedDistrict) return [];
    
    // Safety check
    if (!Array.isArray(personnelData)) {
      console.error("Data Import Error: personnel_data.json is not an array.", personnelData);
      return [];
    }

    return personnelData.filter(p => 
      // Ensure p.district exists before comparing
      p.district && p.district.toLowerCase() === selectedDistrict.toLowerCase()
    );
  }, [selectedDistrict]);

  return (
    <div className="space-y-6 h-full flex flex-col max-w-7xl mx-auto w-full p-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Personnel Roster & GIS</h1>
          <p className="text-gray-500 text-sm">Interactive accountability map. Click a district to view staff.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
           <span className="w-3 h-3 bg-blue-600 rounded-full"></span> Active Zone
           <span className="w-3 h-3 bg-gray-200 rounded-full border border-gray-300"></span> Inactive
        </div>
      </div>
       
      {/* Map Container */}
      <div className="flex-1 bg-blue-50/30 rounded-xl border border-gray-200 shadow-xl overflow-hidden flex flex-col relative min-h-[600px]">
        
        {/* Overlay Info */}
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur p-4 rounded-lg border border-gray-200 shadow-sm max-w-xs pointer-events-none">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <MapPin size={16} className="text-brand-blue"/> 
            {selectedDistrict ? `${selectedDistrict} District` : "Select a Region"}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {selectedDistrict 
              ? `Found ${staffData.length} personnel records.` 
              : "Interact with the map to load the personnel manifest."}
          </p>
        </div>

        {/* Map */}
        <div className="w-full h-full p-4 md:p-8 transform transition-transform duration-700">
          <UgandaMap 
            activeDistrict={selectedDistrict} 
            onSelect={handleMapClick} 
          />
        </div>

        {/* Modal */}
        {selectedDistrict && (
          <StaffRosterModal 
            staff={staffData} 
            area={`${selectedDistrict} District`} 
            onClose={handleClose} 
          />
        )}
      </div>
    </div>
  );
}

// --- Helper Components ---

interface StaffRosterModalProps {
  staff: PersonnelEntry[];
  area: string;
  onClose: () => void;
}

function StaffRosterModal({ staff, area, onClose }: StaffRosterModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filteredStaff = staff.filter(p => {
    const term = searchTerm.toLowerCase();
    // Safely check fields before including in search
    return (
      (p.name && p.name.toLowerCase().includes(term)) ||
      (p.role && p.role.toLowerCase().includes(term)) ||
      (p.subcounty && p.subcounty.toLowerCase().includes(term))
    );
  });

  const sortedStaff = [...filteredStaff].sort((a, b) => {
    const key = sortBy as keyof PersonnelEntry;
    // FIX: Force both values to String to prevent crashes on numbers/nulls
    const valA = String(a[key] || "");
    const valB = String(b[key] || "");
    
    return sortDir === "asc" 
      ? valA.localeCompare(valB) 
      : valB.localeCompare(valA);
  });

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortDir("asc");
    }
  };

  // FIX: Safely handle null, undefined, or non-string roles
  const getRoleColor = (role: string | undefined | null) => {
    // If role is missing, return default gray
    if (!role) return "bg-gray-500";
    
    // Force conversion to String before calling toLowerCase
    const r = String(role).toLowerCase();

    if (r.includes("health")) return "bg-red-500";
    if (r.includes("vht")) return "bg-green-500";
    if (r.includes("chair")) return "bg-blue-600";
    if (r.includes("secretary")) return "bg-purple-500";
    if (r.includes("technician")) return "bg-orange-500";
    if (r.includes("agricultural")) return "bg-yellow-500";
    
    return "bg-gray-500";
  };

  return (
    <div 
      className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-10"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users size={20} className="text-blue-600" />
              {area} Roster
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Active personnel in this zone.
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-4 border-b border-gray-200 bg-white shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Filter by Name, Role, or Subcounty..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-0">
          {sortedStaff.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Search size={32} className="opacity-20 mb-4" />
              <p>No records found.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <table className="w-full text-left hidden md:table">
                <thead className="text-xs uppercase text-gray-500 bg-gray-50 sticky top-0 z-10 border-b border-gray-200 shadow-sm">
                  <tr>
                    <SortableHeader label="Name" sortKey="name" currentSort={sortBy} sortDir={sortDir} onSort={handleSort} />
                    {/* Role Header Removed */}
                    <SortableHeader label="Subcounty" sortKey="subcounty" currentSort={sortBy} sortDir={sortDir} onSort={handleSort} />
                    <th className="px-4 py-3 font-medium">Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {sortedStaff.map((p, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/50 transition-colors group">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        <div className="flex items-center gap-3">
                          {/* Color bar kept for visual distinction, but no role text shown */}
                          <span className={`w-1.5 h-8 rounded-full ${getRoleColor(p.role)}`}></span>
                          <div>
                            {p.name}
                            {/* Mobile Role Text Removed */}
                          </div>
                        </div>
                      </td>
                      {/* Role Column Removed */}
                      <td className="px-4 py-3 text-gray-600">{p.subcounty}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {p.phone && (
                            <a href={`tel:${p.phone}`} className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 text-xs">
                              <Phone size={12} /> {p.phone}
                            </a>
                          )}
                          {p.email && (
                            <a href={`mailto:${p.email}`} className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 text-xs">
                              <Mail size={12} /> {p.email}
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile Cards */}
              <div className="md:hidden p-4 space-y-3">
                {sortedStaff.map((p, idx) => (
                  <div key={idx} className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm relative overflow-hidden">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${getRoleColor(p.role)}`}></div>
                    <div className="flex justify-between items-start mb-2 pl-2">
                      <h3 className="font-bold text-gray-900">{p.name}</h3>
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{p.subcounty}</span>
                    </div>
                    <div className="pl-2 space-y-2 text-sm text-gray-600">
                      {/* Role Line Removed */}
                      <div className="flex gap-4 mt-3 pt-3 border-t border-gray-50">
                        {p.phone && <a href={`tel:${p.phone}`} className="flex items-center gap-1 text-blue-600 font-medium"><Phone size={14}/> Call</a>}
                        {p.email && <a href={`mailto:${p.email}`} className="flex items-center gap-1 text-blue-600 font-medium"><Mail size={14}/> Email</a>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Sortable Header Helper ---
interface SortableHeaderProps {
  label: string;
  sortKey: string;
  currentSort: string;
  sortDir: "asc" | "desc";
  onSort: (key: string) => void;
}

function SortableHeader({ label, sortKey, currentSort, sortDir, onSort }: SortableHeaderProps) {
  const isCurrent = currentSort === sortKey;
  return (
    <th 
      className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors select-none text-xs font-semibold tracking-wider text-gray-500" 
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        {isCurrent && <ArrowDownUp size={12} className={`transition-transform text-blue-600 ${sortDir === 'desc' ? 'rotate-180' : ''}`} />}
      </div>
    </th>
  );
}