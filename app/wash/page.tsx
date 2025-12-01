"use client";

import { 
  Droplets, Wrench, Ban, CheckCircle, 
  MapPin, AlertTriangle, Hammer, LucideIcon 
} from "lucide-react";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

// 1. Mock Data: Water Source Types [cite: 13-17]
const waterSourceData = [
  { name: "Safe (Borehole/Tap)", value: 65, color: "#22C55E" }, // Green
  { name: "Unsafe (River/Pond)", value: 35, color: "#EF4444" }, // Red
];

// 2. Mock Data: Sanitation Coverage (Latrine Type) [cite: 19-21]
const sanitationData = [
  { name: "VIP Latrine", count: 450 },
  { name: "Traditional Pit", count: 1200 },
  { name: "Shared/Communal", count: 300 },
  { name: "Open Defecation", count: 150 }, // Critical indicator
];

// 3. Mock Data: Broken Infrastructure Alerts [cite: 89-91]
const brokenInfrastructure = [
  { id: "WP-09", type: "Borehole", location: "Bwobo Village", issue: "Pump Handle Broken", daysDown: 4, mechanic: "Not Assigned" },
  { id: "WP-12", type: "Tap Stand", location: "Koro Market", issue: "Leaking Pipe", daysDown: 2, mechanic: "John O." },
  { id: "WP-44", type: "Protected Spring", location: "Ajulu", issue: "Contaminated Runoff", daysDown: 1, mechanic: "Pending" },
];

export default function WashPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WASH Intelligence</h1>
          <p className="text-gray-500 text-sm">Water Access, Sanitation & Infrastructure Monitoring</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold flex items-center gap-1">
            <Wrench size={14} /> Maintenance: 3 Alerts
          </span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <WashStat 
          title="Safe Water Access" 
          value="65%" 
          target="Target: 80%" 
          icon={CheckCircle} 
          color="text-green-600 bg-green-50" 
        />
        <WashStat 
          title="Latrine Coverage" 
          value="92%" 
          target="+5% vs last year" 
          icon={Ban} 
          color="text-orange-600 bg-orange-50" 
        />
        <WashStat 
          title="Broken Points" 
          value="12" 
          target="Avg Downtime: 3 days" 
          icon={Wrench} 
          color="text-red-600 bg-red-50" 
        />
        <WashStat 
          title="Avg Distance" 
          value="1.2 km" 
          target="Target: < 0.5 km" 
          icon={MapPin} 
          color="text-blue-600 bg-blue-50" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Safe vs Unsafe Water (Pie) */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Droplets size={18} className="text-brand-blue" />
            Water Source Safety
          </h3>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={waterSourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {waterSourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mb-4">
               <span className="text-3xl font-bold text-gray-800">65%</span>
               <p className="text-xs text-gray-500">Safe</p>
            </div>
          </div>
        </div>

        {/* Chart 2: Sanitation Types (Bar) */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Ban size={18} className="text-orange-600" />
            Sanitation Infrastructure
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sanitationData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="count" fill="#F97316" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">Households by latrine type</p>
        </div>
      </div>

      {/* Priority Action List: Infrastructure Repairs */}
      <div className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden">
        <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex justify-between items-center">
          <h3 className="font-bold text-red-800 flex items-center gap-2">
            <AlertTriangle size={18} />
            Critical Infrastructure: Repairs Needed
          </h3>
          <button className="text-xs font-bold text-red-600 hover:text-red-800">Dispatch Mechanic</button>
        </div>
        <div className="divide-y divide-gray-100">
          {brokenInfrastructure.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Hammer size={16} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{item.type} <span className="text-gray-400 font-normal">| {item.id}</span></p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin size={10} /> {item.location}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded inline-block">
                  {item.issue}
                </p>
                <div className="flex items-center justify-end gap-2 mt-1">
                  <p className="text-xs text-gray-500">Down: {item.daysDown} days</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                    item.mechanic === "Pending" ? "bg-gray-100 text-gray-500 border-gray-200" : "bg-blue-50 text-blue-600 border-blue-100"
                  }`}>
                    {item.mechanic}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Helper Components & Types ---

interface WashStatProps {
  title: string;
  value: string;
  target: string;
  icon: LucideIcon;
  color: string;
}

function WashStat({ title, value, target, icon: Icon, color }: WashStatProps) {
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