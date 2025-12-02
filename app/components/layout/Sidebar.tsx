"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Map as MapIcon, Users, Stethoscope, Droplets, 
  Sprout, Wallet, FileText, Bell, Settings, LogOut, ChevronRight,
  ShieldCheck
} from "lucide-react";

// --- Configuration: Semantic Grouping ---
// We group items to reduce cognitive load (Miller's Law).
// This allows users to scan by category rather than reading a flat list.
const navStructure = [
  {
    groupLabel: "Overview",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/" },
      { name: "Map Intelligence", icon: MapIcon, path: "/map" },
    ]
  },
  {
    groupLabel: "Intervention Sectors",
    items: [
      { name: "Health", icon: Stethoscope, path: "/health", accent: "text-blue-500" },
      { name: "WASH", icon: Droplets, path: "/wash", accent: "text-cyan-500" },
      { name: "Agriculture", icon: Sprout, path: "/agriculture", accent: "text-green-500" },
      { name: "Livelihoods", icon: Wallet, path: "/livelihoods", accent: "text-purple-500" },
    ]
  },
  {
    groupLabel: "Operations",
    items: [
      { name: "Households", icon: Users, path: "/households" },
      { name: "Contingent", icon: ShieldCheck, path: "/contingent", accent: "text-indigo-600" },
      { name: "Reports", icon: FileText, path: "/reports" },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-white h-screen border-r border-gray-200 fixed left-0 top-0 hidden md:flex flex-col z-50 shadow-sm font-sans">
      
      {/* 1. Brand Header: Visual Anchoring */}
      <div className="px-6 py-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-blue-200 shadow-lg">
            <LayoutDashboard size={18} strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            VillageHealth<span className="text-blue-600">360</span>
          </h1>
        </div>
        <p className="text-xs text-gray-400 font-medium pl-10 uppercase tracking-wider">
          Rural Intelligence Platform
        </p>
      </div>

      {/* 2. Navigation Area: Scrollable & Segmented */}
      <nav 
        className="flex-1 overflow-y-auto px-4 space-y-8 custom-scrollbar"
        aria-label="Main Navigation"
      >
        {navStructure.map((group, groupIdx) => (
          <div key={groupIdx}>
            {/* Semantic Label for Screen Readers & Scanning */}
            <h3 className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 select-none">
              {group.groupLabel}
            </h3>
            
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.path;
                
                return (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      // ARIA: Current page indication
                      aria-current={isActive ? "page" : undefined}
                      className={`
                        group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out
                        ${isActive 
                          ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100" 
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        {/* Icon: Subtly colored if active or has accent, otherwise gray */}
                        <item.icon 
                          size={18} 
                          strokeWidth={isActive ? 2.5 : 2}
                          className={`
                            transition-colors duration-200
                            ${isActive ? "text-blue-600" : item.accent ? item.accent : "text-gray-400 group-hover:text-gray-600"}
                          `} 
                        />
                        <span>{item.name}</span>
                      </div>
                      
                      {/* Active Indicator: Subtle Chevron */}
                      {isActive && (
                        <ChevronRight size={14} className="text-blue-400" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* 3. User Profile Footer: Trust & Settings */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all cursor-pointer group border border-transparent hover:border-gray-200">
          <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-100 to-indigo-100 border border-white shadow-sm flex items-center justify-center text-blue-700 font-bold text-xs">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">Jane Doe</p>
            <p className="text-xs text-gray-500 truncate">District Admin</p>
          </div>
          <Settings size={16} className="text-gray-400 group-hover:text-gray-600" />
        </div>
      </div>
    </aside>
  );
}