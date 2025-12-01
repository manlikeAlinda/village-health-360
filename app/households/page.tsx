"use client";

import { useState } from "react";
import Link from "next/link"; 
import { 
  Search, Filter, Plus, Edit, Trash2, 
  MapPin, Droplets, Activity, X // Added X icon for closing modal
} from "lucide-react";

// Mock Data
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
  const [isRegisterOpen, setIsRegisterOpen] = useState(false); // Modal State

  // Filtering Logic
  const filteredData = households.filter((item) => {
    const matchesSearch = item.head.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.village.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = filterRisk === "All" || item.riskLevel === filterRisk;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-6 relative">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Households Directory</h1>
          <p className="text-gray-500 text-sm">Managing 82,450 beneficiaries in Gulu District</p>
        </div>
        
        {/* Register Button - Now triggers the Modal */}
        <button 
          onClick={() => setIsRegisterOpen(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm"
        >
          <Plus size={16} />
          Register New Household
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by Name, Village, or ID..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <select 
              className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:border-brand-blue cursor-pointer"
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
            >
              <option value="All">All Risk Levels</option>
              <option value="Critical">Critical</option>
              <option value="High">High Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low Risk</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      {/* Data Grid / Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                <th className="px-6 py-4">Household Head</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Status & Risk</th>
                <th className="px-6 py-4">Health & WASH</th>
                <th className="px-6 py-4">Last Visit</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.map((hh) => (
                <tr key={hh.id} className="hover:bg-gray-50/50 transition-colors">
                  
                  {/* Column 1: Identity */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold text-sm">
                        {hh.head.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{hh.head}</p>
                        <p className="text-xs text-gray-500">ID: {hh.id} • {hh.members} Members</p>
                      </div>
                    </div>
                  </td>

                  {/* Column 2: Location */}
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin size={16} className="mt-0.5 text-gray-400" />
                      <div>
                        <p>{hh.village} Village</p>
                        <p className="text-xs text-gray-400">{hh.parish} Parish</p>
                      </div>
                    </div>
                  </td>

                  {/* Column 3: Risk Score */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      hh.riskLevel === "Critical" ? "bg-red-50 text-red-700 border-red-100" :
                      hh.riskLevel === "High" ? "bg-orange-50 text-orange-700 border-orange-100" :
                      hh.riskLevel === "Medium" ? "bg-yellow-50 text-yellow-700 border-yellow-100" :
                      "bg-green-50 text-green-700 border-green-100"
                    }`}>
                      {hh.riskLevel} Priority
                    </span>
                  </td>

                  {/* Column 4: Integrated Indicators */}
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {/* Health Indicator */}
                      <div className="flex items-center gap-2 text-xs">
                        <Activity size={14} className="text-brand-blue" />
                        <span className="text-gray-700">{hh.healthStatus}</span>
                      </div>
                      {/* WASH Indicator */}
                      <div className="flex items-center gap-2 text-xs">
                        <Droplets size={14} className={hh.waterSource.includes("Unsafe") ? "text-red-500" : "text-brand-wash"} />
                        <span className="text-gray-700">{hh.waterSource}</span>
                      </div>
                    </div>
                  </td>

                  {/* Column 5: Meta Data */}
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {hh.lastVisit}
                  </td>

                  {/* Column 6: Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/households/${hh.id}`}
                        className="text-brand-blue bg-brand-blue/10 hover:bg-brand-blue/20 px-3 py-1.5 rounded text-xs font-bold transition-colors"
                      >
                        View
                      </Link>

                      <button 
                        className="p-1.5 text-gray-400 hover:text-brand-blue hover:bg-blue-50 rounded transition-colors"
                        title="Edit Details"
                      >
                        <Edit size={16} />
                      </button>

                      <button 
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">Showing <span className="font-medium">{filteredData.length}</span> of <span className="font-medium">82,450</span> households</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100">Next</button>
          </div>
        </div>
      </div>

      {/* --- Registration Modal --- */}
      {isRegisterOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Register New Household</h2>
                <p className="text-sm text-gray-500">Add a new beneficiary to the VillageHealth360 database</p>
              </div>
              <button 
                onClick={() => setIsRegisterOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Form */}
            <form className="p-6 space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Identity Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">
                    Identity
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Head of Household</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-colors" placeholder="Full Name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input type="tel" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-colors" placeholder="07XX XXX XXX" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Family Size</label>
                    <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-colors" placeholder="Number of members" />
                  </div>
                </div>

                {/* Location Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">
                    Location & Status
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Village</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-colors" placeholder="Village Name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Parish</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-colors bg-white">
                      <option>Select Parish...</option>
                      <option>Patiko</option>
                      <option>Omoro</option>
                      <option>Aswa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Initial Risk Assessment</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-colors bg-white">
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="High">High Priority</option>
                      <option value="Critical">Critical Priority</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors"
                >
                  Save & Register
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}