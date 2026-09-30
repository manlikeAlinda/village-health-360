"use client";

import { useState, useMemo, useEffect, type ReactNode } from "react";
import Link from "next/link";
import {
  Search, Filter, Plus, Edit2, Trash2,
  MapPin, X, MoreHorizontal,
  ChevronRight, AlertCircle, Info,
  Save, AlertTriangle, Users, TrendingUp, ChevronDown,
  Download, Share2, Loader2, ShieldCheck, ShieldX, Clock, ScanSearch, UserCheck,
  ArrowUp, ArrowDown, ArrowUpDown, ChevronLeft
} from "lucide-react";
import { useHouseholdsStore, buildQuery, HouseholdSortField } from "../store/householdsStore";
import { Household, HouseholdInput } from "../lib/types";
import NinLookupPanel from "../components/ui/NinLookupPanel";
import type { HomeLocation } from "../lib/mockGovSources";
import { getAllDistricts, getSubcounties, getCounties, getParishes, getDistrictCenter, slugify, nameFromSlug } from "../lib/adminData";
import LocationPicker from "../components/ui/LocationPicker";
import SyncStatusBar from "../components/ui/SyncStatusBar";
import { useAuth } from "../components/providers/AuthProvider";
import { api } from "../lib/api";

// Filter Select Component
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

// Clickable column header for the four server-sortable fields, with a
// direction indicator. Non-sortable columns (derived or unindexed) render as
// plain <th> instead of using this.
function SortableTh({
  field,
  sortBy,
  sortDir,
  onSort,
  children,
}: {
  field: HouseholdSortField;
  sortBy: HouseholdSortField;
  sortDir: "asc" | "desc";
  onSort: (field: HouseholdSortField) => void;
  children: ReactNode;
}) {
  const active = sortBy === field;
  const Icon = active ? (sortDir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <th className="px-6 py-4">
      <button
        onClick={() => onSort(field)}
        className={`flex items-center gap-1 uppercase tracking-wider text-xs font-bold ${active ? "text-purple-700" : "text-gray-500 hover:text-gray-700"}`}
      >
        {children}
        <Icon size={12} />
      </button>
    </th>
  );
}

const SUPERVISOR_ROLES = ["Super Admin", "District Admin"];
const PAGE_SIZE = 25;
const PLACEHOLDER = "—";

// --- Households-table field derivations ---
// The member-roster editor (household detail page) never resynced the
// top-level members/under5Count fields when it grew/shrank householdMembers,
// so those two scalars can no longer be trusted once a roster exists.
// householdMembers, when present, is authoritative; the scalar is the
// fallback only for the (common, pre-roster-feature) records that never got
// one. See the households-table audit for the full root-cause trace.
function getMemberCount(h: Household): number {
  return h.householdMembers && h.householdMembers.length > 0 ? h.householdMembers.length : h.members;
}
function getUnder5Count(h: Household): number {
  return h.householdMembers && h.householdMembers.length > 0
    ? h.householdMembers.filter((m) => m.age < 5).length
    : h.under5Count ?? 0;
}
function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return PLACEHOLDER;
  // Explicit locale — never leave this unspecified (see this project's own
  // past bug where an unspecified locale produced lakh-style number
  // grouping); en-GB gives day-month-year, the convention this app's other
  // Uganda-context surfaces already use.
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function resolveLocationLabels(h: Household, allDistricts: string[]): { district: string; subcounty: string } {
  const district = nameFromSlug(allDistricts, h.location?.district_id) || PLACEHOLDER;
  const subcounty = district !== PLACEHOLDER ? nameFromSlug(getSubcounties(district), h.location?.subcounty_id) || PLACEHOLDER : PLACEHOLDER;
  return { district, subcounty };
}

