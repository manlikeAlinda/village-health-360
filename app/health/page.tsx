"use client";

import { 
  Activity, Baby, Syringe, HeartPulse, 
  TrendingUp, AlertCircle, Calendar, LucideIcon,
  ArrowUpRight, ArrowDownRight, MapPin, Phone
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, ReferenceLine, Legend
} from "recharts";

// --- Mock Data ---
const diseaseData = [
  { month: "Jan", malaria: 65, diarrhea: 40, threshold: 75 },
  { month: "Feb", malaria: 59, diarrhea: 35, threshold: 75 },
  { month: "Mar", malaria: 80, diarrhea: 25, threshold: 75 }, // Crossing threshold
  { month: "Apr", malaria: 81, diarrhea: 30, threshold: 75 },
  { month: "May", malaria: 56, diarrhea: 20, threshold: 75 },
  { month: "Jun", malaria: 40, diarrhea: 15, threshold: 75 },
];

const immunizationData = [
  { name: "BCG (Birth)", rate: 98, fill: "#10B981" }, // Green
  { name: "Polio (Opv)", rate: 92, fill: "#3B82F6" }, // Blue
  { name: "Measles", rate: 85, fill: "#F59E0B" },    // Orange
  { name: "DPT3 (14wk)", rate: 78, fill: "#EF4444" }, // Red (Critical Gap)
];

const highRiskMothers = [
  { id: "M-102", name: "Achan Grace", village: "Koro", issue: "Anemia (Hb < 8g/dL)", riskLevel: "Critical", due: "2 weeks" },
  { id: "M-205", name: "Laker Sarah", village: "Bwobo", issue: "History of PPH", riskLevel: "High", due: "1 month" },
  { id: "M-311", name: "Akello Rose", village: "Ajulu", issue: "Teenage (16y) Primigravida", riskLevel: "Moderate", due: "3 weeks" },
];

export default function HealthPage() {
  return (
    <main className="space-y-8 bg-gray-50/50 min-h-screen p-6">
      
      {/* 1. Header: Context & Status */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Health Surveillance</h1>
          <p className="text-gray-500 font-medium mt-1">
            Maternal, Child & Disease Epidemiology • <span className="text-gray-400 font-normal">Q2 2024 Report</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold shadow-sm flex items-center gap-2">
            <Calendar size={14} /> Last Updated: 2 Hours ago
          </span>
          <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm border border-green-200">
            <TrendingUp size={14} /> District Status: Stable
          </span>
        </div>
      </header>

      {/* 2. Metric Cards: Quick Scan */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <HealthStat 
          label="ANC 4+ Visits" 
          value="64%" 
          trend="-12% vs Target" 
          trendDir="down"
          icon={Baby} 
          intent="warning"
        />
        <HealthStat 
          label="Fully Immunized" 
          value="82%" 
          trend="Gap in DPT3" 
          trendDir="neutral"
          icon={Syringe} 
          intent="brand"
        />
        <HealthStat 
          label="Malaria Incidence" 
          value="1,240" 
          trend="-5% vs last month" 
          trendDir="up" // Up is good here because cases went down (semantic logic)
          icon={Activity} 
          intent="success"
        />
        <HealthStat 
          label="Facility Deliveries" 
          value="88%" 
          trend="+2% increase" 
          trendDir="up"
          icon={HeartPulse} 
          intent="brand"
        />
      </section>

      {/* 3. Data Visualization Layer */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart A: Epidemiology Trends */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Activity size={18} className="text-red-500" />
                Disease Incidence Trends
              </h3>
              <p className="text-xs text-gray-500 mt-1">Compared against district alert thresholds</p>
            </div>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={diseaseData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                  itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                
                {/* Semantic: Threshold Line */}
                <ReferenceLine y={75} label="Alert Threshold" stroke="red" strokeDasharray="3 3" opacity={0.5} />
                
                <Line type="monotone" dataKey="malaria" stroke="#EF4444" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} name="Malaria Cases" />
                <Line type="monotone" dataKey="diarrhea" stroke="#F97316" strokeWidth={3} dot={false} name="Diarrhea" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart B: Immunization Funnel */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Syringe size={18} className="text-blue-600" />
              Immunization Drop-off
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Tracking retention from Birth (BCG) to 14 Weeks (DPT3).
              {/* Trigger diagram for medical context */}
              

[Image of WHO immunization schedule chart]

            </p>
          </div>

          <div className="h-72 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={immunizationData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#F3F4F6" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={90} tick={{fontSize: 11, fontWeight: 500, fill: '#374151'}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#F3F4F6'}} />
                <Bar dataKey="rate" radius={[0, 4, 4, 0]} barSize={32} background={{ fill: '#F9FAFB' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100 flex gap-3 items-start">
            <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-red-700">Critical Insight: DPT3 Gap</p>
              <p className="text-[11px] text-red-600/80 leading-relaxed">
                20% drop-off detected between Birth and Week 14. Suggests failure in follow-up mechanisms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Action Layer: Risk Stratification */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <AlertCircle size={18} className="text-red-600" />
              High Risk Maternal Registry
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Mothers requiring immediate VHT intervention.
              {/* Contextual diagram for clinical logic */}
              

[Image of ANC risk stratification pyramid]

            </p>
          </div>
          <button className="text-xs font-bold text-brand-blue bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
            View Full Cohort
          </button>
        </div>
        
        <div className="divide-y divide-gray-100">
          {highRiskMothers.map((mom) => (
            <div key={mom.id} className="p-4 md:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors group">
              
              <div className="flex items-start gap-4">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-sm
                  ${mom.riskLevel === 'Critical' ? 'bg-red-100 text-red-700 ring-4 ring-red-50' : 'bg-orange-100 text-orange-700'}
                `}>
                  {mom.id.split('-')[1]}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{mom.name}</h4>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {mom.village}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="font-medium text-gray-700">{mom.issue}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pl-14 md:pl-0">
                <div className="text-right">
                  <div className="text-xs font-medium text-gray-500">EDD Timeline</div>
                  <div className="text-sm font-bold text-gray-900 flex items-center gap-1 justify-end">
                    <Calendar size={14} className="text-brand-blue" /> {mom.due}
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
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className={`p-2.5 rounded-lg ${styles[intent]}`}>
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
        <h4 className="text-2xl font-bold text-gray-900 tracking-tight mt-1">{value}</h4>
        <p className="text-xs text-gray-400 mt-1">{trend}</p>
      </div>
    </div>
  );
}