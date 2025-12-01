"use client";

import { 
  Wallet, Briefcase, TrendingUp, Users, 
  PiggyBank, ArrowUpRight, LucideIcon 
} from "lucide-react";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from "recharts";

// 1. Mock Data: Primary Income Sources [cite: Proposal Livelihoods Widget]
const incomeData = [
  { name: "Subsistence Farming", value: 60, color: "#A855F7" }, // Purple
  { name: "Small Trade/Shop", value: 15, color: "#EC4899" },    // Pink
  { name: "Casual Labor", value: 10, color: "#F59E0B" },        // Amber
  { name: "Formal Employment", value: 5, color: "#3B82F6" },    // Blue
  { name: "Remittances/Aid", value: 10, color: "#10B981" },     // Green
];

// 2. Mock Data: VSLA (Village Savings & Loan) Groups
const vslaGroups = [
  { id: "VS-01", name: "Bwobo Women United", members: 30, savings: "UGX 4.5M", status: "Active" },
  { id: "VS-02", name: "Koro Youth Savings", members: 15, savings: "UGX 1.2M", status: "Struggling" },
  { id: "VS-03", name: "Ajulu Farmers Group", members: 45, savings: "UGX 8.9M", status: "Active" },
  { id: "VS-04", name: "Omoro Widows Fund", members: 22, savings: "UGX 2.1M", status: "Active" },
];

export default function LivelihoodsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Livelihoods & Economics</h1>
          <p className="text-gray-500 text-sm">Income, Savings (VSLA) & Financial Inclusion</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold flex items-center gap-1">
            <TrendingUp size={14} /> Local Economy: Growing
          </span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <LivelihoodStat 
          title="Avg Household Income" 
          value="$45 /mo" 
          subtext="+5% vs last year" 
          icon={Wallet} 
          color="text-purple-600 bg-purple-50" 
        />
        <LivelihoodStat 
          title="VSLA Participation" 
          value="42%" 
          subtext="Households saving active" 
          icon={PiggyBank} 
          color="text-pink-600 bg-pink-50" 
        />
        <LivelihoodStat 
          title="Youth Employment" 
          value="28%" 
          subtext="Engaged in trade/skills" 
          icon={Briefcase} 
          color="text-blue-600 bg-blue-50" 
        />
        <LivelihoodStat 
          title="Financial Aid" 
          value="15%" 
          subtext="Dependent on support" 
          icon={Users} 
          color="text-orange-600 bg-orange-50" 
        />
      </div>

      {/* Charts & Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart: Income Source Distribution */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Wallet size={18} className="text-brand-live" />
            Primary Income Sources
          </h3>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incomeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {incomeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mb-6">
               <span className="text-2xl font-bold text-gray-800">60%</span>
               <p className="text-xs text-gray-500">Farming</p>
            </div>
          </div>
        </div>

        {/* List: VSLA Groups Performance */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <PiggyBank size={18} className="text-purple-600" />
              Community Savings Groups (VSLA)
            </h3>
            <button className="text-xs font-bold text-brand-live hover:underline">View All</button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-3">Group Name</th>
                  <th className="px-6 py-3">Savings Pool</th>
                  <th className="px-6 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vslaGroups.map((group) => (
                  <tr key={group.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <p className="font-medium text-gray-900">{group.name}</p>
                      <p className="text-xs text-gray-500">{group.members} Members</p>
                    </td>
                    <td className="px-6 py-3 font-mono text-gray-700">{group.savings}</td>
                    <td className="px-6 py-3 text-right">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        group.status === "Active" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {group.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

// --- Helper Components ---

interface LivelihoodStatProps {
  title: string;
  value: string;
  subtext: string;
  icon: LucideIcon;
  color: string;
}

function LivelihoodStat({ title, value, subtext, icon: Icon, color }: LivelihoodStatProps) {
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