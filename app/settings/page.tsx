"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Settings, Users, Database, Globe, Trash2, PlusCircle, Check, X,
  Bell, Search, Zap, Loader2, Shield, Key, Mail, Clock, Eye, EyeOff,
  Download, Upload, RefreshCw, AlertTriangle, CheckCircle2, Info,
  ChevronDown, ChevronRight, Lock, Unlock, Server, Wifi, WifiOff,
  Smartphone, Monitor, HardDrive, Cloud, FileText, AlertCircle,
  type LucideIcon, Save, RotateCcw, ExternalLink, Copy, Palette,
  Languages, MapPin, Building2, UserCog, ShieldCheck, Activity
} from "lucide-react";

// --- Types ---
interface User {
  id: string;
  name: string;
  role: 'Super Admin' | 'District Admin' | 'Health Officer' | 'Field Agent' | 'Partner' | 'Viewer';
  email: string;
  status: 'Active' | 'Inactive' | 'Pending';
  lastLogin?: string;
  district?: string;
  permissions: string[];
}

interface Module {
  id: string;
  name: string;
  key: string;
  status: boolean;
  description: string;
  category: 'core' | 'analytics' | 'integration';
  version?: string;
}

interface Integration {
  id: string;
  name: string;
  provider: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  description: string;
}

interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
  type: 'info' | 'warning' | 'success' | 'error';
}

// --- Mock Data ---
const mockUsers: User[] = [
  { id: "u1", name: "Dr. Sarah Akello", role: "Super Admin", email: "s.akello@village360.org", status: "Active", lastLogin: "Today, 10:15 AM", permissions: ["all"] },
  { id: "u2", name: "Dr. Laker Joyce", role: "District Admin", email: "laker.j@gulu.gov.ug", status: "Active", lastLogin: "Today, 09:30 AM", district: "Gulu", permissions: ["read", "write", "reports"] },
  { id: "u3", name: "Opio Samuel", role: "Field Agent", email: "opio.s@vht.org", status: "Active", lastLogin: "Yesterday", district: "Omoro", permissions: ["read", "write"] },
  { id: "u4", name: "Wamala Peter", role: "Partner", email: "peter.w@unicef.org", status: "Inactive", lastLogin: "2 weeks ago", permissions: ["read", "reports"] },
  { id: "u5", name: "Achieng Mary", role: "Health Officer", email: "m.achieng@health.go.ug", status: "Pending", permissions: ["read", "write"] },
];

const mockModules: Module[] = [
  { id: "m1", name: "Maternal Health Tracker", key: "mch", status: true, description: "Tracks ANC/PNC visits, maternal risk scores, and delivery outcomes.", category: "core", version: "2.4.1" },
  { id: "m2", name: "WASH Data Validation", key: "wash", status: true, description: "Validates water point functionality and monitors sanitation coverage.", category: "core", version: "1.8.0" },
  { id: "m3", name: "Predictive Analytics Engine", key: "ai_predict", status: true, description: "ML-powered outbreak prediction and resource optimization.", category: "analytics", version: "3.1.0" },
  { id: "m4", name: "Malnutrition Early Warning", key: "ai_nutri", status: false, description: "Predicts child malnutrition hotspots using historical patterns.", category: "analytics", version: "1.2.0" },
  { id: "m5", name: "DHIS2 Interoperability", key: "dhis2", status: true, description: "Bi-directional sync with national DHIS2 instance.", category: "integration", version: "4.0.2" },
  { id: "m6", name: "SMS Gateway", key: "sms", status: false, description: "Automated SMS alerts for critical health events.", category: "integration", version: "2.0.0" },
];

const mockIntegrations: Integration[] = [
  { id: "i1", name: "DHIS2 Uganda", provider: "Ministry of Health", status: "connected", lastSync: "5 minutes ago", description: "National health information system" },
  { id: "i2", name: "Mobile Money Gateway", provider: "MTN Uganda", status: "disconnected", description: "SMS/USSD communication channel" },
  { id: "i3", name: "Weather API", provider: "OpenWeather", status: "connected", lastSync: "1 hour ago", description: "Climate data for disease correlation" },
  { id: "i4", name: "CRVS System", provider: "NIRA", status: "error", description: "Civil registration for birth/death records" },
];

