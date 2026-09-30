"use client";
import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Activity, Baby, HeartPulse, Users2,
  AlertCircle, LucideIcon,
  MapPin, Users,
  ChevronDown, Filter,
  AlertTriangle, X, Loader2,
  Droplets, CheckCircle2, AlertOctagon, Hammer
} from "lucide-react";
import { getAllDistricts, getSubcounties } from "../lib/adminData";
import { useHouseholdsStore } from "../store/householdsStore";
import { api } from "../lib/api";
import { INCOME_BRACKETS } from "../lib/types";
import type { Household, Facility } from "../lib/types";
import { classifySanitation, type SanitationClass } from "../lib/washClassification";

const SANITATION_CLASSES: SanitationClass[] = ["Improved", "Unimproved", "Open Defecation", "Not Recorded"];
import {
  PieChart, Pie, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
  Tooltip as RechartsTooltip, Legend
} from "recharts";

// --- Real aggregation helpers ---

// Groups a set of free-text field values into a sorted tally, so charts show
// what field agents actually typed rather than a fixed enum. Household health
// data is free text (see server/src/types/index.ts), so this is the honest way
// to summarize it without inventing categories that don't exist in the data.
function tally(values: (string | undefined)[], emptyLabel = "Not recorded"): { name: string; value: number }[] {
  const counts = new Map<string, number>();
  for (const raw of values) {
    const v = raw?.trim() || emptyLabel;
    counts.set(v, (counts.get(v) || 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

// Same idea as tally() above, shaped for the WASH bar charts (dataKey="count").
function tallyCount(values: (string | undefined)[], emptyLabel = "Not recorded"): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const raw of values) {
    const v = raw?.trim() || emptyLabel;
    counts.set(v, (counts.get(v) || 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function deriveVulnerabilityFactors(h: Household): string[] {
  const factors: string[] = [];
  if (h.waterSource.toLowerCase().includes("unsafe")) factors.push("Unsafe Water Source");
  if (/pregnan/i.test(h.healthStatus) || /pregnan/i.test(h.health?.maternal || "")) factors.push("Pregnant Member");
  if (/malnutrition/i.test(h.healthStatus)) factors.push("Child Malnutrition");
  if (/malaria/i.test(h.healthStatus)) factors.push("Active Malaria Case");
  return factors;
}

const CHART_COLORS = ["#004AAD", "#EC4899", "#8B5CF6", "#F59E0B", "#10B981", "#EF4444", "#6366F1", "#94A3B8"];

// Same heuristic used on the map dashboard (app/map/page.tsx) for consistency —
// household water sources are free text, so "safe" is a keyword match, not an enum.
const SAFE_WATER_KEYWORDS = ["borehole", "tap", "protected", "safe"];

const FACILITY_TYPE_LABELS: Record<string, string> = {
  borehole: "Borehole",
  tap_stand: "Tap Stand",
  protected_spring: "Protected Spring",
  rain_tank: "Rain Tank",
  health_center: "Health Center",
  school: "School",
  latrine: "Latrine",
};

// --- UI Components ---

interface HealthStatProps {
  label: string;
  value: string;
  subtext?: string;
  icon: LucideIcon;
  intent: 'brand' | 'warning' | 'success' | 'danger' | 'purple' | 'pink';
}

function HealthStat({ label, value, subtext, icon: Icon, intent }: HealthStatProps) {
  const styles: Record<string, string> = {
    brand: "bg-blue-50 text-blue-700 border-blue-200",
    warning: "bg-orange-50 text-orange-700 border-orange-200",
    success: "bg-green-50 text-green-700 border-green-200",
    danger: "bg-red-50 text-red-700 border-red-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    pink: "bg-pink-50 text-pink-700 border-pink-200",
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
      <div className={`p-2.5 rounded-xl border inline-flex ${styles[intent]}`}>
        <Icon size={20} />
      </div>
      <div className="mt-4">
        <h4 className="text-2xl font-bold text-gray-900 tracking-tight">{value}</h4>
        <p className="text-sm font-medium text-gray-500 mt-0.5">{label}</p>
        {subtext && <p className="text-[10px] text-gray-400 mt-2 border-t border-gray-50 pt-2">{subtext}</p>}
      </div>
    </div>
  );
}

interface WashStatProps {
  label: string;
  value: string;
  subtext: string;
  icon: LucideIcon;
  intent: 'brand' | 'success' | 'warning' | 'danger';
}

function WashStat({ label, value, subtext, icon: Icon, intent }: WashStatProps) {
  const theme = {
    brand: { bg: "bg-blue-50", text: "text-blue-700", icon: "text-blue-600" },
    success: { bg: "bg-emerald-50", text: "text-emerald-700", icon: "text-emerald-600" },
    warning: { bg: "bg-amber-50", text: "text-amber-700", icon: "text-amber-600" },
    danger: { bg: "bg-rose-50", text: "text-rose-700", icon: "text-rose-600" },
  };
  const currentTheme = theme[intent];

  return (
    <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300 group">
      <div className={`p-3 rounded-xl ${currentTheme.bg} ${currentTheme.icon} inline-flex`}>
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <div className="mt-4">
        <h4 className="text-2xl font-bold text-gray-900 tracking-tight">{value}</h4>
        <p className="text-sm font-medium text-gray-500 mt-1">{label}</p>
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-50">
          <span className={`text-xs font-bold ${currentTheme.text} flex items-center gap-1`}>
            {intent === 'danger' || intent === 'warning' ? <AlertOctagon size={12} /> : <CheckCircle2 size={12} />}
            {subtext}
          </span>
        </div>
      </div>
    </div>
  );
}

const FilterSelect = ({ value, onChange, options, placeholder, disabled }: any) => (
  <div className="relative min-w-[200px]">
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-[#004AAD] text-sm font-medium transition-colors ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:border-gray-400'}`}
    >
      <option value="">{placeholder}</option>
      {options.map((opt: string) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
      <ChevronDown size={14} />
    </div>
  </div>
);

const RiskBadge = ({ level }: { level: Household["riskLevel"] }) => {
  const styles: Record<string, string> = {
    Critical: "bg-red-50 text-red-700 border-red-100",
    High: "bg-orange-50 text-orange-700 border-orange-100",
    Medium: "bg-amber-50 text-amber-700 border-amber-100",
    Low: "bg-gray-50 text-gray-600 border-gray-100",
  };
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide ${styles[level]}`}>
      {level}
    </span>
  );
};

export default function HealthWashOverview() {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedSubcounty, setSelectedSubcounty] = useState<string | null>(null);

  const allDistricts = useMemo(() => getAllDistricts(), []);
  const subcounties = useMemo(() => getSubcounties(selectedDistrict), [selectedDistrict]);
  const currentLocation = selectedSubcounty || selectedDistrict || "National";

  const { households, loading: householdsLoading, fetchAll } = useHouseholdsStore();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(true);

  useEffect(() => {
    fetchAll({ district: selectedDistrict || undefined, subcounty: selectedSubcounty || undefined });
  }, [selectedDistrict, selectedSubcounty, fetchAll]);

  useEffect(() => {
    setFacilitiesLoading(true);
    const params = selectedDistrict ? `?district=${encodeURIComponent(selectedDistrict)}` : "";
    api.get<{ data: Facility[] }>(`/api/facilities${params}`)
      .then(({ data }) => setFacilities(data))
      .finally(() => setFacilitiesLoading(false));
  }, [selectedDistrict]);

  const loading = householdsLoading || facilitiesLoading;

  // --- Real aggregates, derived entirely from fetched household records ---
  const total = households.length;

  const riskCounts = useMemo(() => {
    const order: Household["riskLevel"][] = ["Low", "Medium", "High", "Critical"];
    return order.map((level) => ({ name: level, value: households.filter((h) => h.riskLevel === level).length }));
  }, [households]);

  const criticalOrHigh = useMemo(() => households.filter((h) => h.riskLevel === "Critical" || h.riskLevel === "High"), [households]);

  const pregnantCount = useMemo(
    () => households.filter((h) => /pregnan/i.test(h.healthStatus) || /pregnan/i.test(h.health?.maternal || "")).length,
    [households]
  );

  const malnourishedMembers = useMemo(
    () => households.reduce((sum, h) => sum + (h.householdMembers?.filter((m) => m.status === "Malnourished").length || 0), 0),
    [households]
  );

  const vulnerabilityFactorCounts = useMemo(() => {
    const counts = new Map<string, number>();
    households.forEach((h) => {
      deriveVulnerabilityFactors(h).forEach((f) => counts.set(f, (counts.get(f) || 0) + 1));
    });
    return Array.from(counts.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [households]);

  const immunizationTally = useMemo(
    () => tally(households.map((h) => h.health?.immunization)).slice(0, 6),
    [households]
  );

  const chronicRecordedCount = useMemo(
    () => households.filter((h) => h.health?.chronic && !["none", "n/a"].includes(h.health.chronic.trim().toLowerCase())).length,
    [households]
  );

  const priorityRegistry = useMemo(
    () => [...criticalOrHigh].sort((a, b) => (a.riskLevel === b.riskLevel ? 0 : a.riskLevel === "Critical" ? -1 : 1)).slice(0, 8),
    [criticalOrHigh]
  );

  // --- Cross-module: WASH × Livelihoods × Health, joined on household_id ---
  // This is the query the household-anchor architecture exists to answer —
  // impossible when each module aggregates independently, trivial once
  // every module reads/writes the same household record. Under-5 diarrhoea
  // (2-week recall) is the standard survey indicator for this; sanitation
  // is grouped by the WHO/JMP Improved/Unimproved classification (see
  // lib/washClassification.ts), keyword-matched from the free-text field.
  const under5DiarrhoeaByIncomeBracket = useMemo(() => {
    const buckets = new Map<string, { under5: number; withDiarrhoea: number }>();
    households.forEach((h) => {
      const bracket = h.livelihoods?.incomeBracket;
      if (!bracket) return;
      (h.householdMembers ?? []).forEach((m) => {
        if (m.age >= 5) return;
        const b = buckets.get(bracket) ?? { under5: 0, withDiarrhoea: 0 };
        b.under5 += 1;
        if (m.diarrhoeaLast2Weeks) b.withDiarrhoea += 1;
        buckets.set(bracket, b);
      });
    });
    return INCOME_BRACKETS.map((b) => {
      const bucket = buckets.get(b);
      return {
        name: b,
        value: bucket && bucket.under5 > 0 ? Math.round((bucket.withDiarrhoea / bucket.under5) * 100) : 0,
        under5Count: bucket?.under5 ?? 0,
      };
    });
  }, [households]);

  const under5DiarrhoeaBySanitation = useMemo(() => {
    const buckets = new Map<SanitationClass, { under5: number; withDiarrhoea: number }>();
    households.forEach((h) => {
      const sanitationClass = classifySanitation(h.wash?.sanitation);
      (h.householdMembers ?? []).forEach((m) => {
        if (m.age >= 5) return;
        const b = buckets.get(sanitationClass) ?? { under5: 0, withDiarrhoea: 0 };
        b.under5 += 1;
        if (m.diarrhoeaLast2Weeks) b.withDiarrhoea += 1;
        buckets.set(sanitationClass, b);
      });
    });
    return SANITATION_CLASSES.map((name) => {
      const b = buckets.get(name);
      return { name, value: b && b.under5 > 0 ? Math.round((b.withDiarrhoea / b.under5) * 100) : 0, under5Count: b?.under5 ?? 0 };
    });
  }, [households]);

  const under5WithDataCount = useMemo(
    () => under5DiarrhoeaByIncomeBracket.reduce((sum, b) => sum + b.under5Count, 0),
    [under5DiarrhoeaByIncomeBracket]
  );

  // --- WASH aggregates ---
  const safeWaterCount = useMemo(
    () => households.filter((h) => {
      const source = (h.wash?.waterSource || h.waterSource).toLowerCase();
      return SAFE_WATER_KEYWORDS.some((kw) => source.includes(kw)) && !source.includes("unsafe");
    }).length,
    [households]
  );
  const safeWaterPct = total > 0 ? Math.round((safeWaterCount / total) * 100) : null;

  const waterSourceSplit = useMemo(() => [
    { name: "Safe (Borehole/Tap/Protected)", value: safeWaterCount, color: "#0EA5E9" },
    { name: "Unsafe / Unclear", value: total - safeWaterCount, color: "#F43F5E" },
  ], [safeWaterCount, total]);

  const sanitationTally = useMemo(
    () => tallyCount(households.map((h) => h.wash?.sanitation)).slice(0, 6),
    [households]
  );

  // WHO/JMP Improved/Unimproved classification (see lib/washClassification.ts)
  // — a keyword-matched grouping of the same free-text field above, not a
  // second data source.
  const sanitationClassTally = useMemo(() => {
    const counts = new Map<SanitationClass, number>();
    households.forEach((h) => {
      const c = classifySanitation(h.wash?.sanitation);
      counts.set(c, (counts.get(c) || 0) + 1);
    });
    return SANITATION_CLASSES.map((name) => ({ name, count: counts.get(name) || 0 }));
  }, [households]);

  const noHandwashingCount = useMemo(
    () => households.filter((h) => {
      const v = (h.wash?.handwashing || "").toLowerCase();
      return v.includes("no soap") || v.includes("none");
    }).length,
    [households]
  );

  const facilitiesByType = useMemo(() => {
    const types = Object.keys(FACILITY_TYPE_LABELS);
    return types.map((type) => ({
      name: FACILITY_TYPE_LABELS[type],
      functional: facilities.filter((f) => f.type === type && f.status === "functional").length,
      broken: facilities.filter((f) => f.type === type && f.status === "broken").length,
    })).filter((row) => row.functional > 0 || row.broken > 0);
  }, [facilities]);

  const brokenFacilities = useMemo(() => facilities.filter((f) => f.status === "broken"), [facilities]);

  return (
    <main className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50/30 p-6 lg:p-10 mt-16">
      {/* 1. Executive Header */}
      <header className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
              Health & WASH Overview
            </h1>
            <p className="text-sm text-gray-500 mt-1.5 max-w-xl">
              {total} household record{total === 1 ? "" : "s"} and {facilities.length} registered facilit{facilities.length === 1 ? "y" : "ies"} in {currentLocation}. Every figure below rolls up from what field agents recorded on the household — see a household's Health / WASH tab to add or correct data.
            </p>
          </div>
        </div>
      </header>

      {/* Shared Filter Bar */}
      <section className="mb-8 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Filter size={16} />
            <span className="text-sm font-semibold">Filters:</span>
          </div>
          <FilterSelect
            value={selectedDistrict}
            onChange={(val: string) => {
              setSelectedDistrict(val || null);
              setSelectedSubcounty(null);
            }}
            options={allDistricts}
            placeholder="All Districts"
          />
          <FilterSelect
            value={selectedSubcounty}
            onChange={(val: string) => setSelectedSubcounty(val || null)}
            options={subcounties}
            placeholder="All Subcounties"
            disabled={!selectedDistrict}
          />
          {(selectedDistrict || selectedSubcounty) && (
            <button
              onClick={() => {
                setSelectedDistrict(null);
                setSelectedSubcounty(null);
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-800 transition"
            >
              <X size={14} /> Clear Filters
            </button>
          )}
          {loading && <Loader2 size={16} className="animate-spin text-gray-400" />}
        </div>
      </section>

      {/* ===================== HEALTH ===================== */}
      <div className="flex items-center gap-2 mb-4">
        <HeartPulse size={20} className="text-[#004AAD]" />
        <h2 className="text-xl font-bold text-gray-900">Health</h2>
      </div>

      {total === 0 && !loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-400 mb-10">
          No household records for {currentLocation} yet.
        </div>
      ) : (
        <>
          {/* Health KPI Section */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <HealthStat label="Households Tracked" value={total.toString()} icon={Users2} intent="brand" subtext={currentLocation} />
            <HealthStat
              label="Critical / High Risk"
              value={`${criticalOrHigh.length}`}
              icon={AlertTriangle}
              intent="danger"
              subtext={total > 0 ? `${Math.round((criticalOrHigh.length / total) * 100)}% of tracked households` : undefined}
            />
            <HealthStat label="Pregnant Members Recorded" value={pregnantCount.toString()} icon={Baby} intent="pink" subtext="From health status / maternal fields" />
            <HealthStat label="Malnourished Members Recorded" value={malnourishedMembers.toString()} icon={HeartPulse} intent="warning" subtext="From household member roster" />
          </section>

          {/* Health Deep Dive Analytics */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            <div className="xl:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-1">
                  <Activity size={20} className="text-[#004AAD]" /> Risk Level Distribution
                </h3>
                <p className="text-xs text-gray-500 mb-6">Vulnerability priority assigned at registration/review, per household.</p>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={riskCounts} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                      <RechartsTooltip contentStyle={{ borderRadius: 0, border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {riskCounts.map((entry, i) => (
                          <Cell key={entry.name} fill={["#94A3B8", "#F59E0B", "#F97316", "#EF4444"][i]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-1">
                  <AlertCircle size={20} className="text-red-500" /> Vulnerability Factors
                </h3>
                <p className="text-xs text-gray-500 mb-6">Households flagged for each factor (a household can carry more than one).</p>
                {vulnerabilityFactorCounts.length > 0 ? (
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={vulnerabilityFactorCounts} layout="vertical" margin={{ left: 0, right: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#F3F4F6" />
                        <XAxis type="number" allowDecimals={false} hide />
                        <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11, fontWeight: 600, fill: '#374151' }} axisLine={false} tickLine={false} />
                        <RechartsTooltip cursor={{ fill: 'transparent' }} />
                        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22} fill="#EF4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No vulnerability factors detected in current records.</p>
                )}
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-1">
                  <HeartPulse size={20} className="text-purple-600" /> Immunization Status (as recorded)
                </h3>
                <p className="text-xs text-gray-500 mb-6">Free-text values entered on each household's Health tab, grouped as typed.</p>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={immunizationTally} layout="vertical" margin={{ left: 0, right: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#F3F4F6" />
                      <XAxis type="number" allowDecimals={false} hide />
                      <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11, fontWeight: 600, fill: '#374151' }} axisLine={false} tickLine={false} />
                      <RechartsTooltip cursor={{ fill: 'transparent' }} />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                        {immunizationTally.map((entry, i) => (
                          <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Right Col: Priority Registry */}
            <div className="space-y-6">
              <HealthStat label="Chronic Illness Recorded" value={chronicRecordedCount.toString()} icon={Activity} intent="purple" subtext="Households with a non-empty chronic illness entry" />

              <div className="bg-white p-0 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                    <Users size={16} className="text-red-600" /> Priority Household Registry
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Critical / High risk households, real records.</p>
                </div>
                <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                  {priorityRegistry.length > 0 ? priorityRegistry.map((h) => (
                    <Link key={h.id} href={`/households/${h.id}`} className="block p-4 hover:bg-gray-50 transition cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <RiskBadge level={h.riskLevel} />
                        <span className="text-xs text-gray-400 font-mono">{h.id.slice(0, 8)}</span>
                      </div>
                      <h4 className="text-sm font-bold text-gray-900">{h.head}</h4>
                      <p className="text-xs text-gray-600 mb-2 font-medium">{h.healthStatus}</p>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        <span className="flex items-center gap-1"><MapPin size={10} /> {h.location?.village_id ?? "Not set"}</span>
                      </div>
                    </Link>
                  )) : (
                    <p className="p-4 text-sm text-gray-400 italic">No critical/high-risk households in this filter.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Cross-module: the query a siloed dashboard can't answer */}
          <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-10">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-1">
              <Baby size={20} className="text-[#004AAD]" /> Under-5 Diarrhoea Prevalence — Cross-Module
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              Joined on household_id across Health, WASH and Livelihoods — 2-week recall, per household member under 5.
            </p>
            {under5WithDataCount === 0 ? (
              <p className="text-sm text-gray-400 italic">
                No under-5 members with recorded diarrhoea data yet — add members via a household&apos;s Health tab to populate this.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">By Income Bracket</h4>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={under5DiarrhoeaByIncomeBracket} layout="vertical" margin={{ left: 0, right: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#F3F4F6" />
                        <XAxis type="number" allowDecimals={false} unit="%" hide />
                        <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 10.5, fontWeight: 600, fill: '#374151' }} axisLine={false} tickLine={false} />
                        <RechartsTooltip
                          cursor={{ fill: 'transparent' }}
                          formatter={(value, _name, item) => [`${value}% (${item.payload.under5Count} under-5 member(s))`, 'Prevalence']}
                        />
                        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18} fill="#004AAD" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">By Sanitation Class (WHO/JMP)</h4>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={under5DiarrhoeaBySanitation} layout="vertical" margin={{ left: 0, right: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#F3F4F6" />
                        <XAxis type="number" allowDecimals={false} unit="%" hide />
                        <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 10.5, fontWeight: 600, fill: '#374151' }} axisLine={false} tickLine={false} />
                        <RechartsTooltip
                          cursor={{ fill: 'transparent' }}
                          formatter={(value, _name, item) => [`${value}% (${item.payload.under5Count} under-5 member(s))`, 'Prevalence']}
                        />
                        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18} fill="#0EA5E9" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </section>
        </>
      )}

      <hr className="my-10 border-gray-200" />

      {/* ===================== WASH ===================== */}
      <div className="flex items-center gap-2 mb-4">
        <Droplets size={20} className="text-[#004AAD]" />
        <h2 className="text-xl font-bold text-gray-900">WASH</h2>
      </div>

      {/* WASH KPI Section */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <WashStat
          label="Safe Water Coverage"
          value={safeWaterPct !== null ? `${safeWaterPct}%` : "—"}
          subtext={`${safeWaterCount} of ${total} households`}
          icon={CheckCircle2}
          intent={safeWaterPct === null ? "brand" : safeWaterPct > 70 ? "success" : "warning"}
        />
        <WashStat
          label="Registered Facilities"
          value={facilities.length.toString()}
          subtext="Boreholes, taps, latrines & more"
          icon={Droplets}
          intent="brand"
        />
        <WashStat
          label="Broken / Down"
          value={brokenFacilities.length.toString()}
          subtext="Facilities needing repair"
          icon={AlertOctagon}
          intent={brokenFacilities.length > 0 ? "danger" : "success"}
        />
        <WashStat
          label="No Handwashing Facility"
          value={noHandwashingCount.toString()}
          subtext="Households reporting no soap/none"
          icon={AlertOctagon}
          intent={noHandwashingCount > 0 ? "warning" : "success"}
        />
      </section>

      {/* WASH Visualization Layer */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Chart A: Source Safety */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Droplets size={20} className="text-[#004AAD]" /> Household Water Source Safety
            </h3>
            <p className="text-xs text-gray-500 mt-1">From each household's recorded water source.</p>
          </div>
          {total > 0 ? (
            <div className="h-[300px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={waterSourceSplit} cx="50%" cy="50%" innerRadius={80} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                    {waterSourceSplit.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: 0, border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
                <span className="text-4xl font-extrabold text-slate-800 block">{safeWaterPct}%</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Safe</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic py-16 text-center">No household records for {currentLocation} yet.</p>
          )}
        </div>

        {/* Chart B: Sanitation types as recorded */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Droplets size={20} className="text-[#004AAD]" /> Sanitation Types (as recorded)
            </h3>
            <p className="text-xs text-gray-500 mt-1">Free-text values entered on each household's WASH tab.</p>
          </div>
          {sanitationTally.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sanitationTally} layout="vertical" margin={{ left: 80, right: 20, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#F1F5F9" />
                  <XAxis type="number" allowDecimals={false} hide />
                  <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: 0, border: '1px solid #E2E8F0', boxShadow: 'none' }} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={28} fill="#0EA5E9" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic py-16 text-center">No sanitation data recorded yet.</p>
          )}
        </div>

        {/* Chart C: WHO/JMP Improved/Unimproved classification */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Droplets size={20} className="text-[#004AAD]" /> Sanitation Classification (WHO/JMP)
            </h3>
            <p className="text-xs text-gray-500 mt-1">Same recorded values above, grouped by the Improved/Unimproved sanitation ladder.</p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sanitationClassTally} layout="vertical" margin={{ left: 80, right: 20, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#F1F5F9" />
                <XAxis type="number" allowDecimals={false} hide />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: 0, border: '1px solid #E2E8F0', boxShadow: 'none' }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={28} fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Facility type breakdown */}
      <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-8">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-1">
          <Droplets size={20} className="text-[#004AAD]" /> Facility Status by Type
        </h3>
        <p className="text-xs text-gray-500 mb-6">Registered water/sanitation infrastructure, functional vs. broken.</p>
        {facilitiesByType.length > 0 ? (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={facilitiesByType} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <RechartsTooltip contentStyle={{ borderRadius: 0, border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="functional" stackId="a" fill="#10B981" name="Functional" radius={[0, 0, 0, 0]} />
                <Bar dataKey="broken" stackId="a" fill="#EF4444" name="Broken" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic py-8 text-center">No registered facilities for {currentLocation}.</p>
        )}
      </section>

      {/* Maintenance Queue (real broken facilities) */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
              <Hammer size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Maintenance Queue</h3>
              <p className="text-xs text-gray-500 font-medium">Facilities currently marked broken</p>
            </div>
          </div>
        </div>

        {brokenFacilities.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wider text-gray-500 font-bold border-b border-gray-100">
                  <th className="px-6 py-4">Facility</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Issue</th>
                  <th className="px-6 py-4">Mechanic</th>
                  <th className="px-6 py-4 text-right">Days Down</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {brokenFacilities.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 text-sm">{f.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{FACILITY_TYPE_LABELS[f.type] || f.type}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-gray-400" /> {f.village ? `${f.village}, ` : ""}{f.district}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {f.issue ? (
                        <span className="font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded text-xs">{f.issue}</span>
                      ) : (
                        <span className="text-gray-400 italic text-xs">Not recorded</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${!f.assignedMechanic ? "bg-amber-400" : "bg-blue-500"}`}></div>
                        <span className="text-sm font-medium text-gray-700">{f.assignedMechanic || "Unassigned"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                      {f.daysDown ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-8 text-sm text-gray-400 italic text-center">No broken facilities in {currentLocation}.</p>
        )}
      </section>
    </main>
  );
}
