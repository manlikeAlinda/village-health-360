"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search, Filter, Plus, Edit2, Trash2,
  MapPin, Droplets, Activity, X, MoreHorizontal,
  ChevronRight, AlertCircle, CalendarClock, Info,
  Save, AlertTriangle, Users, TrendingUp, ChevronDown,
  Download, Share2
} from "lucide-react";

// --- TYPE DEFINITIONS ---
interface Household {
  id: string;
  head: string;
  village: string;
  parish: string;
  members: number;
  riskLevel: string;
  healthStatus: string;
  waterSource: string;
  lastVisit: string;
  program: string;
}

// --- REAL DATA: Integrated from districts.json ---
const DISTRICTS_DATA = {
  "Central": {
    "Kampala": ["Kampala City"],
    "Buganda South": ["Bukomansimbi", "Butambala", "Gomba", "Kalangala", "Kalungu", "Kyotera", "Lwengo", "Lyantonde", "Masaka", "Masaka City", "Mpigi", "Rakai", "Sembabule", "Wakiso"],
    "Buganda North": ["Buikwe", "Buvuma", "Kassanda", "Kayunga", "Kiboga", "Kyankwanzi", "Luweero", "Mityana", "Mubende", "Mukono", "Nakaseke", "Nakasongola", "Kasanda"]
  },
  "Eastern": {
    "Busoga": ["Bugiri", "Bugweri", "Buyende", "Iganga", "Jinja", "Jinja City", "Kaliro", "Kamuli", "Luuka", "Mayuge", "Namayingo", "Namutumba"],
    "Bukedi": ["Budaka", "Busia", "Butaleja", "Butebo", "Kibuku", "Pallisa", "Tororo"],
    "Elgon": ["Bududa", "Bukwo", "Bulambuli", "Kapchorwa", "Kween", "Manafwa", "Mbale", "Mbale City", "Namisindwa", "Sironko"],
    "Teso": ["Amuria", "Bukedea", "Kaberamaido", "Kalaki", "Kapelebyong", "Katakwi", "Kumi", "Ngora", "Serere", "Soroti", "Soroti City"]
  },
  "Northern": {
    "Karamoja": ["Abim", "Amudat", "Kaabong", "Karenga", "Kotido", "Moroto", "Nabilatuk", "Nakapiripirit", "Napak"],
    "Lango": ["Alebtong", "Amolatar", "Apac", "Dokolo", "Kole", "Kwania", "Lira", "Lira City", "Otuke", "Oyam"],
    "Acholi": ["Agago", "Amuru", "Gulu", "Gulu City", "Kitgum", "Lamwo", "Nwoya", "Omoro", "Pader"],
    "West Nile": ["Adjumani", "Arua", "Arua City", "Koboko", "Madi-Okollo", "Maracha", "Moyo", "Nebbi", "Obongi", "Pakwach", "Terego", "Yumbe", "Zombo"]
  },
  "Western": {
    "Bunyoro": ["Buliisa", "Hoima", "Hoima City", "Kagadi", "Kakumiro", "Kibaale", "Kikuube", "Kiryandongo", "Masindi"],
    "Tooro": ["Bundibugyo", "Kabarole", "Kamwenge", "Kitagwenda", "Kyegegwa", "Kyenjojo", "Ntoroko", "Kasese"],
    "Ankole": ["Buhweju", "Bushenyi", "Ibanda", "Isingiro", "Kazo", "Kiruhura", "Mbarara", "Mbarara City", "Mitooma", "Ntungamo", "Rubirizi", "Rwampara", "Sheema"],
    "Kigezi": ["Kabale", "Kanungu", "Kisoro", "Rubanda", "Rukiga", "Rukungiri"]
  }
};

// --- Helper Functions ---
const getAllDistricts = () => {
  const districts: string[] = [];
  Object.values(DISTRICTS_DATA).forEach(region => {
    Object.values(region).forEach(subRegionDistricts => {
      districts.push(...subRegionDistricts);
    });
  });
  return districts.sort();
};

const getSubcounties = (district: string | null) => {
  if (!district) return [];
  return [`${district} Central`, `${district} North`, `${district} South`, "Town Council"];
};

