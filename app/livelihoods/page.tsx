"use client";

import React, { useState, useMemo } from "react";
import {
  Wallet, Briefcase, TrendingUp, Users,
  PiggyBank, ArrowUpRight, ArrowDownRight,
  AlertTriangle, LucideIcon, Target, Filter, ChevronDown, X,
  Download, Share2
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend
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

// --- Domain Constants ---
const USD_RATE = 3750;

// --- Component System ---

interface EconStatProps {
  label: string;
  value: string;
  suffix?: string;
  trend: string;
  trendDir: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  intent: 'brand' | 'success' | 'warning' | 'danger';
  subtext?: string;
}

function EconStat({ label, value, suffix, trend, trendDir, icon: Icon, intent, subtext }: EconStatProps) {
  const styles = {
    brand: "bg-purple-50 text-purple-700 border-purple-200",
    success: "bg-green-50 text-green-700 border-green-200",
    warning: "bg-orange-50 text-orange-700 border-orange-200",
    danger: "bg-red-50 text-red-700 border-red-200",
  };

  const trendColor = trendDir === 'up' ? "text-green-600" : trendDir === 'down' ? "text-red-500" : "text-gray-500";
  const TrendIcon = trendDir === 'up' ? ArrowUpRight : trendDir === 'down' ? ArrowDownRight : TrendingUp;

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
        <div className="flex items-baseline gap-1">
          <h4 className="text-2xl font-bold text-gray-900 tracking-tight">{value}</h4>
          {suffix && <span className="text-sm text-gray-400 font-medium">{suffix}</span>}
        </div>
        <p className="text-sm font-medium text-gray-500 mt-0.5">{label}</p>
        {subtext && <p className="text-[10px] text-gray-400 mt-2 border-t border-gray-50 pt-2">{subtext}</p>}
      </div>
    </div>
  );
}

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

