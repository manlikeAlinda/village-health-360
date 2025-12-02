"use client";

import { 
  Droplets, Wrench, Ban, CheckCircle2, 
  MapPin, AlertOctagon, Hammer, ArrowRight,
  MoreHorizontal, LucideIcon, Info
} from "lucide-react";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

// --- Mock Data ---
const waterSourceData = [
  { name: "Safe (Borehole/Tap)", value: 65, color: "#0EA5E9" }, // Sky Blue
  { name: "Unsafe (River/Pond)", value: 35, color: "#F43F5E" }, // Rose Red
];

const sanitationData = [
  { name: "VIP Latrine", count: 450, fill: "#10B981" },      // Best
  { name: "Traditional Pit", count: 1200, fill: "#F59E0B" }, // Okay
  { name: "Shared/Communal", count: 300, fill: "#6366F1" },  // Risk
  { name: "Open Defecation", count: 150, fill: "#EF4444" },  // Critical
];

const brokenInfrastructure = [
  { id: "WP-09", type: "Borehole", location: "Bwobo Village", issue: "Pump Handle Broken", daysDown: 4, mechanic: "Unassigned", priority: "High" },
  { id: "WP-12", type: "Tap Stand", location: "Koro Market", issue: "Leaking Pipe", daysDown: 2, mechanic: "John O.", priority: "Medium" },
  { id: "WP-44", type: "Protected Spring", location: "Ajulu", issue: "Contaminated Runoff", daysDown: 1, mechanic: "Pending", priority: "High" },
];

export default function WashPage() {
  return (
    <main className="space-y-8 bg-gray-50/50 min-h-screen p-6">
      
      {/* 1. Header: Operational Context */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200 uppercase tracking-wide">
              Sector: WASH
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Infrastructure Monitor</h1>
          <p className="text-gray-500 font-medium">
            Water Point Functionality & Sanitation Coverage
          </p>
        </div>
        
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition shadow-sm">
            <MoreHorizontal size={16} /> Reports
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-bold hover:bg-rose-700 transition shadow-md shadow-rose-200">
            <Wrench size={16} /> Dispatch Mechanic (3)
          </button>
        </div>
      </header>

      {/* 2. KPI Cards: Status at a Glance */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <WashStat 
          label="Safe Water Coverage" 
          value="65%" 
          subtext="Target: 80% by Q4" 
          icon={CheckCircle2} 
          intent="brand" 
        />
        <WashStat 
          label="Latrine Coverage" 
          value="92%" 
          subtext="+5% vs Last Year" 
          icon={Ban} 
          intent="success" 
        />
        <WashStat 
          label="Active Breakdowns" 
          value="12" 
          subtext="Avg Downtime: 3.2 Days" 
          icon={AlertOctagon} 
          intent="danger" 
        />
        <WashStat 
          label="Avg. Water Distance" 
          value="1.2 km" 
          subtext="Target: < 0.5 km" 
          icon={MapPin} 
          intent="warning" 
        />
      </section>

      {/* 3. Visualization Layer */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart A: Water Source Safety (Donut Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Droplets size={18} className="text-blue-500" />
              Source Safety Analysis
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Ratio of potable vs. potentially contaminated sources.
            </p>
          </div>

          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={waterSourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {waterSourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                   itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Summary Metric */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center -mt-5 pointer-events-none">
              <span className="text-3xl font-extrabold text-gray-900">65%</span>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Potable</p>
            </div>
          </div>
        </div>

        {/* Chart B: Sanitation Infrastructure (Bar Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
          <div className="mb-4 flex justify-between items-start">
            <div>
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Ban size={18} className="text-orange-500" />
                Sanitation Quality
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">
                Comparison of latrine structural integrity and hygiene standards.
              </p>
            </div>
            {/* EDUCATIONAL TRIGGER: Contextual Diagram */}
            <div className="group relative">
              <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-blue-600 transition">
                <Info size={18} />
              </button>
              <div className="hidden group-hover:block absolute right-0 top-8 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-10">
                <p className="mb-2 font-semibold">Standard vs. VIP Latrine:</p>
                
                <p className="mt-2 text-gray-400 italic">VIP latrines include a vent pipe to reduce odors and flies.</p>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sanitationData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#F3F4F6" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={110} tick={{fontSize: 11, fontWeight: 500, fill: '#374151'}} axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{fill: '#F9FAFB'}} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24} background={{ fill: '#F9FAFB' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* 4. Action Layer: Maintenance Tickets */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Hammer size={18} className="text-rose-600" />
              Infrastructure Repair Queue
            </h3>
          </div>
          <button className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
            View Maintenance Log <ArrowRight size={12} />
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {brokenInfrastructure.map((item) => (
            <div key={item.id} className="p-4 md:px-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                  <Wrench size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-gray-900">{item.type}</h4>
                    <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 rounded">{item.id}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {item.location}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="font-medium text-rose-600">{item.issue}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  item.mechanic === "Unassigned" 
                    ? "bg-yellow-50 text-yellow-700 border-yellow-200" 
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }`}>
                  {item.mechanic}
                </span>
                <span className="text-[10px] text-gray-400 font-medium">
                  {item.daysDown} Days Downtime
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

// --- Component System ---

interface WashStatProps {
  label: string;
  value: string;
  subtext: string;
  icon: LucideIcon;
  intent: 'brand' | 'success' | 'warning' | 'danger';
}

function WashStat({ label, value, subtext, icon: Icon, intent }: WashStatProps) {
  const styles = {
    brand: "bg-blue-50 text-blue-600",
    success: "bg-emerald-50 text-emerald-600",
    warning: "bg-orange-50 text-orange-600",
    danger: "bg-rose-50 text-rose-600",
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className={`p-2.5 rounded-lg ${styles[intent]}`}>
          <Icon size={22} />
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <h4 className="text-2xl font-bold text-gray-900 tracking-tight mt-1">{value}</h4>
        <p className={`text-xs mt-1 font-medium ${intent === 'danger' ? 'text-rose-600' : 'text-gray-400'}`}>
          {subtext}
        </p>
      </div>
    </div>
  );
}