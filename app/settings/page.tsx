"use client";

import { useState } from "react";
import { 
  Settings, Users, Database, Globe, 
  Trash2, PlusCircle, Check, X, Bell, Search,
  type LucideIcon, Zap, Loader2 // Added Zap (for Notifications) and Loader2 (for Sync)
} from "lucide-react";

// --- Mock Data ---
interface User {
  id: number;
  name: string;
  role: 'Administrator' | 'DHO' | 'Field Agent' | 'Partner';
  email: string;
  status: 'Active' | 'Inactive';
}

const mockUsers: User[] = [
  { id: 1, name: "Nakamya Jane", role: "Administrator", email: "jane.n@admin.ug", status: "Active" },
  { id: 2, name: "Dr. Laker Joyce", role: "DHO", email: "laker.j@gulu.gov", status: "Active" },
  { id: 3, name: "Opio Samuel", role: "Field Agent", email: "opio.s@vht.org", status: "Active" },
  { id: 4, name: "Wamala Peter", role: "Partner", email: "peter.w@unicef.org", status: "Inactive" },
];

const mockModules = [
  { name: "Maternal Health Tracker", key: "mch", status: true, description: "Tracks ANC/PNC visits and maternal risk scores, enabling targeted interventions." },
  { name: "WASH Data Validation", key: "wash_val", status: true, description: "Validates water point functionality and monitors sanitation coverage." },
  { name: "Predictive Malnutrition AI", key: "ai_nutri", status: false, description: "Uses machine learning to predict child malnutrition hotspots and outbreaks." },
];

// --- Main Component ---

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-8">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Settings size={30} className="text-gray-600" />
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200" role="tablist">
        <TabButton label="User Management" icon={Users} id="users" active={activeTab} setActive={setActiveTab} />
        <TabButton label="Platform Configuration" icon={Globe} id="config" active={activeTab} setActive={setActiveTab} />
        <TabButton label="Data & Sync" icon={Database} id="data" active={activeTab} setActive={setActiveTab} />
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        <div role="tabpanel" aria-labelledby={`tab-${activeTab}`} tabIndex={0}>
          {activeTab === "users" && <UserManagementTab />}
          {activeTab === "config" && <ConfigurationTab />}
          {activeTab === "data" && <DataSyncTab />}
        </div>
      </div>
    </div>
  );
}

// --- Tab Components ---

interface TabButtonProps {
  label: string;
  icon: LucideIcon;
  id: string;
  active: string;
  setActive: (id: string) => void;
}

function TabButton({ label, icon: Icon, id, active, setActive }: TabButtonProps) {
  const isActive = active === id;
  return (
    <button 
      onClick={() => setActive(id)}
      id={`tab-${id}`}
      role="tab"
      aria-controls={`panel-${id}`}
      aria-selected={isActive}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
        isActive 
          ? "border-brand-blue text-brand-blue" 
          : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );
}

function UserManagementTab() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleUserStatus = (id: number) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === id 
          ? { ...user, status: user.status === 'Active' ? 'Inactive' : 'Active' }
          : user
      )
    );
  };
  
  const deleteUser = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to permanently delete user: ${name}? This action cannot be undone.`)) {
        setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-100 pb-4">Account Administration ({users.length})</h2>
      
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search users by name, email, or role..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search user accounts"
          />
        </div>
        <button className="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-md">
          <PlusCircle size={18} /> Invite New User
        </button>
      </div>

      {/* User Table */}
      <div className="overflow-x-auto min-h-[300px]">
        {filteredUsers.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name & Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm ${
                      user.role === 'Administrator' ? 'bg-red-100 text-red-800' :
                      user.role === 'DHO' ? 'bg-blue-100 text-brand-blue' :
                      user.role === 'Field Agent' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => toggleUserStatus(user.id)}
                      className="text-brand-blue hover:text-blue-700 mr-4 transition-colors text-xs font-medium underline"
                      aria-label={`${user.status === 'Active' ? 'Deactivate' : 'Activate'} user ${user.name}`}
                    >
                      {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button 
                      onClick={() => deleteUser(user.id, user.name)}
                      className="text-red-600 hover:text-red-800 transition-colors text-xs font-medium"
                      aria-label={`Delete user ${user.name}`}
                    >
                      <Trash2 size={16} className="inline-block align-text-bottom mr-1" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-10 text-gray-500 border border-dashed rounded-lg bg-gray-50">
            <Users size={40} className="mx-auto mb-3 text-gray-400" />
            <p>No users found matching your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ConfigurationTab() {
  const [modules, setModules] = useState(mockModules);
  const [notificationStatus, setNotificationStatus] = useState(true);

  const toggleModule = (key: string) => {
    setModules(prevModules => 
      prevModules.map(mod => 
        mod.key === key 
          ? { ...mod, status: !mod.status }
          : mod
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Module Toggles Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-100 pb-4">Module & Feature Toggles</h2>
        <div className="divide-y divide-gray-100">
          
          {modules.map(mod => (
            <div key={mod.key} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center transition hover:bg-gray-50 -mx-6 px-6">
              <div className="flex-1 pr-4">
                <p className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  {mod.name} 
                  {mod.status && <span title="Enabled"><Check size={16} className="text-green-500" /></span>}
                </p>
                <p className="text-sm text-gray-500 mt-1">{mod.description}</p>
              </div>
              <div className="mt-3 md:mt-0 flex items-center gap-4">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full w-24 text-center ${mod.status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {mod.status ? 'Active' : 'Inactive'}
                </span>
                <ToggleSwitch 
                  id={`toggle-${mod.key}`}
                  checked={mod.status}
                  onChange={() => toggleModule(mod.key)}
                  ariaLabel={`Toggle module: ${mod.name}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* Global Notifications Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-100 pb-4">Global Notification Control</h2>
        
        <div className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center transition hover:bg-gray-50 -mx-6 px-6">
            <div className="flex-1 pr-4">
              <p className="text-lg font-medium text-gray-900 flex items-center gap-2"><Zap size={20} className="text-yellow-600" /> Field Alert System Status</p>
              <p className="text-sm text-gray-500 mt-1">Controls real-time SMS/Email alerts to DHOs and Field Agents for priority issues (e.g., malnutrition, water point failure).</p>
            </div>
            <div className="mt-3 md:mt-0 flex items-center gap-4">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full w-24 text-center ${notificationStatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {notificationStatus ? 'Operational' : 'Paused'}
              </span>
              <ToggleSwitch 
                id="toggle-notifications"
                checked={notificationStatus}
                onChange={() => setNotificationStatus(!notificationStatus)}
                ariaLabel="Toggle Global Field Alert System"
              />
            </div>
        </div>
      </div>
    </div>
  );
}

