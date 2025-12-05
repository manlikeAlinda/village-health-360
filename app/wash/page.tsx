"use client";
import React, { useState, useMemo } from "react";
import {
  Droplets, Wrench, Ban, CheckCircle2,
  MapPin, AlertOctagon, Hammer, ArrowRight,
  MoreHorizontal, LucideIcon, Info, Filter, ChevronDown, X,
  Download, Share2, Search, ArrowUpRight, ArrowDownRight,
  RefreshCw
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from "recharts";

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

// --- Data Perturbation Logic ---
const getSeedMultiplier = (seed: string) => {
  if (!seed || seed === "National") return 1;
  const val = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return 0.7 + ((val % 60) / 100);
};

// --- UI Components ---

// 1. Stat Card with Trend Micro-Interaction
interface WashStatProps {
  label: string;
  value: string;
  subtext: string;
  icon: LucideIcon;
  intent: 'brand' | 'success' | 'warning' | 'danger';
}

function WashStat({ label, value, subtext, icon: Icon, intent }: WashStatProps) {
  const theme = {
    brand: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100", icon: "text-blue-600" },
    success: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100", icon: "text-emerald-600" },
    warning: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100", icon: "text-amber-600" },
    danger: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-100", icon: "text-rose-600" },
  };

  const currentTheme = theme[intent];

  return (
    <div className={`
      relative overflow-hidden bg-white p-5 rounded-2xl border border-gray-100 shadow-sm 
      hover:shadow-md hover:border-gray-200 transition-all duration-300 group
    `}>
      <div className="flex justify-between items-start z-10 relative">
        <div className={`p-3 rounded-xl ${currentTheme.bg} ${currentTheme.icon} group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
        {/* Decorative background element */}
        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${currentTheme.bg} opacity-50 blur-2xl group-hover:opacity-100 transition-opacity`} />
      </div>

      <div className="mt-4 relative z-10">
        <h4 className="text-2xl font-bold text-gray-900 tracking-tight">{value}</h4>
        <p className="text-sm font-medium text-gray-500 mt-1">{label}</p>

        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-50">
          <span className={`text-xs font-bold ${currentTheme.text} flex items-center gap-1`}>
            {intent === 'danger' || intent === 'warning' ? <AlertOctagon size={12} /> : <CheckCircle2 size={12} />}
            {subtext}
          </span>
        </div>
      </div>
    </div>
  );
}

// 2. Modern Filter Select
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

// --- Main Page Component ---
export default function WashPage() {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedSubcounty, setSelectedSubcounty] = useState<string | null>(null);

  // --- Derived Data Logic ---
  const allDistricts = useMemo(() => getAllDistricts(), []);
  const subcounties = useMemo(() => getSubcounties(selectedDistrict), [selectedDistrict]);
  const currentLocation = selectedSubcounty || selectedDistrict || "National";

  const seed = currentLocation;
  const multiplier = useMemo(() => getSeedMultiplier(seed), [seed]);

  // --- Dynamic Data Generators ---
  const safeWaterRate = Math.min(98, Math.max(45, Math.floor(68 * multiplier)));
  const latrineCoverage = Math.min(99, Math.max(50, Math.floor(79 * multiplier)));
  const activeBreakdowns = Math.floor(12 / multiplier);
  const waterDistance = (1.2 / multiplier).toFixed(1);

  const waterSourceData = useMemo(() => [
    { name: "Safe (Borehole/Tap)", value: safeWaterRate, color: "#0EA5E9" },
    { name: "Unsafe (River/Pond)", value: 100 - safeWaterRate, color: "#F43F5E" },
  ], [safeWaterRate]);

  const sanitationData = useMemo(() => [
    { name: "VIP Latrine", count: Math.floor(450 * multiplier), fill: "#10B981" },
    { name: "Traditional Pit", count: Math.floor(1200 * multiplier), fill: "#F59E0B" },
    { name: "Shared", count: Math.floor(300 / multiplier), fill: "#6366F1" },
    { name: "None (OD)", count: Math.floor(150 / multiplier), fill: "#EF4444" },
  ], [multiplier]);

  const brokenInfrastructure = useMemo(() => [
    { id: "WP-09", type: "Borehole", location: selectedDistrict ? `${selectedDistrict} Center` : "Bwobo Village", issue: "Pump Handle Broken", daysDown: 4, mechanic: "Unassigned", priority: "High" },
    { id: "WP-12", type: "Tap Stand", location: selectedDistrict ? `${selectedDistrict} Mkt` : "Koro Market", issue: "Leaking Pipe", daysDown: 2, mechanic: "John O.", priority: "Medium" },
    { id: "WP-44", type: "Protected Spring", location: selectedDistrict ? `${selectedDistrict} North` : "Ajulu", issue: "Contaminated Runoff", daysDown: 1, mechanic: "Pending", priority: "High" },
    { id: "WP-51", type: "Rain Tank", location: selectedDistrict ? `${selectedDistrict} Sch` : "Odek Primary", issue: "Gutter Blockage", daysDown: 7, mechanic: "Pending", priority: "Low" },
  ].slice(0, activeBreakdowns > 8 ? 4 : 3), [selectedDistrict, activeBreakdowns]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 p-6 lg:p-10 mt-16">
      {/* 1. Executive Header */}
      <header className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
              WASH Infrastructure
            </h1>
            <p className="text-sm text-gray-500 mt-1.5 max-w-xl">
              Water, Sanitation & Hygiene monitoring across {currentLocation}.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm">
              <Download size={16} /> Export Report
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#004AAD] rounded-xl hover:bg-[#003a8c] transition shadow-sm">
              <Share2 size={16} /> Share Dashboard
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
          {(selectedDistrict || selectedSubcounty) && (
            <button
              onClick={() => {
                setSelectedDistrict(null);
                setSelectedSubcounty(null);
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
        <WashStat
          label="Safe Water Coverage"
          value={`${safeWaterRate}%`}
          subtext="Target: 80% by Q4"
          icon={CheckCircle2}
          intent={safeWaterRate > 70 ? "success" : "warning"}
        />
        <WashStat
          label="Latrine Coverage"
          value={`${latrineCoverage}%`}
          subtext="+5% vs Last Year"
          icon={Ban}
          intent={latrineCoverage > 80 ? "success" : "warning"}
        />
        <WashStat
          label="Active Breakdowns"
          value={activeBreakdowns.toString()}
          subtext="Avg Downtime: 3.2 Days"
          icon={AlertOctagon}
          intent={activeBreakdowns > 5 ? "danger" : "brand"}
        />
        <WashStat
          label="Avg. Water Distance"
          value={`${waterDistance} km`}
          subtext="Target: < 0.5 km"
          icon={MapPin}
          intent={Number(waterDistance) > 1.0 ? "warning" : "success"}
        />
      </section>

      {/* 3. Visualization Layer */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* Chart A: Source Safety */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Droplets size={20} className="text-[#004AAD]" />
                Source Safety Analysis
              </h3>
              <p className="text-xs text-gray-500 mt-1">Potable vs. Contaminated Sources</p>
            </div>
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
              Total: 1,240 Sources
            </div>
          </div>

          <div className="h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={waterSourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {waterSourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '13px', fontWeight: 600 }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Donut Center Label */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
              <span className="text-4xl font-extrabold text-slate-800 block">{safeWaterRate}%</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Safe</span>
            </div>
          </div>
        </div>

        {/* Chart B: Sanitation Quality */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Ban size={20} className="text-[#004AAD]" />
                Sanitation Infrastructure
              </h3>
              <p className="text-xs text-gray-500 mt-1">Facility Types & Hygiene Standards</p>
            </div>
            <div className="group relative">
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#004AAD] transition-colors">
                <Info size={18} />
              </button>
              <div className="absolute right-0 top-full mt-2 w-64 p-4 bg-slate-800 text-white text-xs rounded-xl shadow-xl z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                <p className="font-bold mb-1">Standard Definitions:</p>
                <p className="text-slate-300 leading-relaxed">VIP Latrines include ventilation pipes to reduce odors and vectors, qualifying as "Improved Sanitation".</p>
              </div>
            </div>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sanitationData} layout="vertical" margin={{ left: 80, right: 20, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#F1F5F9" />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={90}
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: 'none' }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={32} background={{ fill: '#F8FAFC' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* 4. Action Layer - Data Grid */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
              <Hammer size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Maintenance Queue</h3>
              <p className="text-xs text-gray-500 font-medium">Prioritized Repair Tickets</p>
            </div>
          </div>
          <button className="text-sm font-bold text-[#004AAD] hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
            View Full Log <ArrowRight size={16} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs uppercase tracking-wider text-gray-500 font-bold border-b border-gray-100">
                <th className="px-6 py-4">Asset ID / Type</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Issue Diagnosis</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {brokenInfrastructure.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 text-sm">{item.type}</div>
                    <div className="text-xs font-mono text-gray-400 mt-0.5">{item.id}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-gray-400" />
                      {item.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <span className="font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded text-xs">
                      {item.issue}
                    </span>
                    <div className="text-xs text-gray-400 mt-1">{item.daysDown} Days Downtime</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.mechanic === "Unassigned" ? "bg-amber-400" : "bg-blue-500"}`}></div>
                      <span className="text-sm font-medium text-gray-700">{item.mechanic}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wide
                               ${item.priority === 'High' ? 'bg-rose-100 text-rose-700' :
                        item.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}
                            `}>
                      {item.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}