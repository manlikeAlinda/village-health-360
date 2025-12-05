"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayout } from "../providers/LayoutProvider";
import {
    Menu, Search, Bell, ChevronDown, Home, ChevronRight, Settings,
    X, User, LogOut, HelpCircle, Command, Moon, Sun, Globe,
    CheckCircle2, AlertTriangle, Info, Clock, ExternalLink,
    LayoutDashboard, Stethoscope, Droplets, Wallet, Users, FileText, Map
} from "lucide-react";

// --- Design System Constants ---
const PRIMARY_BLUE = "#004AAD";

// --- Navigation Structure (for command palette) ---
const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Map Intelligence", path: "/map", icon: Map },
    { name: "Health", path: "/health", icon: Stethoscope },
    { name: "WASH", path: "/wash", icon: Droplets },
    { name: "Livelihoods", path: "/livelihoods", icon: Wallet },
    { name: "Households", path: "/households", icon: Users },
    { name: "Reports", path: "/reports", icon: FileText },
];

// --- Types ---
interface Notification {
    id: string;
    type: 'success' | 'warning' | 'info' | 'alert';
    title: string;
    message: string;
    time: string;
    read: boolean;
}

interface BreadcrumbSegment {
    name: string;
    href: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
}

// --- Mock Data ---
const mockNotifications: Notification[] = [
    { id: "1", type: "alert", title: "Critical: Water Point Failure", message: "Borehole WP-09 in Gulu Central requires immediate attention.", time: "5 min ago", read: false },
    { id: "2", type: "warning", title: "Low Stock Alert", message: "ORS supplies below threshold in 3 health centers.", time: "1 hour ago", read: false },
    { id: "3", type: "success", title: "Report Generated", message: "Monthly Health Status report is ready for download.", time: "2 hours ago", read: true },
    { id: "4", type: "info", title: "System Update", message: "New data sync completed for Northern region.", time: "Yesterday", read: true },
];

// --- Helper Functions ---
const getPathSegments = (pathname: string): BreadcrumbSegment[] => {
    const segments = pathname.split('/').filter(segment => segment.length > 0);
    const pathSegments: BreadcrumbSegment[] = [{ name: "Home", href: "/", icon: Home }];
    let currentPath = "";

    segments.forEach((segment, index) => {
        const display = segment
            .replace(/[-_]/g, ' ')
            .replace(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|\d+)/i, (match) => {
                return index === segments.length - 1 ? 'Details' : match;
            })
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        currentPath += '/' + segment;

        if (display !== 'Details' || index === segments.length - 1) {
            pathSegments.push({ name: display, href: currentPath });
        }
    });

    return pathSegments;
};

