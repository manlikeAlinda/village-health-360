"use client";

import {
  Sprout, CloudRain, Tractor, Wheat,
  TrendingUp, AlertOctagon, LucideIcon,
  CalendarDays, CheckCircle2, Clock, Info,
  MoreHorizontal, ArrowUpRight
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend, ReferenceLine
} from "recharts";

// --- Mock Data ---
const seasonProgress = 65; // % complete
const cropYieldData = [
  { crop: "Maize", current: 4.5, target: 5.0, status: "On Track" },
  { crop: "Beans", current: 1.2, target: 1.5, status: "Risk" },
  { crop: "Cassava", current: 12.0, target: 10.0, status: "Exceeding" },
  { crop: "Coffee", current: 0.8, target: 1.2, status: "Critical" },
];
const eligibleFarmers = [
  { id: "F-441", name: "Opiyo Moses", village: "Bwobo", crop: "Maize", need: "Drought-Resistant Seeds", status: "Verified", priority: "High" },
  { id: "F-102", name: "Achan Mary", village: "Koro", crop: "Beans", need: "Fertilizer Support", status: "Pending", priority: "Medium" },
  { id: "F-339", name: "Kidega Sam", village: "Ajulu", crop: "Coffee", need: "Pruning Tools", status: "Verified", priority: "Low" },
  { id: "F-550", name: "Lakot Jenifer", village: "Omoro", crop: "Vegetables", need: "Irrigation Pump", status: "Urgent", priority: "Critical" },
];

// --- Component System ---
interface AgriStatProps {
  label: string;
  value: string;
  subtext: string;
  icon: LucideIcon;
  intent: 'brand' | 'success' | 'warning' | 'danger';
}

