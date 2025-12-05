"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Users,
  MapPin,
  Search,
  Phone,
  Mail,
  ArrowLeft,
  Filter,
  MoreHorizontal,
  ChevronRight,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Share2,
  ChevronDown,
  Briefcase,
  Building2,
  UserCheck
} from "lucide-react";
import personnelDataRaw from "./personnel_data.json";
import districtsData from "./districts.json";

// --- Domain Types ---

interface PersonnelEntry {
  name: string;
  phone: string;
  email?: string;
  role?: string;
  level?: string;
  district: string;
  subcounty: string;
  region: string;
  constituency?: string;
}

interface DistrictNode {
  name: string;
  count: number;
  region: string;
  subRegion: string;
  staff: PersonnelEntry[];
}

type SortDirection = 'asc' | 'desc';
type SortKey = keyof PersonnelEntry;

// --- Custom Hook / Data Logic ---

function useDeploymentData() {
  const data = useMemo(() => {
    const rawStaff = (personnelDataRaw as unknown) as PersonnelEntry[];
    const districtHierarchy = (districtsData as unknown) as Record<string, Record<string, string[]>>;

    const staffByDistrict: Record<string, PersonnelEntry[]> = {};
    (rawStaff || []).forEach(p => {
      const key = (p.district || "").toLowerCase().trim();
      if (!staffByDistrict[key]) staffByDistrict[key] = [];
      staffByDistrict[key].push(p);
    });

    const nodes: DistrictNode[] = [];
    Object.entries(districtHierarchy || {}).forEach(([region, subRegions]: [string, any]) => {
      Object.entries(subRegions).forEach(([subRegion, districts]: [string, any]) => {
        (districts as string[]).forEach(districtName => {
          const key = districtName.toLowerCase().trim();
          const staff = staffByDistrict[key] || [];
          nodes.push({
            name: districtName,
            region,
            subRegion,
            staff,
            count: staff.length
          });
        });
      });
    });

    return nodes.sort((a, b) => a.name.localeCompare(b.name));
  }, [personnelDataRaw, districtsData]);

  return data;
}

// --- Main Layout Component ---