// --- Breadcrumbs Component ---
function Breadcrumbs({ segments }: { segments: BreadcrumbSegment[] }) {
    return (
        <nav className="flex items-center text-sm" aria-label="Breadcrumb">
            <ol role="list" className="flex items-center flex-wrap gap-1">
                {segments.map((item, index) => {
                    const isActive = index === segments.length - 1;
                    const Icon = item.icon;
                    return (
                        <li key={item.href + index} className="flex items-center">
                            {index > 0 && (
                                <ChevronRight className="h-4 w-4 text-gray-300 mx-1 flex-shrink-0" />
                            )}
                            <Link
                                href={item.href}
                                className={`
                  flex items-center gap-1.5 px-2 py-1 rounded-md text-sm transition-all
                  ${isActive
                                        ? 'text-gray-900 font-semibold bg-gray-100'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                    }
                `}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                {Icon && <Icon size={14} className="shrink-0" />}
                                <span className="truncate max-w-[120px] sm:max-w-[200px]">{item.name}</span>
                            </Link>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

// --- Notification Panel Component ---
function NotificationPanel({
    isOpen,
    onClose,
    notifications,
    onMarkAsRead
}: {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
    onMarkAsRead: (id: string) => void;
}) {
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    const getTypeStyles = (type: Notification['type']) => {
        const styles = {
            success: { bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle2, color: 'text-green-600' },
            warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: AlertTriangle, color: 'text-amber-600' },
            info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: Info, color: 'text-blue-600' },
            alert: { bg: 'bg-red-50', border: 'border-red-200', icon: AlertTriangle, color: 'text-red-600' },
        };
        return styles[type];
    };

    if (!isOpen) return null;

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div
            ref={panelRef}
            className="absolute top-full right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in slide-in-from-top-2 fade-in duration-200"
        >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Bell size={16} className="text-gray-500" />
                    <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Notifications List */}
            <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <Bell size={32} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No notifications</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {notifications.map((notification) => {
                            const typeStyle = getTypeStyles(notification.type);
                            const Icon = typeStyle.icon;
                            return (
                                <li
                                    key={notification.id}
                                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50/30' : ''}`}
                                    onClick={() => onMarkAsRead(notification.id)}
                                >
                                    <div className="flex gap-3">
                                        <div className={`p-2 rounded-lg ${typeStyle.bg} ${typeStyle.color} shrink-0`}>
                                            <Icon size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                    {notification.title}
                                                </p>
                                                {!notification.read && (
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>
                                            <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                                <Clock size={10} /> {notification.time}
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                <button className="w-full text-center text-sm font-medium text-[#004AAD] hover:underline">
                    View All Notifications
                </button>
            </div>
        </div>
    );
}

// --- User Menu Component ---
function UserMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            ref={menuRef}
            className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in slide-in-from-top-2 fade-in duration-200"
        >
            {/* User Info */}
            <div className="p-4 border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        SA
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">Super Administrator</p>
                        <p className="text-xs text-gray-500 truncate">admin@village360.org</p>
                    </div>
                </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <User size={16} className="text-gray-400" />
                    <span>Profile Settings</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <Settings size={16} className="text-gray-400" />
                    <span>Preferences</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <HelpCircle size={16} className="text-gray-400" />
                    <span>Help & Support</span>
                </button>
            </div>

            {/* Logout */}
            <div className="p-2 border-t border-gray-100">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <LogOut size={16} />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );
}

// --- Command Palette Component ---
function CommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    const filteredItems = query
        ? navItems.filter(item => item.name.toLowerCase().includes(query.toLowerCase()))
        : navItems;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 animate-in zoom-in-95 slide-in-from-top-4 duration-200">
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                    <Search size={18} className="text-gray-400 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search pages, actions..."
                        className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 bg-transparent border-none outline-none"
                    />
                    <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-gray-400 bg-gray-100 rounded border border-gray-200">
                        ESC
                    </kbd>
                </div>

                {/* Results */}
                <div className="max-h-[300px] overflow-y-auto p-2">
                    {filteredItems.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <Search size={32} className="mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No results found</p>
                        </div>
                    ) : (
                        <ul className="space-y-1">
                            {filteredItems.map((item) => (
                                <li key={item.path}>
                                    <Link
                                        href={item.path}
                                        onClick={onClose}
                                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors group"
                                    >
                                        <item.icon size={18} className="text-gray-400 group-hover:text-[#004AAD] transition-colors" />
                                        <span className="flex-1">{item.name}</span>
                                        <ExternalLink size={14} className="text-gray-300 group-hover:text-gray-400" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Footer Hint */}
                <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-[10px] text-gray-400">
                    <span>Navigate with ↑↓ keys</span>
                    <span>Press Enter to select</span>
                </div>
            </div>
        </div>
    );
}

// --- Main TopBar Component ---
export default function TopBar() {
    const pathname = usePathname();
    const { toggleMobileMenu } = useLayout();

    // State
    const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbSegment[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // Breadcrumb updates
    useEffect(() => {
        setBreadcrumbs(getPathSegments(pathname));
    }, [pathname]);

    // Scroll detection for header shadow
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd/Ctrl + K for command palette
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsCommandPaletteOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Handlers
    const handleMarkAsRead = useCallback((id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <>
            <header
                className={`
          fixed top-0 right-0 left-0 md:left-72 z-40
          bg-white/95 backdrop-blur-lg border-b border-gray-200
          transition-all duration-300
          ${isScrolled ? 'shadow-sm' : ''}
        `}
                role="banner"
            >
                {/* Main Row */}
                <div className="h-16 px-4 lg:px-8 flex items-center justify-between max-w-[1920px] mx-auto w-full">
                    {/* Left Section */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={toggleMobileMenu}
                            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg md:hidden transition-colors"
                            aria-label="Toggle Navigation Menu"
                        >
                            <Menu size={22} />
                        </button>

                        {/* Command Palette Trigger (Desktop) */}
                        <button
                            onClick={() => setIsCommandPaletteOpen(true)}
                            className="hidden lg:flex items-center gap-3 w-full max-w-xs px-4 py-2 bg-gray-100 hover:bg-gray-200/70 border border-gray-200 rounded-xl text-sm text-gray-500 transition-all group"
                        >
                            <Search size={16} className="text-gray-400 group-hover:text-gray-600" />
                            <span className="flex-1 text-left">Quick search...</span>
                            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-white rounded border border-gray-200 shadow-sm">
                                <Command size={10} /> K
                            </kbd>
                        </button>

                        {/* Mobile Search Button */}
                        <button
                            onClick={() => setIsCommandPaletteOpen(true)}
                            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Search"
                        >
                            <Search size={20} />
                        </button>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        {/* Settings (Desktop) */}
                        <button
                            className="hidden sm:flex p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Settings"
                        >
                            <Settings size={20} />
                        </button>

                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setIsNotificationOpen(!isNotificationOpen);
                                    setIsUserMenuOpen(false);
                                }}
                                className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
                                aria-expanded={isNotificationOpen}
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                                )}
                            </button>

                            <NotificationPanel
                                isOpen={isNotificationOpen}
                                onClose={() => setIsNotificationOpen(false)}
                                notifications={notifications}
                                onMarkAsRead={handleMarkAsRead}
                            />
                        </div>

                        {/* Divider */}
                        <div className="hidden sm:block h-6 w-px bg-gray-200" />

                        {/* User Profile */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setIsUserMenuOpen(!isUserMenuOpen);
                                    setIsNotificationOpen(false);
                                }}
                                className="flex items-center gap-2 p-1.5 pr-3 hover:bg-gray-100 rounded-full transition-colors group"
                                aria-label="User menu"
                                aria-expanded={isUserMenuOpen}
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs shadow-sm ring-2 ring-white">
                                    SA
                                </div>
                                <span className="hidden lg:block text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                                    Admin
                                </span>
                                <ChevronDown size={14} className="hidden sm:block text-gray-400 group-hover:text-gray-600 transition-colors" />
                            </button>

                            <UserMenu
                                isOpen={isUserMenuOpen}
                                onClose={() => setIsUserMenuOpen(false)}
                            />
                        </div>
                    </div>
                </div>

                {/* Breadcrumbs Row */}
                <div className="px-4 lg:px-8 pb-3 max-w-[1920px] mx-auto w-full">
                    <Breadcrumbs segments={breadcrumbs} />
                </div>
            </header>

            {/* Command Palette Portal */}
            <CommandPalette
                isOpen={isCommandPaletteOpen}
                onClose={() => setIsCommandPaletteOpen(false)}
            />
        </>
    );
}