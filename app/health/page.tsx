"use client";

import { 
  Activity, Baby, Syringe, HeartPulse, 
  TrendingUp, AlertCircle, Calendar, LucideIcon 
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar 
} from "recharts";

// 1. Mock Data: Disease Trends [cite: 35-37]
const diseaseData = [
  { month: "Jan", malaria: 65, diarrhea: 40, respiratory: 24 },
  { month: "Feb", malaria: 59, diarrhea: 35, respiratory: 28 },
  { month: "Mar", malaria: 80, diarrhea: 25, respiratory: 22 }, // Spikes in rain
  { month: "Apr", malaria: 81, diarrhea: 30, respiratory: 30 },
  { month: "May", malaria: 56, diarrhea: 20, respiratory: 18 },
  { month: "Jun", malaria: 40, diarrhea: 15, respiratory: 15 },
];

// 2. Mock Data: Immunization Coverage [cite: 28-30]
const immunizationData = [
  { name: "Polio", rate: 92 },
  { name: "Measles", rate: 85 },
  { name: "BCG", rate: 98 },
  { name: "DPT3", rate: 78 }, // Gap identified
];

// 3. Mock Data: High-Risk Mothers (Action List) [cite: 25-27]
const highRiskMothers = [
  { id: "M-102", name: "Achan Grace", village: "Koro", issue: "Anemia / 3rd Trimester", due: "2 weeks" },
  { id: "M-205", name: "Laker Sarah", village: "Bwobo", issue: "Previous Complications", due: "1 month" },
  { id: "M-311", name: "Akello Rose", village: "Ajulu", issue: "Teenage Pregnancy", due: "3 weeks" },
];

export default function HealthPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Health Surveillance</h1>
          <p className="text-gray-500 text-sm">Maternal, Child & Disease Monitoring</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
            <TrendingUp size={14} /> Trends: Stable
          </span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <HealthStat 
          title="ANC Visits (4+)" 
          value="64%" 
          target="Target: 75%" 
          icon={Baby} 
          color="text-pink-600 bg-pink-50" 
        />
        <HealthStat 
          title="Fully Immunized" 
          value="82%" 
          target="Target: 90%" 
          icon={Syringe} 
          color="text-blue-600 bg-blue-50" 
        />
        <HealthStat 
          title="Malaria Cases" 
          value="1,240" 
          target="-5% vs last month" 
          icon={Activity} 
          color="text-red-600 bg-red-50" 
        />
        <HealthStat 
          title="Facility Deliveries" 
          value="88%" 
          target="+2% vs last month" 
          icon={HeartPulse} 
          color="text-purple-600 bg-purple-50" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Disease Trends */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Activity size={18} className="text-brand-blue" />
            Disease Incidence Trends
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={diseaseData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="malaria" stroke="#EF4444" strokeWidth={2} dot={false} name="Malaria" />
                <Line type="monotone" dataKey="diarrhea" stroke="#F97316" strokeWidth={2} dot={false} name="Diarrhea" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Malaria</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Diarrhea</span>
          </div>
        </div>

        {/* Chart 2: Immunization Gaps */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Syringe size={18} className="text-blue-600" />
            Immunization Coverage
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={immunizationData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={60} tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="rate" fill="#004AAD" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">Percentage of eligible children fully vaccinated</p>
        </div>
      </div>

      {/* Priority Action List: Maternal Health */}
      <div className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden">
        <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex justify-between items-center">
          <h3 className="font-bold text-red-800 flex items-center gap-2">
            <AlertCircle size={18} />
            Urgent Follow-up: High Risk Mothers
          </h3>
          <button className="text-xs font-bold text-red-600 hover:text-red-800">View All</button>
        </div>
        <div className="divide-y divide-gray-100">
          {highRiskMothers.map((mom) => (
            <div key={mom.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-xs">
                  {mom.id}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{mom.name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPinIcon size={10} /> {mom.village} Village
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded inline-block">
                  {mom.issue}
                </p>
                <p className="text-xs text-gray-500 mt-1 flex items-center justify-end gap-1">
                  <Calendar size={10} /> Due: {mom.due}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Helper Components & Types ---

interface HealthStatProps {
  title: string;
  value: string;
  target: string;
  icon: LucideIcon;
  color: string;
}

function HealthStat({ title, value, target, icon: Icon, color }: HealthStatProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <h4 className="text-2xl font-bold text-gray-900 mt-1">{value}</h4>
        <p className="text-xs text-gray-400 mt-1">{target}</p>
      </div>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon size={20} />
      </div>
    </div>
  );
}

function MapPinIcon({ size }: { size: number }) {
  // Simple SVG wrapper since we are inside a loop and want to be clean
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  );
}