function AgriStat({ label, value, subtext, icon: Icon, intent }: AgriStatProps) {
  const styles = {
    brand: "bg-green-50 text-green-700",
    success: "bg-emerald-50 text-emerald-600",
    warning: "bg-amber-50 text-amber-600",
    danger: "bg-rose-50 text-rose-600",
  };
  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className={`p-2 sm:p-2.5 rounded-xl ${styles[intent]}`}>
          <Icon className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px]" />
        </div>
      </div>
      <div className="mt-3 sm:mt-4">
        <p className="text-xs sm:text-sm font-medium text-gray-500">{label}</p>
        <h4 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mt-1 tabular-nums">{value}</h4>
        <p className={`text-[10px] sm:text-xs mt-1 font-medium ${intent === 'danger' ? 'text-rose-600' : 'text-gray-400'}`}>
          {subtext}
        </p>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-gray-200 pb-4 sm:pb-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 uppercase tracking-wide">
            Season: First Rains (March - June)
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Food Security Monitor</h1>
        <p className="text-sm sm:text-base text-gray-500 font-medium">
          Crop Production & Input Distribution
        </p>
      </div>
      
      {/* Seasonality Widget */}
      <div className="bg-white border border-gray-200 p-2 sm:p-3 rounded-xl shadow-sm w-full sm:min-w-[240px] md:w-auto">
        <div className="flex justify-between items-center text-xs font-semibold text-gray-700 mb-2">
          <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Season Progress</span>
          <span>{seasonProgress}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full"
            style={{ width: `${seasonProgress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-gray-400 font-medium uppercase">
          <span>Planting</span>
          <span>Harvest</span>
        </div>
      </div>
    </header>
  );
}

function YieldAnalysis() {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h3 className="font-bold text-gray-900 flex items-center gap-2 text-base sm:text-lg">
            <Wheat size={18} className="text-amber-500" />
            Yield Gap Analysis
          </h3>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
            Actual output (Tons/Ha) vs. Seasonal Targets.
          </p>
        </div>
        {/* EDUCATIONAL TRIGGER */}
        <div className="group relative">
          <button className="flex items-center gap-1 text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100 hover:bg-blue-100 transition">
            <Info size={11} className="hidden sm:inline" /> Crop Stages
          </button>
          {/* In a real app, this triggers a modal. Here we show context. */}
          <div className="hidden group-hover:block absolute right-0 top-8 w-64 sm:w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-10">
            [Image of maize crop growth stages]
            <p className="mt-2 text-gray-300">
              Current Maize Stage: <span className="text-white font-bold">Tasseling</span>. Critical time for nitrogen application.
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-[250px] sm:min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={cropYieldData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis dataKey="crop" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
            <RechartsTooltip
              cursor={{fill: '#F9FAFB'}}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="top" align="right" iconType="circle" height={36}/>
            <Bar dataKey="current" name="Actual Yield" fill="#10B981" radius={[4, 4, 0, 0]} barSize={28} />
            <Bar dataKey="target" name="Target" fill="#E5E7EB" radius={[4, 4, 0, 0]} barSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function InputRequestQueue() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h3 className="font-bold text-gray-900 flex items-center gap-2 text-base sm:text-lg">
            <Sprout size={18} className="text-green-600" />
            Input Request Queue
          </h3>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Farmers eligible for subsidized seeds & tools.</p>
        </div>
        <button className="text-[10px] sm:text-xs font-bold text-green-700 bg-green-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-green-200 transition w-full sm:w-auto">
          Process All
        </button>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <table className="w-full text-left text-xs sm:text-sm divide-y divide-gray-100">
          <thead className="bg-gray-50 text-gray-400 font-semibold text-[10px] sm:text-[11px] uppercase tracking-wider sticky top-0">
            <tr>
              <th className="px-4 sm:px-6 py-2 sm:py-3">Farmer Profile</th>
              <th className="px-4 sm:px-6 py-2 sm:py-3">Request Details</th>
              <th className="px-4 sm:px-6 py-2 sm:py-3 text-right">Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {eligibleFarmers.map((farmer) => (
              <tr key={farmer.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-4 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-[10px] sm:text-xs font-bold border border-green-200">
                      {farmer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm sm:text-base">{farmer.name}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1">
                        {farmer.id} • {farmer.village}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-gray-900 text-sm sm:text-base">{farmer.need}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] sm:text-xs text-gray-500 bg-gray-100 px-1 sm:px-1.5 py-0.5 rounded">
                        {farmer.crop}
                      </span>
                      {/* Contextual verification tool */}
                      {farmer.need.includes("Seeds") && (
                        <span className="text-[10px] text-blue-600 cursor-help hover:underline decoration-dotted" title="View drought-resistance specs">
                          [Specs]
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                  <div className="flex flex-col items-end gap-1">
                    <span className={`
                      px-1.5 sm:px-2 py-0.5 rounded text-[10px] font-bold border
                      ${farmer.status === "Urgent" ? "bg-red-50 text-red-700 border-red-200" :
                        farmer.status === "Verified" ? "bg-blue-50 text-blue-700 border-blue-200" :
                        "bg-gray-50 text-gray-600 border-gray-200"}
                    `}>
                      {farmer.status}
                    </span>
                    {farmer.status === "Pending" && (
                      <button className="text-[10px] font-medium text-blue-600 hover:text-blue-800 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        Verify <ArrowUpRight size={10} className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KPICards() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      <AgriStat
        label="Active Farmers"
        value="85%"
        subtext="Target: 90%"
        icon={Tractor}
        intent="brand"
      />
      <AgriStat
        label="Food Insecurity"
        value="12%"
        subtext="High Risk Households"
        icon={AlertOctagon}
        intent="danger"
      />
      <AgriStat
        label="Harvest Projection"
        value="$1.2M"
        subtext="Current Season Value"
        icon={TrendingUp}
        intent="success"
      />
      <AgriStat
        label="Inputs Distributed"
        value="3,450"
        subtext="Kits Delivered"
        icon={Sprout}
        intent="warning"
      />
    </section>
  );
}

function VisualizationLayer() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <YieldAnalysis />
      <InputRequestQueue />
    </section>
  );
}

export default function AgriculturePage() {
  return (
    <main className="space-y-6 sm:space-y-8 bg-gray-50/50 min-h-screen p-4 sm:p-6">
      <Header />
      <KPICards />
      <VisualizationLayer />
    </main>
  );
}