"use client";
import React, { useState, useMemo } from "react";
import {
  Activity, Baby, Syringe, HeartPulse,
  TrendingUp, AlertCircle, Calendar, LucideIcon,
  ArrowUpRight, ArrowDownRight, MapPin, Pill,
  Users, Shield, ChevronDown, Filter,
  Download, Share2, AlertTriangle,
  Heart, Thermometer, X
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, ReferenceLine, Cell, AreaChart, Area, ComposedChart,
  LabelList, PieChart, Pie
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
const MALARIA_COLOR = "#EF4444";
const HIV_COLOR = "#8B5CF6";
const MATERNAL_COLOR = "#EC4899";

// --- Domain Badge Component ---
function DomainBadge({ domain }: { domain: 'maternal' | 'hiv' | 'malaria' }) {
  const styles = {
    maternal: "bg-pink-100 text-pink-700 border-pink-200",
    hiv: "bg-purple-100 text-purple-700 border-purple-200",
    malaria: "bg-red-100 text-red-700 border-red-200"
  };
  const labels = { maternal: "Maternal", hiv: "HIV", malaria: "Malaria" };
  return (
    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide ${styles[domain]}`}>
      {labels[domain]}
    </span>
  );
}

// --- Component System ---
interface HealthStatProps {
  label: string;
  value: string;
  trend: string;
  trendDir: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  intent: 'brand' | 'warning' | 'success' | 'danger' | 'purple' | 'pink';
  subtext?: string;
}

function HealthStat({ label, value, trend, trendDir, icon: Icon, intent, subtext }: HealthStatProps) {
  const styles: Record<string, string> = {
    brand: "bg-blue-50 text-blue-700 border-blue-200",
    warning: "bg-orange-50 text-orange-700 border-orange-200",
    success: "bg-green-50 text-green-700 border-green-200",
    danger: "bg-red-50 text-red-700 border-red-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    pink: "bg-pink-50 text-pink-700 border-pink-200",
  };

  const trendColor = trendDir === 'up' && intent !== 'warning' && intent !== 'danger' ? "text-green-600" : trendDir === 'down' ? "text-red-500" : "text-gray-500";
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

// Domain Tab Component
const DomainTab = ({ active, label, color, onClick }: { active: boolean; label: string; color: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${active ? `${color} text-white shadow-sm` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
  >
    {label}
  </button>
);

export default function PublicHealthTriage() {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedSubcounty, setSelectedSubcounty] = useState<string | null>(null);
  const [activeDomainTab, setActiveDomainTab] = useState<'malaria' | 'hiv' | 'maternal'>('malaria');

  // --- Derived Data Logic ---
  const allDistricts = useMemo(() => getAllDistricts(), []);
  const subcounties = useMemo(() => getSubcounties(selectedDistrict), [selectedDistrict]);
  const currentLocation = selectedSubcounty || selectedDistrict || "National";

  const seed = currentLocation;
  const multiplier = useMemo(() => getSeedMultiplier(seed), [seed]);

  // --- DOMAIN-SPECIFIC KPI DATA ---
  const kpiData = {
    // Malaria
    itnCoverage: Math.min(99, Math.floor(78 * multiplier)) + "%",
    malariaIncidence: (12.4 * multiplier).toFixed(1),
    // HIV
    artRetention: Math.min(99, Math.floor(92 * multiplier)) + "%",
    viralSuppression: Math.min(99, Math.floor(88 * multiplier)) + "%",
    // Maternal
    skillBirthAtt: Math.min(99, Math.floor(74 * multiplier)) + "%",
    anc4Coverage: Math.min(99, Math.floor(62 * multiplier)) + "%",
    // Cross-cutting
    highRiskCases: Math.floor(23 * multiplier)
  };

  // --- MALARIA + HIV SURVEILLANCE DATA ---
  const malariaHivData = useMemo(() => [
    { month: "Jan", malaria: +(6.5 * multiplier).toFixed(1), hivPositivity: +(4.2 * multiplier).toFixed(1), malariaThreshold: 7.5 },
    { month: "Feb", malaria: +(5.9 * multiplier).toFixed(1), hivPositivity: +(4.0 * multiplier).toFixed(1), malariaThreshold: 7.5 },
    { month: "Mar", malaria: +(8.0 * multiplier).toFixed(1), hivPositivity: +(3.8 * multiplier).toFixed(1), malariaThreshold: 7.5 },
    { month: "Apr", malaria: +(8.1 * multiplier).toFixed(1), hivPositivity: +(4.1 * multiplier).toFixed(1), malariaThreshold: 7.5 },
    { month: "May", malaria: +(5.6 * multiplier).toFixed(1), hivPositivity: +(3.9 * multiplier).toFixed(1), malariaThreshold: 7.5 },
    { month: "Jun", malaria: +(4.0 * multiplier).toFixed(1), hivPositivity: +(3.7 * multiplier).toFixed(1), malariaThreshold: 7.5 },
  ], [multiplier]);

  // --- PMTCT CASCADE DATA (HIV) ---
  const pmtctData = useMemo(() => [
    { name: "ANC HIV Testing", rate: Math.min(100, Math.floor(96 * multiplier)), fill: "#8B5CF6" },
    { name: "HIV+ Identified", rate: Math.min(100, Math.floor(98 * multiplier)), fill: "#A78BFA" },
    { name: "ARV Initiated", rate: Math.min(100, Math.floor(94 * multiplier)), fill: "#C4B5FD" },
    { name: "Infant Tested", rate: Math.min(100, Math.floor(82 * multiplier)), fill: "#DDD6FE" },
  ], [multiplier]);

  // --- ANC CASCADE DATA (MATERNAL) ---
  const ancCascadeData = useMemo(() => [
    { name: "ANC 1", rate: Math.min(100, Math.floor(97 * multiplier)), fill: "#EC4899" },
    { name: "ANC 4+", rate: Math.min(100, Math.floor(62 * multiplier)), fill: "#F472B6" },
    { name: "Facility Delivery", rate: Math.min(100, Math.floor(74 * multiplier)), fill: "#F9A8D4" },
    { name: "PNC within 48h", rate: Math.min(100, Math.floor(58 * multiplier)), fill: "#FBCFE8" },
  ], [multiplier]);

  // --- DOMAIN-SPECIFIC SUPPLY CHAIN DATA ---
  const supplyData = useMemo(() => ({
    malaria: [
      { item: "ACTs (Coartem)", level: Math.min(100, Math.floor(85 * multiplier)), status: multiplier > 1.1 ? "Healthy" : multiplier > 0.8 ? "Moderate" : "Critical" },
      { item: "ITNs (Bed Nets)", level: Math.min(100, Math.floor(72 * multiplier)), status: multiplier > 1.0 ? "Healthy" : multiplier > 0.7 ? "Moderate" : "Critical" },
      { item: "mRDTs", level: Math.min(100, Math.floor(68 * multiplier)), status: multiplier > 0.9 ? "Moderate" : "Critical" },
    ],
    hiv: [
      { item: "ARVs (TLD)", level: Math.min(100, Math.floor(91 * multiplier)), status: "Healthy" },
      { item: "HIV Test Kits", level: Math.min(100, Math.floor(78 * multiplier)), status: multiplier > 1.0 ? "Healthy" : "Moderate" },
      { item: "Viral Load Reagents", level: Math.min(100, Math.floor(55 * multiplier)), status: multiplier > 0.9 ? "Moderate" : "Critical" },
    ],
    maternal: [
      { item: "Oxytocin", level: Math.min(100, Math.floor(82 * multiplier)), status: multiplier > 1.0 ? "Healthy" : "Moderate" },
      { item: "Magnesium Sulfate", level: Math.min(100, Math.floor(65 * multiplier)), status: multiplier > 0.9 ? "Moderate" : "Critical" },
      { item: "Misoprostol", level: Math.min(100, Math.floor(88 * multiplier)), status: "Healthy" },
    ]
  }), [multiplier]);

  // --- HIGH-RISK CASES (ALL DOMAINS) ---
  const highRiskCases = useMemo(() => [
    { id: "MN-001", name: "Nakato Sarah", domain: "maternal" as const, riskLevel: "Critical", issue: "Pre-eclampsia, 36 weeks gestation", village: "Bukasa", action: "Refer to HC IV" },
    { id: "HV-042", name: "Kato Moses", domain: "hiv" as const, riskLevel: "High", issue: "Unsuppressed VL (12,000 copies), 6mo on ART", village: "Ntinda", action: "Enhanced Adherence Counseling" },
    { id: "MN-002", name: "Namuli Grace", domain: "maternal" as const, riskLevel: "High", issue: "Previous C-Section, ANC defaulter", village: "Kiwatule", action: "Home Visit Scheduled" },
    { id: "HV-089", name: "Lwanga Peter", domain: "hiv" as const, riskLevel: "Critical", issue: "ART defaulter (45 days), PMTCT exposed infant", village: "Makindye", action: "Urgent Tracing Required" },
    { id: "MN-003", name: "Apio Janet", domain: "maternal" as const, riskLevel: "Critical", issue: "Severe anemia (Hb 6.5), 28 weeks", village: "Banda", action: "Emergency Referral" },
  ], []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 p-6 lg:p-10 mt-16">
      {/* 1. Executive Header */}
      <header className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
              Priority Health Surveillance
            </h1>
            <p className="text-sm text-gray-500 mt-1.5 max-w-xl">
              National dashboard for <span className="font-semibold text-pink-600">Maternal Health</span>, <span className="font-semibold text-purple-600">HIV</span>, and <span className="font-semibold text-red-600">Malaria</span> programs across {currentLocation}.
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

      {/* 2. Domain-Specific KPI Section */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <HealthStat
          label="ITN Coverage"
          value={kpiData.itnCoverage}
          trend="+5% QoQ"
          trendDir="up"
          icon={Shield}
          intent="danger"
          subtext="Malaria prevention indicator"
        />
        <HealthStat
          label="ART Retention (12mo)"
          value={kpiData.artRetention}
          trend="+2.1% YoY"
          trendDir="up"
          icon={Pill}
          intent="purple"
          subtext="HIV treatment continuity"
        />
        <HealthStat
          label="Skilled Birth Attendance"
          value={kpiData.skillBirthAtt}
          trend="+8% vs baseline"
          trendDir="up"
          icon={Baby}
          intent="pink"
          subtext="Maternal mortality reduction proxy"
        />
        <HealthStat
          label="High-Risk Cases Active"
          value={kpiData.highRiskCases.toString()}
          trend="3 new this week"
          trendDir="neutral"
          icon={AlertTriangle}
          intent="warning"
          subtext="Across all three domains"
        />
      </section>

      {/* 3. Deep Dive Analytics */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">

        {/* Left Col: Surveillance (2/3 width) */}
        <div className="xl:col-span-2 space-y-6">

          {/* Chart A: Malaria & HIV Surveillance */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Activity size={20} className="text-[#004AAD]" />
                  Malaria & HIV Surveillance
                </h3>
                <p className="text-xs text-gray-500 mt-1">Monthly incidence rates per 1,000 population.</p>
              </div>
              <div className="flex gap-3">
                <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600"><span className="w-2 h-2 rounded-full bg-red-500"></span> Malaria</span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600"><span className="w-2 h-2 rounded-full bg-purple-500"></span> HIV Positivity</span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={malariaHivData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMalaria" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={MALARIA_COLOR} stopOpacity={0.1} />
                      <stop offset="95%" stopColor={MALARIA_COLOR} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <ReferenceLine y={7.5} label={{ value: "Malaria Epidemic Threshold", fill: 'red', fontSize: 10 }} stroke="red" strokeDasharray="3 3" />
                  <Area type="monotone" dataKey="malaria" stroke={MALARIA_COLOR} strokeWidth={3} fillOpacity={1} fill="url(#colorMalaria)" name="Malaria Incidence" />
                  <Line type="monotone" dataKey="hivPositivity" stroke={HIV_COLOR} strokeWidth={3} dot={false} name="HIV Positivity %" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart B: PMTCT & ANC Cascades */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="grid md:grid-cols-2 gap-8">
              {/* PMTCT Cascade */}
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Shield size={20} className="text-purple-600" />
                    PMTCT Cascade
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Prevention of Mother-to-Child HIV Transmission</p>
                </div>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pmtctData} layout="vertical" margin={{ left: 0, right: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#F3F4F6" />
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11, fontWeight: 600, fill: '#374151' }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'transparent' }} />
                      <Bar dataKey="rate" radius={[0, 6, 6, 0]} barSize={24} background={{ fill: '#F9FAFB' }}>
                        {pmtctData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                        <LabelList dataKey="rate" position="right" formatter={(val) => `${val}%`} style={{ fontSize: '11px', fontWeight: 'bold', fill: '#4B5563' }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ANC Cascade */}
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Heart size={20} className="text-pink-600" />
                    ANC Attendance Cascade
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Maternal care continuum tracking</p>
                </div>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ancCascadeData} layout="vertical" margin={{ left: 0, right: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#F3F4F6" />
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11, fontWeight: 600, fill: '#374151' }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'transparent' }} />
                      <Bar dataKey="rate" radius={[0, 6, 6, 0]} barSize={24} background={{ fill: '#F9FAFB' }}>
                        {ancCascadeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                        <LabelList dataKey="rate" position="right" formatter={(val) => `${val}%`} style={{ fontSize: '11px', fontWeight: 'bold', fill: '#4B5563' }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Supply Chain & Risk (1/3 width) */}
        <div className="space-y-6">

          {/* Domain-Specific Supply Chain Widget */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Pill size={18} className="text-[#004AAD]" />
              Commodity Stock Status
            </h3>
            {/* Domain Tabs */}
            <div className="flex gap-2 mb-4">
              <DomainTab active={activeDomainTab === 'malaria'} label="Malaria" color="bg-red-500" onClick={() => setActiveDomainTab('malaria')} />
              <DomainTab active={activeDomainTab === 'hiv'} label="HIV" color="bg-purple-500" onClick={() => setActiveDomainTab('hiv')} />
              <DomainTab active={activeDomainTab === 'maternal'} label="Maternal" color="bg-pink-500" onClick={() => setActiveDomainTab('maternal')} />
            </div>
            <div className="space-y-4">
              {supplyData[activeDomainTab].map((item) => (
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
              View Full Logistics Report
            </button>
          </div>

          {/* High Risk Registry - All Domains */}
          <div className="bg-white p-0 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                <Users size={16} className="text-red-600" />
                Priority Case Registry
              </h3>
            </div>
            <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
              {highRiskCases.map((caseItem) => (
                <div key={caseItem.id} className="p-4 hover:bg-gray-50 transition cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <DomainBadge domain={caseItem.domain} />
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${caseItem.riskLevel === 'Critical' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-orange-50 text-orange-700 border-orange-100'
                        }`}>
                        {caseItem.riskLevel}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{caseItem.id}</span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900">{caseItem.name}</h4>
                  <p className="text-xs text-gray-600 mb-2 font-medium">{caseItem.issue}</p>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    <span className="flex items-center gap-1"><MapPin size={10} /> {caseItem.village}</span>
                    <span>•</span>
                    <span className="text-blue-600 font-bold">{caseItem.action}</span>
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