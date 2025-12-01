import { 
  Users, Droplets, Activity, AlertTriangle, 
  LucideIcon, CheckCircle, AlertCircle, Wrench, Baby 
} from "lucide-react";
import MapWrapper from "./components/dashboard/MapWrapper";

// --- Mock Data: Realistic Field Stream ---
const recentActivities = [
  {
    id: 1,
    type: "Critical Alert",
    message: "Cholera symptoms reported in 3 households",
    location: "Koro Village, Omoro",
    agent: "Agent Moses",
    time: "12 mins ago",
    icon: AlertCircle,
    color: "bg-red-100 text-red-600"
  },
  {
    id: 2,
    type: "Maternal Health",
    message: "New high-risk pregnancy registered (Trimester 3)",
    location: "Bwobo Parish",
    agent: "Agent Sarah",
    time: "45 mins ago",
    icon: Baby,
    color: "bg-purple-100 text-purple-600"
  },
  {
    id: 3,
    type: "WASH Maintenance",
    message: "Borehole WP-09 flagged: Pump handle broken",
    location: "Ajulu Center",
    agent: "John O. (Technician)",
    time: "2 hours ago",
    icon: Wrench,
    color: "bg-orange-100 text-orange-600"
  },
  {
    id: 4,
    type: "Routine Data",
    message: "Daily Census: 15 Households verified",
    location: "Patiko Sub-county",
    agent: "Agent Grace",
    time: "3 hours ago",
    icon: CheckCircle,
    color: "bg-blue-100 text-brand-blue"
  }
];

// --- Interfaces ---
interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  label?: string;
  icon: LucideIcon;
  color: string;
}

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Executive Dashboard</h1>
          <p className="text-gray-500">Real-time surveillance: Gulu District (Pilot)</p>
        </div>
        <button className="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm">
          Export Report
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Households" 
          value="82,450" 
          change="+120 this week" 
          icon={Users} 
          color="bg-blue-100 text-brand-blue"
        />
        <StatsCard 
          title="Safe Water Access" 
          value="64%" 
          change="-2% vs last month" 
          icon={Droplets} 
          color="bg-orange-100 text-brand-wash"
        />
        <StatsCard 
          title="Maternal Risk" 
          value="312" 
          label="High Risk Mothers" 
          icon={Activity} 
          color="bg-purple-100 text-brand-live"
        />
        <StatsCard 
          title="Active Alerts" 
          value="5" 
          label="Critical Outbreaks" 
          icon={AlertTriangle} 
          color="bg-red-100 text-brand-alert"
        />
      </div>

      {/* Main Visualization Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
        {/* Map Section */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-1 shadow-sm flex flex-col z-0 relative">
          <div className="w-full h-full rounded-lg overflow-hidden">
            <MapWrapper />
          </div>
        </div>

        {/* Updated Activity Feed */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900">Live Field Updates</h3>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          </div>
          
          <div className="space-y-6 overflow-y-auto pr-2">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex gap-4 items-start">
                <div className={`mt-1 p-2 rounded-full shrink-0 ${activity.color}`}>
                  <activity.icon size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {activity.location} • <span className="font-medium text-gray-700">{activity.agent}</span>
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide font-medium">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, change, label, icon: Icon, color }: StatsCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition hover:shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} />
        </div>
      </div>
      <div className="mt-4 flex items-center text-xs">
        {change ? (
          <span className={change.includes('+') ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
            {change}
          </span>
        ) : (
          <span className="text-brand-alert font-medium">{label}</span>
        )}
      </div>
    </div>
  );
}