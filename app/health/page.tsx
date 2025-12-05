"use client";
import React, { useState, useMemo } from "react";
import {
  Activity, Baby, Syringe, HeartPulse,
  TrendingUp, AlertCircle, Calendar, LucideIcon,
  ArrowUpRight, ArrowDownRight, MapPin, Phone,
  Users, Layers, Package, Truck, FileText, ChevronDown, Filter,
  Download, Share2, AlertTriangle, CheckCircle2,
  DollarSign, Search, X
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, ReferenceLine, Legend, Cell, AreaChart, Area, ComposedChart,
  LabelList
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
  return 0.6 + ((val % 80) / 100);
};

// --- Domain Configuration ---
const PRIMARY_COLOR = "#004AAD";
const CRITICAL_COLOR = "#EF4444";
const WARNING_COLOR = "#F59E0B";
const SUCCESS_COLOR = "#10B981";

// --- Component System ---

interface HealthStatProps {
  label: string;
  value: string;
  trend: string;
  trendDir: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  intent: 'brand' | 'warning' | 'success' | 'danger';
  subtext?: string;
}

function HealthStat({ label, value, trend, trendDir, icon: Icon, intent, subtext }: HealthStatProps) {
  const styles = {
    brand: "bg-blue-50 text-blue-700 border-blue-200",
    warning: "bg-orange-50 text-orange-700 border-orange-200",
    success: "bg-green-50 text-green-700 border-green-200",
    danger: "bg-red-50 text-red-700 border-red-200",
  };

  const trendColor = trendDir === 'up' && intent !== 'warning' && intent !== 'danger' ? "text-green-600" : "text-gray-500";
  const TrendIcon = trendDir === 'up' ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start">
        <div className={`p-2.5 rounded-xl border ${styles[intent]}`}>
          <Icon size={20} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-gray-50 ${trendColor}`}>
          <TrendIcon size={12} /> {trend}
        </div>
      </div>
      <div className="mt-4">
        <h4 className="text-2xl font-bold text-gray-900 tracking-tight">{value}</h4>
        <p className="text-sm font-medium text-gray-500 mt-0.5">{label}</p>
        {subtext && <p className="text-[10px] text-gray-400 mt-2 border-t border-gray-50 pt-2">{subtext}</p>}
      </div>
    </div>
  );
}

// Simple Filter Select Component
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

export default function PublicHealthTriage() {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedSubcounty, setSelectedSubcounty] = useState<string | null>(null);

  // --- Derived Data Logic ---
  const allDistricts = useMemo(() => getAllDistricts(), []);
  const subcounties = useMemo(() => getSubcounties(selectedDistrict), [selectedDistrict]);
  const currentLocation = selectedSubcounty || selectedDistrict || "National";

  const seed = currentLocation;
  const multiplier = useMemo(() => getSeedMultiplier(seed), [seed]);

  // --- Dynamic Data Generators ---

  const kpiData = {
    livesSaved: Math.floor(412 * multiplier).toLocaleString(),
    costPerChild: (18.50 * (2 - multiplier)).toFixed(2),
    stockRisk: multiplier > 1.1 ? "High" : multiplier > 0.9 ? "Moderate" : "Low",
    vhtRate: Math.min(99, Math.floor(94 * multiplier)) + "%"
  };

  const diseaseData = useMemo(() => [
    { month: "Jan", malaria: +(6.5 * multiplier).toFixed(1), diarrhea: +(4.0 * multiplier).toFixed(1), threshold: 7.5, projected: +(6.0 * multiplier).toFixed(1) },
    { month: "Feb", malaria: +(5.9 * multiplier).toFixed(1), diarrhea: +(3.5 * multiplier).toFixed(1), threshold: 7.5, projected: +(5.5 * multiplier).toFixed(1) },
    { month: "Mar", malaria: +(8.0 * multiplier).toFixed(1), diarrhea: +(2.5 * multiplier).toFixed(1), threshold: 7.5, projected: +(7.0 * multiplier).toFixed(1) },
    { month: "Apr", malaria: +(8.1 * multiplier).toFixed(1), diarrhea: +(3.0 * multiplier).toFixed(1), threshold: 7.5, projected: +(7.8 * multiplier).toFixed(1) },
    { month: "May", malaria: +(5.6 * multiplier).toFixed(1), diarrhea: +(2.0 * multiplier).toFixed(1), threshold: 7.5, projected: +(5.2 * multiplier).toFixed(1) },
    { month: "Jun", malaria: +(4.0 * multiplier).toFixed(1), diarrhea: +(1.5 * multiplier).toFixed(1), threshold: 7.5, projected: +(3.8 * multiplier).toFixed(1) },
  ], [multiplier]);

  const immunizationData = useMemo(() => [
    { name: "BCG (Birth)", rate: Math.min(100, Math.floor(98 * multiplier)), fill: "#004AAD" },
    { name: "OPV1 (Wk 6)", rate: Math.min(100, Math.floor(95 * multiplier)), fill: "#2563EB" },
    { name: "DPT2 (Wk 10)", rate: Math.min(100, Math.floor(88 * multiplier)), fill: "#3B82F6" },
    { name: "DPT3 (Wk 14)", rate: Math.min(100, Math.floor(75 * multiplier)), fill: "#EF4444" },
  ], [multiplier]);

  const stockData = useMemo(() => [
    { item: "ACTs (Malaria)", level: Math.min(100, Math.floor(85 * multiplier)), status: multiplier > 1.1 ? "Healthy" : multiplier > 0.8 ? "Moderate" : "Critical" },
    { item: "ORS Sachets", level: Math.min(100, Math.floor(60 * multiplier)), status: multiplier > 1.1 ? "Healthy" : multiplier > 0.8 ? "Moderate" : "Critical" },
    { item: "Amoxicillin", level: Math.min(100, Math.floor(45 * multiplier)), status: multiplier > 1.0 ? "Moderate" : "Critical" },
    { item: "Zinc Tablets", level: Math.min(100, Math.floor(90 * multiplier)), status: "Healthy" },
  ], [multiplier]);

  const highRiskMothers = useMemo(() => [
    { id: "MN-001", name: "Nakato Sarah", riskLevel: "Critical", issue: "Pre-eclampsia, 36 weeks gestation", village: "Bukasa", action: "Refer to HC IV" },
    { id: "MN-002", name: "Namuli Grace", riskLevel: "High", issue: "Previous C-Section, ANC defaulter", village: "Kiwatule", action: "Home Visit Scheduled" },
    { id: "MN-003", name: "Apio Janet", riskLevel: "Critical", issue: "Severe anemia (Hb 6.5), 28 weeks", village: "Banda", action: "Emergency Referral" },
  ], []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 p-6 lg:p-10 mt-16">
      {/* 1. Executive Header */}
      <header className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
              Public Health Triage
            </h1>
            <p className="text-sm text-gray-500 mt-1.5 max-w-xl">
              Real-time surveillance for maternal, child, and community health outcomes across {currentLocation}.
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
        <HealthStat
          label="Est. Lives Saved (YTD)"
          value={kpiData.livesSaved}
          trend="+18% YoY"
          trendDir="up"
          icon={HeartPulse}
          intent="brand"
          subtext="Based on DALY reduction model"
        />
        <HealthStat
          label="Cost per Child Reached"
          value={`$${kpiData.costPerChild}`}
          trend="-12% vs Target"
          trendDir="down"
          icon={DollarSign}
          intent="success"
          subtext="Program efficiency metric"
        />
        <HealthStat
          label="Supply Chain Risk"
          value={kpiData.stockRisk}
          trend={kpiData.stockRisk === "High" ? "Action Needed" : "Stable"}
          trendDir={kpiData.stockRisk === "High" ? "down" : "up"}
          icon={Package}
          intent={kpiData.stockRisk === "High" ? "danger" : kpiData.stockRisk === "Moderate" ? "warning" : "success"}
          subtext="Composite score for essential meds"
        />
        <HealthStat
          label="VHT Report Rate"
          value={kpiData.vhtRate}
          trend="+3% this month"
          trendDir="up"
          icon={Activity}
          intent="brand"
          subtext="Community Surveillance Reliability"
        />
      </section>

      {/* 3. Deep Dive Analytics */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">

        {/* Left Col: Epidemiology (2/3 width) */}
        <div className="xl:col-span-2 space-y-6">

          {/* Chart A: Disease Surveillance */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Activity size={20} className="text-[#004AAD]" />
                  Disease Incidence vs. Thresholds
                </h3>
                <p className="text-xs text-gray-500 mt-1">Real-time surveillance vs. 5-year epidemic thresholds.</p>
              </div>
              <div className="flex gap-2">
                <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600"><span className="w-2 h-2 rounded-full bg-red-500"></span> Malaria</span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600"><span className="w-2 h-2 rounded-full bg-orange-400"></span> Diarrhea</span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={diseaseData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMalaria" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <ReferenceLine y={7.5} label={{ value: "Epidemic Threshold", fill: 'red', fontSize: 10 }} stroke="red" strokeDasharray="3 3" />
                  <Area type="monotone" dataKey="malaria" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorMalaria)" />
                  <Line type="monotone" dataKey="diarrhea" stroke="#F97316" strokeWidth={3} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart B: Immunization Cohort Analysis */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Syringe size={20} className="text-[#004AAD]" />
                  Immunization Cascade
                </h3>
                <p className="text-xs text-gray-500 mt-1">Tracking retention from Birth (BCG) to Week 14 (DPT3).</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={immunizationData} layout="vertical" margin={{ left: 0, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#F3F4F6" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fontWeight: 600, fill: '#374151' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="rate" radius={[0, 6, 6, 0]} barSize={28} background={{ fill: '#F9FAFB' }}>
                      {immunizationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                      <LabelList dataKey="rate" position="right" formatter={(val) => `${val}%`} style={{ fontSize: '12px', fontWeight: 'bold', fill: '#4B5563' }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Targeted Intervention Box */}
            <div className="w-full md:w-72 bg-rose-50 rounded-xl p-5 border border-rose-100 flex flex-col justify-center">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-white rounded-lg shadow-sm text-red-600">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Dropout Alert: DPT3</h4>
                  <p className="text-xs text-red-600 font-medium">Week 14 Retention &lt; 80%</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                380 children have missed their scheduled DPT3 dose. This exceeds the 5% acceptable dropout margin.
              </p>
              <button className="w-full py-2 bg-white border border-rose-200 text-rose-700 font-bold text-xs rounded-lg hover:bg-rose-100 transition shadow-sm flex items-center justify-center gap-2">
                Download Defaulter List <Download size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Supply Chain & Risk (1/3 width) */}
        <div className="space-y-6">

          {/* Supply Chain Widget */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Truck size={18} className="text-[#004AAD]" />
              Essential Meds Status
            </h3>
            <div className="space-y-4">
              {stockData.map((item) => (
                <div key={item.item}>
                  <div className="flex justify-between text-xs font-bold text-gray-700 mb-1.5">
                    <span>{item.item}</span>
                    <span className={item.status === "Critical" ? "text-red-600" : item.status === "Moderate" ? "text-orange-500" : "text-green-600"}>
                      {item.status} ({item.level}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.status === "Critical" ? "bg-red-500" :
                        item.status === "Moderate" ? "bg-orange-400" : "bg-green-500"
                        }`}
                      style={{ width: `${item.level}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-gray-200">
              View Logistics Report
            </button>
          </div>

          {/* High Risk Registry */}
          <div className="bg-white p-0 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                <Users size={16} className="text-red-600" />
                Priority Case List (Active)
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {highRiskMothers.map((mom) => (
                <div key={mom.id} className="p-4 hover:bg-gray-50 transition cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${mom.riskLevel === 'Critical' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-orange-50 text-orange-700 border-orange-100'
                        }`}>
                        {mom.riskLevel}
                      </span>
                      <h4 className="text-sm font-bold text-gray-900 mt-1">{mom.name}</h4>
                    </div>
                    <span className="text-xs text-gray-400">{mom.id}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2 font-medium">{mom.issue}</p>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    <span className="flex items-center gap-1"><MapPin size={10} /> {mom.village}</span>
                    <span>•</span>
                    <span className="text-blue-600 font-bold">{mom.action}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}