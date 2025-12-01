"use client";

import { 
  Sprout, CloudRain, Tractor, Wheat, 
  TrendingUp, AlertOctagon, LucideIcon 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from "recharts";

// 1. Mock Data: Seasonal Harvest Yields (vs Target) [cite: Proposal Widget]
const cropYieldData = [
  { crop: "Maize", current: 4.5, target: 5.0 }, // Tons per hectare
  { crop: "Beans", current: 1.2, target: 1.5 },
  { crop: "Cassava", current: 12.0, target: 10.0 }, // Exceeded target
  { crop: "Coffee", current: 0.8, target: 1.2 },
];

// 2. Mock Data: Households Needing Inputs (Seeds/Tools) [cite: Proposal Targeting]
const eligibleFarmers = [
  { id: "F-441", name: "Opiyo Moses", village: "Bwobo", crop: "Maize", need: "Drought-Resistant Seeds", status: "Verified" },
  { id: "F-102", name: "Achan Mary", village: "Koro", crop: "Beans", need: "Fertilizer Support", status: "Pending" },
  { id: "F-339", name: "Kidega Sam", village: "Ajulu", crop: "Coffee", need: "Pruning Tools", status: "Verified" },
  { id: "F-550", name: "Lakot Jenifer", village: "Omoro", crop: "Vegetables", need: "Irrigation Pump", status: "Urgent" },
];

export default function AgriculturePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agriculture & Food Security</h1>
          <p className="text-gray-500 text-sm">Crop Production, Inputs & Famine Early Warning</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1">
            <CloudRain size={14} /> Rainfall: Normal
          </span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AgriStat 
          title="Farming Households" 
          value="85%" 
          subtext="Of total registered" 
          icon={Tractor} 
          color="text-green-600 bg-green-50" 
        />
        <AgriStat 
          title="Food Insecurity" 
          value="12%" 
          subtext="High risk (1 meal/day)" 
          icon={AlertOctagon} 
          color="text-red-600 bg-red-50" 
        />
        <AgriStat 
          title="Est. Harvest Value" 
          value="$1.2M" 
          subtext="Current Season Projection" 
          icon={TrendingUp} 
          color="text-blue-600 bg-blue-50" 
        />
        <AgriStat 
          title="Inputs Distributed" 
          value="3,450" 
          subtext="Farmers supported" 
          icon={Sprout} 
          color="text-yellow-600 bg-yellow-50" 
        />
      </div>

      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart: Yield Gap Analysis */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Wheat size={18} className="text-brand-agri" />
            Harvest Yields: Actual vs Target (Tons/Ha)
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cropYieldData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="crop" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                <Tooltip cursor={{fill: '#F3F4F6'}} />
                <Legend />
                <Bar dataKey="current" name="Current Yield" fill="#22C55E" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="target" name="Target Yield" fill="#D1D5DB" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action List: Input Support Targeting */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Sprout size={18} className="text-green-600" />
              Eligible for Input Support
            </h3>
            <button className="text-xs font-bold text-brand-blue hover:underline">Export List</button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-3">Farmer</th>
                  <th className="px-6 py-3">Crop</th>
                  <th className="px-6 py-3">Need</th>
                  <th className="px-6 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {eligibleFarmers.map((farmer) => (
                  <tr key={farmer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {farmer.name}
                      <p className="text-xs text-gray-400">{farmer.village}</p>
                    </td>
                    <td className="px-6 py-3 text-gray-600">{farmer.crop}</td>
                    <td className="px-6 py-3">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                        {farmer.need}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span className={`text-xs font-bold ${
                        farmer.status === "Urgent" ? "text-red-600" : "text-green-600"
                      }`}>
                        {farmer.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-200 bg-gray-50 text-center">
            <button className="text-sm font-medium text-gray-500 hover:text-gray-900">View all 450 eligible farmers</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Helper Components & Interfaces ---

interface AgriStatProps {
  title: string;
  value: string;
  subtext: string;
  icon: LucideIcon;
  color: string;
}

function AgriStat({ title, value, subtext, icon: Icon, color }: AgriStatProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <h4 className="text-2xl font-bold text-gray-900 mt-1">{value}</h4>
        <p className="text-xs text-gray-400 mt-1">{subtext}</p>
      </div>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon size={20} />
      </div>
    </div>
  );
}