"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayout } from "../providers/LayoutProvider";
import {
  LayoutDashboard, Map as MapIcon, Users, Stethoscope, Droplets,
  Wallet, FileText, Settings, ChevronRight, X, ShieldCheck, LogOut,
  ChevronDown, HelpCircle, Bell, Moon, Sun, Sparkles, Home,
  Activity, BarChart3, Building2, UserCog, ClipboardList, FolderKanban,
  Globe, Lock, Database, Zap, MessageSquare, Calendar
} from "lucide-react";

// --- Types ---
interface NavItem {
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  path: string;
  badge?: string;
  badgeColor?: string;
  description?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
  collapsible?: boolean;
  defaultOpen?: boolean;
}

interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatar?: string;
  initials: string;
}

// --- Configuration ---
const SIDEBAR_WIDTH = "w-72"; // 288px

// Current user (would come from auth context in production)
const currentUser: UserProfile = {
  name: "Dr. Sarah Akello",
  email: "s.akello@village360.org",
  role: "District Administrator",
  initials: "SA",
};

// Navigation structure with groups
const navigationGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        name: "Dashboard",
        icon: LayoutDashboard,
        path: "/",
        description: "System overview and key metrics"
      },
      {
        name: "Map Intelligence",
        icon: MapIcon,
        path: "/map",
        description: "Geospatial data visualization"
      },
    ],
  },
  {
    label: "Programs",
    collapsible: true,
    defaultOpen: true,
    items: [
      {
        name: "Health",
        icon: Stethoscope,
        path: "/health",
        badge: "3",
        badgeColor: "bg-blue-500",
        description: "Immunization, maternal care, disease surveillance"
      },
      {
        name: "WASH",
        icon: Droplets,
        path: "/wash",
        badge: "!",
        badgeColor: "bg-amber-500",
        description: "Water, sanitation, and hygiene infrastructure"
      },
      {
        name: "Livelihoods",
        icon: Wallet,
        path: "/livelihoods",
        description: "Economic empowerment and agricultural support"
      },
    ],
  },
  {
    label: "Data Management",
    collapsible: true,
    defaultOpen: true,
    items: [
      {
        name: "Households",
        icon: Users,
        path: "/households",
        description: "Beneficiary registry and profiles"
      },
      {
        name: "Field Coordinators",
        icon: ShieldCheck,
        path: "/contingent",
        description: "Personnel deployment and coordination"
      },
      {
        name: "Reports",
        icon: FileText,
        path: "/reports",
        description: "Analytics and export center"
      },
    ],
  },
];

// Admin/Settings section (separate for role-based visibility)
const adminItems: NavItem[] = [
  { name: "Settings", icon: Settings, path: "/settings", description: "System configuration" },
  { name: "User Management", icon: UserCog, path: "/users", description: "Access control" },
];

// --- Utility Components ---

function Badge({ children, color = "bg-gray-500" }: { children: React.ReactNode; color?: string }) {
  return (
    <span className={`px-1.5 py-0.5 text-[10px] font-bold text-white rounded-full ${color}`}>
      {children}
    </span>
  );
}

function Tooltip({ children, content }: { children: React.ReactNode; content: string }) {
  return (
    <div className="relative group/tooltip">
      {children}
      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all whitespace-nowrap z-50 pointer-events-none">
        {content}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
      </div>
    </div>
  );
}

// --- Nav Group Component ---
function NavGroupSection({
  group,
  pathname,
  onNavigate,
}: {
  group: NavGroup;
  pathname: string;
  onNavigate?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(group.defaultOpen ?? true);
  const hasActiveItem = group.items.some(item => pathname === item.path || pathname.startsWith(item.path + '/'));

  return (
    <div className="space-y-1">
      {/* Group Header */}
      {group.collapsible ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-gray-600 transition-colors"
          aria-expanded={isOpen}
        >
          <span>{group.label}</span>
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'}`}
          />
        </button>
      ) : (
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          {group.label}
        </div>
      )}

      {/* Items */}
      <ul
        className={`space-y-0.5 overflow-hidden transition-all duration-200 ${group.collapsible && !isOpen ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'
          }`}
      >
        {group.items.map((item) => (
          <NavItemRow
            key={item.path}
            item={item}
            isActive={pathname === item.path || pathname.startsWith(item.path + '/')}
            onNavigate={onNavigate}
          />
        ))}
      </ul>
    </div>
  );
}