export default function HouseholdsPage() {
  const { households, loading, error, total, fetchAll, remove, pendingIds, reviewHousehold } = useHouseholdsStore();
  const { role } = useAuth();
  const canReview = !!role && SUPERVISOR_ROLES.includes(role);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterRisk, setFilterRisk] = useState("All");
  const [filterReview, setFilterReview] = useState("All");
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedSubcounty, setSelectedSubcounty] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<HouseholdSortField>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // --- Modal States ---
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Household | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isReviewing, setIsReviewing] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // --- Derived Data ---
  const allDistricts = useMemo(() => getAllDistricts(), []);
  const subcounties = useMemo(() => getSubcounties(selectedDistrict), [selectedDistrict]);
  const currentLocation = selectedSubcounty || selectedDistrict || "National";

  // Debounce the free-text search before it drives a server request.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Any change to a filter or sort invalidates the current page.
  useEffect(() => {
    setPage(1);
  }, [selectedDistrict, selectedSubcounty, filterReview, filterRisk, debouncedSearch, sortBy, sortDir]);

  // Server-side scoping, sorting and pagination — every filter shown in the
  // UI is now a real query param, not a client-side re-filter of an
  // already-fetched page (which would silently drop matches once paginated).
  useEffect(() => {
    fetchAll({
      district: selectedDistrict || undefined,
      subcounty: selectedSubcounty || undefined,
      reviewStatus: filterReview !== "All" ? filterReview : undefined,
      riskLevel: filterRisk !== "All" ? filterRisk : undefined,
      search: debouncedSearch || undefined,
      page,
      pageSize: PAGE_SIZE,
      sortBy,
      sortDir,
    });
  }, [selectedDistrict, selectedSubcounty, filterReview, filterRisk, debouncedSearch, page, sortBy, sortDir, fetchAll]);

  // KPI cards need true totals across every matching record, not just the
  // current 25-row page — a second, unpaginated request against the same
  // filters (same pattern the Health/WASH/Livelihoods dashboards already
  // use), kept separate from the store's paginated `households` state.
  const [scopeStats, setScopeStats] = useState<{ total: number; critical: number; newThisMonth: number; pendingReview: number } | null>(null);
  useEffect(() => {
    let cancelled = false;
    api
      .get<{ data: Household[] }>(
        `/api/households${buildQuery({
          district: selectedDistrict || undefined,
          subcounty: selectedSubcounty || undefined,
          reviewStatus: filterReview !== "All" ? filterReview : undefined,
          riskLevel: filterRisk !== "All" ? filterRisk : undefined,
          search: debouncedSearch || undefined,
        })}`
      )
      .then(({ data }) => {
        if (cancelled) return;
        const now = new Date();
        setScopeStats({
          total: data.length,
          critical: data.filter((h) => h.riskLevel === "Critical").length,
          newThisMonth: data.filter((h) => {
            const created = new Date(h.createdAt);
            return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth();
          }).length,
          pendingReview: data.filter((h) => h.reviewStatus === "pending").length,
        });
      })
      .catch(() => {
        // Supplementary KPI data — the table's own error banner already
        // covers a primary fetch failure, so this fails silently rather
        // than showing a second error for the same underlying problem.
      });
    return () => {
      cancelled = true;
    };
  }, [selectedDistrict, selectedSubcounty, filterReview, filterRisk, debouncedSearch]);

  const handleApprove = async (hh: Household) => {
    setIsReviewing(hh.id);
    setReviewError(null);
    try {
      await reviewHousehold(hh.id, "approved");
    } catch (err) {
      setReviewError((err as Error).message);
    } finally {
      setIsReviewing(null);
    }
  };

  const openRejectModal = (hh: Household) => {
    setRejectTarget(hh);
    setRejectReason("");
    setReviewError(null);
  };

  const confirmReject = async () => {
    if (!rejectTarget || !rejectReason.trim()) return;
    setIsReviewing(rejectTarget.id);
    setReviewError(null);
    try {
      await reviewHousehold(rejectTarget.id, "rejected", rejectReason.trim());
      setRejectTarget(null);
    } catch (err) {
      setReviewError((err as Error).message);
    } finally {
      setIsReviewing(null);
    }
  };

  // --- Actions ---
  const handleEditClick = (hh: Household) => {
    setSelectedHousehold(hh);
    setIsEditOpen(true);
  };

  const handleDeleteClick = (hh: Household) => {
    setSelectedHousehold(hh);
    setDeleteError(null);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedHousehold) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await remove(selectedHousehold.id);
      setIsDeleteOpen(false);
      setSelectedHousehold(null);
    } catch (err) {
      // Deletion isn't offline-queueable (unlike create/edit) — it needs to
      // confirm against the current server state, not a stale local copy.
      setDeleteError(
        typeof navigator !== "undefined" && !navigator.onLine
          ? "Can't delete while offline — this needs to reach the server."
          : (err as Error).message
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // households is now the current server page already — district, subcounty,
  // review status, risk and search are all real query params (see the
  // fetchAll effect above), not a second client-side filter over a page
  // that's already been sliced server-side.
  const totalPages = total ? Math.max(1, Math.ceil(total / PAGE_SIZE)) : 1;

  const toggleSort = (field: HouseholdSortField) => {
    if (sortBy === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 p-6 lg:p-10 mt-16">
      {/* Warms the Leaflet chunk next/dynamic will need for the registration
          modal's map-pin picker. A raw import() doesn't share next/dynamic's
          own loader chunk, so this mounts the real dynamic component (hidden)
          to force it through the same loading path — otherwise the first
          "Register Household" click, if it happens offline, fails to fetch
          the chunk and crashes the page. */}
      <div className="hidden" aria-hidden="true">
        <LocationPicker value={null} center={[0, 0]} onChange={() => {}} />
      </div>

      {/* 1. Executive Header */}
      <header className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
              Beneficiary Directory
            </h1>
            <p className="text-sm text-gray-500 mt-1.5 max-w-xl">
              Household registry and vulnerability tracking across {currentLocation}.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm">
              <Download size={16} /> Export Report
            </button>
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#7C3AED] rounded-xl hover:bg-[#6D28D9] transition shadow-sm"
            >
              <Plus size={16} /> Register Household
            </button>
          </div>
        </div>
      </header>

      <SyncStatusBar />

      {reviewError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
          <AlertCircle size={16} /> {reviewError}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
          <AlertCircle size={16} /> Couldn't reach the API ({error}). Is the backend running at the configured NEXT_PUBLIC_API_URL?
        </div>
      )}

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
          <div className="relative min-w-[180px]">
            <select
              className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg text-sm font-medium transition-colors hover:border-gray-400 focus:outline-none focus:border-[#004AAD]"
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
            >
              <option value="All">All Risk Levels</option>
              <option value="Critical">Critical Priority</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <ChevronDown size={14} />
            </div>
          </div>
          <div className="relative min-w-[180px]">
            <select
              className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg text-sm font-medium transition-colors hover:border-gray-400 focus:outline-none focus:border-[#004AAD]"
              value={filterReview}
              onChange={(e) => setFilterReview(e.target.value)}
            >
              <option value="All">All Review Statuses</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <ChevronDown size={14} />
            </div>
          </div>
          {(selectedDistrict || selectedSubcounty || filterRisk !== "All" || filterReview !== "All") && (
            <button
              onClick={() => {
                setSelectedDistrict(null);
                setSelectedSubcounty(null);
                setFilterRisk("All");
                setFilterReview("All");
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-800 transition"
            >
              <X size={14} /> Clear Filters
            </button>
          )}
          {loading && <Loader2 size={16} className="animate-spin text-gray-400 ml-auto" />}
        </div>
      </section>

      {/* 2. KPI Section */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-xl border bg-blue-50 text-blue-700 border-blue-200">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-bold text-gray-900 tracking-tight">{(total ?? 0).toLocaleString()}</h4>
            <p className="text-sm font-medium text-gray-500 mt-0.5">Households {selectedDistrict ? `in ${currentLocation}` : "(All Districts)"}</p>
            <p className="text-[10px] text-gray-400 mt-2 border-t border-gray-50 pt-2">Registered beneficiaries</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-xl border bg-red-50 text-red-700 border-red-200">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-bold text-gray-900 tracking-tight">{(scopeStats?.critical ?? 0).toLocaleString()}</h4>
            <p className="text-sm font-medium text-gray-500 mt-0.5">Critical Priority</p>
            <p className="text-[10px] text-gray-400 mt-2 border-t border-gray-50 pt-2">Require immediate attention</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-xl border bg-amber-50 text-amber-700 border-amber-200">
              <Clock size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-bold text-gray-900 tracking-tight">{(scopeStats?.pendingReview ?? 0).toLocaleString()}</h4>
            <p className="text-sm font-medium text-gray-500 mt-0.5">Pending Review</p>
            <p className="text-[10px] text-gray-400 mt-2 border-t border-gray-50 pt-2">Awaiting supervisor approval</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-xl border bg-purple-50 text-purple-700 border-purple-200">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-bold text-gray-900 tracking-tight">+{(scopeStats?.newThisMonth ?? 0).toLocaleString()}</h4>
            <p className="text-sm font-medium text-gray-500 mt-0.5">New This Month</p>
            <p className="text-[10px] text-gray-400 mt-2 border-t border-gray-50 pt-2">Registered in the current calendar month</p>
          </div>
        </div>
      </section>

      {/* 3. Search Bar */}
      <section className="mb-6 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by Head of House, Village, or Unique ID..."
            className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:ring-0 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      {/* 4. Data Table */}
      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {loading && households.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Loader2 size={28} className="animate-spin text-purple-500 mb-3" />
            <p className="text-gray-500 text-sm">Loading households…</p>
          </div>
        ) : households.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-bold tracking-wider">
                  <SortableTh field="head" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort}>Household</SortableTh>
                  <th className="px-6 py-4">District</th>
                  <th className="px-6 py-4">Sub-county</th>
                  <th className="px-6 py-4">Parish</th>
                  <th className="px-6 py-4">Village</th>
                  <th className="px-6 py-4 text-right">Members</th>
                  <th className="px-6 py-4 text-right">Under-5s</th>
                  <SortableTh field="createdAt" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort}>Registered</SortableTh>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {households.map((hh) => {
                  const { district, subcounty } = resolveLocationLabels(hh, allDistricts);
                  return (
                    <tr key={hh.id} className="group hover:bg-purple-50/30 transition-colors">
                      {/* Household: head + record reference (truncated, not the raw UUID) */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border border-white shadow-sm flex items-center justify-center text-gray-600 font-bold text-xs shrink-0">
                            {hh.head.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 text-sm flex items-center gap-2 flex-wrap">
                              {hh.head}
                              {pendingIds.has(hh.id) && (
                                <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200" title="Created offline — not yet synced to the server">
                                  Pending Sync
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-400 font-mono mt-0.5" title={hh.id}>
                              #{hh.id.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700">{district}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{subcounty}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{hh.location?.parish_id || PLACEHOLDER}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <span className="inline-flex items-center gap-1.5"><MapPin size={12} className="text-gray-400" /> {hh.location?.village_id || PLACEHOLDER}</span>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700 text-right tabular-nums">{getMemberCount(hh)}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 text-right tabular-nums">{getUnder5Count(hh)}</td>

                      <td className="px-6 py-4 text-xs text-gray-500">{formatDate(hh.createdAt)}</td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/households/${hh.id}`}
                            className="text-purple-600 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-1"
                          >
                            View <ChevronRight size={12} />
                          </Link>

                          {canReview && hh.reviewStatus === "pending" && (
                            <>
                              <div className="h-4 w-px bg-gray-200 mx-1"></div>
                              <button
                                onClick={() => handleApprove(hh)}
                                disabled={isReviewing === hh.id}
                                className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors disabled:opacity-40"
                                title="Approve"
                              >
                                {isReviewing === hh.id ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                              </button>
                              <button
                                onClick={() => openRejectModal(hh)}
                                disabled={isReviewing === hh.id}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-40"
                                title="Reject"
                              >
                                <ShieldX size={14} />
                              </button>
                            </>
                          )}

                          <div className="h-4 w-px bg-gray-200 mx-1"></div>

                          <button
                            onClick={() => handleEditClick(hh)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit Record"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(hh)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState clearFilters={() => { setSearchTerm(""); setFilterRisk("All"); }} />
        )}

        {/* Footer: real server-side pagination */}
        {households.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <p>
              Showing <span className="font-bold text-gray-900">{(page - 1) * PAGE_SIZE + 1}–{(page - 1) * PAGE_SIZE + households.length}</span> of{" "}
              <span className="font-bold text-gray-900">{total ?? households.length}</span> records
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 font-semibold text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <span className="px-2 font-semibold text-gray-700">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 font-semibold text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* --- MODAL SYSTEM --- */}

      {/* Registration Modal */}
      {isRegisterOpen && (
        <ModalBase title="New Household Registration" onClose={() => setIsRegisterOpen(false)}>
          <HouseholdForm onClose={() => setIsRegisterOpen(false)} />
        </ModalBase>
      )}

      {/* Edit Modal */}
      {isEditOpen && selectedHousehold && (
        <ModalBase title={`Edit Record: ${selectedHousehold.id}`} onClose={() => setIsEditOpen(false)}>
          <HouseholdForm
            initialData={selectedHousehold}
            onClose={() => setIsEditOpen(false)}
            isEdit
          />
        </ModalBase>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && selectedHousehold && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => !isDeleting && setIsDeleteOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete Household Record?</h3>
              <p className="text-sm text-gray-500 mt-2">
                You are about to permanently remove <span className="font-bold text-gray-800">{selectedHousehold.head}</span> ({selectedHousehold.id}) from the directory. This action cannot be undone.
              </p>
              {deleteError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-3">{deleteError}</p>
              )}
            </div>
            <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-center">
              <button
                onClick={() => setIsDeleteOpen(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 shadow-sm disabled:opacity-70"
              >
                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : null}
                {isDeleting ? "Deleting…" : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Submission Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => !isReviewing && setRejectTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldX size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center">Reject Submission?</h3>
              <p className="text-sm text-gray-500 mt-2 text-center">
                Rejecting <span className="font-bold text-gray-800">{rejectTarget.head}</span> sends it back to the field agent for correction. A reason is required.
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Village name doesn't match the subcounty on file"
                rows={3}
                className="w-full mt-4 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
              />
            </div>
            <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-center">
              <button
                onClick={() => setRejectTarget(null)}
                disabled={!!isReviewing}
                className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={!!isReviewing || !rejectReason.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 shadow-sm disabled:opacity-50"
              >
                {isReviewing ? <Loader2 size={14} className="animate-spin" /> : null}
                {isReviewing ? "Rejecting…" : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// --- Sub-Components ---

function EmptyState({ clearFilters }: { clearFilters: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Search size={32} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-bold text-gray-900">No households found</h3>
      <p className="text-gray-500 max-w-sm mt-2 mb-6">
        Try adjusting your search or filter criteria, or register a new household.
      </p>
      <button
        onClick={clearFilters}
        className="text-purple-600 font-medium hover:underline text-sm"
      >
        Clear all filters
      </button>
    </div>
  );
}

function ModalBase({ title, onClose, children }: { title: string, onClose: () => void, children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function HouseholdForm({ onClose, initialData, isEdit = false }: { onClose: () => void, initialData?: Household, isEdit?: boolean }) {
  const { create, update } = useHouseholdsStore();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isLookupOpen, setIsLookupOpen] = useState(false);

  const allDistricts = useMemo(() => getAllDistricts(), []);
  const initialDistrict = nameFromSlug(allDistricts, initialData?.location?.district_id);

  const [form, setForm] = useState({
    head: initialData?.head || "",
    phone: initialData?.phone || "",
    nationalId: initialData?.nationalId || "",
    members: initialData?.members ?? 1,
    under5Count: initialData?.under5Count ?? 0,
    district: initialDistrict,
    county: nameFromSlug(getCounties(initialDistrict), initialData?.location?.county_id),
    subcounty: nameFromSlug(getSubcounties(initialDistrict), initialData?.location?.subcounty_id),
    parish: initialData?.location?.parish_id || "",
    village: initialData?.location?.village_id || "",
    riskLevel: initialData?.riskLevel || "Low",
    healthStatus: initialData?.healthStatus || "Stable",
    waterSource: initialData?.waterSource || "Borehole (Safe)",
    program: initialData?.program || "Routine Monitoring",
    lat: initialData?.location?.latitude,
    lng: initialData?.location?.longitude,
    capturedAt: initialData?.location?.captured_at,
  });

  const formCounties = useMemo(() => getCounties(form.district || null), [form.district]);
  const formSubcounties = useMemo(() => getSubcounties(form.district || null), [form.district]);
  const formParishes = useMemo(() => getParishes(form.district || null, form.subcounty || null), [form.district, form.subcounty]);
  const mapCenter = useMemo(() => getDistrictCenter(form.district || null), [form.district]);
  const locationValue = form.lat != null && form.lng != null ? { lat: form.lat, lng: form.lng } : null;

  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // Autofill from the resolved NIN identity's registered address, in the
  // same step as the name autofill. Each relational field is resolved
  // against the existing district/county/subcounty/parish reference data
  // (adminData.ts) and rejected — not inserted as free text — on a mismatch.
  // A level with no reference data at all for this district (most counties,
  // almost all parishes — see DATA_SOURCES.md) is passed through rather than
  // rejected, since there's nothing to validate it against.
  const handleApplyIdentity = (name: string, loc: HomeLocation) => {
    setField("head", name);

    const district = loc.district.trim();
    const county = loc.county.trim();
    const subcounty = loc.subcounty.trim();
    const parish = loc.parish.trim();
    const village = loc.village.trim();

    if (!getAllDistricts().includes(district)) {
      setFormError(`National ID location data did not resolve: "${district}" is not a recognized district.`);
      return;
    }
    const countyOptions = getCounties(district);
    if (countyOptions.length > 0 && !countyOptions.includes(county)) {
      setFormError(`National ID location data did not resolve: "${county}" is not a recognized county of ${district}.`);
      return;
    }
    const subcountyOptions = getSubcounties(district);
    if (!subcountyOptions.includes(subcounty)) {
      setFormError(`National ID location data did not resolve: "${subcounty}" is not a recognized subcounty of ${district}.`);
      return;
    }
    const parishOptions = getParishes(district, subcounty);
    if (parishOptions.length > 0 && !parishOptions.includes(parish)) {
      setFormError(`National ID location data did not resolve: "${parish}" is not a recognized parish of ${subcounty}.`);
      return;
    }

    setFormError(null);
    setField("district", district);
    setField("county", county);
    setField("subcounty", subcounty);
    setField("parish", parish);
    setField("village", village);
  };

  const handleSubmit = async () => {
    if (!form.head.trim()) {
      setFormError("Run an NIN lookup and apply the resolved identity before saving.");
      return;
    }
    if (!form.district || !form.parish.trim() || !form.village.trim()) {
      setFormError("District, parish, and village are required.");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const payload: HouseholdInput = {
        head: form.head,
        phone: form.phone,
        nationalId: form.nationalId,
        members: Number(form.members),
        under5Count: Number(form.under5Count),
        riskLevel: form.riskLevel,
        healthStatus: form.healthStatus,
        waterSource: form.waterSource,
        program: form.program,
        location: {
          district_id: slugify(form.district),
          county_id: form.county ? slugify(form.county) : undefined,
          subcounty_id: form.subcounty ? slugify(form.subcounty) : undefined,
          parish_id: form.parish.trim(),
          village_id: form.village.trim(),
          latitude: form.lat,
          longitude: form.lng,
          captured_at: form.capturedAt,
        },
      };
      if (isEdit && initialData) {
        await update(initialData.id, payload);
      } else {
        await create(payload);
      }
      onClose();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto p-6">
        {formError && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
            <AlertCircle size={14} /> {formError}
          </div>
        )}
        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wider">Identity Verification</h3>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">National ID / NIN</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.nationalId ?? ""}
                  onChange={(e) => setField("nationalId", e.target.value)}
                  placeholder="CM..."
                  className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setIsLookupOpen((o) => !o)}
                  disabled={!form.nationalId?.trim()}
                  title="Preview cross-agency lookup (sample interface)"
                  className="shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-700 hover:bg-purple-50 hover:text-purple-700 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ScanSearch size={14} /> {isLookupOpen ? "Hide Lookup" : "Lookup"}
                </button>
              </div>
            </div>
            {form.head.trim() && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-center gap-2">
                <UserCheck size={16} className="text-emerald-600 shrink-0" />
                <span className="text-sm font-bold text-emerald-800">{form.head}</span>
                <span className="text-xs text-emerald-600">resolved as head of household</span>
              </div>
            )}
          </div>

          {isLookupOpen && form.nationalId?.trim() && (
            <NinLookupPanel
              id={form.nationalId.trim()}
              onApplyIdentity={handleApplyIdentity}
            />
          )}

          <div className="h-px bg-gray-100" />

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wider">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">District</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none bg-white"
                  value={form.district}
                  onChange={(e) => {
                    setField("district", e.target.value);
                    setField("county", "");
                    setField("subcounty", "");
                    setField("parish", "");
                  }}
                >
                  <option value="">Select District...</option>
                  {allDistricts.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">County</label>
                {formCounties.length > 0 ? (
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400"
                    value={form.county}
                    onChange={(e) => setField("county", e.target.value)}
                    disabled={!form.district}
                  >
                    <option value="">{form.district ? "Select County..." : "Select district first"}</option>
                    {formCounties.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={form.county}
                    onChange={(e) => setField("county", e.target.value)}
                    disabled={!form.district}
                    placeholder={form.district ? "No reference data — type it in" : "Select district first"}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-colors disabled:bg-gray-50 disabled:text-gray-400"
                  />
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Subcounty</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400"
                  value={form.subcounty}
                  onChange={(e) => {
                    setField("subcounty", e.target.value);
                    setField("parish", "");
                  }}
                  disabled={!form.district}
                >
                  <option value="">{form.district ? "Select Subcounty..." : "Select district first"}</option>
                  {formSubcounties.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Parish</label>
                {formParishes.length > 0 ? (
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400"
                    value={form.parish}
                    onChange={(e) => setField("parish", e.target.value)}
                    disabled={!form.subcounty}
                  >
                    <option value="">{form.subcounty ? "Select Parish..." : "Select subcounty first"}</option>
                    {formParishes.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={form.parish}
                    onChange={(e) => setField("parish", e.target.value)}
                    disabled={!form.district}
                    placeholder={form.district ? "e.g. Patiko — no reference data, type it in" : "Select district first"}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-colors disabled:bg-gray-50 disabled:text-gray-400"
                  />
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Village</label>
                <input
                  type="text"
                  value={form.village}
                  onChange={(e) => setField("village", e.target.value)}
                  placeholder="e.g. Bwobo"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <LocationPicker
                  value={locationValue}
                  center={mapCenter}
                  onChange={(lat, lng) => setForm((f) => ({ ...f, lat, lng, capturedAt: new Date().toISOString() }))}
                />
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={submitting}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 shadow-md transition-all active:scale-95 disabled:opacity-70"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {submitting ? "Saving…" : isEdit ? "Update Record" : "Save Registration"}
        </button>
      </div>
    </>
  );
}

