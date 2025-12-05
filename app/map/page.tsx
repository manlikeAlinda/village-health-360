"use client";
import React, { useState, useMemo } from "react";
import {
  Filter, Layers, Map as MapIcon,
  Droplets, Activity, Users, ChevronLeft, ChevronRight,
  Maximize2, Info, CheckCircle2, Calendar, AlertTriangle,
  Play, Pause, Sliders, Menu, X, Heart, TrendingUp, DollarSign, Utensils, Wrench,
  LucideIcon, Search, ChevronDown, Globe, MapPin, School, Home,
  Download, Share2
} from "lucide-react";

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

// --- Domain Configuration ---
const PRIMARY_COLOR = "text-[#004AAD]";
const PRIMARY_BG = "bg-[#004AAD]"; // Using the Deep Blue from design system
const SECONDARY_BG = "bg-[#7c3aed]"; // Purple accent from screenshot for buttons

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

// --- Components ---

// 1. Map Component (Center Panel)
const MapWrapper = ({ location }: { location: string }) => {
  const mapQuery = useMemo(() => {
    const baseLocation = location === "National" ? "Uganda" : `${location}, Uganda`;
    return encodeURIComponent(baseLocation);
  }, [location]);

  return (
    <div className="w-full h-full bg-slate-100 relative overflow-hidden group">
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
        title={`Map of ${location}`}
      ></iframe>
      <div className="absolute inset-0 pointer-events-none border border-black/5"></div>
    </div>
  );
};

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

// 3. Checkbox Group Component (Left Panel)
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Map Layer State
  const [mapLayers, setMapLayers] = useState({
    households: true,
    waterPoints: true,
    healthFacilities: true,
    schools: false,
    latrines: false
  });

  const allDistricts = useMemo(() => getAllDistricts(), []);
  const subcounties = useMemo(() => getSubcounties(selectedDistrict), [selectedDistrict]);

  return (
    <div className="min-h-screen bg-[#F7F8F9] font-sans text-slate-800 p-4 md:p-8 mt-16 flex flex-col h-screen overflow-hidden">

      {/* 1. Executive Header */}
      <header className="flex flex-col gap-6 border-b border-gray-200 pb-6 shrink-0">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Geospatial Hub</h1>
            <p className="text-gray-500 font-medium mt-1">
              Live operational map for <strong className="text-gray-900">{selectedDistrict || "National"}</strong>
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
              <FilterSelect label="Parish" placeholder="Select Parish" options={[]} disabled={true} />
              <FilterSelect label="Village" placeholder="Select Village" options={[]} disabled={true} />
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

          {/* Apply Button Footer */}
          <div className="p-4 border-t border-gray-100 bg-white">
            <button className={`w-full py-3 rounded-lg text-white font-bold text-sm shadow-md hover:opacity-90 transition-opacity ${SECONDARY_BG}`}>
              Apply Filters
            </button>
          </div>
        </aside>

        {/* 2.2 Center Panel: Operational Map */}
        <main className="flex-1 relative bg-slate-200 flex flex-col min-w-0">
          {/* Map Header / Controls */}
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-1 flex">
              <button className="px-3 py-1.5 text-xs font-bold bg-[#004AAD] text-white rounded shadow-sm">Standard</button>
              <button className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-50 rounded">Satellite</button>
            </div>
          </div>

          {/* Floating Layer Control (Top Right) */}
          <div className="absolute top-16 right-4 z-10 bg-white/95 backdrop-blur rounded-xl border border-gray-200 shadow-lg p-3 w-48">
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
                      checked={mapLayers[layer.key as keyof typeof mapLayers]}
                      onChange={() => setMapLayers(prev => ({ ...prev, [layer.key]: !prev[layer.key as keyof typeof mapLayers] }))}
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
          <div className="w-full h-full">
            <MapWrapper location={selectedDistrict || "Gulu"} />
          </div>

          {/* Legend (Bottom Left) */}
          <div className="absolute bottom-6 left-6 z-10 bg-white/95 backdrop-blur p-4 rounded-xl border border-gray-200 shadow-lg w-40">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">Legend</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                <span className="text-xs text-gray-600">Households</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                <span className="text-xs text-gray-600">Water Points</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                <span className="text-xs text-gray-600">Health Facility</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                <span className="text-xs text-gray-600">Schools</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-800"></div>
                <span className="text-xs text-gray-600">Latrines</span>
              </div>
            </div>
          </div>

          {/* Zoom Controls (Simulated position based on screenshot) */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <button className="p-2 hover:bg-gray-50 border-b border-gray-100 text-gray-600">+</button>
            <button className="p-2 hover:bg-gray-50 text-gray-600">-</button>
          </div>
        </main>

        {/* 2.3 Right Panel: Quick Stats */}
        <aside className="w-[300px] bg-white border-l border-gray-200 flex flex-col z-20 shadow-sm shrink-0 overflow-y-auto custom-scrollbar">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="font-bold text-gray-800 text-sm">Quick Stats (Visible Area)</h2>
          </div>

          <div className="p-5 space-y-6">
            {/* Households Mapped */}
            <div>
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Households Mapped</h3>
              <div className="text-3xl font-extrabold text-gray-900 tracking-tight">1,240</div>
            </div>

            {/* WASH Coverage */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">WASH Coverage</h3>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium text-gray-700">
                  <span>Access to Clean Water</span>
                  <span>84%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[84%] rounded-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium text-gray-700">
                  <span>Functional Latrines</span>
                  <span>42%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[42%] rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Critical Alerts */}
            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
              <h3 className="text-[10px] font-bold text-red-800 uppercase tracking-widest mb-3 flex items-center gap-1">
                Critical Alerts
              </h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <AlertTriangle size={14} className="text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-red-900">Maternal Risk</div>
                    <div className="text-[11px] text-red-700 leading-tight">12 households need follow up</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Activity size={14} className="text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-red-900">Child Malnutrition</div>
                    <div className="text-[11px] text-red-700 leading-tight">Hotspot detected in Sector A</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Avg Distance */}
            <div className="pt-2">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Avg. Distance to Facility</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="p-1 bg-orange-100 rounded text-orange-600"><Heart size={12} /></div>
                    Health Center
                  </div>
                  <span className="font-bold text-gray-900">4.2 km</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="p-1 bg-blue-100 rounded text-blue-600"><Droplets size={12} /></div>
                    Water Point
                  </div>
                  <span className="font-bold text-green-600">0.8 km</span>
                </div>
              </div>
            </div>

            {/* Agri Data */}
            <div className="p-4 bg-green-50/50 rounded-xl border border-green-100/50">
              <h3 className="text-[10px] font-bold text-green-800 uppercase tracking-widest mb-2">Agri-Data</h3>
              <div className="space-y-1">
                <div className="text-xs text-gray-700">Projected Maize Yield: <span className="font-bold text-gray-900">High</span></div>
                <div className="text-xs text-gray-700">Drought Risk: <span className="font-bold text-red-500">Low</span></div>
              </div>
            </div>

          </div>
        </aside>

      </div>
    </div>
  );
}