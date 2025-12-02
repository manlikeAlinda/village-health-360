import React from "react";
import {
  Users, Droplets, Activity, AlertTriangle,
  LucideIcon, CheckCircle, AlertCircle, Wrench, Baby,
  Download, ChevronRight, MoreHorizontal
} from "lucide-react";
import MapWrapper from "./components/dashboard/MapWrapper";
// --- Types & Interfaces ---
// structured for scalability and strict typing
type ActivityType = "Critical Alert" | "Maternal Health" | "WASH Maintenance" | "Routine Data";
interface ActivityItem {
  id: number;
  type: ActivityType;
  message: string;
  location: string;
  agent: string;
  timestamp: string;
  isUrgent?: boolean;
}
interface StatsCardProps {
  label: string;
  value: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  subtext?: string;
  icon: LucideIcon;
  intent: 'brand' | 'warning' | 'danger' | 'success'; // Semantic intent
}
// --- Mock Data: Refined for Realism ---
const recentActivities: ActivityItem[] = [
  {
    id: 1,
    type: "Critical Alert",
    message: "Cholera symptoms reported in 3 households",
    location: "Koro Village, Omoro",
    agent: "Agent Moses",
    timestamp: "12 mins ago",
    isUrgent: true,
  },
  {
    id: 2,
    type: "Maternal Health",
    message: "New high-risk pregnancy registered (Trimester 3)",
    location: "Bwobo Parish",
    agent: "Agent Sarah",
    timestamp: "45 mins ago",
  },
  {
    id: 3,
    type: "WASH Maintenance",
    message: "Borehole WP-09 flagged: Pump handle broken",
    location: "Ajulu Center",
    agent: "John O. (Technician)",
    timestamp: "2 hours ago",
  },
  {
    id: 4,
    type: "Routine Data",
    message: "Daily Census: 15 Households verified",
    location: "Patiko Sub-county",
    agent: "Agent Grace",
    timestamp: "3 hours ago",
  }
];
export default function Dashboard() {
  return (
    // SEMANTIC WRAPPER: Usage of <main> for accessibility
    <main className="space-y-6 md:space-y-8 p-4 md:p-6 max-w-[1600px] mx-auto bg-gray-50/50 min-h-screen">
     
      {/* Header Section: Improved Typography & Actions */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-gray-200 pb-4 md:pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
            Executive Overview
          </h1>
          <p className="text-gray-500 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live Surveillance: Gulu District (Pilot)
          </p>
        </div>
       
        <div className="flex gap-3 flex-wrap md:flex-nowrap">
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-50 hover:text-gray-900 transition flex items-center gap-2">
            <MoreHorizontal size={18} />
            <span>Settings</span>
          </button>
          <button className="px-4 py-2 bg-gray-900 text-white font-medium rounded-lg shadow-md hover:bg-gray-800 transition flex items-center gap-2 transform active:scale-95">
            <Download size={18} />
            <span>Export Report</span>
          </button>
        </div>
      </header>
      {/* KPI Stats Grid: Semantic Colors & Spacing */}
      <section aria-label="Key Performance Indicators" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatsCard
          label="Total Households"
          value="82,450"
          trend="+120 this week"
          trendDirection="up"
          icon={Users}
          intent="brand"
        />
        <StatsCard
          label="Safe Water Access"
          value="64%"
          trend="-2% vs last month"
          trendDirection="down"
          icon={Droplets}
          intent="warning"
        />
        <StatsCard
          label="Personnel On Ground"
          value="82,000"
          subtext="Active Field Agents"
          icon={Activity}
          intent="success" // Purple treated as 'brand success' variant here
        />
        <StatsCard
          label="Critical Alerts"
          value="5"
          subtext="Active Outbreaks"
          icon={AlertTriangle}
          intent="danger"
        />
      </section>
      {/* Main Visualization Area: Asymmetric Grid */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 md:min-h-[600px]">
       
        {/* Map Section: Dominant Visual (8 cols) */}
        <div className="md:col-span-7 lg:col-span-8 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[40vh] md:min-h-0">
          <div className="p-4 md:p-5 border-b border-gray-100 flex justify-between items-center bg-white z-10">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <MapIcon className="text-gray-400" size={18}/>
              Geospatial Distribution
            </h3>
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-1 bg-gray-100 rounded text-gray-600 font-medium">Satelllite</span>
              <span className="px-2 py-1 bg-blue-50 text-blue-700 font-medium border border-blue-100">Terrain</span>
            </div>
          </div>
          <div className="flex-1 relative bg-gray-100">
            <MapWrapper />
          </div>
        </div>
        {/* Feed Section: Supporting Data (4 cols) */}
        <div className="md:col-span-5 lg:col-span-4 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full min-h-[200px] md:min-h-0">
          <div className="p-4 md:p-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Field Stream</h3>
            <button className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline">
              View All
            </button>
          </div>
         
          <div className="p-0 overflow-y-auto flex-1 custom-scrollbar">
            <div className="flex flex-col">
              {recentActivities.map((activity, index) => (
                <ActivityRow
                  key={activity.id}
                  data={activity}
                  isLast={index === recentActivities.length - 1}
                />
              ))}
            </div>
          </div>
         
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
            <button className="w-full py-2 text-sm text-gray-600 font-medium border border-gray-200 bg-white rounded-lg hover:bg-gray-50 hover:border-gray-300 transition shadow-sm">
              Load Previous Shift
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
// --- Sub-Components: Micro-Interaction & Design System ---
function StatsCard({ label, value, trend, trendDirection, subtext, icon: Icon, intent }: StatsCardProps) {
  // Design System: Color Mapping
  const colorMap = {
    brand: "bg-blue-50 text-blue-600 border-blue-100",
    warning: "bg-orange-50 text-orange-600 border-orange-100",
    danger: "bg-red-50 text-red-600 border-red-100",
    success: "bg-purple-50 text-purple-600 border-purple-100",
  };
  const trendColor = trendDirection === 'up' ? 'text-green-600' : trendDirection === 'down' ? 'text-red-600' : 'text-gray-500';
  return (
    <div className="group bg-white p-4 md:p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorMap[intent]} transition-colors`}>
          <Icon size={22} strokeWidth={2} />
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full bg-opacity-10 ${trendColor} bg-gray-100`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <h4 className="text-gray-500 text-sm font-medium mb-1">{label}</h4>
        {/* Tabular nums prevents jitter when numbers update live */}
        <div className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight tabular-nums">
          {value}
        </div>
        {subtext && (
          <p className="text-xs text-gray-400 mt-2 font-medium flex items-center gap-1">
            <AlertCircle size={12} /> {subtext}
          </p>
        )}
      </div>
    </div>
  );
}
function ActivityRow({ data, isLast }: { data: ActivityItem, isLast: boolean }) {
  const getIcon = (type: ActivityType) => {
    switch (type) {
      case "Critical Alert": return { icon: AlertCircle, color: "text-red-600 bg-red-100" };
      case "Maternal Health": return { icon: Baby, color: "text-purple-600 bg-purple-100" };
      case "WASH Maintenance": return { icon: Wrench, color: "text-orange-600 bg-orange-100" };
      case "Routine Data": return { icon: CheckCircle, color: "text-blue-600 bg-blue-100" };
    }
  };
  const { icon: Icon, color } = getIcon(data.type);
  return (
    <div className={`relative flex gap-4 p-4 md:p-5 hover:bg-gray-50 transition-colors group cursor-default ${!isLast ? 'border-b border-gray-100' : ''}`}>
      {/* Visual Timeline Connector could go here if we wanted strictly connected lines */}
     
      <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
        <Icon size={18} strokeWidth={2.5} />
      </div>
     
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <p className="text-sm font-bold text-gray-900 truncate pr-2 group-hover:text-blue-700 transition-colors">
            {data.type}
          </p>
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
            {data.timestamp}
          </span>
        </div>
       
        <p className="text-sm text-gray-600 leading-relaxed mb-2">
          {data.message}
        </p>
       
        <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
          <span className="flex items-center gap-1 font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-600">
            <Users size={10} /> {data.agent}
          </span>
          <span className="flex items-center gap-1 text-gray-400">
            <ChevronRight size={10} /> {data.location}
          </span>
        </div>
      </div>
      {data.isUrgent && (
        <div className="absolute right-0 top-0 w-1 h-full bg-red-500 rounded-l opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </div>
  );
}
// Icon helper
const MapIcon = ({ className, size }: { className?: string, size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
    <line x1="8" y1="2" x2="8" y2="18"></line>
    <line x1="16" y1="6" x2="16" y2="22"></line>
  </svg>
);