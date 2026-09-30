"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Wallet, TrendingUp,
  AlertTriangle, LucideIcon, Filter, ChevronDown, X, Loader2,
  Sprout, ClipboardList
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { getAllDistricts, getSubcounties } from "../lib/adminData";
import { useHouseholdsStore } from "../store/householdsStore";
import { INCOME_BRACKETS } from "../lib/types";

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

const CHART_COLORS = ["#7C3AED", "#DB2777", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#6366F1", "#94A3B8"];

// --- Component System ---

interface EconStatProps {
  label: string;
  value: string;
  suffix?: string;
  icon: LucideIcon;
  intent: 'brand' | 'success' | 'warning' | 'danger';
  subtext?: string;
}

function EconStat({ label, value, suffix, icon: Icon, intent, subtext }: EconStatProps) {
  const styles = {
    brand: "bg-purple-50 text-purple-700 border-purple-200",
    success: "bg-green-50 text-green-700 border-green-200",
    warning: "bg-orange-50 text-orange-700 border-orange-200",
    danger: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
      <div className={`p-2.5 rounded-xl border inline-flex ${styles[intent]}`}>
        <Icon size={20} />
      </div>
      <div className="mt-4">
        <div className="flex items-baseline gap-1">
          <h4 className="text-2xl font-bold text-gray-900 tracking-tight">{value}</h4>
          {suffix && <span className="text-sm text-gray-400 font-medium">{suffix}</span>}
        </div>
        <p className="text-sm font-medium text-gray-500 mt-0.5">{label}</p>
        {subtext && <p className="text-[10px] text-gray-400 mt-2 border-t border-gray-50 pt-2">{subtext}</p>}
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

export default function LivelihoodsMonitor() {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedSubcounty, setSelectedSubcounty] = useState<string | null>(null);

  const allDistricts = useMemo(() => getAllDistricts(), []);
  const subcounties = useMemo(() => getSubcounties(selectedDistrict), [selectedDistrict]);
  const currentLocation = selectedSubcounty || selectedDistrict || "National";

  const { households, loading, fetchAll } = useHouseholdsStore();

  useEffect(() => {
    fetchAll({ district: selectedDistrict || undefined, subcounty: selectedSubcounty || undefined });
  }, [selectedDistrict, selectedSubcounty, fetchAll]);

  // --- Real aggregates ---
  const total = households.length;

  const withLivelihoodsData = useMemo(() => households.filter((h) => h.livelihoods), [households]);
  const coveragePct = total > 0 ? Math.round((withLivelihoodsData.length / total) * 100) : null;

  const incomeTally = useMemo(
    () => tally(withLivelihoodsData.map((h) => h.livelihoods?.incomeSource)),
    [withLivelihoodsData]
  );

  // Ordinal, not frequency-sorted — a tier chart needs to read low-to-high,
  // not shuffled by count. This is the real, population-relative tiering
  // Slide 6 of the household-anchor deck needed and didn't have before.
  const incomeBracketTally = useMemo(() => {
    const counts = new Map<string, number>();
    withLivelihoodsData.forEach((h) => {
      const b = h.livelihoods?.incomeBracket;
      if (b) counts.set(b, (counts.get(b) || 0) + 1);
    });
    return INCOME_BRACKETS.map((b) => ({ name: b, value: counts.get(b) || 0 }));
  }, [withLivelihoodsData]);
  const incomeBracketRecordedCount = useMemo(
    () => withLivelihoodsData.filter((h) => h.livelihoods?.incomeBracket).length,
    [withLivelihoodsData]
  );

  const foodSecurityTally = useMemo(
    () => tally(withLivelihoodsData.map((h) => h.livelihoods?.foodSecurity)),
    [withLivelihoodsData]
  );

  const foodInsecureHouseholds = useMemo(
    () => households.filter((h) => {
      const v = (h.livelihoods?.foodSecurity || "").toLowerCase();
      return v.includes("stressed") || v.includes("critical") || v.includes("crisis") || v.includes("severe");
    }),
    [households]
  );

  const cropTally = useMemo(() => {
    const counts = new Map<string, number>();
    withLivelihoodsData.forEach((h) => {
      (h.livelihoods?.crops || []).forEach((crop) => {
        const c = crop.trim();
        if (!c) return;
        counts.set(c, (counts.get(c) || 0) + 1);
      });
    });
    return Array.from(counts.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [withLivelihoodsData]);

  const topIncomeSource = incomeTally.find((t) => t.name !== "Not recorded");
  const topCrop = cropTally[0];

  return (
    <main className="min-h-screen bg-linear-to-br from-gray-50 via-white to-purple-50/30 p-6 lg:p-10 mt-16">
      {/* 1. Executive Header */}
      <header className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
              Livelihoods Monitor
            </h1>
            <p className="text-sm text-gray-500 mt-1.5 max-w-xl">
              Aggregated from {total} household record{total === 1 ? "" : "s"} in {currentLocation}. Income, food security, and crops are entered manually per household — see a household's Livelihoods tab to add or correct data.
            </p>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
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

      {total === 0 && !loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-400">
          No household records for {currentLocation} yet.
        </div>
      ) : (
        <>
          {/* 2. KPI Section */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <EconStat
              label="Livelihoods Data Recorded"
              value={coveragePct !== null ? `${coveragePct}%` : "—"}
              icon={ClipboardList}
              intent="brand"
              subtext={`${withLivelihoodsData.length} of ${total} households`}
            />
            <EconStat
              label="Most Common Income Source"
              value={topIncomeSource ? topIncomeSource.name : "—"}
              icon={Wallet}
              intent="success"
              subtext={topIncomeSource ? `${topIncomeSource.value} households` : "No data yet"}
            />
            <EconStat
              label="Food-Insecure Households"
              value={foodInsecureHouseholds.length.toString()}
              icon={AlertTriangle}
              intent={foodInsecureHouseholds.length > 0 ? "danger" : "success"}
              subtext="Flagged 'stressed'/'critical' in food security"
            />
            <EconStat
              label="Most-Grown Crop"
              value={topCrop ? topCrop.name : "—"}
              icon={Sprout}
              intent="brand"
              subtext={topCrop ? `${topCrop.value} households` : "No crop data yet"}
            />
          </section>

          {/* 3. Deep-Dive Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Chart A: Income Diversification */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Wallet size={20} className="text-purple-600" /> Income Source Distribution
                </h3>
                <p className="text-xs text-gray-500 mt-1">As recorded on each household's Livelihoods tab.</p>
              </div>
              {incomeTally.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={incomeTally} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={4} dataKey="value" stroke="none">
                        {incomeTally.map((entry, i) => (
                          <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => [`${value} household(s)`, 'Count']} contentStyle={{ borderRadius: 0, border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Legend verticalAlign="bottom" height={60} iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic py-16 text-center">No income data recorded yet.</p>
              )}
            </div>

            {/* Chart A2: Income Bracket (ordinal tier, not just source) */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp size={20} className="text-purple-600" /> Monthly Income Bracket
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {incomeBracketRecordedCount} of {withLivelihoodsData.length} households with Livelihoods data have a recorded bracket.
                </p>
              </div>
              {incomeBracketRecordedCount > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={incomeBracketTally} layout="vertical" margin={{ left: 0, right: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#F3F4F6" />
                      <XAxis type="number" allowDecimals={false} hide />
                      <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11, fontWeight: 600, fill: '#374151' }} axisLine={false} tickLine={false} />
                      <RechartsTooltip cursor={{ fill: 'transparent' }} formatter={(value) => [`${value} household(s)`, 'Count']} />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22} fill="#7C3AED" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic py-16 text-center">No income bracket data recorded yet.</p>
              )}
            </div>

            {/* Chart B: Food Security */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <AlertTriangle size={20} className="text-orange-500" /> Food Security Status
                </h3>
                <p className="text-xs text-gray-500 mt-1">As recorded on each household's Livelihoods tab.</p>
              </div>
              {foodSecurityTally.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={foodSecurityTally} layout="vertical" margin={{ left: 0, right: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#F3F4F6" />
                      <XAxis type="number" allowDecimals={false} hide />
                      <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11, fontWeight: 600, fill: '#374151' }} axisLine={false} tickLine={false} />
                      <RechartsTooltip cursor={{ fill: 'transparent' }} />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22} fill="#F59E0B" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic py-16 text-center">No food security data recorded yet.</p>
              )}
            </div>

            {/* Chart C: Top Crops */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Sprout size={20} className="text-green-600" /> Most-Grown Crops
                </h3>
                <p className="text-xs text-gray-500 mt-1">Households growing each crop, from recorded agricultural profiles.</p>
              </div>
              {cropTally.length > 0 ? (
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cropTally} layout="vertical" margin={{ left: 0, right: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#F3F4F6" />
                      <XAxis type="number" allowDecimals={false} hide />
                      <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11, fontWeight: 600, fill: '#374151' }} axisLine={false} tickLine={false} />
                      <RechartsTooltip cursor={{ fill: 'transparent' }} />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20} fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic py-16 text-center">No crop data recorded yet.</p>
              )}
            </div>
          </div>
        </>
      )}
    </main>
  );
}
