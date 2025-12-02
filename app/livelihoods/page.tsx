"use client";

import { 
  Wallet, Briefcase, TrendingUp, Users, 
  PiggyBank, ArrowUpRight, ArrowDownRight,
  Info, AlertCircle, MoreHorizontal, LucideIcon 
} from "lucide-react";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend
} from "recharts";

// --- Mock Data ---
const incomeData = [
  { name: "Subsistence Farming", value: 60, color: "#8B5CF6" }, // Violet (Primary)
  { name: "Small Trade/Shop", value: 15, color: "#EC4899" },    // Pink
  { name: "Casual Labor", value: 10, color: "#F59E0B" },        // Amber
  { name: "Formal Employment", value: 5, color: "#3B82F6" },    // Blue
  { name: "Remittances/Aid", value: 10, color: "#10B981" },     // Emerald
];

const vslaGroups = [
  { id: "VS-01", name: "Bwobo Women United", members: 30, savings: 4500000, target: 5000000, status: "Active", risk: "Low" },
  { id: "VS-02", name: "Koro Youth Savings", members: 15, savings: 1200000, target: 3000000, status: "Struggling", risk: "High" },
  { id: "VS-03", name: "Ajulu Farmers Group", members: 45, savings: 8900000, target: 9000000, status: "Active", risk: "Low" },
  { id: "VS-04", name: "Omoro Widows Fund", members: 22, savings: 2100000, target: 2000000, status: "Active", risk: "Low" },
];

export default function LivelihoodsPage() {
  return (
    <main className="space-y-8 bg-gray-50/50 min-h-screen p-6">
      
      {/* 1. Header: Economic Climate */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 uppercase tracking-wide">
               Sector: Local Economy
             </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Livelihoods Monitor</h1>
          <p className="text-gray-500 font-medium">
            Household Income, Financial Inclusion & Resilience
          </p>
        </div>
        
        <div className="flex gap-3">
          <div className="text-right hidden md:block">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Exchange Rate</p>
            <p className="text-sm font-bold text-gray-700 font-mono">1 USD = 3,750 UGX</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition shadow-sm">
            <MoreHorizontal size={16} /> Export Data
          </button>
        </div>
      </header>

      {/* 2. KPI Cards: Financial Health */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <EconStat 
          label="Avg Household Income" 
          value="$45" 
          suffix="/mo"
          trend="+5% YoY" 
          trendDir="up"
          icon={Wallet} 
          intent="brand" 
        />
        <EconStat 
          label="VSLA Participation" 
          value="42%" 
          trend="High Retention"
          trendDir="neutral"
          icon={PiggyBank} 
          intent="success" 
        />
        <EconStat 
          label="Youth Employment" 
          value="28%" 
          trend="Vocational Growth"
          trendDir="up"
          icon={Briefcase} 
          intent="brand" 
        />
        <EconStat 
          label="Aid Dependency" 
          value="15%" 
          trend="Target: <10%"
          trendDir="down"
          icon={Users} 
          intent="warning" 
        />
      </section>

      {/* 3. Visualization Layer */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart A: Income Diversification */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
          <div className="mb-2">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Wallet size={18} className="text-purple-600" />
              Income Source Distribution
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Breakdown of primary revenue streams per household.
            </p>
          </div>

          <div className="flex-1 min-h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incomeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {incomeData.map((entry, index) => (
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
            
            {/* Center Metric: Dominant Source */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center -mt-6 pointer-events-none">
              <span className="text-4xl font-extrabold text-gray-900 tracking-tight">60%</span>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-1">Agrarian</p>
            </div>
          </div>
        </div>

        {/* List: VSLA Portfolio */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
            <div>
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <PiggyBank size={18} className="text-pink-600" />
                VSLA Portfolio
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xs leading-relaxed">
                Performance of Village Savings & Loan Associations.
              </p>
            </div>
            
            {/* DIAGRAM TRIGGER: Educational Context */}
            <div className="group relative">
               <button className="flex items-center gap-1 text-[10px] font-bold bg-pink-50 text-pink-600 px-2 py-1 rounded border border-pink-100 hover:bg-pink-100 transition">
                 <Info size={12} /> Model Info
               </button>
               <div className="hidden group-hover:block absolute right-0 top-8 w-80 p-4 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-20">
                 <p className="font-bold mb-2 text-pink-200">The VSLA Cycle:</p>
                 
                 <p className="mt-3 text-gray-300">
                   Groups operate on a 9-12 month cycle. Funds are accumulated (Savings) and lent out (Loans) before a final Share-out.
                 </p>
               </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-400 font-semibold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Group Profile</th>
                  <th className="px-6 py-3">Savings Pool (UGX)</th>
                  <th className="px-6 py-3 text-right">Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vslaGroups.map((group) => {
                  const percent = Math.min(100, Math.round((group.savings / group.target) * 100));
                  return (
                    <tr key={group.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{group.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                          <Users size={12} /> {group.members} Members
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono font-medium text-gray-700">
                          {group.savings.toLocaleString()}
                        </div>
                        {/* Progress Bar */}
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${group.status === "Struggling" ? "bg-red-400" : "bg-green-500"}`} 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1">{percent}% of target</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                         {group.status === "Struggling" ? (
                           <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-100">
                             <AlertCircle size={10} /> At Risk
                           </span>
                         ) : (
                           <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-100">
                             <TrendingUp size={10} /> Healthy
                           </span>
                         )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}

// --- Component System ---

interface EconStatProps {
  label: string;
  value: string;
  suffix?: string;
  trend: string;
  trendDir: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  intent: 'brand' | 'success' | 'warning';
}

function EconStat({ label, value, suffix, trend, trendDir, icon: Icon, intent }: EconStatProps) {
  const styles = {
    brand: "bg-purple-50 text-purple-600",
    success: "bg-pink-50 text-pink-600",
    warning: "bg-orange-50 text-orange-600",
  };

  const TrendIcon = trendDir === 'up' ? ArrowUpRight : ArrowDownRight;
  const trendColor = trendDir === 'up' ? 'text-green-600' : trendDir === 'down' ? 'text-red-500' : 'text-gray-400';

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className={`p-2.5 rounded-xl ${styles[intent]}`}>
          <Icon size={22} />
        </div>
        <span className={`flex items-center text-xs font-bold ${trendColor} bg-gray-50 px-2 py-1 rounded-full`}>
          <TrendIcon size={14} /> {trend}
        </span>
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <div className="flex items-baseline gap-1 mt-1">
          <h4 className="text-2xl font-bold text-gray-900 tracking-tight tabular-nums">{value}</h4>
          {suffix && <span className="text-sm text-gray-400 font-medium">{suffix}</span>}
        </div>
      </div>
    </div>
  );
}