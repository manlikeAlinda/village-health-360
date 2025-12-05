"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Users, Droplets, Activity, AlertTriangle,
  MapPin, ChevronRight, Layers, Filter, Search,
  ChevronDown, X, Globe, Calendar, CheckCircle, Wrench, Baby,
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

const ALERT_CATEGORIES = ["Cholera", "Malaria", "Floods", "Drought"];

// --- Helper: Extract Flat District List ---
const getAllDistricts = () => {
  const districts: string[] = [];
  Object.values(DISTRICTS_DATA).forEach(region => {
    Object.values(region).forEach(subRegionDistricts => {
      districts.push(...subRegionDistricts);
    });
  });
  return districts.sort();
};

// --- Helper: Deterministic Random Number Generator based on String ---
const getSeededNumber = (seed: string, base: number, variance: number) => {
  const seedValue = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const factor = (seedValue % 100) / 100; // 0.00 to 0.99
  return Math.floor(base - (base * 0.2) + (variance * factor));
};

// --- Component: Accessible Searchable Combobox ---
interface ComboboxProps {
  label: string;
  options: string[];
  value: string | null;
  onChange: (val: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

const Combobox = ({ label, options, value, onChange, disabled, placeholder }: ComboboxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    return query === ""
      ? options
      : options.filter((opt) => opt.toLowerCase().includes(query.toLowerCase()));
  }, [query, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full md:w-64" ref={containerRef}>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      <div className="relative">
        <div
          className={`flex items-center w-full bg-white border rounded-lg px-3 py-2 shadow-sm transition-all
            ${disabled ? "bg-gray-100 cursor-not-allowed border-gray-200" : "hover:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 border-gray-300"}
          `}
        >
          <Search size={14} className={`mr-2 ${disabled ? "text-gray-300" : "text-gray-400"}`} />
          <input
            type="text"
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={`listbox-${label}`}
            disabled={disabled}
            placeholder={value || placeholder}
            className={`w-full bg-transparent text-sm focus:outline-none ${disabled ? "text-gray-400" : "text-gray-900"}`}
            value={isOpen ? query : (value || "")}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => {
              if (!disabled) {
                setQuery("");
                setIsOpen(true);
              }
            }}
          />
          {value && !disabled && (
            <button
              onClick={(e) => { e.stopPropagation(); onChange(null); setQuery(""); }}
              className="p-1 hover:bg-gray-100 rounded-full text-gray-400"
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown size={14} className={`ml-1 ${disabled ? "text-gray-300" : "text-gray-400"}`} />
        </div>

        {isOpen && !disabled && (
          <ul
            id={`listbox-${label}`}
            role="listbox"
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto py-1 custom-scrollbar"
          >
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-2 text-sm text-gray-400">No results found</li>
            ) : (
              filteredOptions.map((option) => (
                <li
                  key={option}
                  role="option"
                  aria-selected={value === option}
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 hover:text-blue-700
                    ${value === option ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"}
                  `}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                    setQuery("");
                  }}
                >
                  {option}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

// --- Map Component ---
const MapWrapper = ({ scope, location }: { scope: string, location: string }) => {
  // Construct a query URL for Google Maps Embed
  // Uses "Location, Uganda" to ensure accuracy
  const mapQuery = useMemo(() => {
    const baseLocation = location === "National" ? "Uganda" : `${location}, Uganda`;
    return encodeURIComponent(baseLocation);
  }, [location]);

  // Zoom levels: National = 6, District = 10, Subcounty = 12
  const zoomLevel = scope === "National" ? 7 : scope === "District" ? 11 : 13;

  return (
    <div className="w-full h-full bg-slate-100 relative overflow-hidden group">
      {/* Real Map Iframe */}
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0, minHeight: '400px' }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=${zoomLevel}&ie=UTF8&iwloc=&output=embed`}
        title={`Map of ${location}`}
      ></iframe>

      {/* Overlay Badge */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
        <p className="text-gray-600 font-medium text-xs flex items-center gap-2">
          <Globe size={12} className="text-blue-600" />
          Live View: <span className="font-bold text-gray-900">{location}</span>
        </p>
      </div>

      {/* Loading/Fallback visual (behind iframe, visible if loading) */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <span className="text-xs text-gray-400">Loading Satellite Data...</span>
        </div>
      </div>
    </div>
  );
};

const MapPinIcon = ({ color }: { color: string }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill={color} stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-lg">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3" fill="white"></circle>
  </svg>
);

// --- Types ---
type ActivityType = "Critical Alert" | "Maternal Health" | "WASH Maintenance" | "Routine Data";

interface ActivityItem {
  id: number;
  type: ActivityType;
  message: string;
  location: string;
  agent: string;
  timestamp: string;
}

interface StatsCardProps {
  label: string;
  value: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  subtext?: string;
  icon: any;
  intent: 'brand' | 'warning' | 'danger' | 'success';
}

// --- Mock Activity Data (Placeholder for structure) ---
const recentActivities: ActivityItem[] = [
  { id: 1, type: "Critical Alert", message: "Cholera symptoms reported in 3 households", location: "Koro Village, Omoro", agent: "Agent Moses", timestamp: "12 mins ago" },
  { id: 2, type: "Maternal Health", message: "New high-risk pregnancy registered (Trimester 3)", location: "Bwobo Parish", agent: "Agent Sarah", timestamp: "45 mins ago" },
  { id: 3, type: "WASH Maintenance", message: "Borehole WP-09 flagged: Pump handle broken", location: "Ajulu Center", agent: "John O. (Technician)", timestamp: "2 hours ago" },
  { id: 4, type: "Routine Data", message: "Daily Census: 15 Households verified", location: "Patiko Sub-county", agent: "Agent Grace", timestamp: "3 hours ago" }
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<string>("All");
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedSubcounty, setSelectedSubcounty] = useState<string | null>(null);
  const [activeAlertIndex, setActiveAlertIndex] = useState(0);

  // Dynamic Metadata
  useEffect(() => {
    document.title = "Dashboard";
  }, []);

  const currentScope = selectedSubcounty ? "Subcounty" : selectedDistrict ? "District" : "National";
  const currentLocationString = selectedSubcounty || selectedDistrict || "National";

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAlertIndex((prev) => (prev + 1) % ALERT_CATEGORIES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // 1. Get Real Districts
  const allDistricts = useMemo(() => getAllDistricts(), []);

  // 2. Generate Deterministic Subcounties (Since JSON stops at District level)
  const availableSubcounties = useMemo(() => {
    if (!selectedDistrict) return [];
    // Generating realistic subcounty structure based on district name to ensure feature works
    return [
      `${selectedDistrict} Central`,
      `${selectedDistrict} North`,
      `${selectedDistrict} South`,
      `${selectedDistrict} Town Council`,
      `Greater ${selectedDistrict}`
    ];
  }, [selectedDistrict]);

  const handleDistrictChange = (district: string | null) => {
    setSelectedDistrict(district);
    setSelectedSubcounty(null);
  };

  // Dynamic Metrics Generation
  const metrics = useMemo(() => {
    const seed = currentLocationString;
    const isNational = currentScope === "National";
    const isDistrict = currentScope === "District";

    const coverageBase = isNational ? 82450 : isDistrict ? 12400 : 2100;
    const agentsBase = isNational ? 842 : isDistrict ? 120 : 15;

    return {
      coverage: getSeededNumber(seed, coverageBase, 500).toLocaleString(),
      waterAccess: getSeededNumber(seed, 64, 15) + "%",
      agents: getSeededNumber(seed, agentsBase, 20).toString(),
      outbreaks: Math.floor((seed.length % 5) + 1).toString(),
    };
  }, [currentScope, currentLocationString]);

  const filteredActivities = activeTab === "All"
    ? recentActivities
    : recentActivities.filter(activity => {
      if (activeTab === "Critical") return activity.type === "Critical Alert";
      if (activeTab === "Maternal") return activity.type === "Maternal Health";
      if (activeTab === "WASH") return activity.type === "WASH Maintenance";
      return true;
    });

  return (
    <div className="min-h-screen font-sans text-slate-800 bg-[#F7F8F9] mt-8">
      <main className="space-y-6 md:space-y-8 p-4 md:p-8 max-w-[1600px] mx-auto">

        {/* 1. Executive Header */}
        <header className="flex flex-col gap-6 border-b border-gray-200 pb-6 mt-6">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
              <p className="text-gray-500 font-medium mt-1">
                Overview for <strong className="text-gray-900">{currentLocationString}</strong>
              </p>
            </div>

            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 text-sm shadow-sm transition-all">
                <Download size={16} /> Export Report
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#004AAD] text-white font-bold rounded-lg hover:bg-blue-800 text-sm shadow-md transition-all">
                <Share2 size={16} /> Share Dashboard
              </button>
            </div>
          </div>

          {/* 2. Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
              <Filter size={16} />
              <span>Filters:</span>
            </div>

            <div className="flex-1 w-full flex flex-col md:flex-row gap-4">
              <Combobox
                label="District"
                placeholder="Select District..."
                options={allDistricts}
                value={selectedDistrict}
                onChange={handleDistrictChange}
              />
              <Combobox
                label="Subcounty"
                placeholder={selectedDistrict ? "Select Subcounty..." : "Select District first"}
                options={availableSubcounties}
                value={selectedSubcounty}
                onChange={setSelectedSubcounty}
                disabled={!selectedDistrict}
              />
            </div>

            <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 text-sm font-bold transition-colors ml-auto
                ${currentScope === 'National' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                currentScope === 'District' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                  'bg-green-50 text-green-700 border-green-100'
              }
             `}>
              <Layers size={16} />
              {currentScope} Scope
            </div>
          </div>
        </header>

        {/* 3. Reactive KPI Grid */}
        <section aria-label="Key Performance Indicators" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatsCard
            label="Active Agents"
            value={metrics.agents}
            subtext="98% Reporting Rate"
            icon={Activity}
            intent="success"
          />
          <StatsCard
            label="Household Coverage"
            value={metrics.coverage}
            trend={currentScope === 'National' ? "+120 this week" : "+12 this week"}
            trendDirection="up"
            icon={Users}
            intent="brand"
          />
          <StatsCard
            label="Safe Water Access"
            value={metrics.waterAccess}
            trend="-2% vs last month"
            trendDirection="down"
            icon={Droplets}
            intent="warning"
          />

          <StatsCard
            label={`Active ${ALERT_CATEGORIES[activeAlertIndex]}`}
            value={metrics.outbreaks}
            subtext="Requires Intervention"
            icon={AlertTriangle}
            intent="danger"
          />
        </section>

        {/* 4. Operational View */}
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-[600px]">

          <div className="xl:col-span-8 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden relative group">
            <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <MapPin size={16} className="text-[#004AAD]" />
                Geospatial Distribution
              </h3>
            </div>

            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <button className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition" aria-label="Map Layers">
                <Layers size={18} className="text-gray-600" />
              </button>
            </div>

            <div className="flex-1 bg-slate-100 relative w-full h-full min-h-[400px]">
              <MapWrapper scope={currentScope} location={currentLocationString} />
            </div>

            <div className="p-3 border-t border-gray-100 bg-white text-xs text-gray-500 flex justify-between">
              <span>Data updated: Real-time</span>
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#F44336]"></span> Critical
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#FF9800]"></span> WASH
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#2196F3]"></span> Health
                </span>
              </span>
            </div>
          </div>

          <div className="xl:col-span-4 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col">
            <div className="p-5 border-b border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900">Field Stream</h3>
                <button className="text-gray-400 hover:text-[#004AAD] transition">
                  <Filter size={18} />
                </button>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {['All', 'Critical', 'Maternal', 'WASH'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${activeTab === tab
                      ? 'bg-[#004AAD] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
              <div className="flex flex-col divide-y divide-gray-50">
                {filteredActivities.length > 0 ? (
                  filteredActivities.map((activity) => (
                    <ActivityRow
                      key={activity.id}
                      data={activity}
                    />
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-400 text-sm">
                    No activities found for this category.
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
              <button className="w-full py-2.5 text-sm text-gray-600 font-medium border border-gray-200 bg-white rounded-lg hover:bg-gray-50 hover:border-gray-300 transition shadow-sm flex items-center justify-center gap-2">
                View Previous Shift <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

// --- Component System ---

function StatsCard({ label, value, trend, trendDirection, subtext, icon: Icon, intent }: StatsCardProps) {
  const styles = {
    brand: "bg-[#004AAD]/10 text-[#004AAD] border-[#004AAD]/20",
    warning: "bg-[#FF9800]/10 text-[#FF9800] border-[#FF9800]/20",
    danger: "bg-[#F44336]/10 text-[#F44336] border-[#F44336]/20",
    success: "bg-[#4CAF50]/10 text-[#4CAF50] border-[#4CAF50]/20",
  };

  return (
    <div className="group bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-[#004AAD]/30 transition-all duration-300 relative overflow-hidden">
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3 rounded-xl ${styles[intent]} transition-transform group-hover:scale-110 duration-300`}>
          <Icon size={24} strokeWidth={2} />
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${trendDirection === 'up' ? 'bg-[#4CAF50]/10 text-[#4CAF50]' : 'bg-[#F44336]/10 text-[#F44336]'
            }`}>
            {trend}
          </span>
        )}
      </div>
      <div className="relative z-10">
        <h4 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">{label}</h4>
        <div className="text-3xl font-bold text-gray-900 tracking-tight tabular-nums transition-all duration-500">
          {value}
        </div>
        {subtext && (
          <p className="text-xs text-gray-400 mt-2 font-medium flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${intent === 'danger' ? 'bg-[#F44336] animate-pulse' : 'bg-gray-300'}`} />
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}

function ActivityRow({ data }: { data: ActivityItem }) {
  const getStyles = (type: ActivityType) => {
    switch (type) {
      case "Critical Alert":
        return { icon: AlertTriangle, bg: "bg-[#F44336]/10", text: "text-[#F44336]", border: "border-l-4 border-[#F44336]" };
      case "Maternal Health":
        return { icon: Baby, bg: "bg-[#2196F3]/10", text: "text-[#2196F3]", border: "border-l-4 border-[#2196F3]" };
      case "WASH Maintenance":
        return { icon: Wrench, bg: "bg-[#FF9800]/10", text: "text-[#FF9800]", border: "border-l-4 border-[#FF9800]" };
      case "Routine Data":
        return { icon: CheckCircle, bg: "bg-[#2196F3]/10", text: "text-[#2196F3]", border: "border-l-4 border-[#2196F3]" };
    }
  };

  const style = getStyles(data.type);
  const Icon = style.icon;

  return (
    <div className={`relative p-4 hover:bg-gray-50 transition-colors cursor-pointer group ${style.border} pl-4`}>
      <div className="flex gap-3">
        <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${style.bg} ${style.text}`}>
          <Icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-0.5">
            <span className="text-xs font-bold text-gray-900 uppercase tracking-wide">{data.type}</span>
            <span className="text-[10px] font-medium text-gray-400">{data.timestamp}</span>
          </div>
          <p className="text-sm text-gray-600 font-medium leading-snug mb-2 group-hover:text-gray-900">
            {data.message}
          </p>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1 hover:text-[#004AAD] transition-colors">
              <Users size={12} /> {data.agent}
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <span>{data.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
}