// --- Nav Item Component ---
function NavItemRow({
  item,
  isActive,
  onNavigate,
  compact = false,
}: {
  item: NavItem;
  isActive: boolean;
  onNavigate?: () => void;
  compact?: boolean;
}) {
  const Icon = item.icon;

  const content = (
    <Link
      href={item.path}
      onClick={onNavigate}
      className={`
        relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
        transition-all duration-200 group
        ${isActive
          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }
      `}
      aria-current={isActive ? 'page' : undefined}
    >
      {/* Active Indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full" />
      )}

      {/* Icon */}
      <div className={`shrink-0 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
        <Icon size={18} />
      </div>

      {/* Label */}
      {!compact && (
        <span className="flex-1 truncate">{item.name}</span>
      )}

      {/* Badge */}
      {item.badge && !compact && (
        <Badge color={item.badgeColor}>{item.badge}</Badge>
      )}

      {/* Active Chevron */}
      {isActive && !compact && (
        <ChevronRight size={14} className="text-blue-500 shrink-0" />
      )}
    </Link>
  );

  return (
    <li>
      {compact && item.description ? (
        <Tooltip content={item.name}>{content}</Tooltip>
      ) : (
        content
      )}
    </li>
  );
}

// --- User Profile Card ---
function UserProfileCard({ user, onSignOut }: { user: UserProfile; onSignOut?: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative">
      {/* Expandable Menu */}
      {isExpanded && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200">
          <div className="p-2 space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings size={16} className="text-gray-400" />
              <span>Account Settings</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <HelpCircle size={16} className="text-gray-400" />
              <span>Help & Support</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <MessageSquare size={16} className="text-gray-400" />
              <span>Send Feedback</span>
            </button>
          </div>
          <div className="border-t border-gray-100 p-2">
            <button
              onClick={onSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Profile Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${isExpanded
          ? 'bg-gray-100 ring-1 ring-gray-200'
          : 'hover:bg-gray-100 border border-transparent hover:border-gray-200'
          }`}
        aria-expanded={isExpanded}
        aria-haspopup="menu"
      >
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-white shrink-0">
          {user.initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
          <p className="text-xs text-gray-500 truncate">{user.role}</p>
        </div>

        {/* Expand Icon */}
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>
    </div>
  );
}

// --- Quick Actions Bar ---
function QuickActionsBar() {
  const [isDark, setIsDark] = useState(false);

  return (
    <div className="flex items-center justify-between px-2 py-2 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-1">
        <button
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all"
          aria-label="Notifications"
        >
          <Bell size={16} />
        </button>
        <button
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all"
          aria-label="Calendar"
        >
          <Calendar size={16} />
        </button>
        <button
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all"
          aria-label="Activity"
        >
          <Activity size={16} />
        </button>
      </div>

      <div className="h-4 w-px bg-gray-200" />

      <button
        onClick={() => setIsDark(!isDark)}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all"
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </div>
  );
}

// --- System Status Indicator ---
function SystemStatus() {
  const [status] = useState<'online' | 'syncing' | 'offline'>('online');

  const statusConfig = {
    online: { color: 'bg-green-500', text: 'All systems operational', pulse: false },
    syncing: { color: 'bg-amber-500', text: 'Syncing data...', pulse: true },
    offline: { color: 'bg-red-500', text: 'Connection lost', pulse: false },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-500">
      <span className="relative flex h-2 w-2">
        <span className={`${config.pulse ? 'animate-ping' : ''} absolute inline-flex h-full w-full rounded-full ${config.color} opacity-75`} />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.color}`} />
      </span>
      <span>{config.text}</span>
    </div>
  );
}

// --- Main Sidebar Component ---
export default function Sidebar() {
  const pathname = usePathname();
  const { isMobileMenuOpen, closeMobileMenu } = useLayout();
  const sidebarRef = useRef<HTMLElement>(null);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (isMobileMenuOpen) {
      closeMobileMenu();
    }
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close on click outside (mobile)
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        closeMobileMenu();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMobileMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMobileMenuOpen, closeMobileMenu]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleSignOut = useCallback(() => {
    // Handle sign out logic
    console.log('Signing out...');
  }, []);

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`
          fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden
          ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        aria-hidden="true"
        onClick={closeMobileMenu}
      />

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`
          fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-50
          flex flex-col shadow-xl md:shadow-none
          transition-transform duration-300 ease-out
          ${SIDEBAR_WIDTH}
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Header */}
        <header className="h-16 px-6 flex items-center justify-between border-b border-gray-100 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/25 group-hover:shadow-blue-600/40 transition-shadow">
              <Sparkles size={18} strokeWidth={2.5} />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900 tracking-tight">
                <span className="text-blue-600">VillageHealth</span><span className="text-black">360</span>
              </span>
              <p className="text-[10px] text-gray-400 -mt-0.5 font-medium">Community Health Platform</p>
            </div>
          </Link>

          {/* Mobile Close Button */}
          <button
            onClick={closeMobileMenu}
            className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </header>

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          {/* Main Navigation Groups */}
          {navigationGroups.map((group) => (
            <NavGroupSection
              key={group.label}
              group={group}
              pathname={pathname}
              onNavigate={closeMobileMenu}
            />
          ))}

          {/* Admin Section */}
          <div className="pt-4 border-t border-gray-100">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Administration
            </div>
            <ul className="space-y-0.5">
              {adminItems.map((item) => (
                <NavItemRow
                  key={item.path}
                  item={item}
                  isActive={pathname === item.path || pathname.startsWith(item.path + '/')}
                  onNavigate={closeMobileMenu}
                />
              ))}
            </ul>
          </div>
        </nav>

        {/* Footer */}
        <footer className="shrink-0 p-4 border-t border-gray-100 bg-gray-50/50 space-y-3">
          {/* Quick Actions */}
          <QuickActionsBar />

          {/* System Status */}
          <SystemStatus />

          {/* User Profile */}
          <UserProfileCard user={currentUser} onSignOut={handleSignOut} />
        </footer>
      </aside>
    </>
  );
}