"use client";

import { useState, useMemo } from "react";
import {
  MapPin, Phone, Calendar, ShieldAlert,
  Stethoscope, Droplets, Wallet, Clock,
  CheckCircle, LucideIcon, TrendingUp, Utensils
} from "lucide-react";
import { Household, HouseholdMember, RiskLevel } from "../../lib/types";

// --- Reusable Components ---

interface TabConfig {
  id: string;
  label: string;
  icon: LucideIcon;
  content: React.ReactNode;
}

function deriveVulnerabilityFactors(household: Household): string[] {
  const factors: string[] = [];
  if (household.waterSource.toLowerCase().includes("unsafe")) factors.push("Unsafe Water Source");
  if (/pregnan/i.test(household.healthStatus)) factors.push("Pregnant Member");
  if (/malnutrition/i.test(household.healthStatus)) factors.push("Child Malnutrition");
  if (/malaria/i.test(household.healthStatus)) factors.push("Active Malaria Case");
  return factors;
}

const ProfileHeader = ({ data }: { data: Household }) => {
  const factors = useMemo(() => deriveVulnerabilityFactors(data), [data]);

  const getVulnerabilityStyles = (score: RiskLevel) => {
    switch (score) {
      case "Critical": return "bg-red-50 text-red-700 border-red-100";
      case "High": return "bg-amber-50 text-amber-700 border-amber-100";
      default: return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  return (
    <header className="bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
      <div className="h-32 bg-[#4A90E2]/10 w-full relative">
        <div className="absolute top-4 right-4 flex gap-3">
          <span className="bg-white/90 backdrop-blur text-xs font-semibold px-3 py-1 rounded-full shadow-sm text-gray-600 flex items-center gap-1">
            <CheckCircle size={12} className="text-green-500" /> Last updated: {new Date(data.updatedAt).toLocaleDateString()}
          </span>
          <button className="bg-[#4A90E2] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md hover:bg-[#3A7AD2] transition">
            Edit Profile
          </button>
        </div>
      </div>

      <div className="px-8 pb-8 relative">
        <div className="flex flex-col md:flex-row items-start md:items-center -mt-12 mb-6 gap-6 justify-between">
          <div className="flex items-end gap-6 flex-1">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-500 shadow-lg">
              {data.head.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">{data.head}</h1>
              <p className="text-base font-semibold text-gray-600 mb-2">Household Head | ID: {data.id}</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin size={14} className="text-gray-400" /> {data.village}, {data.parish}
                </span>
                <span className="flex items-center gap-1">
                  <Phone size={14} className="text-gray-400" /> {data.phone || "Not recorded"}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={14} className="text-gray-400" /> Registered: {new Date(data.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className={`flex flex-col items-end border px-4 py-2 rounded-xl min-w-[200px] text-right shadow-sm ${getVulnerabilityStyles(data.riskLevel)}`}>
            <p className="text-xs uppercase font-bold tracking-widest opacity-80">Vulnerability Priority</p>
            <div className="flex items-center gap-2 font-extrabold text-2xl mt-0.5">
              <ShieldAlert size={24} />
              {data.riskLevel}
            </div>
            <p className="text-xs mt-1 font-medium italic">Factors: {factors.length ? factors.join(', ') : "None identified"}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

const ProfileDataRow = ({ label, value, alert = false }: { label: string, value: string | undefined, alert?: boolean }) => (
  <dl className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
    <dt className="text-gray-600 text-sm font-medium">{label}</dt>
    <dd className={`font-semibold text-sm text-right ${alert ? "text-red-700 bg-red-100/70 px-2 py-0.5 rounded-md" : "text-gray-900"}`}>
      {value || "Not recorded"}
    </dd>
  </dl>
);

const SectionTitle = ({ title }: { title: string }) => (
  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-4 mb-3">{title}</h3>
);

const TabButton = ({ label, icon: Icon, id, active, set }: { label: string, icon: LucideIcon, id: string, active: string, set: (id: string) => void }) => {
  const isActive = active === id;
  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => set(id)}
      className={`flex items-center gap-2 pb-3 text-base font-semibold transition-colors border-b-2 focus:outline-none ${isActive ? "border-[#4A90E2] text-[#4A90E2]" : "border-transparent text-gray-600 hover:text-gray-800"
        }`}
    >
      <Icon size={20} />
      {label}
    </button>
  );
};

// --- Tab Content Components ---

const HealthTab = ({ health, members }: { health: Household['health'], members?: HouseholdMember[] }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in duration-300">
    <div className="space-y-4 md:col-span-1">
      <SectionTitle title="Health Summary" />
      <ProfileDataRow label="Maternal Status" value={health?.maternal} />
      <ProfileDataRow label="Immunization Gaps" value={health?.immunization} alert={!!health?.immunization && health.immunization !== "None" && health.immunization !== "Fully Immunized"} />
      <ProfileDataRow label="Chronic Illness" value={health?.chronic} />
    </div>
    <div className="md:col-span-2">
      <SectionTitle title="Family Members" />
      {members && members.length > 0 ? (
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
                  <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${m.status === "Healthy" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {m.status.toUpperCase()}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic">No individual family member roster recorded yet.</p>
      )}
    </div>
  </div>
);

const WashTab = ({ wash, fallbackWaterSource }: { wash: Household['wash'], fallbackWaterSource: string }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
    <div className="space-y-4">
      <SectionTitle title="Water Access" />
      <ProfileDataRow label="Primary Source" value={wash?.waterSource || fallbackWaterSource} alert={(wash?.waterSource || fallbackWaterSource).toLowerCase().includes("unsafe")} />
      <ProfileDataRow label="Distance to Water" value={wash?.distance} />
    </div>
    <div className="space-y-4">
      <SectionTitle title="Sanitation & Hygiene" />
      <ProfileDataRow label="Latrine Type" value={wash?.sanitation} />
      <ProfileDataRow label="Handwashing Facility" value={wash?.handwashing} alert={!!wash?.handwashing && (wash.handwashing.includes("No Soap") || wash.handwashing.includes("None"))} />
    </div>
  </div>
);

const LivelihoodsTab = ({ livelihoods }: { livelihoods: Household['livelihoods'] }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in duration-300">
    <div className="space-y-4 md:col-span-2">
      <SectionTitle title="Economic Status" />
      <ProfileDataRow label="Main Income" value={livelihoods?.incomeSource} />
      <ProfileDataRow label="Food Security" value={livelihoods?.foodSecurity} alert={!!livelihoods?.foodSecurity && livelihoods.foodSecurity.includes("Stressed")} />
      <div className="mt-8 pt-4 border-t border-gray-100">
        <SectionTitle title="Agricultural Profile" />
        <div className="flex flex-wrap gap-2">
          {livelihoods?.crops && livelihoods.crops.length > 0 ? (
            livelihoods.crops.map((crop) => (
              <span key={crop} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm flex items-center gap-1">
                <Utensils size={14} /> {crop}
              </span>
            ))
          ) : (
            <p className="text-sm text-gray-400 italic">No crop data recorded yet.</p>
          )}
        </div>
      </div>
    </div>
    <div className="bg-blue-50 p-6 rounded-xl shadow-md border border-blue-100 flex flex-col justify-center">
      <h4 className="flex items-center gap-2 font-bold text-blue-800 mb-2 text-lg">
        <TrendingUp size={24} className="text-blue-600" /> Economic Outlook
      </h4>
      <p className="text-sm text-blue-700">
        No automated recommendation engine is connected yet — this panel is a placeholder for future analysis.
      </p>
    </div>
  </div>
);

const HistoryTab = ({ history }: { history: Household['history'] }) => (
  <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl">
    <SectionTitle title="Timeline of Interventions" />
    {history && history.length > 0 ? (
      <ol className="relative border-s border-gray-200 ml-4">
        {history.map((visit, i) => (
          <li key={i} className="mb-8 ms-6">
            <span className={`absolute flex items-center justify-center w-6 h-6 rounded-full -start-3 ${visit.isCritical ? "bg-red-500 ring-red-100" : "bg-[#4A90E2] ring-blue-100"} text-white ring-8`}>
              <CheckCircle size={14} />
            </span>
            <div className={`p-4 rounded-lg shadow-md border transition-all duration-300 ${visit.isCritical ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
              <div className="flex justify-between items-center mb-1">
                <time className={`text-xs font-semibold ${visit.isCritical ? 'text-red-700' : 'text-gray-500'}`}>{visit.date}</time>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${visit.isCritical ? 'bg-red-200 text-red-800' : 'bg-gray-100 text-gray-700'}`}>
                  {visit.isCritical ? 'CRITICAL ACTION' : 'Routine'}
                </span>
              </div>
              <h4 className="font-extrabold text-gray-900 text-base">{visit.action}</h4>
              <p className="text-sm text-gray-600 mt-1">Agent: <span className="font-bold">{visit.agent}</span></p>
            </div>
          </li>
        ))}
      </ol>
    ) : (
      <p className="text-sm text-gray-400 italic">No visits logged yet.</p>
    )}
  </div>
);

// --- Main Component ---

export default function UserProfile({ household }: { household: Household }) {
  const [activeTab, setActiveTab] = useState("health");

  const tabs: TabConfig[] = useMemo(() => [
    { id: "health", label: "Health Profile", icon: Stethoscope, content: <HealthTab health={household.health} members={household.householdMembers} /> },
    { id: "wash", label: "WASH Status", icon: Droplets, content: <WashTab wash={household.wash} fallbackWaterSource={household.waterSource} /> },
    { id: "livelihoods", label: "Livelihoods", icon: Wallet, content: <LivelihoodsTab livelihoods={household.livelihoods} /> },
    { id: "history", label: "Visit History", icon: Clock, content: <HistoryTab history={household.history} /> },
  ], [household]);

  const activeTabContent = tabs.find(t => t.id === activeTab)?.content;

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      <ProfileHeader data={household} />
      <div className="bg-white rounded-xl border border-gray-200 shadow-xl p-8">
        <nav role="tablist" aria-label="Household Profile Sections" className="flex border-b border-gray-200 gap-8 -mb-px overflow-x-auto">
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
        <div className="mt-8">
          {activeTabContent}
        </div>
      </div>
    </div>
  );
}
