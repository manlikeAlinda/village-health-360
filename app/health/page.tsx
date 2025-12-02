"use client";
import {
  Activity, Baby, Syringe, HeartPulse,
  TrendingUp, AlertCircle, Calendar, LucideIcon,
  ArrowUpRight, ArrowDownRight, MapPin, Phone,
  Users, Layers
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, ReferenceLine, Legend, Label, Cell
} from "recharts";
// --- Mock Data: High-Fidelity for Presentation ---
// Note: Malaria cases are in thousands (K) to represent a large cohort size for realism
const diseaseData = [
  { month: "Jan", malaria: 6.5, diarrhea: 4.0, threshold: 7.5 },
  { month: "Feb", malaria: 5.9, diarrhea: 3.5, threshold: 7.5 },
  { month: "Mar", malaria: 8.0, diarrhea: 2.5, threshold: 7.5 },
  { month: "Apr", malaria: 8.1, diarrhea: 3.0, threshold: 7.5 },
  { month: "May", malaria: 5.6, diarrhea: 2.0, threshold: 7.5 },
  { month: "Jun", malaria: 4.0, diarrhea: 1.5, threshold: 7.5 },
];
const immunizationData = [
  { name: "BCG (Birth)", rate: 98, fill: "#10B981" },
  { name: "Polio (Opv)", rate: 92, fill: "#3B82F6" },
  { name: "Measles", rate: 85, fill: "#F59E0B" },
  { name: "DPT3 (14wk)", rate: 78, fill: "#EF4444" },
];
const highRiskMothers = [
  { id: "M-102", name: "Achan Grace", village: "Koro", issue: "Severe Anemia (Hb < 8g/dL)", riskLevel: "Critical", due: "2 weeks", action: "Emergency Transfer" },
  { id: "M-205", name: "Laker Sarah", village: "Bwobo", issue: "History of Postpartum Hemorrhage (PPH)", riskLevel: "High", due: "1 month", action: "VHT Follow-up" },
  { id: "M-311", name: "Akello Rose", village: "Ajulu", issue: "Teenage (16y) Primigravida / Low BMI", riskLevel: "Moderate", due: "3 weeks", action: "Nutrition Support" },
];
// --- Component System ---
export default function PublicHealthTriage() {
  return (
    <main className="space-y-6 md:space-y-8 bg-gray-50/50 min-h-screen p-4 sm:p-6">
     
      {/* 1. Executive Summary & Context */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-gray-200 pb-4 md:pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Public Health Triage & Management</h1>
          <p className="text-gray-500 font-medium mt-1">
            Maternal & Child Health (MCH) Program Monitoring • <span className="text-gray-400 font-normal">Q2 2024 Performance Review</span>
          </p>
         
        </div>
       
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Operational Status</p>
            <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-bold flex items-center gap-1 shadow-sm border border-green-200">
              <TrendingUp size={16} /> District Risk Posture: Stable
            </span>
          </div>
        </div>
      </header>
      {/* 2. Key Programmatic Outcome Metrics (KPI Grid) */}
      <section aria-label="Key Performance Indicators" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <HealthStat
          label="Maternal Engagement Rate"
          value="64%"
          trend="-12% vs WHO Target"
          trendDir="down"
          icon={Baby}
          intent="warning"
        />
        <HealthStat
          label="Immunization Coverage (DPT3)"
          value="82%"
          trend="8% Gap Requires Targeting"
          trendDir="neutral"
          icon={Syringe}
          intent="brand"
        />
        <HealthStat
          label="Facility Case Reduction (YoY)"
          value="1,240"
          trend="-5% vs Last Period"
          trendDir="up" // Semantic: Reduction in cases is positive trend
          icon={Activity}
          intent="success"
        />
        <HealthStat
          label="Skilled Birth Attendance"
          value="88%"
          trend="+2% QoQ Growth"
          trendDir="up"
          icon={HeartPulse}
          intent="brand"
        />
      </section>
     
      <hr className="border-gray-100" />
      {/* 3. Data Visualization & Predictive Analytics Layer */}
      <section aria-label="Data Visualization and Epidemiology" className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
       
        {/* Chart A: Epidemiology Trends - Demonstrates Risk Modeling */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-4 md:mb-6">
            <div>
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Layers size={18} className="text-indigo-500" />
                Disease Incidence Time-Series
              </h3>
              <p className="text-xs text-gray-500 mt-1">Cases (in thousands) compared against established epidemic alert thresholds.</p>
             
            </div>
          </div>
         
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={diseaseData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} label={{ value: 'Cases (k)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#6B7280' }} />
                <Tooltip
                  formatter={(value) => [`${value}k cases`, 'Incidence']}
                  labelFormatter={(label) => `Month: ${label}`}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
               
                {/* Critical Feature: Dynamic Threshold */}
                <ReferenceLine y={7.5} label={{ value: "Epidemic Alert Threshold", position: 'top', fill: 'red', fontSize: 10 }} stroke="red" strokeDasharray="3 3" opacity={0.6} />
               
                <Line type="monotone" dataKey="malaria" stroke="#EF4444" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} name="Malaria" />
                <Line type="monotone" dataKey="diarrhea" stroke="#F97316" strokeWidth={3} dot={false} name="Diarrhea" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Chart B: Immunization Funnel - Demonstrates Micro-Intervention Targeting */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Syringe size={18} className="text-blue-600" />
              Immunization Drop-off Analysis
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Retention analysis against the mandated national schedule.
            </p>
          </div>
          <div className="h-64 sm:h-72 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={immunizationData} layout="vertical" margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#F3F4F6" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12, fontWeight: 500, fill: '#374151'}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#F3F4F6'}} />
                <Bar dataKey="rate" radius={[0, 4, 4, 0]} barSize={24}>
                    {immunizationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
         
          {/* Action Panel: Targeted Intervention */}
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-100 flex gap-3 items-start">
            <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-700">Actionable Gap: DPT3</p>
              <p className="text-xs text-red-600/80 leading-relaxed mt-1">
                A **20% drop-off** from BCG to DPT3 indicates a failure in longitudinal follow-up (Week 14 target). We project **380 children** are now at risk.
              </p>
              <button className="text-xs font-bold text-blue-700 mt-2 hover:underline">
                 Generate VHT Follow-up List <ChevronRight size={12} className="inline-block" />
              </button>
            </div>
          </div>
        </div>
      </section>
      <hr className="border-gray-100" />
      {/* 4. Active Case Management (Risk Stratification) */}
      <section aria-label="Active Case Management" className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-rose-50/50 gap-4">
          <div>
            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-base sm:text-lg">
              <Users size={18} className="text-red-600" />
              Active Maternal Risk Registry
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Prioritized caseload for VHT intervention, sorted by S.M.A.R.T. protocol trigger.
            </p>
            {/* Contextual link to clinical standard */}
          </div>
          <button className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors shadow-sm w-full sm:w-auto">
            View Full Cohort (142 Active)
          </button>
        </div>
       
        <div className="divide-y divide-gray-100">
          {highRiskMothers.map((mom) => (
            <div key={mom.id} className="p-4 md:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-rose-50 transition-colors group">
             
              <div className="flex items-start gap-4 flex-1">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ring-4
                  ${mom.riskLevel === 'Critical' ? 'bg-red-100 text-red-700 ring-red-50' : 'bg-orange-100 text-orange-700 ring-orange-50'}
                `}>
                  {mom.id.split('-')[1]}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{mom.name}</h4>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {mom.village}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="font-medium text-gray-700">{mom.issue}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 sm:gap-6 pl-14 md:pl-0 shrink-0 flex-wrap md:flex-nowrap">
                 {/* Action Tag - Explicit Intervention */}
                <div className="text-left sm:text-right">
                  <div className="text-xs font-medium text-gray-500 uppercase">Immediate Protocol</div>
                  <div className={`text-sm font-bold mt-0.5 ${mom.riskLevel === 'Critical' ? 'text-red-600' : 'text-blue-600'}`}>
                    {mom.action}
                  </div>
                </div>
                <div className="text-left sm:text-right hidden xs:block">
                  <div className="text-xs font-medium text-gray-500">Expected Delivery</div>
                  <div className="text-sm font-bold text-gray-900 flex items-center gap-1 justify-start sm:justify-end mt-0.5">
                    <Calendar size={14} className="text-purple-600" /> {mom.due}
                  </div>
                </div>
               
                <button className="p-2 bg-white border border-gray-200 text-gray-500 rounded-lg hover:text-blue-600 hover:border-blue-200 transition shadow-sm group-hover:shadow-md">
                  <Phone size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
// --- Component System ---
interface HealthStatProps {
  label: string;
  value: string;
  trend: string;
  trendDir: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  intent: 'brand' | 'warning' | 'success';
}
function HealthStat({ label, value, trend, trendDir, icon: Icon, intent }: HealthStatProps) {
  const styles = {
    brand: "bg-blue-50 text-blue-600",
    warning: "bg-orange-50 text-orange-600",
    success: "bg-green-50 text-green-600",
  };
  const trendColor =
    trendDir === 'neutral' ? 'text-gray-400' :
    (trendDir === 'up' && intent !== 'warning') || (trendDir === 'down' && intent === 'warning')
      ? 'text-green-600'
      : 'text-red-500';
  const TrendIcon = trendDir === 'up' ? ArrowUpRight : ArrowDownRight;
  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className={`p-2.5 rounded-xl ${styles[intent]}`}>
          <Icon size={22} />
        </div>
        {trendDir !== 'neutral' && (
          <span className={`flex items-center text-xs font-bold ${trendColor} bg-gray-50 px-2 py-1 rounded-full`}>
            <TrendIcon size={14} /> {trendDir === 'up' ? '+' : ''}{trend.split(' ')[0]}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <h4 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mt-1">{value}</h4>
        <p className="text-xs text-gray-400 mt-1">{trend}</p>
      </div>
    </div>
  );
}
function ChevronRight({ size, className }: { size: number, className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}