export default function LivelihoodsMonitor() {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedSubcounty, setSelectedSubcounty] = useState<string | null>(null);

  // --- Derived Data Logic ---
  const allDistricts = useMemo(() => getAllDistricts(), []);
  const subcounties = useMemo(() => getSubcounties(selectedDistrict), [selectedDistrict]);
  const currentLocation = selectedSubcounty || selectedDistrict || "National";

  const seed = currentLocation;
  const multiplier = useMemo(() => getSeedMultiplier(seed), [seed]);

  // --- Dynamic Data Generators ---
  const avgIncome = Math.floor(300000 * multiplier);

  const incomeData = useMemo(() => [
    { name: "Agri-Business (Cash Crops)", value: Math.floor(45 * multiplier), color: "#7C3AED" },
    { name: "Small Trade/Petty Commerce", value: Math.floor(25 * multiplier), color: "#DB2777" },
    { name: "Formal Employment (Local)", value: Math.floor(10 * multiplier), color: "#06B6D4" },
    { name: "Remittances (Diaspora)", value: Math.floor(15 * multiplier), color: "#10B981" },
    { name: "Casual Labor/Gigs", value: Math.floor(5 * multiplier), color: "#F59E0B" },
  ], [multiplier]);

  const vslaGroups = useMemo(() => [
    { id: "VS-01", name: "Bwobo Women United", members: Math.floor(35 * multiplier), savings: Math.floor(8500000 * multiplier), target: 10000000, loanRepayRate: 0.98, status: "Healthy" },
    { id: "VS-02", name: "Koro Youth Tech-Savings", members: Math.floor(18 * multiplier), savings: Math.floor(2500000 * multiplier), target: 5000000, loanRepayRate: 0.75, status: "At Risk" },
    { id: "VS-03", name: "Ajulu Farmers Group", members: Math.floor(50 * multiplier), savings: Math.floor(12500000 * multiplier), target: 12000000, loanRepayRate: 1.05, status: "Exceeded" },
    { id: "VS-04", name: "Omoro Widows Fund", members: Math.floor(24 * multiplier), savings: Math.floor(4800000 * multiplier), target: 5000000, loanRepayRate: 0.90, status: "Healthy" },
    { id: "VS-05", name: "Gulu Urban Innovators", members: Math.floor(10 * multiplier), savings: Math.floor(1500000 * multiplier), target: 4000000, loanRepayRate: 0.55, status: "Critical" },
  ], [multiplier]);

  const totalSavings = useMemo(() => vslaGroups.reduce((acc, g) => acc + g.savings, 0), [vslaGroups]);
  const avgLoanRepayRate = useMemo(() => (vslaGroups.reduce((acc, g) => acc + g.loanRepayRate, 0) / vslaGroups.length * 100).toFixed(1), [vslaGroups]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 p-6 lg:p-10 mt-16">
      {/* 1. Executive Header */}
      <header className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
              Livelihoods Monitor
            </h1>
            <p className="text-sm text-gray-500 mt-1.5 max-w-xl">
              Financial inclusion and economic resilience tracking across {currentLocation}.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="text-right mr-2 hidden md:block">
              <p className="text-xs text-gray-400 font-medium">Reference FX</p>
              <p className="text-sm font-bold text-gray-700 font-mono">1 USD = {USD_RATE.toLocaleString()} UGX</p>
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm">
              <Download size={16} /> Export Report
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#7C3AED] rounded-xl hover:bg-[#6D28D9] transition shadow-sm">
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
        <EconStat
          label="Avg Monthly Household Income"
          value={avgIncome.toLocaleString()}
          suffix="UGX"
          trend="+5.2% YoY"
          trendDir="up"
          icon={Wallet}
          intent="success"
          subtext={`(${(avgIncome / USD_RATE).toFixed(0)} USD)`}
        />
        <EconStat
          label="VSLA Participation"
          value="42.8"
          suffix="%"
          trend="1.2k New Members"
          trendDir="up"
          icon={Users}
          intent="brand"
          subtext="Coverage of target population"
        />
        <EconStat
          label="Capital Mobilized"
          value={`${(totalSavings / 1000000).toFixed(0)}M`}
          suffix="UGX"
          trend="Target: 500M"
          trendDir="neutral"
          icon={PiggyBank}
          intent="brand"
          subtext="Total savings across VSLAs"
        />
        <EconStat
          label="Loan Portfolio Health"
          value={avgLoanRepayRate}
          suffix="%"
          trend="Threshold: 80%"
          trendDir={Number(avgLoanRepayRate) < 85 ? "down" : "up"}
          icon={AlertTriangle}
          intent={Number(avgLoanRepayRate) < 80 ? "danger" : Number(avgLoanRepayRate) < 90 ? "warning" : "success"}
          subtext="Average Loan Repayment Rate"
        />
      </section>

      {/* 3. Deep-Dive Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 mb-8">

        {/* Chart A: Income Diversification */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Wallet size={20} className="text-purple-600" />
              Income Source Distribution
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Primary revenue streams and livelihood concentration risk.
            </p>
          </div>

          <div className="h-[320px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incomeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={105}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {incomeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(value) => [`${value}%`, 'Share']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '13px', fontWeight: 600 }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={60}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Metric */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[70%] text-center pointer-events-none">
              <span className="text-3xl font-extrabold text-gray-900">{incomeData[0].value}%</span>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-1 max-w-[80px] leading-tight">
                Primary Income
              </p>
            </div>
          </div>
        </div>

        {/* VSLA Portfolio Performance */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <PiggyBank size={18} className="text-pink-600" />
              VSLA Group Performance
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Group health, capital accumulation, and loan repayment rates.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-gray-500 font-bold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3">Group Profile</th>
                  <th className="px-6 py-3">Capital Pool (UGX)</th>
                  <th className="px-6 py-3 text-center">LRR %</th>
                  <th className="px-6 py-3 text-right">Risk Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {vslaGroups.map((group) => {
                  const savingsPercent = Math.min(100, Math.round((group.savings / group.target) * 100));
                  const isCritical = group.loanRepayRate < 0.8;
                  const isAtRisk = group.loanRepayRate < 0.9 && group.loanRepayRate >= 0.8;
                  const healthTag = isCritical ? { color: "red", text: "Critical Risk" }
                    : isAtRisk ? { color: "orange", text: "Monitor" }
                      : { color: "green", text: "High Performance" };

                  return (
                    <tr key={group.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{group.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                          <Users size={12} className="text-pink-500" /> {group.members} Members
                        </div>
                      </td>
                      <td className="px-6 py-4 tabular-nums">
                        <div className="font-mono font-medium text-gray-700">
                          {group.savings.toLocaleString()}
                        </div>
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isCritical ? "bg-red-500" : "bg-purple-600"}`}
                            style={{ width: `${savingsPercent}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                          <Target size={10} /> {savingsPercent}% of Target
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-sm font-bold ${healthTag.color === 'green' ? 'text-green-600' : healthTag.color === 'orange' ? 'text-orange-500' : 'text-red-600'}`}>
                          {(group.loanRepayRate * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider 
                            ${healthTag.color === 'red' ? 'bg-red-100 text-red-700' : healthTag.color === 'orange' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                          {healthTag.color === 'red' && <AlertTriangle size={10} />}
                          {healthTag.text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}