function DataSyncTab() {
  const [lastSync, setLastSync] = useState("2025-11-30 14:35:12");
  const [dataRetention, setDataRetention] = useState("3 years");
  const [isSyncing, setIsSyncing] = useState(false);

  const startManualSync = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setLastSync(new Date().toISOString().replace('T', ' ').substring(0, 19));
      setIsSyncing(false);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-100 pb-4">Data Management & Integrity</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Sync Status Card */}
        <div className="bg-white rounded-xl shadow-md p-6 space-y-4 border border-gray-100">
          <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <Database size={16} /> Data Synchronization
          </p>
          <p className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            {isSyncing ? (
              <>
                <Loader2 size={24} className="animate-spin text-brand-blue" />
                <span className="text-brand-blue">Synchronizing...</span>
              </>
            ) : (
              'Successful'
            )}
          </p>
          <p className="text-sm text-gray-600">
            {isSyncing ? 'Processing data batches for integrity check.' : `Last successful sync completed at: ${lastSync} (EAT)`}
          </p>
          <button 
            onClick={startManualSync} 
            disabled={isSyncing}
            aria-busy={isSyncing}
            className={`w-full mt-4 px-4 py-2 rounded-lg text-sm font-medium transition shadow-md ${
              isSyncing 
                ? 'bg-gray-200 text-gray-600 cursor-not-allowed flex items-center justify-center gap-2'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isSyncing ? 'Sync in Progress...' : 'Run Manual Integrity Check'}
          </button>
        </div>

        {/* Data Retention Card */}
        <div className="bg-white rounded-xl shadow-md p-6 space-y-4 border border-gray-100">
          <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <Trash2 size={16} /> Data Retention Policy
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {dataRetention}
          </p>
          <p className="text-sm text-gray-600 mb-3">
            Sets the automatic archival schedule for historical household records.
          </p>
          <label htmlFor="data-retention-select" className="block text-sm font-medium text-gray-700 mb-1">Retention Period</label>
          <select 
            id="data-retention-select"
            value={dataRetention}
            onChange={(e) => setDataRetention(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-brand-blue/30 focus:border-brand-blue"
            aria-label="Select data retention period"
          >
            <option value="1 year">1 Year</option>
            <option value="3 years">3 Years (Recommended)</option>
            <option value="5 years">5 Years</option>
            <option value="Forever">Forever (Not Recommended)</option>
          </select>
        </div>

      </div>
      
      {/* External Integrations */}
      <h2 className="text-xl font-semibold text-gray-800 pt-4 border-b border-gray-100 pb-4">External Interoperability</h2>
      <div className="bg-white rounded-xl shadow-md divide-y divide-gray-100 border border-gray-100">
          <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center transition hover:bg-gray-50">
            <div className="flex-1 pr-4">
              <p className="text-lg font-medium text-gray-900">Mobile Money (SMS/USSD)</p>
              <p className="text-sm text-gray-500 mt-1">Gateway for delivering personalized SMS health reminders and communicating via USSD in rural areas.</p>
            </div>
            <div className="mt-3 md:mt-0 flex items-center gap-3">
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 flex items-center gap-1 w-24 justify-center">
                <X size={14} /> Disconnected
              </span>
              <button className="text-brand-blue text-sm hover:underline" aria-label="Attempt to reconfigure mobile money connection">Configure Now</button>
            </div>
          </div>
      </div>
    </div>
  );
}

// Custom reusable Toggle Switch component (improves semantics and accessibility)
interface ToggleSwitchProps {
    id: string;
    checked: boolean;
    onChange: () => void;
    ariaLabel: string;
}

function ToggleSwitch({ id, checked, onChange, ariaLabel }: ToggleSwitchProps) {
    return (
        <label htmlFor={id} className="inline-flex items-center cursor-pointer">
            <input
                id={id}
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="sr-only"
                role="switch"
                aria-checked={checked}
                aria-label={ariaLabel}
            />
            <div
                className={`w-12 h-6 rounded-full p-0.5 transition-colors relative ${checked ? 'bg-brand-blue' : 'bg-gray-300'}`}
                aria-hidden="true"
            >
                <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
        </label>
    );
}