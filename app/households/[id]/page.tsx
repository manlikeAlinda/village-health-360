"use client";

import { useState } from "react";
import { 
  MapPin, Phone, Calendar, ShieldAlert, 
  Stethoscope, Droplets, Sprout, Wallet, 
  CheckCircle, Clock, LucideIcon 
} from "lucide-react";

// 1. Mock Data (Moved here)
const householdData = {
  id: "HH-8291",
  head: "Achan Grace",
  age: 34,
  phone: "0772-123-456",
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
    { date: "Nov 28, 2025", agent: "Sarah A.", action: "Delivered Plumpy'Nut supplement" },
    { date: "Nov 15, 2025", agent: "John K.", action: "Routine Census" }
  ]
};

// --- Interfaces ---

interface TabButtonProps {
  label: string;
  icon: LucideIcon;
  id: string;
  active: string;
  set: (id: string) => void;
}

interface InfoRowProps {
  label: string;
  value: string | undefined; 
  alert?: boolean;
}

export default function HouseholdProfileClient() {
  const [activeTab, setActiveTab] = useState("health");

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Header Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="h-32 bg-brand-blue/10 w-full relative">
          <div className="absolute top-4 right-4 flex gap-2">
            <span className="bg-white/90 backdrop-blur text-xs font-bold px-3 py-1 rounded-full shadow-sm text-gray-600">
              Verified: Nov 28
            </span>
            <button className="bg-brand-blue text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              Edit Profile
            </button>
          </div>
        </div>
        
        <div className="px-8 pb-8 relative">
          {/* Avatar & Name */}
          <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 mb-6 gap-6">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-400 shadow-md">
              AG
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{householdData.head}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                <span className="flex items-center gap-1"><MapPin size={14} /> {householdData.location.village}, {householdData.location.parish}</span>
                <span className="flex items-center gap-1"><Phone size={14} /> {householdData.phone}</span>
                <span className="flex items-center gap-1"><Calendar size={14} /> Registered: 2023</span>
              </div>
            </div>
            {/* Risk Score Badge */}
            <div className="bg-red-50 border border-red-100 px-4 py-2 rounded-lg text-right">
              <p className="text-xs text-red-600 uppercase font-bold tracking-wider">Vulnerability Priority</p>
              <div className="flex items-center gap-2 text-red-700 font-bold text-lg">
                <ShieldAlert size={20} />
                {householdData.vulnerability.score}
              </div>
            </div>
          </div>

          {/* 2. Tabs Navigation */}
          <div className="flex border-b border-gray-200 gap-6">
            <TabButton label="Health Profile" icon={Stethoscope} id="health" active={activeTab} set={setActiveTab} />
            <TabButton label="WASH Status" icon={Droplets} id="wash" active={activeTab} set={setActiveTab} />
            <TabButton label="Livelihoods" icon={Wallet} id="livelihoods" active={activeTab} set={setActiveTab} />
            <TabButton label="Visit History" icon={Clock} id="history" active={activeTab} set={setActiveTab} />
          </div>

          {/* 3. Tab Content Area */}
          <div className="mt-8">
            
            {/* HEALTH TAB */}
            {activeTab === "health" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
                <div className="space-y-6">
                  <SectionTitle title="Maternal & Child Health" />
                  <InfoRow label="Maternal Status" value={householdData.health.maternal} />
                  <InfoRow label="Immunization Gaps" value={householdData.health.immunization} alert />
                  <InfoRow label="Chronic Illness" value={householdData.health.chronic} />
                </div>
                <div>
                  <SectionTitle title="Family Members" />
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {householdData.members.map((m, i) => (
                      <div key={i} className="flex justify-between items-center text-sm border-b border-gray-200 pb-2 last:border-0">
                        <div>
                          <p className="font-medium text-gray-900">{m.name} ({m.age}{m.sex})</p>
                          <p className="text-gray-500 text-xs">{m.role}</p>
                        </div>
                        {m.status && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            m.status === "Healthy" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>
                            {m.status}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* WASH TAB */}
            {activeTab === "wash" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
                <div className="space-y-6">
                  <SectionTitle title="Water Access" />
                  <InfoRow label="Primary Source" value={householdData.wash.waterSource} alert={householdData.wash.waterSource.includes("Unsafe")} />
                  <InfoRow label="Distance to Water" value={householdData.wash.distance} />
                </div>
                <div className="space-y-6">
                  <SectionTitle title="Sanitation & Hygiene" />
                  <InfoRow label="Latrine Type" value={householdData.wash.sanitation} />
                  <InfoRow label="Handwashing Facility" value={householdData.wash.handwashing} alert />
                </div>
              </div>
            )}

            {/* LIVELIHOODS TAB */}
            {activeTab === "livelihoods" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
                <div className="space-y-6">
                  <SectionTitle title="Economic Status" />
                  <InfoRow label="Main Income" value={householdData.livelihoods.incomeSource} />
                  <InfoRow label="Food Security" value={householdData.livelihoods.foodSecurity} alert />
                </div>
                <div className="bg-green-50 p-6 rounded-xl">
                  <h4 className="flex items-center gap-2 font-bold text-brand-agri mb-4">
                    <Sprout size={18} /> Agriculture Data
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {householdData.livelihoods.crops.map((crop) => (
                      <span key={crop} className="bg-white text-green-700 px-3 py-1 rounded shadow-sm text-sm font-medium">
                        {crop}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* HISTORY TAB */}
            {activeTab === "history" && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {householdData.history.map((visit, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                        <CheckCircle size={16} />
                      </div>
                      {i !== householdData.history.length - 1 && <div className="w-0.5 h-full bg-gray-200 my-1"></div>}
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg flex-1 border border-gray-100">
                      <div className="flex justify-between">
                        <h4 className="font-bold text-gray-900 text-sm">{visit.action}</h4>
                        <span className="text-xs text-gray-500">{visit.date}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Agent: {visit.agent}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// --- Helper Functions ---

function TabButton({ label, icon: Icon, id, active, set }: TabButtonProps) {
  const isActive = active === id;
  return (
    <button 
      onClick={() => set(id)}
      className={`flex items-center gap-2 pb-3 text-sm font-medium transition-colors border-b-2 ${
        isActive 
          ? "border-brand-blue text-brand-blue" 
          : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">{title}</h3>;
}

function InfoRow({ label, value, alert }: InfoRowProps) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-600 text-sm">{label}</span>
      <span className={`font-medium text-sm ${alert ? "text-red-600 bg-red-50 px-2 py-0.5 rounded" : "text-gray-900"}`}>
        {value || "N/A"}
      </span>
    </div>
  );
}