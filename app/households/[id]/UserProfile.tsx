"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MapPin, Phone, Calendar, ShieldAlert,
  Stethoscope, Droplets, Wallet, Clock,
  CheckCircle, LucideIcon, TrendingUp, Utensils,
  Pencil, Plus, X, Loader2, AlertTriangle
} from "lucide-react";
import { Household, HouseholdInput, HouseholdMember, RiskLevel, VisitRecord, INCOME_BRACKETS, IncomeBracket } from "../../lib/types";
import { useHouseholdsStore } from "../../store/householdsStore";
import { useAuth } from "../../components/providers/AuthProvider";
import { ApiError } from "../../lib/api";

// --- Reusable Components ---

interface TabConfig {
  id: string;
  label: string;
  icon: LucideIcon;
  content: React.ReactNode;
}

function deriveVulnerabilityFactors(household: Household): string[] {
  const factors: string[] = [];
  if (household.waterSource.toLowerCase().includes("unsafe")) factors.push("Unsafe Water Source");
  if (/pregnan/i.test(household.healthStatus)) factors.push("Pregnant Member");
  if (/malnutrition/i.test(household.healthStatus)) factors.push("Child Malnutrition");
  if (/malaria/i.test(household.healthStatus)) factors.push("Active Malaria Case");
  return factors;
}

