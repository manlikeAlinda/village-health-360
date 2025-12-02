"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Map, Users, Stethoscope, Droplets, 
  Sprout, Wallet, FileText, Bell, Settings 
} from "lucide-react";

// Menu items based on Proposal [cite: 468-477]
const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/" },
  { name: "Map Intelligence", icon: Map, path: "/map" },
  { name: "Households", icon: Users, path: "/households" },
  { name: "Health", icon: Stethoscope, path: "/health", color: "text-brand-blue" },
  { name: "WASH", icon: Droplets, path: "/wash", color: "text-brand-wash" },
  { name: "Agriculture", icon: Sprout, path: "/agriculture", color: "text-brand-agri" },
  { name: "Livelihoods", icon: Wallet, path: "/livelihoods", color: "text-brand-live" },
  { name: "Reports", icon: FileText, path: "/reports" },
  //Contingent
  { name: "Contingent", icon: Bell, path: "/contingent", color: "text-brand-contingent" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white h-screen border-r border-gray-200 fixed left-0 top-0 hidden md:flex flex-col z-50">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-brand-blue tracking-tight">
          VillageHealth<span className="text-gray-800">360</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">Rural Intelligence Platform</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-blue/10 text-brand-blue"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon size={20} className={item.color || ""} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer Settings */}
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <Link href="/settings" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
            <Settings size={20} />
            System Settings
        </Link>
      </div>
    </aside>
  );
}