export default function ContingentPage() {
  const districts = useDeploymentData();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && setSelectedId(null);
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const selectedDistrictData = useMemo(
    () => districts.find(d => d.name === selectedId),
    [districts, selectedId]
  );

  // Calculate KPI Stats
  const totalPersonnel = useMemo(() => districts.reduce((acc, d) => acc + d.count, 0), [districts]);
  const districtsWithStaff = useMemo(() => districts.filter(d => d.count > 0).length, [districts]);
  const avgPerDistrict = useMemo(() => Math.round(totalPersonnel / districtsWithStaff) || 0, [totalPersonnel, districtsWithStaff]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 p-6 lg:p-10 mt-16">
      {/* 1. Executive Header */}
      <header className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
              Operational Capacity
            </h1>
            <p className="text-sm text-gray-500 mt-1.5 max-w-xl">
              Staff deployment and personnel directory across all districts.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm">
              <Download size={16} /> Export Report
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-sm">
              <Share2 size={16} /> Share Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* 2. KPI Section */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-xl border bg-indigo-50 text-indigo-700 border-indigo-200">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-bold text-gray-900 tracking-tight">{totalPersonnel.toLocaleString()}</h4>
            <p className="text-sm font-medium text-gray-500 mt-0.5">Total Personnel</p>
            <p className="text-[10px] text-gray-400 mt-2 border-t border-gray-50 pt-2">Active staff deployed</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-xl border bg-green-50 text-green-700 border-green-200">
              <Building2 size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-bold text-gray-900 tracking-tight">{districtsWithStaff}</h4>
            <p className="text-sm font-medium text-gray-500 mt-0.5">Active Districts</p>
            <p className="text-[10px] text-gray-400 mt-2 border-t border-gray-50 pt-2">Of {districts.length} total districts</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-xl border bg-purple-50 text-purple-700 border-purple-200">
              <UserCheck size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-bold text-gray-900 tracking-tight">{avgPerDistrict}</h4>
            <p className="text-sm font-medium text-gray-500 mt-0.5">Avg. per District</p>
            <p className="text-[10px] text-gray-400 mt-2 border-t border-gray-50 pt-2">Staff distribution ratio</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-xl border bg-blue-50 text-blue-700 border-blue-200">
              <Briefcase size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-bold text-gray-900 tracking-tight">4</h4>
            <p className="text-sm font-medium text-gray-500 mt-0.5">Regions Covered</p>
            <p className="text-[10px] text-gray-400 mt-2 border-t border-gray-50 pt-2">Central, Eastern, Northern, Western</p>
          </div>
        </div>
      </section>

      {/* 3. Master-Detail Layout */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 380px)', minHeight: '500px' }}>
        <div className="flex h-full">
          <aside
            className="w-full md:w-80 lg:w-96 flex flex-col border-r border-gray-200 bg-gray-50/50"
            aria-label="District Navigation"
          >
            <DistrictSidebar
              data={districts}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </aside>

          <main className="flex-1 relative bg-white overflow-hidden">
            {selectedDistrictData ? (
              <div className="h-full w-full hidden md:block">
                <PersonnelDirectory
                  district={selectedDistrictData}
                  onClose={() => setSelectedId(null)}
                />
              </div>
            ) : (
              <div className="hidden md:flex h-full items-center justify-center">
                <EmptyState />
              </div>
            )}

            <div
              className={`
                absolute inset-0 z-20 bg-white transform transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1) md:hidden
                ${selectedId ? 'translate-x-0' : 'translate-x-full'}
              `}
              aria-modal="true"
              role="dialog"
            >
              {selectedDistrictData && (
                <PersonnelDirectory
                  district={selectedDistrictData}
                  onClose={() => setSelectedId(null)}
                  isMobile
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </main>
  );
}

// --- Sidebar Component ---

function DistrictSidebar({
  data,
  selectedId,
  onSelect
}: {
  data: DistrictNode[],
  selectedId: string | null,
  onSelect: (id: string) => void
}) {
  const [query, setQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("All");

  const filtered = useMemo(() => {
    return data.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(query.toLowerCase());
      const matchesRegion = regionFilter === "All" || d.region === regionFilter;
      return matchesSearch && matchesRegion;
    });
  }, [data, query, regionFilter]);

  const grouped = useMemo(() => {
    const groups: Record<string, DistrictNode[]> = {};
    filtered.forEach(d => {
      const key = regionFilter === "All" ? d.region : d.subRegion;
      if (!groups[key]) groups[key] = [];
      groups[key].push(d);
    });
    return groups;
  }, [filtered, regionFilter]);

  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 bg-white space-y-4 shrink-0">
        <div>
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-bold text-gray-900">Districts</h2>
            <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded-full text-gray-600">
              {filtered.length} Zones
            </span>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
          {["All", "Central", "Eastern", "Northern", "Western"].map(r => (
            <button
              key={r}
              onClick={() => setRegionFilter(r)}
              className={`
                px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors
                ${regionFilter === r
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
              `}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
          <input
            type="text"
            placeholder="Search districts..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scroll-smooth">
        {Object.entries(grouped).length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No districts found.</div>
        ) : (
          <div className="pb-4">
            {Object.entries(grouped).sort().map(([groupName, districts]) => (
              <div key={groupName}>
                <div className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm px-4 py-2 border-y border-gray-200/50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{groupName}</span>
                </div>
                <ul className="divide-y divide-gray-100">
                  {districts.map(d => (
                    <li key={d.name}>
                      <button
                        onClick={() => onSelect(d.name)}
                        className={`
                          w-full text-left px-4 py-3 group transition-all duration-200 relative
                          ${selectedId === d.name ? 'bg-indigo-50/50' : 'hover:bg-white'}
                        `}
                      >
                        {selectedId === d.name && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600" />
                        )}
                        <div className="flex justify-between items-center mb-1.5">
                          <span className={`text-sm font-semibold ${selectedId === d.name ? 'text-indigo-900' : 'text-gray-700'}`}>
                            {d.name}
                          </span>
                          {d.count > 0 ? (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${selectedId === d.name ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600'}`}>
                              {d.count}
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-300">Empty</span>
                          )}
                        </div>

                        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${selectedId === d.name ? 'bg-indigo-500' : 'bg-gray-300 group-hover:bg-indigo-300'}`}
                            style={{ width: `${(d.count / maxCount) * 100}%` }}
                          />
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Detail View Component (Responsive) ---

function PersonnelDirectory({
  district,
  onClose,
  isMobile
}: {
  district: DistrictNode,
  onClose: () => void,
  isMobile?: boolean
}) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');

  const filteredStaff = useMemo(() => {
    let result = (district.staff || []).filter(p => {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.subcounty.toLowerCase().includes(q) ||
        (p.role || "").toLowerCase().includes(q)
      );
    });

    return result.sort((a, b) => {
      const valA = (a[sortKey] || "").toString().toLowerCase();
      const valB = (b[sortKey] || "").toString().toLowerCase();
      return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }, [district.staff, search, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-6 py-5 border-b border-gray-200 flex flex-col gap-4 bg-white shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {isMobile && (
              <button
                onClick={onClose}
                className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">{district.name} District</h1>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{district.region} Region</span>
                <span className="text-gray-300">•</span>
                <span>{filteredStaff.length} Active Personnel</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 border border-gray-200">
              <Filter size={18} />
            </button>
            <button className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 border border-gray-200">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Find personnel by name, role, or subcounty..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50/30">
        {filteredStaff.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Users size={32} className="mb-3 opacity-20" />
            <p className="text-sm">No personnel match criteria.</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block min-w-full inline-block align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <SortHeader label="Name" column="name" currentSort={sortKey} dir={sortDir} onToggle={toggleSort} className="pl-6" />
                    <SortHeader label="Subcounty" column="subcounty" currentSort={sortKey} dir={sortDir} onToggle={toggleSort} />
                    <SortHeader label="Role" column="role" currentSort={sortKey} dir={sortDir} onToggle={toggleSort} />
                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredStaff.map((person, idx) => (
                    <tr key={idx} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm">
                        <div className="flex items-center">
                          <AvatarInitials name={person.name} />
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{person.name}</div>
                            {person.level && <div className="text-xs text-gray-500">{person.level}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {person.subcounty}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                          {person.role || "Officer"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="flex flex-col gap-1">
                          {person.phone && (
                            <a href={`tel:${person.phone}`} className="flex items-center gap-1.5 text-gray-700 hover:text-indigo-600">
                              <Phone size={12} /> {person.phone}
                            </a>
                          )}
                          {person.email && (
                            <a href={`mailto:${person.email}`} className="flex items-center gap-1.5 text-gray-500 hover:text-indigo-600">
                              <Mail size={12} /> <span className="truncate max-w-[150px]">{person.email}</span>
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="md:hidden divide-y divide-gray-100 bg-white">
              {filteredStaff.map((person, idx) => (
                <li key={idx} className="p-4">
                  <div className="flex items-start gap-3">
                    <AvatarInitials name={person.name} size="small" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">{person.name}</h3>
                        <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          {person.subcounty}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 mb-2">{person.role || "Unspecified Role"}</p>

                      <div className="flex gap-3 mt-2">
                        {person.phone && (
                          <a href={`tel:${person.phone}`} className="flex items-center gap-1 text-xs font-medium text-gray-700 border border-gray-200 rounded px-2 py-1 hover:bg-gray-50">
                            <Phone size={12} /> Call
                          </a>
                        )}
                        {person.email && (
                          <a href={`mailto:${person.email}`} className="flex items-center gap-1 text-xs font-medium text-gray-700 border border-gray-200 rounded px-2 py-1 hover:bg-gray-50">
                            <Mail size={12} /> Email
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

// --- Helper Components ---

function SortHeader({
  label,
  column,
  currentSort,
  dir,
  onToggle,
  className = ""
}: {
  label: string,
  column: SortKey,
  currentSort: SortKey,
  dir: SortDirection,
  onToggle: (k: SortKey) => void,
  className?: string
}) {
  const isActive = currentSort === column;
  return (
    <th scope="col" className={`px-3 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider group cursor-pointer hover:bg-gray-100 transition-colors ${className}`} onClick={() => onToggle(column)}>
      <div className="flex items-center gap-1">
        {label}
        <span className={`transition-opacity ${isActive ? 'opacity-100 text-indigo-600' : 'opacity-0 group-hover:opacity-50'}`}>
          {isActive && dir === 'asc' ? <ArrowUp size={12} /> : isActive && dir === 'desc' ? <ArrowDown size={12} /> : <ArrowUpDown size={12} />}
        </span>
      </div>
    </th>
  );
}

function AvatarInitials({ name, size = "normal" }: { name: string, size?: "normal" | "small" }) {
  const initials = name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
  const sizeClasses = size === "normal" ? "h-10 w-10 text-sm" : "h-8 w-8 text-xs";

  return (
    <div className={`${sizeClasses} rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 shrink-0 ring-1 ring-white shadow-sm`}>
      {initials}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center max-w-sm p-6">
      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100 shadow-sm">
        <MapPin size={28} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-bold text-gray-900">Select a Deployment Zone</h3>
      <p className="text-sm text-gray-500 mt-2 leading-relaxed">
        Select a district from the sidebar to view the roster of active personnel, contact details, and subcounty allocations.
      </p>
    </div>
  );
}