const ProfileHeader = ({ data, onEdit }: { data: Household; onEdit: () => void }) => {
  const factors = useMemo(() => deriveVulnerabilityFactors(data), [data]);

  const getVulnerabilityStyles = (score: RiskLevel) => {
    switch (score) {
      case "Critical": return "bg-red-50 text-red-700 border-red-100";
      case "High": return "bg-amber-50 text-amber-700 border-amber-100";
      default: return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  return (
    <header className="bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
      <div className="h-32 bg-[#4A90E2]/10 w-full relative">
        <div className="absolute top-4 right-4 flex gap-3">
          <span className="bg-white/90 backdrop-blur text-xs font-semibold px-3 py-1 rounded-full shadow-sm text-gray-600 flex items-center gap-1">
            <CheckCircle size={12} className="text-green-500" /> Last updated: {new Date(data.updatedAt).toLocaleDateString()}
          </span>
          <button onClick={onEdit} className="bg-[#4A90E2] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md hover:bg-[#3A7AD2] transition">
            Edit Profile
          </button>
        </div>
      </div>

      <div className="px-8 pb-8 relative">
        <div className="flex flex-col md:flex-row items-start md:items-center -mt-12 mb-6 gap-6 justify-between">
          <div className="flex items-end gap-6 flex-1">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-500 shadow-lg">
              {data.head.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 leading-tight flex items-center gap-3">
                {data.head}
                {data.reviewStatus === "pending" && (
                  <span className="text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Pending Review
                  </span>
                )}
                {data.reviewStatus === "rejected" && (
                  <span className="text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
                    Rejected
                  </span>
                )}
                {data.reviewStatus === "approved" && (
                  <span className="text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Approved
                  </span>
                )}
              </h1>
              <p className="text-base font-semibold text-gray-600 mb-2">Household Head | ID: {data.id}</p>
              {data.reviewStatus === "rejected" && data.rejectionReason && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-2 max-w-lg">
                  <span className="font-bold">Rejection reason:</span> {data.rejectionReason}
                </p>
              )}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin size={14} className="text-gray-400" /> {data.location ? `${data.location.village_id}, ${data.location.parish_id}` : "Location not set"}
                </span>
                <span className="flex items-center gap-1">
                  <Phone size={14} className="text-gray-400" /> {data.phone || "Not recorded"}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={14} className="text-gray-400" /> Registered: {new Date(data.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className={`flex flex-col items-end border px-4 py-2 rounded-xl min-w-[200px] text-right shadow-sm ${getVulnerabilityStyles(data.riskLevel)}`}>
            <p className="text-xs uppercase font-bold tracking-widest opacity-80">Vulnerability Priority</p>
            <div className="flex items-center gap-2 font-extrabold text-2xl mt-0.5">
              <ShieldAlert size={24} />
              {data.riskLevel}
            </div>
            <p className="text-xs mt-1 font-medium italic">Factors: {factors.length ? factors.join(', ') : "None identified"}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

const ProfileDataRow = ({ label, value, alert = false }: { label: string, value: string | undefined, alert?: boolean }) => (
  <dl className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
    <dt className="text-gray-600 text-sm font-medium">{label}</dt>
    <dd className={`font-semibold text-sm text-right ${alert ? "text-red-700 bg-red-100/70 px-2 py-0.5 rounded-md" : "text-gray-900"}`}>
      {value || "Not recorded"}
    </dd>
  </dl>
);

const SectionTitle = ({ title }: { title: string }) => (
  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-4 mb-3">{title}</h3>
);

const TabButton = ({ label, icon: Icon, id, active, set }: { label: string, icon: LucideIcon, id: string, active: string, set: (id: string) => void }) => {
  const isActive = active === id;
  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => set(id)}
      className={`flex items-center gap-2 pb-3 text-base font-semibold transition-colors border-b-2 focus:outline-none ${isActive ? "border-[#4A90E2] text-[#4A90E2]" : "border-transparent text-gray-600 hover:text-gray-800"
        }`}
    >
      <Icon size={20} />
      {label}
    </button>
  );
};

const TabHeaderBar = ({ title, onEdit, editLabel = "Edit" }: { title: string; onEdit: () => void; editLabel?: string }) => (
  <div className="flex items-center justify-between mb-2">
    <h2 className="text-lg font-bold text-gray-900">{title}</h2>
    <button
      onClick={onEdit}
      className="flex items-center gap-1.5 text-xs font-bold text-[#4A90E2] hover:text-[#3A7AD2] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
    >
      <Pencil size={12} /> {editLabel}
    </button>
  </div>
);

// --- Modal Primitives ---

function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-[85vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-xs font-bold text-gray-700 mb-1.5">{label}</label>
    {children}
  </div>
);

const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white";

function ModalFooter({ onCancel, onSave, saving, error }: { onCancel: () => void; onSave: () => void; saving: boolean; error: string | null }) {
  return (
    <div className="mt-6">
      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3 flex items-center gap-2">
          <AlertTriangle size={14} /> {error}
        </p>
      )}
      <div className="flex justify-end gap-3">
        <button onClick={onCancel} disabled={saving} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50">
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="px-4 py-2 text-sm font-bold text-white bg-[#4A90E2] hover:bg-[#3A7AD2] rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

function useSaveHousehold(householdId: string, onSaved: (updated: Household) => void) {
  const { update } = useHouseholdsStore();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (patch: Partial<HouseholdInput>) => {
    setSaving(true);
    setError(null);
    try {
      const updated = await update(householdId, patch);
      onSaved(updated);
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save changes. Check your connection and try again.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  return { save, saving, error };
}

// --- Edit Modals ---

function EditHealthModal({ household, onClose, onSaved }: { household: Household; onClose: () => void; onSaved: (h: Household) => void }) {
  const [maternal, setMaternal] = useState(household.health?.maternal ?? "");
  const [immunization, setImmunization] = useState(household.health?.immunization ?? "");
  const [chronic, setChronic] = useState(household.health?.chronic ?? "");
  const [consent, setConsent] = useState(household.health?.consentCaptured ?? false);
  const [formError, setFormError] = useState<string | null>(null);
  const { save, saving, error } = useSaveHousehold(household.id, (h) => { onSaved(h); onClose(); });

  const submit = () => {
    if (!consent) {
      setFormError("Health data is a restricted tier — capture the subject's explicit consent before saving, separate from general registration consent.");
      return;
    }
    setFormError(null);
    save({ health: { maternal, immunization, chronic, consentCaptured: consent } });
  };

  return (
    <Modal title="Edit Health Profile" onClose={onClose}>
      <div className="space-y-4">
        <Field label="Maternal Status">
          <input className={inputClass} placeholder="e.g. Pregnant, 2nd trimester" value={maternal} onChange={(e) => setMaternal(e.target.value)} />
        </Field>
        <Field label="Immunization Gaps">
          <input className={inputClass} placeholder="e.g. Fully Immunized, or list gaps" value={immunization} onChange={(e) => setImmunization(e.target.value)} />
        </Field>
        <Field label="Chronic Illness">
          <input className={inputClass} placeholder="e.g. None, or condition" value={chronic} onChange={(e) => setChronic(e.target.value)} />
        </Field>
        <label className="flex items-start gap-2 text-sm text-gray-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 rounded border-gray-300" />
          <span>Explicit consent captured from the subject to record and store this household&apos;s health data — separate from general registration consent.</span>
        </label>
      </div>
      <ModalFooter saving={saving} error={formError || error} onCancel={onClose} onSave={submit} />
    </Modal>
  );
}

function EditWashModal({ household, onClose, onSaved }: { household: Household; onClose: () => void; onSaved: (h: Household) => void }) {
  const [waterSource, setWaterSource] = useState(household.wash?.waterSource ?? household.waterSource ?? "");
  const [distance, setDistance] = useState(household.wash?.distance ?? "");
  const [sanitation, setSanitation] = useState(household.wash?.sanitation ?? "");
  const [handwashing, setHandwashing] = useState(household.wash?.handwashing ?? "");
  const { save, saving, error } = useSaveHousehold(household.id, (h) => { onSaved(h); onClose(); });

  return (
    <Modal title="Edit WASH Status" onClose={onClose}>
      <div className="space-y-4">
        <Field label="Primary Water Source">
          <input className={inputClass} placeholder="e.g. Borehole (Safe)" value={waterSource} onChange={(e) => setWaterSource(e.target.value)} />
        </Field>
        <Field label="Distance to Water">
          <input className={inputClass} placeholder="e.g. 500m, 15 min walk" value={distance} onChange={(e) => setDistance(e.target.value)} />
        </Field>
        <Field label="Latrine / Sanitation Type">
          <input className={inputClass} placeholder="e.g. Pit latrine (covered)" value={sanitation} onChange={(e) => setSanitation(e.target.value)} />
        </Field>
        <Field label="Handwashing Facility">
          <input className={inputClass} placeholder="e.g. Tippy tap with soap" value={handwashing} onChange={(e) => setHandwashing(e.target.value)} />
        </Field>
      </div>
      <ModalFooter
        saving={saving}
        error={error}
        onCancel={onClose}
        onSave={() => save({ wash: { waterSource, distance, sanitation, handwashing } })}
      />
    </Modal>
  );
}

function EditLivelihoodsModal({ household, onClose, onSaved }: { household: Household; onClose: () => void; onSaved: (h: Household) => void }) {
  const [incomeSource, setIncomeSource] = useState(household.livelihoods?.incomeSource ?? "");
  const [incomeBracket, setIncomeBracket] = useState<IncomeBracket | "">(household.livelihoods?.incomeBracket ?? "");
  const [cropsText, setCropsText] = useState((household.livelihoods?.crops ?? []).join(", "));
  const [foodSecurity, setFoodSecurity] = useState(household.livelihoods?.foodSecurity ?? "");
  const { save, saving, error } = useSaveHousehold(household.id, (h) => { onSaved(h); onClose(); });

  return (
    <Modal title="Edit Livelihoods" onClose={onClose}>
      <div className="space-y-4">
        <Field label="Main Income Source">
          <input className={inputClass} placeholder="e.g. Subsistence farming" value={incomeSource} onChange={(e) => setIncomeSource(e.target.value)} />
        </Field>
        <Field label="Monthly Income Bracket">
          <select className={inputClass} value={incomeBracket} onChange={(e) => setIncomeBracket(e.target.value as IncomeBracket | "")}>
            <option value="">Not recorded</option>
            {INCOME_BRACKETS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </Field>
        <Field label="Crops Grown (comma-separated)">
          <input className={inputClass} placeholder="e.g. Maize, Beans, Cassava" value={cropsText} onChange={(e) => setCropsText(e.target.value)} />
        </Field>
        <Field label="Food Security Status">
          <input className={inputClass} placeholder="e.g. Stressed, Adequate" value={foodSecurity} onChange={(e) => setFoodSecurity(e.target.value)} />
        </Field>
      </div>
      <ModalFooter
        saving={saving}
        error={error}
        onCancel={onClose}
        onSave={() => save({
          livelihoods: {
            incomeSource,
            ...(incomeBracket ? { incomeBracket } : {}),
            foodSecurity,
            crops: cropsText.split(",").map((c) => c.trim()).filter(Boolean),
          },
        })}
      />
    </Modal>
  );
}

function MemberFormModal({ household, member, onClose, onSaved }: { household: Household; member: HouseholdMember | null; onClose: () => void; onSaved: (h: Household) => void }) {
  const isEdit = !!member;
  const [name, setName] = useState(member?.name ?? "");
  const [role, setRole] = useState(member?.role ?? "");
  const [age, setAge] = useState(String(member?.age ?? ""));
  const [sex, setSex] = useState<"M" | "F">(member?.sex ?? "M");
  const [status, setStatus] = useState<HouseholdMember["status"] | "">(member?.status ?? "");
  const [diarrhoea, setDiarrhoea] = useState(member?.diarrhoeaLast2Weeks ?? false);
  const [formError, setFormError] = useState<string | null>(null);
  const { save, saving, error } = useSaveHousehold(household.id, (h) => { onSaved(h); onClose(); });

  const submit = () => {
    if (!name.trim()) {
      setFormError("Name is required.");
      return;
    }
    setFormError(null);
    const nextMember: HouseholdMember = {
      member_id: member?.member_id ?? (crypto.randomUUID?.() ?? `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`),
      name: name.trim(),
      role: role.trim() || "Member",
      age: Number(age) || 0,
      sex,
      ...(status ? { status } : {}),
      diarrhoeaLast2Weeks: diarrhoea,
    };
    const existing = household.householdMembers ?? [];
    const nextMembers = isEdit
      ? existing.map((m) => (m.member_id === nextMember.member_id ? nextMember : m))
      : [...existing, nextMember];
    save({ householdMembers: nextMembers });
  };

  return (
    <Modal title={isEdit ? "Edit Member" : "Add Household Member"} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Full Name">
          <input className={inputClass} placeholder="e.g. Grace Aceng" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Role in Household">
          <input className={inputClass} placeholder="e.g. Head, Spouse, Child" value={role} onChange={(e) => setRole(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Age">
            <input type="number" min={0} className={inputClass} value={age} onChange={(e) => setAge(e.target.value)} />
          </Field>
          <Field label="Sex">
            <select className={inputClass} value={sex} onChange={(e) => setSex(e.target.value as "M" | "F")}>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </Field>
        </div>
        <Field label="Nutrition Status">
          <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as HouseholdMember["status"] | "")}>
            <option value="">Not recorded</option>
            <option value="Healthy">Healthy</option>
            <option value="At-Risk">At-Risk</option>
            <option value="Malnourished">Malnourished</option>
          </select>
        </Field>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={diarrhoea} onChange={(e) => setDiarrhoea(e.target.checked)} className="rounded border-gray-300" />
          Diarrhoea in the last 2 weeks
        </label>
      </div>
      <ModalFooter saving={saving} error={formError || error} onCancel={onClose} onSave={submit} />
    </Modal>
  );
}

function LogVisitModal({ household, onClose, onSaved }: { household: Household; onClose: () => void; onSaved: (h: Household) => void }) {
  const { profile } = useAuth();
  const [action, setAction] = useState("");
  const [isCritical, setIsCritical] = useState(false);
  const { save, saving, error } = useSaveHousehold(household.id, (h) => { onSaved(h); onClose(); });

  const submit = () => {
    if (!action.trim()) return;
    const entry: VisitRecord = {
      date: new Date().toISOString(),
      agent: profile?.name || "Unknown",
      action: action.trim(),
      isCritical,
    };
    save({ history: [...(household.history ?? []), entry] });
  };

  return (
    <Modal title="Log a Visit" onClose={onClose}>
      <div className="space-y-4">
        <Field label="What happened during this visit?">
          <textarea
            className={`${inputClass} min-h-[100px] resize-none`}
            placeholder="e.g. Delivered ITN, referred child to health center"
            value={action}
            onChange={(e) => setAction(e.target.value)}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
          <input type="checkbox" checked={isCritical} onChange={(e) => setIsCritical(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
          Flag as a critical action
        </label>
        <p className="text-[11px] text-gray-400">Recorded as {profile?.name || "Unknown"}, dated today.</p>
      </div>
      <ModalFooter saving={saving} error={error} onCancel={onClose} onSave={submit} />
    </Modal>
  );
}

function EditBasicInfoModal({ household, onClose, onSaved }: { household: Household; onClose: () => void; onSaved: (h: Household) => void }) {
  const [head, setHead] = useState(household.head);
  const [age, setAge] = useState(household.age?.toString() ?? "");
  const [phone, setPhone] = useState(household.phone ?? "");
  const [nationalId, setNationalId] = useState(household.nationalId ?? "");
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(household.riskLevel);
  const { save, saving, error } = useSaveHousehold(household.id, (h) => { onSaved(h); onClose(); });

  return (
    <Modal title="Edit Basic Info" onClose={onClose}>
      <div className="space-y-4">
        <Field label="Household Head">
          <input className={inputClass} value={head} onChange={(e) => setHead(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Age">
            <input className={inputClass} type="number" min={0} value={age} onChange={(e) => setAge(e.target.value)} />
          </Field>
          <Field label="Phone">
            <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
        </div>
        <Field label="National ID">
          <input className={inputClass} value={nationalId} onChange={(e) => setNationalId(e.target.value)} />
        </Field>
        <Field label="Vulnerability Priority">
          <div className="grid grid-cols-4 gap-2">
            {(["Low", "Medium", "High", "Critical"] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setRiskLevel(level)}
                className={`text-xs font-bold py-2 rounded-lg border transition-colors ${riskLevel === level ? "bg-[#4A90E2] text-white border-[#4A90E2]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}
              >
                {level}
              </button>
            ))}
          </div>
        </Field>
      </div>
      <ModalFooter
        saving={saving}
        error={error}
        onCancel={onClose}
        onSave={() => save({
          head,
          age: age ? Number(age) : undefined,
          phone: phone || undefined,
          nationalId: nationalId || undefined,
          riskLevel,
        })}
      />
    </Modal>
  );
}

// --- Tab Content Components ---

const HealthTab = ({
  health, members, onEdit, onAddMember, onEditMember, onDeleteMember, deletingMemberId,
}: {
  health: Household['health'], members?: HouseholdMember[], onEdit: () => void,
  onAddMember: () => void, onEditMember: (m: HouseholdMember) => void,
  onDeleteMember: (memberId: string) => void, deletingMemberId: string | null,
}) => (
  <div className="animate-in fade-in duration-300">
    <TabHeaderBar title="Health Profile" onEdit={onEdit} />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="space-y-4 md:col-span-1">
        <SectionTitle title="Health Summary" />
        <ProfileDataRow label="Maternal Status" value={health?.maternal} />
        <ProfileDataRow label="Immunization Gaps" value={health?.immunization} alert={!!health?.immunization && health.immunization !== "None" && health.immunization !== "Fully Immunized"} />
        <ProfileDataRow label="Chronic Illness" value={health?.chronic} />
        <ProfileDataRow label="Consent Captured" value={health ? (health.consentCaptured ? "Yes" : "No") : undefined} alert={!!health && !health.consentCaptured} />
      </div>
      <div className="md:col-span-2">
        <div className="flex items-center justify-between mb-2">
          <SectionTitle title="Family Members" />
          <button
            onClick={onAddMember}
            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Plus size={14} /> Add Member
          </button>
        </div>
        {members && members.length > 0 ? (
          <div className="bg-gray-50 rounded-xl p-4 shadow-inner">
            <ul className="divide-y divide-gray-200">
              {members.map((m) => (
                <li key={m.member_id} className="flex justify-between items-center py-3 gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">
                      {m.name} <span className="text-xs font-normal text-gray-500">({m.age}{m.sex})</span>
                      {m.role === 'Head' && <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-gray-200 rounded-full">Head</span>}
                    </p>
                    <p className="text-gray-500 text-sm italic">
                      {m.role}
                      {m.diarrhoeaLast2Weeks && <span className="ml-2 not-italic text-red-600 font-semibold">· Diarrhoea (last 2 weeks)</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {m.status && (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${m.status === "Healthy" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {m.status.toUpperCase()}
                      </span>
                    )}
                    <button onClick={() => onEditMember(m)} className="text-gray-400 hover:text-blue-600 p-1" title="Edit member">
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => onDeleteMember(m.member_id)}
                      disabled={deletingMemberId === m.member_id}
                      className="text-gray-400 hover:text-red-600 p-1 disabled:opacity-50"
                      title="Remove member"
                    >
                      {deletingMemberId === m.member_id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">No individual family member roster recorded yet.</p>
        )}
      </div>
    </div>
  </div>
);

const WashTab = ({ wash, fallbackWaterSource, onEdit }: { wash: Household['wash'], fallbackWaterSource: string, onEdit: () => void }) => (
  <div className="animate-in fade-in duration-300">
    <TabHeaderBar title="WASH Status" onEdit={onEdit} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <SectionTitle title="Water Access" />
        <ProfileDataRow label="Primary Source" value={wash?.waterSource || fallbackWaterSource} alert={(wash?.waterSource || fallbackWaterSource).toLowerCase().includes("unsafe")} />
        <ProfileDataRow label="Distance to Water" value={wash?.distance} />
      </div>
      <div className="space-y-4">
        <SectionTitle title="Sanitation & Hygiene" />
        <ProfileDataRow label="Latrine Type" value={wash?.sanitation} />
        <ProfileDataRow label="Handwashing Facility" value={wash?.handwashing} alert={!!wash?.handwashing && (wash.handwashing.includes("No Soap") || wash.handwashing.includes("None"))} />
      </div>
    </div>
  </div>
);

const LivelihoodsTab = ({ livelihoods, onEdit }: { livelihoods: Household['livelihoods'], onEdit: () => void }) => (
  <div className="animate-in fade-in duration-300">
    <TabHeaderBar title="Livelihoods" onEdit={onEdit} />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="space-y-4 md:col-span-2">
        <SectionTitle title="Economic Status" />
        <ProfileDataRow label="Main Income" value={livelihoods?.incomeSource} />
        <ProfileDataRow label="Monthly Income Bracket" value={livelihoods?.incomeBracket} />
        <ProfileDataRow label="Food Security" value={livelihoods?.foodSecurity} alert={!!livelihoods?.foodSecurity && livelihoods.foodSecurity.includes("Stressed")} />
        <div className="mt-8 pt-4 border-t border-gray-100">
          <SectionTitle title="Agricultural Profile" />
          <div className="flex flex-wrap gap-2">
            {livelihoods?.crops && livelihoods.crops.length > 0 ? (
              livelihoods.crops.map((crop) => (
                <span key={crop} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm flex items-center gap-1">
                  <Utensils size={14} /> {crop}
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-400 italic">No crop data recorded yet.</p>
            )}
          </div>
        </div>
      </div>
      <div className="bg-blue-50 p-6 rounded-xl shadow-md border border-blue-100 flex flex-col justify-center">
        <h4 className="flex items-center gap-2 font-bold text-blue-800 mb-2 text-lg">
          <TrendingUp size={24} className="text-blue-600" /> Economic Outlook
        </h4>
        <p className="text-sm text-blue-700">
          No automated recommendation engine is connected yet — this panel is a placeholder for future analysis.
        </p>
      </div>
    </div>
  </div>
);

const HistoryTab = ({ history, onLogVisit }: { history: Household['history'], onLogVisit: () => void }) => (
  <div className="animate-in fade-in duration-300 max-w-2xl">
    <div className="flex items-center justify-between mb-2">
      <h2 className="text-lg font-bold text-gray-900">Timeline of Interventions</h2>
      <button
        onClick={onLogVisit}
        className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#4A90E2] hover:bg-[#3A7AD2] px-3 py-1.5 rounded-lg transition-colors"
      >
        <Plus size={12} /> Log a Visit
      </button>
    </div>
    {history && history.length > 0 ? (
      <ol className="relative border-s border-gray-200 ml-4 mt-6">
        {[...history].reverse().map((visit, i) => (
          <li key={i} className="mb-8 ms-6">
            <span className={`absolute flex items-center justify-center w-6 h-6 rounded-full -start-3 ${visit.isCritical ? "bg-red-500 ring-red-100" : "bg-[#4A90E2] ring-blue-100"} text-white ring-8`}>
              <CheckCircle size={14} />
            </span>
            <div className={`p-4 rounded-lg shadow-md border transition-all duration-300 ${visit.isCritical ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
              <div className="flex justify-between items-center mb-1">
                <time className={`text-xs font-semibold ${visit.isCritical ? 'text-red-700' : 'text-gray-500'}`}>{new Date(visit.date).toLocaleString()}</time>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${visit.isCritical ? 'bg-red-200 text-red-800' : 'bg-gray-100 text-gray-700'}`}>
                  {visit.isCritical ? 'CRITICAL ACTION' : 'Routine'}
                </span>
              </div>
              <h4 className="font-extrabold text-gray-900 text-base">{visit.action}</h4>
              <p className="text-sm text-gray-600 mt-1">Agent: <span className="font-bold">{visit.agent}</span></p>
            </div>
          </li>
        ))}
      </ol>
    ) : (
      <p className="text-sm text-gray-400 italic mt-6">No visits logged yet.</p>
    )}
  </div>
);

// --- Main Component ---

type EditModalId = "health" | "wash" | "livelihoods" | "visit" | "basic" | null;

export default function UserProfile({ household }: { household: Household }) {
  const [data, setData] = useState(household);
  const [activeTab, setActiveTab] = useState("health");
  const [openModal, setOpenModal] = useState<EditModalId>(null);
  const [memberModalTarget, setMemberModalTarget] = useState<HouseholdMember | "new" | null>(null);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
  const { save: saveMembers } = useSaveHousehold(data.id, setData);

  useEffect(() => {
    setData(household);
  }, [household]);

  const handleDeleteMember = useCallback(async (memberId: string) => {
    if (!window.confirm("Remove this household member? This cannot be undone.")) return;
    setDeletingMemberId(memberId);
    await saveMembers({ householdMembers: (data.householdMembers ?? []).filter((m) => m.member_id !== memberId) });
    setDeletingMemberId(null);
  }, [data, saveMembers]);

  const tabs: TabConfig[] = useMemo(() => [
    {
      id: "health", label: "Health Profile", icon: Stethoscope,
      content: (
        <HealthTab
          health={data.health}
          members={data.householdMembers}
          onEdit={() => setOpenModal("health")}
          onAddMember={() => setMemberModalTarget("new")}
          onEditMember={(m) => setMemberModalTarget(m)}
          onDeleteMember={handleDeleteMember}
          deletingMemberId={deletingMemberId}
        />
      ),
    },
    { id: "wash", label: "WASH Status", icon: Droplets, content: <WashTab wash={data.wash} fallbackWaterSource={data.waterSource} onEdit={() => setOpenModal("wash")} /> },
    { id: "livelihoods", label: "Livelihoods", icon: Wallet, content: <LivelihoodsTab livelihoods={data.livelihoods} onEdit={() => setOpenModal("livelihoods")} /> },
    { id: "history", label: "Visit History", icon: Clock, content: <HistoryTab history={data.history} onLogVisit={() => setOpenModal("visit")} /> },
  ], [data, deletingMemberId, handleDeleteMember]);

  const activeTabContent = tabs.find(t => t.id === activeTab)?.content;

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      <ProfileHeader data={data} onEdit={() => setOpenModal("basic")} />
      <div className="bg-white rounded-xl border border-gray-200 shadow-xl p-8">
        <nav role="tablist" aria-label="Household Profile Sections" className="flex border-b border-gray-200 gap-8 -mb-px overflow-x-auto">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              label={tab.label}
              icon={tab.icon}
              id={tab.id}
              active={activeTab}
              set={setActiveTab}
            />
          ))}
        </nav>
        <div className="mt-8">
          {activeTabContent}
        </div>
      </div>

      {openModal === "health" && <EditHealthModal household={data} onClose={() => setOpenModal(null)} onSaved={setData} />}
      {openModal === "wash" && <EditWashModal household={data} onClose={() => setOpenModal(null)} onSaved={setData} />}
      {openModal === "livelihoods" && <EditLivelihoodsModal household={data} onClose={() => setOpenModal(null)} onSaved={setData} />}
      {openModal === "visit" && <LogVisitModal household={data} onClose={() => setOpenModal(null)} onSaved={setData} />}
      {openModal === "basic" && <EditBasicInfoModal household={data} onClose={() => setOpenModal(null)} onSaved={setData} />}
      {memberModalTarget && (
        <MemberFormModal
          household={data}
          member={memberModalTarget === "new" ? null : memberModalTarget}
          onClose={() => setMemberModalTarget(null)}
          onSaved={setData}
        />
      )}
    </div>
  );
}
