"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Search, Filter, Plus, Edit2, Trash2,
  MapPin, Droplets, Activity, X, MoreHorizontal,
  ChevronRight, AlertCircle, CalendarClock, Info,
  Save, AlertTriangle, Users, TrendingUp, ChevronDown,
  Download, Share2, Loader2, ShieldCheck, ShieldX, Clock
} from "lucide-react";
import { useHouseholdsStore } from "../store/householdsStore";
import { Household, HouseholdInput } from "../lib/types";
import DemoDataBadge from "../components/ui/DemoDataBadge";
import { getAllDistricts, getSubcounties, getDistrictCenter } from "../lib/adminData";
import LocationPicker from "../components/ui/LocationPicker";
import SyncStatusBar from "../components/ui/SyncStatusBar";
import { useAuth } from "../components/providers/AuthProvider";

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

const SUPERVISOR_ROLES = ["Super Admin", "District Admin"];

export default function HouseholdsPage() {
  const { households, loading, error, fetchAll, remove, pendingIds, reviewHousehold } = useHouseholdsStore();
  const { role } = useAuth();
  const canReview = !!role && SUPERVISOR_ROLES.includes(role);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRisk, setFilterRisk] = useState("All");
  const [filterReview, setFilterReview] = useState("All");
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedSubcounty, setSelectedSubcounty] = useState<string | null>(null);

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

  // Server-side scoping by district/subcounty/review status; search + risk filtered client-side below.
  useEffect(() => {
    fetchAll({
      district: selectedDistrict || undefined,
      subcounty: selectedSubcounty || undefined,
      reviewStatus: filterReview !== "All" ? filterReview : undefined,
    });
  }, [selectedDistrict, selectedSubcounty, filterReview, fetchAll]);

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

  // --- Filtering Logic (search + risk, client-side over the fetched scope) ---
  const filteredData = households.filter((item) => {
    const matchesSearch = item.head.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = filterRisk === "All" || item.riskLevel === filterRisk;
    return matchesSearch && matchesRisk;
  });

  // --- Real Stats (derived from fetched data, not fabricated) ---
  const criticalCount = households.filter(h => h.riskLevel === "Critical").length;
  const newThisMonth = useMemo(() => {
    const now = new Date();
    return households.filter(h => {
      const created = new Date(h.createdAt);
      return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth();
    }).length;
  }, [households]);

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
            <h4 className="text-2xl font-bold text-gray-900 tracking-tight">{households.length.toLocaleString()}</h4>
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
            <h4 className="text-2xl font-bold text-gray-900 tracking-tight">{criticalCount.toLocaleString()}</h4>
            <p className="text-sm font-medium text-gray-500 mt-0.5">Critical Priority</p>
            <p className="text-[10px] text-gray-400 mt-2 border-t border-gray-50 pt-2">Require immediate attention</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-xl border bg-green-50 text-green-700 border-green-200">
              <Activity size={20} />
            </div>
            <DemoDataBadge label="Not tracked yet" />
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-bold text-gray-900 tracking-tight">—</h4>
            <p className="text-sm font-medium text-gray-500 mt-0.5">Visit Compliance</p>
            <p className="text-[10px] text-gray-400 mt-2 border-t border-gray-50 pt-2">Needs a visit-schedule model (not built yet)</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-xl border bg-purple-50 text-purple-700 border-purple-200">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-bold text-gray-900 tracking-tight">+{newThisMonth.toLocaleString()}</h4>
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
        ) : filteredData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-bold tracking-wider">
                  <th className="px-6 py-4">Household Profile</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Risk Triage</th>
                  <th className="px-6 py-4">Intervention</th>
                  <th className="px-6 py-4">Last Visit</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredData.map((hh) => (
                  <tr key={hh.id} className="group hover:bg-purple-50/30 transition-colors">
                    {/* Identity */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border border-white shadow-sm flex items-center justify-center text-gray-600 font-bold text-xs">
                          {hh.head.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm flex items-center gap-2 flex-wrap">
                            {hh.head}
                            {pendingIds.has(hh.id) && (
                              <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
                                Pending Sync
                              </span>
                            )}
                            {hh.reviewStatus === "pending" && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                <Clock size={9} /> Pending Review
                              </span>
                            )}
                            {hh.reviewStatus === "rejected" && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200" title={hh.rejectionReason}>
                                <ShieldX size={9} /> Rejected
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 font-mono mt-0.5 flex items-center gap-2">
                            {hh.id}
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            {hh.members} Members
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                          <MapPin size={14} className="text-gray-400" /> {hh.village}
                        </div>
                        <p className="text-xs text-gray-500 pl-5">{hh.parish} Parish</p>
                      </div>
                    </td>

                    {/* Risk Badge */}
                    <td className="px-6 py-4">
                      <RiskBadge level={hh.riskLevel} />
                    </td>

                    {/* Indicators */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100 font-medium">
                            {hh.program}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Droplets size={12} className={hh.waterSource.includes("Unsafe") ? "text-amber-500" : "text-blue-500"} />
                          {hh.waterSource}
                        </div>
                      </div>
                    </td>

                    {/* Meta */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <CalendarClock size={14} className="text-gray-400" />
                        {hh.lastVisit || "No visits logged"}
                      </div>
                    </td>

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
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState clearFilters={() => { setSearchTerm(""); setFilterRisk("All"); }} />
        )}

        {/* Footer */}
        {filteredData.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <p>Showing <span className="font-bold text-gray-900">{filteredData.length}</span> of {households.length} records</p>
          </div>
        )}
      </section>

      {/* --- MODAL SYSTEM --- */}

      {/* Registration Modal */}
      {isRegisterOpen && (
        <ModalBase title="New Household Registration" onClose={() => setIsRegisterOpen(false)}>
          <HouseholdForm onClose={() => setIsRegisterOpen(false)} allDistricts={allDistricts} />
        </ModalBase>
      )}

      {/* Edit Modal */}
      {isEditOpen && selectedHousehold && (
        <ModalBase title={`Edit Record: ${selectedHousehold.id}`} onClose={() => setIsEditOpen(false)}>
          <HouseholdForm
            initialData={selectedHousehold}
            onClose={() => setIsEditOpen(false)}
            isEdit
            allDistricts={allDistricts}
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

function HouseholdForm({ onClose, initialData, isEdit = false, allDistricts }: { onClose: () => void, initialData?: Household, isEdit?: boolean, allDistricts: string[] }) {
  const { create, update } = useHouseholdsStore();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [form, setForm] = useState({
    head: initialData?.head || "",
    phone: initialData?.phone || "",
    nationalId: initialData?.nationalId || "",
    members: initialData?.members ?? 1,
    under5Count: initialData?.under5Count ?? 0,
    district: initialData?.district || "",
    subcounty: initialData?.subcounty || "",
    village: initialData?.village || "",
    parish: initialData?.parish || "",
    riskLevel: initialData?.riskLevel || "Low",
    healthStatus: initialData?.healthStatus || "Stable",
    waterSource: initialData?.waterSource || "Borehole (Safe)",
    program: initialData?.program || "Routine Monitoring",
    lat: initialData?.lat,
    lng: initialData?.lng,
  });

  const formSubcounties = useMemo(() => getSubcounties(form.district || null), [form.district]);
  const mapCenter = useMemo(() => getDistrictCenter(form.district || null), [form.district]);
  const locationValue = form.lat != null && form.lng != null ? { lat: form.lat, lng: form.lng } : null;

  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!form.head.trim() || !form.district || !form.village.trim() || !form.parish.trim()) {
      setFormError("Head of household, district, village, and parish are required.");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const payload: HouseholdInput = {
        ...form,
        members: Number(form.members),
        under5Count: Number(form.under5Count),
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
          {/* Form Section 1 */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-[10px]">1</span>
              Identity & Demographics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputGroup label="Head of Household" placeholder="Full Name (Last, First)" value={form.head} onChange={(v) => setField("head", v)} />
              <InputGroup label="Phone Number" placeholder="+256 7..." type="tel" value={form.phone} onChange={(v) => setField("phone", v)} />
              <InputGroup label="National ID / NIN" placeholder="CM..." value={form.nationalId} onChange={(v) => setField("nationalId", v)} />
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="Members (Total)" placeholder="0" type="number" value={String(form.members)} onChange={(v) => setField("members", Number(v) || 0)} />
                <InputGroup label="Under 5s" placeholder="0" type="number" value={String(form.under5Count)} onChange={(v) => setField("under5Count", Number(v) || 0)} />
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Form Section 2 */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-[10px]">2</span>
              Location & Vulnerability
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">District</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none bg-white"
                  value={form.district}
                  onChange={(e) => {
                    setField("district", e.target.value);
                    setField("subcounty", "");
                  }}
                >
                  <option value="">Select District...</option>
                  {allDistricts.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Subcounty</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400"
                  value={form.subcounty}
                  onChange={(e) => setField("subcounty", e.target.value)}
                  disabled={!form.district}
                >
                  <option value="">{form.district ? "Select Subcounty..." : "Select district first"}</option>
                  {formSubcounties.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <InputGroup label="Village Name" placeholder="e.g. Bwobo" value={form.village} onChange={(v) => setField("village", v)} />
              <InputGroup label="Parish" placeholder="e.g. Patiko" value={form.parish} onChange={(v) => setField("parish", v)} />

              <div className="md:col-span-2">
                <LocationPicker
                  value={locationValue}
                  center={mapCenter}
                  onChange={(lat, lng) => setForm((f) => ({ ...f, lat, lng }))}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Initial Risk Assessment (HEA Score)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(["Low", "Medium", "High", "Critical"] as const).map((level) => (
                    <RadioCard key={level} label={level} checked={form.riskLevel === level} onSelect={() => setField("riskLevel", level)} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Form Section 3 */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-[10px]">3</span>
              Health & Intervention
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputGroup label="Health Status" placeholder="e.g. Pregnant Mother" value={form.healthStatus} onChange={(v) => setField("healthStatus", v)} />
              <InputGroup label="Water Source" placeholder="e.g. Borehole (Safe)" value={form.waterSource} onChange={(v) => setField("waterSource", v)} />
              <InputGroup label="Program" placeholder="e.g. Cash Transfer" value={form.program} onChange={(v) => setField("program", v)} />
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

function RiskBadge({ level }: { level: string }) {
  const styles = {
    Critical: "bg-red-50 text-red-700 ring-red-600/20",
    High: "bg-orange-50 text-orange-800 ring-orange-600/20",
    Medium: "bg-yellow-50 text-yellow-800 ring-yellow-600/20",
    Low: "bg-green-50 text-green-700 ring-green-600/20",
  };

  const style = styles[level as keyof typeof styles] || styles.Low;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold ring-1 ring-inset ${style}`}>
      {level === 'Critical' && <AlertCircle size={10} />}
      {level.toUpperCase()}
    </span>
  );
}

function InputGroup({ label, placeholder, type = "text", value, onChange }: { label: string, placeholder: string, type?: string, value?: string, onChange: (value: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-colors"
        placeholder={placeholder}
      />
    </div>
  );
}

function RadioCard({ label, checked, onSelect }: { label: string, checked?: boolean, onSelect: () => void }) {
  const colorMap: Record<string, string> = {
    Low: "border-gray-200 hover:border-purple-300",
    Medium: "border-yellow-200 bg-yellow-50/50",
    High: "border-orange-200 bg-orange-50/50",
    Critical: "border-red-200 bg-red-50/50",
  };
  return (
    <label className={`cursor-pointer border rounded-lg p-3 text-center transition-all hover:shadow-sm ${colorMap[label]} ${checked ? 'ring-2 ring-purple-500 border-purple-500' : ''}`}>
      <input type="radio" name="risk" className="sr-only" checked={checked} onChange={onSelect} />
      <span className="text-xs font-bold text-gray-700">{label}</span>
    </label>
  );
}
