"use client";

import { useState } from "react";
import Link from "next/link"; 
import { 
  Search, Filter, Plus, Edit2, Trash2, 
  MapPin, Droplets, Activity, X, MoreHorizontal,
  ChevronRight, AlertCircle, CalendarClock, Info
} from "lucide-react";

// --- Mock Data ---
const households = [
  { 
    id: "HH-001", 
    head: "Okelo James", 
    village: "Bwobo", 
    parish: "Patiko",
    members: 6, 
    riskLevel: "High", 
    healthStatus: "Pregnant Mother", 
    waterSource: "Unsafe (Stream)",
    lastVisit: "2 days ago"
  },
  { 
    id: "HH-002", 
    head: "Akello Sarah", 
    village: "Ajulu", 
    parish: "Patiko", 
    members: 4, 
    riskLevel: "Low", 
    healthStatus: "Fully Immunized", 
    waterSource: "Borehole (Safe)", 
    lastVisit: "1 month ago"
  },
  { 
    id: "HH-003", 
    head: "Opio David", 
    village: "Bwobo", 
    parish: "Patiko",
    members: 8, 
    riskLevel: "Medium", 
    healthStatus: "Malaria Case", 
    waterSource: "Borehole (Broken)",
    lastVisit: "1 week ago"
  },
  { 
    id: "HH-004", 
    head: "Achan Grace", 
    village: "Koro", 
    parish: "Omoro",
    members: 3, 
    riskLevel: "Critical", 
    healthStatus: "Child Malnutrition", 
    waterSource: "Unsafe (River)",
    lastVisit: "Yesterday"
  },
  { 
    id: "HH-8291", 
    head: "Mugisha Ben", 
    village: "Ajulu", 
    parish: "Patiko",
    members: 5, 
    riskLevel: "Low", 
    healthStatus: "Stable", 
    waterSource: "Tap Stand",
    lastVisit: "3 weeks ago"
  },
];

