"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Map as MapIcon, Users, Stethoscope, Droplets,
  Sprout, Wallet, FileText, Settings, ChevronRight, Menu, X,
  ShieldCheck, LogOut
} from "lucide-react";
// --- Configuration: Semantic Grouping ---
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
  // State to manage the mobile menu visibility
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Ref for the sidebar
  const sidebarRef = useRef<HTMLElement>(null);
  // Function to close the menu upon navigation
  const handleNavigation = () => {
    setIsMobileMenuOpen(false);
  };
  // Effect for outside click detection on mobile
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleClickOutside = (event: MouseEvent): void => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
      setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMobileMenuOpen]);
  return (
    <>
      {/* 1. Mobile Menu Toggle Button (Visible on small screens) */}
      {/* This assumes the main content page pushes a top bar or this button floats */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className={`fixed top-4 right-4 z-99 p-3 bg-blue-600 text-white rounded-full shadow-lg md:hidden hover:bg-blue-700 transition-all active:scale-95 ${isMobileMenuOpen ? 'hidden' : ''}`}
        aria-label="Open navigation menu"
      >
        <Menu size={24} />
      </button>
      {/* 2. Mobile Backdrop (Overlay) */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          aria-hidden="true"
        />
      )}
      {/* 3. Sidebar (Desktop Fixed / Mobile Drawer) */}
      <aside
        ref={sidebarRef}
        className={`
          // Desktop Styling (Default)
          w-72 bg-white h-screen border-r border-gray-200 fixed left-0 top-0 flex-col z-50 shadow-sm font-sans
          
          // Mobile Drawer Styling
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0 fixed z-60 w-64' : '-translate-x-full hidden md:flex'}
          md:translate-x-0 md:flex
        `}
        aria-label="Main Application Sidebar"
      >
        
        {/* Header Section */}
        <div className="px-6 py-8 border-b border-gray-100/50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-blue-200 shadow-lg">
              <LayoutDashboard size={18} strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              VillageHealth<span className="text-blue-600">360</span>
            </h1>
          </div>
          {/* Close button for Mobile only */}
          <button
             onClick={() => setIsMobileMenuOpen(false)}
             className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 md:hidden"
             aria-label="Close menu"
          >
             <X size={20} />
          </button>
        </div>
        {/* Navigation Area: Scrollable & Segmented */}
        <nav
          className="flex-1 overflow-y-auto px-4 space-y-8 custom-scrollbar pt-6"
          aria-label="Primary Navigation Links"
        >
          {navStructure.map((group, groupIdx) => (
            <div key={groupIdx}>
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
                        onClick={handleNavigation}
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
        {/* User Profile Footer: Settings & Logout */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
          {/* User Display (Kept for visual anchor) */}
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-all cursor-pointer group border border-transparent hover:border-gray-200">
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-100 to-indigo-100 border border-white shadow-sm flex items-center justify-center text-blue-700 font-bold text-xs">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">Jane Doe</p>
              <p className="text-xs text-gray-500 truncate">District Admin</p>
            </div>
          </div>
          {/* Settings & Logout Links */}
          <div className="mt-3 space-y-1">
             <Link href="/settings" onClick={handleNavigation} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg">
                <Settings size={18} className="text-gray-400" />
                System Settings
             </Link>
             <button onClick={handleNavigation} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <LogOut size={18} />
                Sign Out
             </button>
          </div>
        </div>
      </aside>
    </>
  );
}