// --- Domain-Specific Mock Data ---
const initialHouseholds: Household[] = [
  {
    id: "HH-GUL-001",
    head: "Okelo James",
    village: "Bwobo",
    parish: "Patiko",
    members: 6,
    riskLevel: "High",
    healthStatus: "Pregnant Mother",
    waterSource: "Unsafe (Stream)",
    lastVisit: "2 days ago",
    program: "Cash Transfer"
  },
  {
    id: "HH-GUL-002",
    head: "Akello Sarah",
    village: "Ajulu",
    parish: "Patiko",
    members: 4,
    riskLevel: "Low",
    healthStatus: "Fully Immunized",
    waterSource: "Borehole (Safe)",
    lastVisit: "1 month ago",
    program: "VSLA Linkage"
  },
  {
    id: "HH-GUL-003",
    head: "Opio David",
    village: "Bwobo",
    parish: "Patiko",
    members: 8,
    riskLevel: "Medium",
    healthStatus: "Malaria Case",
    waterSource: "Borehole (Broken)",
    lastVisit: "1 week ago",
    program: "Agri-Input"
  },
  {
    id: "HH-GUL-004",
    head: "Achan Grace",
    village: "Koro",
    parish: "Omoro",
    members: 3,
    riskLevel: "Critical",
    healthStatus: "Child Malnutrition",
    waterSource: "Unsafe (River)",
    lastVisit: "Yesterday",
    program: "Emergency Food"
  },
  {
    id: "HH-GUL-005",
    head: "Mugisha Ben",
    village: "Ajulu",
    parish: "Patiko",
    members: 5,
    riskLevel: "Low",
    healthStatus: "Stable",
    waterSource: "Tap Stand",
    lastVisit: "3 weeks ago",
    program: "VSLA Linkage"
  },
];