export default function HouseholdsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRisk, setFilterRisk] = useState("All");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Filtering Logic
  const filteredData = households.filter((item) => {
    const matchesSearch = item.head.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = filterRisk === "All" || item.riskLevel === filterRisk;
    return matchesSearch && matchesRisk;
  });

  return (
    <main className="space-y-6 relative min-h-screen bg-gray-50/50 p-6">
      
      {/* 1. Header: Operational Context */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Beneficiary Directory</h1>
          <p className="text-gray-500 text-sm mt-1">
            Managing <span className="font-mono font-medium text-gray-700">82,450</span> households in Gulu District.
          </p>
        </div>
        
        <button 
          onClick={() => setIsRegisterOpen(true)}
          className="group flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm hover:shadow-md active:scale-95"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          Register Household
        </button>
      </header>

      {/* 2. Control Bar: Search & Filter */}
      <section className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by Name, Village, or HH-ID..." 
            className="w-full pl-10 pr-4 py-2.5 bg-transparent border-none focus:ring-0 text-sm text-gray-900 placeholder:text-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="h-auto w-px bg-gray-200 hidden md:block mx-2 my-2"></div>
        
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          <select 
            className="w-full appearance-none bg-gray-50 border border-transparent hover:border-gray-200 text-gray-700 py-2.5 pl-10 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium transition-colors cursor-pointer"
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
          >
            <option value="All">All Risk Levels</option>
            <option value="Critical">Critical Priority</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
          {/* EDUCATIONAL TRIGGER: Standardization */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 group">
             <Info size={14} className="text-gray-400 hover:text-blue-600 cursor-help" />
             <div className="hidden group-hover:block absolute right-0 top-6 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-20">
               <p className="font-bold mb-1 text-gray-200">Risk Assessment Standard:</p>
               

[Image of Household Vulnerability Assessment Tool]

               <p className="mt-2 text-gray-400">
                 Households are graded on 5 dimensions: Health, Income, WASH, Shelter, and Food Security.
               </p>
             </div>
          </div>
        </div>
      </section>

      {/* 3. Data Table */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {filteredData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200 text-[11px] uppercase text-gray-500 font-bold tracking-wider">
                  <th className="px-6 py-4">Household Profile</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Risk Triage</th>
                  <th className="px-6 py-4">Key Indicators</th>
                  <th className="px-6 py-4">Last Visit</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.map((hh) => (
                  <tr key={hh.id} className="group hover:bg-blue-50/30 transition-colors">
                    
                    {/* Identity */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border border-white shadow-sm flex items-center justify-center text-gray-600 font-bold text-xs">
                          {hh.head.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{hh.head}</p>
                          <p className="text-xs text-gray-500 font-mono mt-0.5 flex items-center gap-2">
                            {hh.id} 
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            {hh.members} Members
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                          <MapPin size={14} className="text-gray-400" /> {hh.village}
                        </div>
                        <p className="text-xs text-gray-500 pl-5">{hh.parish} Parish</p>
                      </div>
                    </td>

                    {/* Risk Badge */}
                    <td className="px-6 py-4">
                      <RiskBadge level={hh.riskLevel} />
                    </td>

                    {/* Indicators */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-xs">
                          <Activity size={14} className="text-rose-500 shrink-0" />
                          <span className="text-gray-700 truncate max-w-[140px]" title={hh.healthStatus}>{hh.healthStatus}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Droplets size={14} className={hh.waterSource.includes("Unsafe") ? "text-amber-500 shrink-0" : "text-blue-500 shrink-0"} />
                          <span className="text-gray-700 truncate max-w-[140px]" title={hh.waterSource}>{hh.waterSource}</span>
                        </div>
                      </div>
                    </td>

                    {/* Meta */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <CalendarClock size={14} className="text-gray-400" />
                        {hh.lastVisit}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <Link 
                          href={`/households/${hh.id}`}
                          className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          View <ChevronRight size={12} />
                        </Link>
                        
                        <div className="h-4 w-px bg-gray-200 mx-1"></div>

                        <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors" title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No households found</h3>
            <p className="text-gray-500 max-w-sm mt-2 mb-6">
              Try adjusting your search or filter criteria to find what you are looking for.
            </p>
            <button 
              onClick={() => { setSearchTerm(""); setFilterRisk("All"); }}
              className="text-blue-600 font-medium hover:underline text-sm"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Footer */}
        {filteredData.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <p>Showing <span className="font-bold text-gray-900">{filteredData.length}</span> results</p>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 border border-gray-300 rounded hover:bg-white disabled:opacity-50" disabled>Previous</button>
              <button className="px-3 py-1.5 border border-gray-300 rounded hover:bg-white">Next</button>
            </div>
          </div>
        )}
      </section>

      {/* 4. Registration Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsRegisterOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-lg font-bold text-gray-900">New Household Registration</h2>
                <p className="text-xs text-gray-500 mt-1">Beneficiary ID will be auto-generated upon saving.</p>
              </div>
              <button 
                onClick={() => setIsRegisterOpen(false)}
                className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form className="space-y-8">
                
                {/* Form Section 1 */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px]">1</span>
                    Identity & Demographics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputGroup label="Head of Household" placeholder="Full Name (Last, First)" />
                    <InputGroup label="Phone Number" placeholder="+256 7..." type="tel" />
                    <InputGroup label="National ID / NIN" placeholder="Optional" />
                    <div className="grid grid-cols-2 gap-4">
                      <InputGroup label="Members (M)" placeholder="0" type="number" />
                      <InputGroup label="Members (F)" placeholder="0" type="number" />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Form Section 2 */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px]">2</span>
                    Location & Vulnerability
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputGroup label="Village Name" placeholder="e.g. Bwobo" />
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Parish</label>
                      <select className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white">
                        <option>Select Parish...</option>
                        <option>Patiko</option>
                        <option>Omoro</option>
                      </select>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Initial Risk Assessment</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <RadioCard label="Low" color="border-gray-200 hover:border-blue-300" />
                        <RadioCard label="Medium" color="border-yellow-200 bg-yellow-50/50" />
                        <RadioCard label="High" color="border-orange-200 bg-orange-50/50" />
                        <RadioCard label="Critical" color="border-red-200 bg-red-50/50" />
                      </div>
                    </div>
                  </div>
                </div>

              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsRegisterOpen(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-md transition-all active:scale-95">
                Complete Registration
              </button>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}

// --- Component System ---

function RiskBadge({ level }: { level: string }) {
  const styles = {
    Critical: "bg-red-50 text-red-700 ring-red-600/20",
    High: "bg-orange-50 text-orange-800 ring-orange-600/20",
    Medium: "bg-yellow-50 text-yellow-800 ring-yellow-600/20",
    Low: "bg-green-50 text-green-700 ring-green-600/20",
  };
  
  // Default to Low if unknown
  const style = styles[level as keyof typeof styles] || styles.Low;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold ring-1 ring-inset ${style}`}>
      {level === 'Critical' && <AlertCircle size={10} />}
      {level.toUpperCase()}
    </span>
  );
}

function InputGroup({ label, placeholder, type = "text" }: { label: string, placeholder: string, type?: string }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-700 mb-1.5">{label}</label>
      <input 
        type={type} 
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors" 
        placeholder={placeholder} 
      />
    </div>
  );
}

function RadioCard({ label, color }: { label: string, color: string }) {
  return (
    <label className={`cursor-pointer border rounded-lg p-3 text-center transition-all hover:shadow-sm ${color}`}>
      <input type="radio" name="risk" className="sr-only" />
      <span className="text-xs font-bold text-gray-700">{label}</span>
    </label>
  );
}