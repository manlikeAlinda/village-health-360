"use client";

import { useState, useMemo } from "react";
import {
  MapPin, Phone, Calendar, ShieldAlert,
  Stethoscope, Droplets, Wallet, Clock,
  CheckCircle, LucideIcon, TrendingUp, TrendingDown, Users, Utensils
} from "lucide-react";

// --- Type Definitions (Improved for Clarity and Precision) ---
// Using specific types for better data validation and context
type VulnerabilityScore = "Critical" | "High" | "Medium" | "Low";
type MemberStatus = "Malnourished" | "Healthy" | "At-Risk" | undefined;

interface Member {
  name: string;
  role: string;
  age: number;
  sex: "M" | "F";
  status?: MemberStatus;
}

interface HouseholdData {
  id: string;
  head: string;
  age: number;
  phone: string;
  dateRegistered: string; // New: Explicit registration date
  location: {
    village: string;
    parish: string;
    gps: string; // Consider: dedicated component for Map/GPS link
  };
  vulnerability: {
    score: VulnerabilityScore;
    factors: string[];
  };
  members: Member[];
  health: {
    maternal: string;
    immunization: string;
    chronic: string;
  };
  wash: {
    waterSource: string;
    distance: string;
    sanitation: string;
    handwashing: string;
  };
  livelihoods: {
    incomeSource: string;
    crops: string[];
    foodSecurity: string;
  };
  history: {
    date: string;
    agent: string;
    action: string;
    isCritical: boolean; // New: to highlight critical actions/interventions
  }[];
}

// 1. Mock Data (Typed)
const householdData: HouseholdData = {
  id: "HH-8291",
  head: "Achan Grace",
  age: 34,
  phone: "0772-123-456",
  dateRegistered: "2023-05-10",
  location: {
    village: "Koro",
    parish: "Omoro",
    gps: "2.772, 32.288"
  },
  vulnerability: {
    score: "Critical",
    factors: ["Malnourished Child", "Unsafe Water"]
  },
  members: [
    { name: "Achan Grace", role: "Head", age: 34, sex: "F" },
    { name: "Opio Moses", role: "Child", age: 3, sex: "M", status: "Malnourished" },
    { name: "Akello Rose", role: "Child", age: 1, sex: "F", status: "Healthy" }
  ],
  health: {
    maternal: "Not Pregnant",
    immunization: "Opio Moses (Missed Polio 2)",
    chronic: "None"
  },
  wash: {
    waterSource: "River (Unsafe)",
    distance: "1.5 km",
    sanitation: "Shared Pit Latrine",
    handwashing: "No Soap Observed"
  },
  livelihoods: {
    incomeSource: "Subsistence Farming",
    crops: ["Maize", "Beans"],
    foodSecurity: "1 meal/day (Stressed)"
  },
  history: [
    { date: "Nov 28, 2025", agent: "Sarah A.", action: "Delivered Plumpy'Nut supplement", isCritical: true },
    { date: "Nov 15, 2025", agent: "John K.", action: "Routine Census", isCritical: false }
  ]
};

// --- Reusable Components (Improved for A11y and Clarity) ---

interface TabConfig {
  id: string;
  label: string;
  icon: LucideIcon;
  content: React.ReactNode;
}

/**
 * Renders the main header and contact information block.
 * Uses a semantic <header> tag for improved document outline.
 */