const mockAuditLogs: AuditLog[] = [
  { id: "a1", action: "User Login", user: "Dr. Sarah Akello", timestamp: "Today, 10:15 AM", details: "Successful login from 102.134.xx.xx", type: "success" },
  { id: "a2", action: "Module Disabled", user: "System", timestamp: "Today, 08:00 AM", details: "SMS Gateway disabled due to API limit", type: "warning" },
  { id: "a3", action: "Data Export", user: "Dr. Laker Joyce", timestamp: "Yesterday, 4:30 PM", details: "Exported Q3 Health Report (PDF)", type: "info" },
  { id: "a4", action: "Failed Sync", user: "System", timestamp: "Yesterday, 2:00 PM", details: "CRVS connection timeout after 30s", type: "error" },
  { id: "a5", action: "User Created", user: "Dr. Sarah Akello", timestamp: "Nov 28, 2025", details: "Created account for Achieng Mary", type: "success" },
];

// --- Utility Components ---

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' }) {
  const styles = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-green-50 text-green-700 border-green-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-red-50 text-red-700 border-red-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full border ${styles[variant]}`}>
      {children}
    </span>
  );
}

function ToggleSwitch({ id, checked, onChange, disabled = false }: { id: string; checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

function SectionCard({ title, description, children, action }: { title: string; description?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, subtext, variant = "default" }: { icon: LucideIcon; label: string; value: string | number; subtext?: string; variant?: 'default' | 'success' | 'warning' | 'danger' }) {
  const colors = {
    default: "bg-gray-50 text-gray-600 border-gray-200",
    success: "bg-green-50 text-green-600 border-green-200",
    warning: "bg-amber-50 text-amber-600 border-amber-200",
    danger: "bg-red-50 text-red-600 border-red-200",
  };
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[variant]} border mb-3`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
  );
}