// Filter Select Component
const FilterSelect = ({ value, onChange, options, placeholder, disabled }: any) => (
  <div className="relative min-w-[200px]">
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-[#004AAD] text-sm font-medium transition-colors ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:border-gray-400'}`}
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
);

export default function HouseholdsPage() {
  const [data, setData] = useState<Household[]>(initialHouseholds);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRisk, setFilterRisk] = useState("All");
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedSubcounty, setSelectedSubcounty] = useState<string | null>(null);

  // --- Modal States ---
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);

  // --- Derived Data ---
  const allDistricts = useMemo(() => getAllDistricts(), []);
  const subcounties = useMemo(() => getSubcounties(selectedDistrict), [selectedDistrict]);
  const currentLocation = selectedSubcounty || selectedDistrict || "National";

  // --- Actions ---
  const handleEditClick = (hh: Household) => {
    setSelectedHousehold(hh);
    setIsEditOpen(true);
  };

  const handleDeleteClick = (hh: Household) => {
    setSelectedHousehold(hh);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedHousehold) return;
    setData(data.filter(h => h.id !== selectedHousehold.id));
    setIsDeleteOpen(false);
    setSelectedHousehold(null);
  };

  // --- Filtering Logic ---
  const filteredData = data.filter((item) => {
    const matchesSearch = item.head.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = filterRisk === "All" || item.riskLevel === filterRisk;
    return matchesSearch && matchesRisk;
  });

  // --- Stats ---
  const totalHouseholds = 82450;
  const criticalCount = data.filter(h => h.riskLevel === "Critical").length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 p-6 lg:p-10 mt-16">
      {/* 1. Executive Header */}
      <header className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
              Beneficiary Directory
            </h1>
            <p className="text-sm text-gray-500 mt-1.5 max-w-xl">
              Household registry and vulnerability tracking across {currentLocation}.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm">
              <Download size={16} /> Export Report
            </button>
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#7C3AED] rounded-xl hover:bg-[#6D28D9] transition shadow-sm"
            >
              <Plus size={16} /> Register Household
            </button>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <section className="mb-8 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Filter size={16} />
            <span className="text-sm font-semibold">Filters:</span>
          </div>
          <FilterSelect
            value={selectedDistrict}
            onChange={(val: string) => {
              setSelectedDistrict(val || null);
              setSelectedSubcounty(null);
            }}
            options={allDistricts}
            placeholder="All Districts"
          />
          <FilterSelect
            value={selectedSubcounty}
            onChange={(val: string) => setSelectedSubcounty(val || null)}
            options={subcounties}
            placeholder="All Subcounties"
            disabled={!selectedDistrict}
          />
          <div className="relative min-w-[180px]">
            <select
              className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg text-sm font-medium transition-colors hover:border-gray-400 focus:outline-none focus:border-[#004AAD]"
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
            >
              <option value="All">All Risk Levels</option>
              <option value="Critical">Critical Priority</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <ChevronDown size={14} />
            </div>
          </div>
          {(selectedDistrict || selectedSubcounty || filterRisk !== "All") && (
            <button
              onClick={() => {
                setSelectedDistrict(null);
                setSelectedSubcounty(null);
                setFilterRisk("All");
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-800 transition"
            >
              <X size={14} /> Clear Filters
            </button>
          )}
        </div>
      </section>

      {/* 2. KPI Section */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-xl border bg-blue-50 text-blue-700 border-blue-200">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-bold text-gray-900 tracking-tight">{totalHouseholds.toLocaleString()}</h4>
            <p className="text-sm font-medium text-gray-500 mt-0.5">Total Households</p>
            <p className="text-[10px] text-gray-400 mt-2 border-t border-gray-50 pt-2">Registered beneficiaries</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-xl border bg-red-50 text-red-700 border-red-200">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-bold text-gray-900 tracking-tight">1,204</h4>
            <p className="text-sm font-medium text-gray-500 mt-0.5">Critical Priority</p>
            <p className="text-[10px] text-gray-400 mt-2 border-t border-gray-50 pt-2">Require immediate attention</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-xl border bg-green-50 text-green-700 border-green-200">
              <Activity size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-bold text-gray-900 tracking-tight">94.2%</h4>
            <p className="text-sm font-medium text-gray-500 mt-0.5">Visit Compliance</p>
            <p className="text-[10px] text-gray-400 mt-2 border-t border-gray-50 pt-2">Last 30 days coverage</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-xl border bg-purple-50 text-purple-700 border-purple-200">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-bold text-gray-900 tracking-tight">+2,340</h4>
            <p className="text-sm font-medium text-gray-500 mt-0.5">New This Month</p>
            <p className="text-[10px] text-gray-400 mt-2 border-t border-gray-50 pt-2">Registered in last 30 days</p>
          </div>
        </div>
      </section>

      {/* 3. Search Bar */}
      <section className="mb-6 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by Head of House, Village, or Unique ID..."
            className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:ring-0 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      {/* 4. Data Table */}
      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {filteredData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-bold tracking-wider">
                  <th className="px-6 py-4">Household Profile</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Risk Triage</th>
                  <th className="px-6 py-4">Intervention</th>
                  <th className="px-6 py-4">Last Visit</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredData.map((hh) => (
                  <tr key={hh.id} className="group hover:bg-purple-50/30 transition-colors">
                    {/* Identity */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border border-white shadow-sm flex items-center justify-center text-gray-600 font-bold text-xs">
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
                          <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100 font-medium">
                            {hh.program}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Droplets size={12} className={hh.waterSource.includes("Unsafe") ? "text-amber-500" : "text-blue-500"} />
                          {hh.waterSource}
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
                          className="text-purple-600 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          View <ChevronRight size={12} />
                        </Link>

                        <div className="h-4 w-px bg-gray-200 mx-1"></div>

                        <button
                          onClick={() => handleEditClick(hh)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit Record"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(hh)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete Record"
                        >
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
          <EmptyState clearFilters={() => { setSearchTerm(""); setFilterRisk("All"); }} />
        )}

        {/* Footer */}
        {filteredData.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <p>Showing <span className="font-bold text-gray-900">{filteredData.length}</span> of {data.length} records</p>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 border border-gray-300 rounded hover:bg-white disabled:opacity-50" disabled>Previous</button>
              <button className="px-3 py-1.5 border border-gray-300 rounded hover:bg-white">Next</button>
            </div>
          </div>
        )}
      </section>

      {/* --- MODAL SYSTEM --- */}

      {/* Registration Modal */}
      {isRegisterOpen && (
        <ModalBase title="New Household Registration" onClose={() => setIsRegisterOpen(false)}>
          <HouseholdForm onClose={() => setIsRegisterOpen(false)} />
        </ModalBase>
      )}

      {/* Edit Modal */}
      {isEditOpen && selectedHousehold && (
        <ModalBase title={`Edit Record: ${selectedHousehold.id}`} onClose={() => setIsEditOpen(false)}>
          <HouseholdForm
            initialData={selectedHousehold}
            onClose={() => setIsEditOpen(false)}
            isEdit
          />
        </ModalBase>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && selectedHousehold && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsDeleteOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete Household Record?</h3>
              <p className="text-sm text-gray-500 mt-2">
                You are about to remove <span className="font-bold text-gray-800">{selectedHousehold.head}</span> ({selectedHousehold.id}) from the directory. This action cannot be undone.
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-center">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// --- Sub-Components ---

function EmptyState({ clearFilters }: { clearFilters: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Search size={32} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-bold text-gray-900">No households found</h3>
      <p className="text-gray-500 max-w-sm mt-2 mb-6">
        Try adjusting your search or filter criteria to find what you are looking for.
      </p>
      <button
        onClick={clearFilters}
        className="text-purple-600 font-medium hover:underline text-sm"
      >
        Clear all filters
      </button>
    </div>
  );
}

function ModalBase({ title, onClose, children }: { title: string, onClose: () => void, children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-500 mt-1">Ensure all fields comply with Gulu District Data Standards.</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function HouseholdForm({ onClose, initialData = {}, isEdit = false }: { onClose: () => void, initialData?: Partial<Household>, isEdit?: boolean }) {
  return (
    <>
      <div className="flex-1 overflow-y-auto p-6">
        <form className="space-y-8">
          {/* Form Section 1 */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-[10px]">1</span>
              Identity & Demographics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputGroup label="Head of Household" placeholder="Full Name (Last, First)" defaultValue={initialData.head} />
              <InputGroup label="Phone Number" placeholder="+256 7..." type="tel" />
              <InputGroup label="National ID / NIN" placeholder="CM..." />
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="Members (Total)" placeholder="0" type="number" defaultValue={initialData.members} />
                <InputGroup label="Under 5s" placeholder="0" type="number" />
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Form Section 2 */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-[10px]">2</span>
              Location & Vulnerability
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputGroup label="Village Name" placeholder="e.g. Bwobo" defaultValue={initialData.village} />
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Parish</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none bg-white" defaultValue={initialData.parish}>
                  <option>Select Parish...</option>
                  <option>Patiko</option>
                  <option>Omoro</option>
                  <option>Paicho</option>
                  <option>Awach</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Initial Risk Assessment (HEA Score)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <RadioCard label="Low" color="border-gray-200 hover:border-purple-300" defaultChecked={initialData.riskLevel === 'Low'} />
                  <RadioCard label="Medium" color="border-yellow-200 bg-yellow-50/50" defaultChecked={initialData.riskLevel === 'Medium'} />
                  <RadioCard label="High" color="border-orange-200 bg-orange-50/50" defaultChecked={initialData.riskLevel === 'High'} />
                  <RadioCard label="Critical" color="border-red-200 bg-red-50/50" defaultChecked={initialData.riskLevel === 'Critical'} />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          Cancel
        </button>
        <button className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 shadow-md transition-all active:scale-95">
          <Save size={16} />
          {isEdit ? "Update Record" : "Save Registration"}
        </button>
      </div>
    </>
  );
}

function RiskBadge({ level }: { level: string }) {
  const styles = {
    Critical: "bg-red-50 text-red-700 ring-red-600/20",
    High: "bg-orange-50 text-orange-800 ring-orange-600/20",
    Medium: "bg-yellow-50 text-yellow-800 ring-yellow-600/20",
    Low: "bg-green-50 text-green-700 ring-green-600/20",
  };

  const style = styles[level as keyof typeof styles] || styles.Low;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold ring-1 ring-inset ${style}`}>
      {level === 'Critical' && <AlertCircle size={10} />}
      {level.toUpperCase()}
    </span>
  );
}

function InputGroup({ label, placeholder, type = "text", defaultValue }: { label: string, placeholder: string, type?: string, defaultValue?: string | number }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-700 mb-1.5">{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-colors"
        placeholder={placeholder}
      />
    </div>
  );
}

function RadioCard({ label, color, defaultChecked }: { label: string, color: string, defaultChecked?: boolean }) {
  return (
    <label className={`cursor-pointer border rounded-lg p-3 text-center transition-all hover:shadow-sm ${color} ${defaultChecked ? 'ring-2 ring-purple-500 border-purple-500' : ''}`}>
      <input type="radio" name="risk" className="sr-only" defaultChecked={defaultChecked} />
      <span className="text-xs font-bold text-gray-700">{label}</span>
    </label>
  );
}