const ProfileHeader = ({ data }: { data: HouseholdData }) => {
  const { head, location, phone, dateRegistered, vulnerability } = data;

  const getVulnerabilityStyles = (score: VulnerabilityScore) => {
    switch (score) {
      case "Critical":
        return "bg-red-50 text-red-700 border-red-100";
      case "High":
        return "bg-amber-50 text-amber-700 border-amber-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  const scoreStyle = getVulnerabilityStyles(vulnerability.score);

  return (
    <header className="bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
      {/* Visual Banner Area */}
      <div className="h-32 bg-[#4A90E2]/10 w-full relative">
        <div className="absolute top-4 right-4 flex gap-3">
          <span className="bg-white/90 backdrop-blur text-xs font-semibold px-3 py-1 rounded-full shadow-sm text-gray-600 flex items-center gap-1">
            <CheckCircle size={12} className="text-green-500" /> Verified: {data.history[0].date.split(',')[0]}
          </span>
          <button
            className="bg-[#4A90E2] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md hover:bg-[#3A7AD2] transition"
            aria-label="Edit Household Profile"
          >
            Edit Profile
          </button>
        </div>
      </div>

      <div className="px-8 pb-8 relative">
        <div className="flex flex-col md:flex-row items-start md:items-center -mt-12 mb-6 gap-6 justify-between">
          {/* Avatar & Name/Contact Group */}
          <div className="flex items-end gap-6 flex-1">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-500 shadow-lg" role="img" aria-label={`Avatar for ${head}`}>
              {head.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">{head}</h1>
              <p className="text-base font-semibold text-gray-600 mb-2">Household Head | ID: {data.id}</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                <span className="flex items-center gap-1" aria-label={`Location: ${location.village}, ${location.parish}`}>
                  <MapPin size={14} className="text-gray-400" /> {location.village}, {location.parish}
                </span>
                <span className="flex items-center gap-1" aria-label={`Phone number: ${phone}`}>
                  <Phone size={14} className="text-gray-400" /> {phone}
                </span>
                <span className="flex items-center gap-1" aria-label={`Registered on: ${dateRegistered}`}>
                  <Calendar size={14} className="text-gray-400" /> Registered: {new Date(dateRegistered).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Risk Score Badge - High Visibility */}
          <div className={`flex flex-col items-end border px-4 py-2 rounded-xl min-w-[200px] text-right shadow-sm ${scoreStyle}`}>
            <p className="text-xs uppercase font-bold tracking-widest opacity-80">Vulnerability Priority</p>
            <div className="flex items-center gap-2 font-extrabold text-2xl mt-0.5">
              <ShieldAlert size={24} />
              {vulnerability.score}
            </div>
            <p className="text-xs mt-1 font-medium italic">Factors: {vulnerability.factors.join(', ')}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

/**
 * Standardized component for a single piece of profile data.
 * Improved to use a definition list for semantic markup.
 */
const ProfileDataRow = ({ label, value, alert = false }: { label: string, value: string | undefined, alert?: boolean }) => {
  return (
    <dl className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0" role="presentation">
      <dt className="text-gray-600 text-sm font-medium">{label}</dt>
      <dd className={`font-semibold text-sm text-right ${alert ? "text-red-700 bg-red-100/70 px-2 py-0.5 rounded-md" : "text-gray-900"}`}>
        {value || "N/A"}
      </dd>
    </dl>
  );
};

/**
 * Standardized section title for content tabs.
 */
const SectionTitle = ({ title }: { title: string }) => {
  return <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-4 mb-3">{title}</h3>;
};

/**
 * Tab Navigation Button - A11y improvements with role="tab" and aria-selected.
 */
const TabButton = ({ label, icon: Icon, id, active, set }: { label: string, icon: LucideIcon, id: string, active: string, set: (id: string) => void }) => {
  const isActive = active === id;
  return (
    <button
      role="tab"
      aria-controls={`tabpanel-${id}`}
      aria-selected={isActive}
      onClick={() => set(id)}
      id={`tab-${id}`}
      className={`flex items-center gap-2 pb-3 text-base font-semibold transition-colors border-b-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A90E2] ${
        isActive
          ? "border-[#4A90E2] text-[#4A90E2]"
          : "border-transparent text-gray-600 hover:text-gray-800"
      }`}
    >
      <Icon size={20} />
      {label}
    </button>
  );
};

// --- Tab Content Components (Composition over prop drilling) ---

const HealthTab = ({ healthData, members }: { healthData: HouseholdData['health'], members: HouseholdData['members'] }) => (
  <div
    role="tabpanel"
    id="tabpanel-health"
    aria-labelledby="tab-health"
    className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in duration-300"
  >
    {/* Section 1: Health Summary */}
    <div className="space-y-4 md:col-span-1">
      <SectionTitle title="Health Summary" />
      <ProfileDataRow label="Maternal Status" value={healthData.maternal} />
      <ProfileDataRow
        label="Immunization Gaps"
        value={healthData.immunization}
        alert={healthData.immunization !== "None" && healthData.immunization !== "Fully Immunized"}
      />
      <ProfileDataRow label="Chronic Illness" value={healthData.chronic} />
    </div>

    {/* Section 2: Family Members (Table/List) */}
    <div className="md:col-span-2">
      <SectionTitle title="Family Members" />
      <div className="bg-gray-50 rounded-xl p-4 shadow-inner">
        <ul className="divide-y divide-gray-200">
          {members.map((m, i) => (
            <li key={i} className="flex justify-between items-center py-3">
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  {m.name} <span className="text-xs font-normal text-gray-500">({m.age}{m.sex})</span>
                  {m.role === 'Head' && <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-gray-200 rounded-full">Head</span>}
                </p>
                <p className="text-gray-500 text-sm italic">{m.role}</p>
              </div>
              {m.status && (
                <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${
                  m.status === "Healthy" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {m.status.toUpperCase()}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

const WashTab = ({ washData }: { washData: HouseholdData['wash'] }) => (
  <div
    role="tabpanel"
    id="tabpanel-wash"
    aria-labelledby="tab-wash"
    className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300"
  >
    <div className="space-y-4">
      <SectionTitle title="Water Access" />
      <ProfileDataRow
        label="Primary Source"
        value={washData.waterSource}
        alert={washData.waterSource.includes("Unsafe") || washData.waterSource.includes("River")}
      />
      <ProfileDataRow label="Distance to Water" value={washData.distance} />
    </div>
    <div className="space-y-4">
      <SectionTitle title="Sanitation & Hygiene" />
      <ProfileDataRow label="Latrine Type" value={washData.sanitation} />
      <ProfileDataRow
        label="Handwashing Facility"
        value={washData.handwashing}
        alert={washData.handwashing.includes("No Soap") || washData.handwashing.includes("None")}
      />
    </div>
  </div>
);

const LivelihoodsTab = ({ livelihoodsData }: { livelihoodsData: HouseholdData['livelihoods'] }) => {
  const isFoodInsecure = livelihoodsData.foodSecurity.includes("Stressed") || livelihoodsData.foodSecurity.includes("Crisis");

  return (
    <div
      role="tabpanel"
      id="tabpanel-livelihoods"
      aria-labelledby="tab-livelihoods"
      className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in duration-300"
    >
      <div className="space-y-4 md:col-span-2">
        <SectionTitle title="Economic Status" />
        <ProfileDataRow label="Main Income" value={livelihoodsData.incomeSource} />
        <ProfileDataRow
          label="Food Security"
          value={livelihoodsData.foodSecurity}
          alert={isFoodInsecure}
        />
        <div className="mt-8 pt-4 border-t border-gray-100">
          <SectionTitle title="Agricultural Profile" />
          <div className="flex flex-wrap gap-2">
            {livelihoodsData.crops.map((crop) => (
              <span
                key={crop}
                className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm flex items-center gap-1"
              >
                <Utensils size={14} /> {crop}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-blue-50 p-6 rounded-xl shadow-md border border-blue-100 flex flex-col justify-center">
        <h4 className="flex items-center gap-2 font-bold text-blue-800 mb-2 text-lg">
          <TrendingUp size={24} className="text-blue-600" /> Economic Outlook
        </h4>
        <p className="text-sm text-blue-700">
          **Recommendation:** Introduce cash-for-work program to diversify income and strengthen food security. Farming alone is **highly volatile**.
        </p>
      </div>
    </div>
  );
};

const HistoryTab = ({ historyData }: { historyData: HouseholdData['history'] }) => (
  <div
    role="tabpanel"
    id="tabpanel-history"
    aria-labelledby="tab-history"
    className="space-y-6 animate-in fade-in duration-300 max-w-2xl"
  >
    <SectionTitle title="Timeline of Interventions" />
    <ol className="relative border-s border-gray-200 ml-4">
      {historyData.map((visit, i) => {
        const isCriticalAction = visit.isCritical;
        const iconClasses = isCriticalAction
          ? "bg-red-500 text-white ring-8 ring-red-100"
          : "bg-[#4A90E2] text-white ring-8 ring-blue-100";

        return (
          <li key={i} className="mb-8 ms-6">
            <span className={`absolute flex items-center justify-center w-6 h-6 rounded-full -start-3 ${iconClasses}`}>
              <CheckCircle size={14} />
            </span>
            <div className={`p-4 rounded-lg shadow-md border transition-all duration-300 ${isCriticalAction ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100 hover:shadow-lg'}`}>
              <div className="flex justify-between items-center mb-1">
                <time className={`text-xs font-semibold ${isCriticalAction ? 'text-red-700' : 'text-gray-500'}`}>{visit.date}</time>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isCriticalAction ? 'bg-red-200 text-red-800' : 'bg-gray-100 text-gray-700'}`}>
                  {isCriticalAction ? 'CRITICAL ACTION' : 'Routine'}
                </span>
              </div>
              <h4 className="font-extrabold text-gray-900 text-base">{visit.action}</h4>
              <p className="text-sm text-gray-600 mt-1">Agent: **{visit.agent}**</p>
            </div>
          </li>
        );
      })}
    </ol>
  </div>
);

// --- Main Profile Component ---

export default function HouseholdProfileClient() {
  const [activeTab, setActiveTab] = useState("health");

  // Centralized Tab Configuration
  const tabs: TabConfig[] = useMemo(() => [
    { id: "health", label: "Health Profile", icon: Stethoscope, content: <HealthTab healthData={householdData.health} members={householdData.members} /> },
    { id: "wash", label: "WASH Status", icon: Droplets, content: <WashTab washData={householdData.wash} /> },
    { id: "livelihoods", label: "Livelihoods", icon: Wallet, content: <LivelihoodsTab livelihoodsData={householdData.livelihoods} /> },
    { id: "history", label: "Visit History", icon: Clock, content: <HistoryTab historyData={householdData.history} /> },
  ], []);

  const activeTabContent = useMemo(() => tabs.find(t => t.id === activeTab)?.content, [activeTab, tabs]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* 1. Header Profile Card */}
      <ProfileHeader data={householdData} />

      {/* 2. Content Container (Tabs & Data) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xl p-8">
        {/* Tabs Navigation */}
        <nav role="tablist" aria-label="Household Profile Sections" className="flex border-b border-gray-200 gap-8 -mb-px">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              label={tab.label}
              icon={tab.icon}
              id={tab.id}
              active={activeTab}
              set={setActiveTab}
            />
          ))}
        </nav>

        {/* Tab Content Area */}
        <div className="mt-8">
          {activeTabContent}
        </div>
      </div>
    </div>
  );
}