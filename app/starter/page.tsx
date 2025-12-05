"use client";

import React, { useState } from "react";
import {
    LayoutDashboard, MoreHorizontal, Filter, Download, Share2,
    TrendingUp, Users, Activity, AlertCircle, ChevronDown, Search,
    ArrowUpRight, ArrowDownRight, CheckCircle2
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from "recharts";

// --- Mock Data ---
const chartData = [
    { name: "Jan", value: 4000, target: 2400 },
    { name: "Feb", value: 3000, target: 1398 },
    { name: "Mar", value: 2000, target: 9800 },
    { name: "Apr", value: 2780, target: 3908 },
    { name: "May", value: 1890, target: 4800 },
    { name: "Jun", value: 2390, target: 3800 },
];

const activityLog = [
    { id: 1, user: "Sarah J.", action: "Updated report", time: "2m ago", type: "edit" },
    { id: 2, user: "System", action: "Sync completed", time: "15m ago", type: "system" },
    { id: 3, user: "Mike T.", action: "Flagged issue", time: "1h ago", type: "alert" },
];

// --- Components ---

// 1. KPI Card Component
interface StatCardProps {
    label: string;
    value: string;
    trend: string;
    trendDir: 'up' | 'down' | 'neutral';
    icon: any;
    intent: 'brand' | 'success' | 'warning' | 'danger';
}

function StatCard({ label, value, trend, trendDir, icon: Icon, intent }: StatCardProps) {
    const theme = {
        brand: { bg: "bg-blue-50", text: "text-blue-700", icon: "text-blue-600" },
        success: { bg: "bg-emerald-50", text: "text-emerald-700", icon: "text-emerald-600" },
        warning: { bg: "bg-amber-50", text: "text-amber-700", icon: "text-amber-600" },
        danger: { bg: "bg-rose-50", text: "text-rose-700", icon: "text-rose-600" },
    };
    const currentTheme = theme[intent];
    const TrendIcon = trendDir === 'up' ? ArrowUpRight : ArrowDownRight;
    const trendColor = trendDir === 'up' ? 'text-emerald-600' : 'text-rose-600';

    return (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start">
                <div className={`p-3 rounded-xl ${currentTheme.bg} ${currentTheme.icon}`}>
                    <Icon size={20} strokeWidth={2.5} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-gray-50 ${trendColor}`}>
                    <TrendIcon size={12} /> {trend}
                </div>
            </div>
            <div className="mt-4">
                <h4 className="text-2xl font-bold text-gray-900 tracking-tight">{value}</h4>
                <p className="text-sm font-medium text-gray-500 mt-1">{label}</p>
            </div>
        </div>
    );
}

// 2. Filter Select Component
const FilterSelect = ({ placeholder }: { placeholder: string }) => (
    <div className="relative group min-w-[160px]">
        <select className="w-full pl-3 pr-8 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#004AAD] hover:border-gray-300 transition-colors cursor-pointer">
            <option>{placeholder}</option>
            <option>Option 1</option>
            <option>Option 2</option>
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
);

export default function StarterPage() {
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <main className="min-h-screen bg-[#F7F8F9] font-sans text-slate-800 p-4 md:p-8 mt-16">

            {/* 1. Header Section */}
            <header className="flex flex-col gap-6 mb-8 border-b border-gray-200 pb-6">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Starter Template</h1>
                        <p className="text-gray-500 font-medium mt-1">
                            Reference layout for Village Health 360 pages.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 text-sm shadow-sm transition-all">
                            <Download size={16} /> Export
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#004AAD] text-white font-bold rounded-lg hover:bg-blue-800 text-sm shadow-md transition-all">
                            <Share2 size={16} /> Action
                        </button>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                        <Filter size={16} />
                        <span>Filters:</span>
                    </div>
                    <FilterSelect placeholder="Select Region" />
                    <FilterSelect placeholder="Select Status" />

                    <div className="ml-auto flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#004AAD] w-64"
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* 2. KPI Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                <StatCard
                    label="Total Users"
                    value="12,450"
                    trend="+12%"
                    trendDir="up"
                    icon={Users}
                    intent="brand"
                />
                <StatCard
                    label="Active Sessions"
                    value="842"
                    trend="+5%"
                    trendDir="up"
                    icon={Activity}
                    intent="success"
                />
                <StatCard
                    label="Pending Alerts"
                    value="23"
                    trend="-2"
                    trendDir="down"
                    icon={AlertCircle}
                    intent="warning"
                />
                <StatCard
                    label="System Health"
                    value="99.9%"
                    trend="Stable"
                    trendDir="neutral"
                    icon={CheckCircle2}
                    intent="success"
                />
            </section>

            {/* 3. Main Content Split */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">

                {/* Left Column (2/3) - Primary Visualization */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <TrendingUp size={20} className="text-[#004AAD]" />
                                Performance Trends
                            </h3>
                            <div className="flex gap-2">
                                <button className="px-3 py-1 text-xs font-bold bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200">Daily</button>
                                <button className="px-3 py-1 text-xs font-bold bg-[#004AAD] text-white rounded-full">Weekly</button>
                            </div>
                        </div>

                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#004AAD" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#004AAD" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#004AAD" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Secondary Table/List */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900 text-sm">Recent Records</h3>
                            <button className="text-xs font-bold text-[#004AAD] hover:underline">View All</button>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="p-4 hover:bg-gray-50 transition flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                            ID
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Record #{1000 + i}</p>
                                            <p className="text-xs text-gray-500">Updated 2h ago</p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-100">
                                        Completed
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column (1/3) - Details & Activity */}
                <div className="space-y-6">
                    {/* Info Card */}
                    <div className="bg-[#004AAD] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-2">Pro Tip</h3>
                            <p className="text-blue-100 text-sm leading-relaxed mb-4">
                                Use the starter template to quickly scaffold new modules. Ensure all colors match the design system variables.
                            </p>
                            <button className="bg-white text-[#004AAD] px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-50 transition">
                                Read Documentation
                            </button>
                        </div>
                        {/* Decor */}
                        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                    </div>

                    {/* Activity Feed */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider text-gray-500">Activity Log</h3>
                        <div className="space-y-6">
                            {activityLog.map((item, idx) => (
                                <div key={item.id} className="flex gap-3 relative">
                                    {idx !== activityLog.length - 1 && (
                                        <div className="absolute left-3.5 top-8 bottom-[-24px] w-px bg-gray-100"></div>
                                    )}
                                    <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-sm z-10
                    ${item.type === 'alert' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}
                  `}>
                                        {item.user.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-900">
                                            <span className="font-bold">{item.user}</span> {item.action}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}