// --- Tab Button ---
function TabButton({ label, icon: Icon, id, active, onClick, badge }: { label: string; icon: LucideIcon; id: string; active: boolean; onClick: () => void; badge?: string }) {
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 whitespace-nowrap ${active
          ? "border-blue-600 text-blue-600 bg-blue-50/50"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
        }`}
    >
      <Icon size={18} />
      <span>{label}</span>
      {badge && <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">{badge}</span>}
    </button>
  );
}

// --- Main Component ---
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(() => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 p-6 lg:p-10 mt-16">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl shadow-lg">
              <Settings size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
                System Settings
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage platform configuration, users, and integrations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm">
              <RotateCcw size={16} /> Reset Defaults
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition shadow-sm disabled:opacity-70"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-8 overflow-hidden">
        <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-100" role="tablist">
          <TabButton label="Overview" icon={Activity} id="overview" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
          <TabButton label="Users & Roles" icon={Users} id="users" active={activeTab === "users"} onClick={() => setActiveTab("users")} badge="5" />
          <TabButton label="Modules" icon={Zap} id="modules" active={activeTab === "modules"} onClick={() => setActiveTab("modules")} />
          <TabButton label="Integrations" icon={Cloud} id="integrations" active={activeTab === "integrations"} onClick={() => setActiveTab("integrations")} />
          <TabButton label="Security" icon={Shield} id="security" active={activeTab === "security"} onClick={() => setActiveTab("security")} />
          <TabButton label="Data & Sync" icon={Database} id="data" active={activeTab === "data"} onClick={() => setActiveTab("data")} />
          <TabButton label="Notifications" icon={Bell} id="notifications" active={activeTab === "notifications"} onClick={() => setActiveTab("notifications")} />
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "users" && <UsersTab />}
          {activeTab === "modules" && <ModulesTab />}
          {activeTab === "integrations" && <IntegrationsTab />}
          {activeTab === "security" && <SecurityTab />}
          {activeTab === "data" && <DataSyncTab />}
          {activeTab === "notifications" && <NotificationsTab />}
        </div>
      </div>
    </main>
  );
}

// --- Tab Components ---

function OverviewTab() {
  const activeUsers = mockUsers.filter(u => u.status === "Active").length;
  const activeModules = mockModules.filter(m => m.status).length;
  const connectedIntegrations = mockIntegrations.filter(i => i.status === "connected").length;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Active Users" value={activeUsers} subtext={`of ${mockUsers.length} total`} variant="success" />
        <StatCard icon={Zap} label="Active Modules" value={activeModules} subtext={`of ${mockModules.length} available`} variant="default" />
        <StatCard icon={Cloud} label="Integrations" value={connectedIntegrations} subtext={`${mockIntegrations.length - connectedIntegrations} disconnected`} variant="warning" />
        <StatCard icon={Shield} label="Security Score" value="92%" subtext="Last audit: Today" variant="success" />
      </div>

      {/* Recent Activity */}
      <SectionCard title="Recent Activity" description="System audit trail">
        <div className="space-y-3">
          {mockAuditLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`p-2 rounded-lg shrink-0 ${log.type === "success" ? "bg-green-50 text-green-600" :
                  log.type === "warning" ? "bg-amber-50 text-amber-600" :
                    log.type === "error" ? "bg-red-50 text-red-600" :
                      "bg-blue-50 text-blue-600"
                }`}>
                {log.type === "success" ? <CheckCircle2 size={16} /> :
                  log.type === "warning" ? <AlertTriangle size={16} /> :
                    log.type === "error" ? <AlertCircle size={16} /> :
                      <Info size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-sm text-gray-900">{log.action}</p>
                  <span className="text-xs text-gray-400 shrink-0">{log.timestamp}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{log.details}</p>
                <p className="text-xs text-gray-400 mt-0.5">by {log.user}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all group">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
            <Download size={20} />
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900">Export Configuration</p>
            <p className="text-xs text-gray-500">Download settings backup</p>
          </div>
        </button>
        <button className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all group">
          <div className="p-2 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-100 transition-colors">
            <Upload size={20} />
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900">Import Configuration</p>
            <p className="text-xs text-gray-500">Restore from backup</p>
          </div>
        </button>
        <button className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all group">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors">
            <FileText size={20} />
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900">View Documentation</p>
            <p className="text-xs text-gray-500">Admin guide & API docs</p>
          </div>
        </button>
      </div>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "All" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const toggleUserStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" } : u));
  };

  const getRoleBadge = (role: User['role']) => {
    const variants: Record<string, 'danger' | 'info' | 'success' | 'purple' | 'warning'> = {
      "Super Admin": "danger",
      "District Admin": "info",
      "Health Officer": "success",
      "Field Agent": "success",
      "Partner": "purple",
      "Viewer": "default" as any,
    };
    return <Badge variant={variants[role] || "default"}>{role}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="All">All Roles</option>
            <option value="Super Admin">Super Admin</option>
            <option value="District Admin">District Admin</option>
            <option value="Health Officer">Health Officer</option>
            <option value="Field Agent">Field Agent</option>
            <option value="Partner">Partner</option>
          </select>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm">
          <PlusCircle size={16} /> Invite User
        </button>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">User</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Role</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Last Login</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                      {user.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">{getRoleBadge(user.role)}</td>
                <td className="py-4 px-4">
                  <Badge variant={user.status === "Active" ? "success" : user.status === "Pending" ? "warning" : "default"}>
                    {user.status}
                  </Badge>
                </td>
                <td className="py-4 px-4 text-sm text-gray-500">{user.lastLogin || "Never"}</td>
                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {user.status === "Active" ? "Deactivate" : "Activate"}
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ModulesTab() {
  const [modules, setModules] = useState(mockModules);

  const toggleModule = (key: string) => {
    setModules(prev => prev.map(m => m.key === key ? { ...m, status: !m.status } : m));
  };

  const groupedModules = useMemo(() => {
    const groups: Record<string, Module[]> = { core: [], analytics: [], integration: [] };
    modules.forEach(m => groups[m.category].push(m));
    return groups;
  }, [modules]);

  const categoryLabels = { core: "Core Modules", analytics: "Analytics & AI", integration: "Integrations" };
  const categoryIcons = { core: Zap, analytics: Activity, integration: Cloud };

  return (
    <div className="space-y-8">
      {Object.entries(groupedModules).map(([category, mods]) => {
        const Icon = categoryIcons[category as keyof typeof categoryIcons];
        return (
          <div key={category}>
            <div className="flex items-center gap-2 mb-4">
              <Icon size={18} className="text-gray-400" />
              <h3 className="font-semibold text-gray-900">{categoryLabels[category as keyof typeof categoryLabels]}</h3>
              <span className="text-xs text-gray-400">({mods.filter(m => m.status).length}/{mods.length} active)</span>
            </div>
            <div className="space-y-3">
              {mods.map((mod) => (
                <div key={mod.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{mod.name}</p>
                      {mod.version && <span className="text-[10px] text-gray-400 font-mono">v{mod.version}</span>}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{mod.description}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <Badge variant={mod.status ? "success" : "default"}>{mod.status ? "Active" : "Inactive"}</Badge>
                    <ToggleSwitch id={`mod-${mod.key}`} checked={mod.status} onChange={() => toggleModule(mod.key)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function IntegrationsTab() {
  return (
    <div className="space-y-4">
      {mockIntegrations.map((integration) => (
        <div key={integration.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${integration.status === "connected" ? "bg-green-50 text-green-600" :
                integration.status === "error" ? "bg-red-50 text-red-600" :
                  "bg-gray-100 text-gray-400"
              }`}>
              {integration.status === "connected" ? <Wifi size={20} /> :
                integration.status === "error" ? <AlertCircle size={20} /> :
                  <WifiOff size={20} />}
            </div>
            <div>
              <p className="font-medium text-gray-900">{integration.name}</p>
              <p className="text-sm text-gray-500">{integration.provider} • {integration.description}</p>
              {integration.lastSync && (
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <RefreshCw size={10} /> Last sync: {integration.lastSync}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={integration.status === "connected" ? "success" : integration.status === "error" ? "danger" : "default"}>
              {integration.status === "connected" ? "Connected" : integration.status === "error" ? "Error" : "Disconnected"}
            </Badge>
            <button className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors">
              {integration.status === "connected" ? "Configure" : "Connect"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function SecurityTab() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [ipWhitelist, setIpWhitelist] = useState(true);

  return (
    <div className="space-y-6">
      <SectionCard title="Authentication Settings" description="Configure login security options">
        <div className="space-y-6">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">Two-Factor Authentication</p>
              <p className="text-sm text-gray-500">Require 2FA for all administrator accounts</p>
            </div>
            <ToggleSwitch id="2fa" checked={twoFactorEnabled} onChange={() => setTwoFactorEnabled(!twoFactorEnabled)} />
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">Session Timeout</p>
              <p className="text-sm text-gray-500">Automatically log out inactive users</p>
            </div>
            <select
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="480">8 hours</option>
            </select>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-900">IP Whitelist</p>
              <p className="text-sm text-gray-500">Restrict access to approved IP addresses only</p>
            </div>
            <ToggleSwitch id="ip-whitelist" checked={ipWhitelist} onChange={() => setIpWhitelist(!ipWhitelist)} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Password Policy" description="Enforce strong password requirements">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle2 size={16} className="text-green-600" />
            <span className="text-sm text-green-800">Minimum 12 characters</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle2 size={16} className="text-green-600" />
            <span className="text-sm text-green-800">Uppercase & lowercase required</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle2 size={16} className="text-green-600" />
            <span className="text-sm text-green-800">Numbers required</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle2 size={16} className="text-green-600" />
            <span className="text-sm text-green-800">Special characters required</span>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function DataSyncTab() {
  const [lastSync, setLastSync] = useState("2025-12-05 10:15:22");
  const [isSyncing, setIsSyncing] = useState(false);
  const [dataRetention, setDataRetention] = useState("3");

  const startSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setLastSync(new Date().toISOString().replace("T", " ").substring(0, 19));
      setIsSyncing(false);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard title="Sync Status" description="Database synchronization">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {isSyncing ? (
                <Loader2 size={24} className="animate-spin text-blue-600" />
              ) : (
                <CheckCircle2 size={24} className="text-green-600" />
              )}
              <div>
                <p className="font-medium text-gray-900">{isSyncing ? "Synchronizing..." : "All Systems Synced"}</p>
                <p className="text-sm text-gray-500">Last sync: {lastSync} (EAT)</p>
              </div>
            </div>
            <button
              onClick={startSync}
              disabled={isSyncing}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
              {isSyncing ? "Syncing..." : "Run Manual Sync"}
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Data Retention" description="Archival policy settings">
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Configure how long historical records are retained before archival.</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Retention Period</label>
              <select
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                value={dataRetention}
                onChange={(e) => setDataRetention(e.target.value)}
              >
                <option value="1">1 Year</option>
                <option value="3">3 Years (Recommended)</option>
                <option value="5">5 Years</option>
                <option value="7">7 Years</option>
              </select>
            </div>
            <p className="text-xs text-gray-400">Note: This affects storage costs and compliance requirements.</p>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Storage Overview" description="Database and file storage metrics">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <HardDrive size={24} className="mx-auto text-gray-400 mb-2" />
            <p className="text-lg font-bold text-gray-900">24.6 GB</p>
            <p className="text-xs text-gray-500">Database Size</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <FileText size={24} className="mx-auto text-gray-400 mb-2" />
            <p className="text-lg font-bold text-gray-900">8.2 GB</p>
            <p className="text-xs text-gray-500">Attachments</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <Server size={24} className="mx-auto text-gray-400 mb-2" />
            <p className="text-lg font-bold text-gray-900">82,450</p>
            <p className="text-xs text-gray-500">Total Records</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <Cloud size={24} className="mx-auto text-gray-400 mb-2" />
            <p className="text-lg font-bold text-gray-900">99.9%</p>
            <p className="text-xs text-gray-500">Uptime (30d)</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function NotificationsTab() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [criticalOnly, setCriticalOnly] = useState(false);

  return (
    <div className="space-y-6">
      <SectionCard title="Alert Channels" description="Configure how you receive notifications">
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Mail size={18} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive alerts via email</p>
              </div>
            </div>
            <ToggleSwitch id="email" checked={emailAlerts} onChange={() => setEmailAlerts(!emailAlerts)} />
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <Smartphone size={18} />
              </div>
              <div>
                <p className="font-medium text-gray-900">SMS Alerts</p>
                <p className="text-sm text-gray-500">Receive critical alerts via SMS</p>
              </div>
            </div>
            <ToggleSwitch id="sms" checked={smsAlerts} onChange={() => setSmsAlerts(!smsAlerts)} />
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Bell size={18} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-500">Browser and mobile push alerts</p>
              </div>
            </div>
            <ToggleSwitch id="push" checked={pushNotifications} onChange={() => setPushNotifications(!pushNotifications)} />
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                <AlertTriangle size={18} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Critical Alerts Only</p>
                <p className="text-sm text-gray-500">Only receive high-priority notifications</p>
              </div>
            </div>
            <ToggleSwitch id="critical" checked={criticalOnly} onChange={() => setCriticalOnly(!criticalOnly)} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Event Subscriptions" description="Choose which events trigger notifications">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: "System outages", checked: true },
            { label: "Failed sync operations", checked: true },
            { label: "New user registrations", checked: true },
            { label: "Data exports completed", checked: false },
            { label: "Security incidents", checked: true },
            { label: "Low stock alerts", checked: true },
            { label: "High-risk patient flags", checked: true },
            { label: "Weekly digest reports", checked: false },
          ].map((item, i) => (
            <label key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <input type="checkbox" defaultChecked={item.checked} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
              <span className="text-sm text-gray-700">{item.label}</span>
            </label>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}