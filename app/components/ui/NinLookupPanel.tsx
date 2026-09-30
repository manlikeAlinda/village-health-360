"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Loader2, CheckCircle2, XCircle, AlertTriangle, Lock, ShieldCheck,
  History, ChevronDown, ChevronUp, UserCheck, Fingerprint,
  IdCard, Baby, Landmark, GraduationCap, ReceiptText, Building2,
  HeartPulse, HandCoins, Briefcase, MapPinned, Zap, Droplets,
  ShieldAlert, Gavel, Wheat, BadgeCheck, type LucideIcon,
} from "lucide-react";
import {
  SOURCES, resolveIdentity, simulateFetch,
  SourceConfig, SourceEnvelope, IdentityPath, HomeLocation,
} from "../../lib/mockGovSources";
import DemoDataBadge from "./DemoDataBadge";

const ICONS: Record<string, LucideIcon> = {
  nira: Fingerprint,
  "nira-bd": Baby,
  crb: Landmark,
  moes: GraduationCap,
  ura: ReceiptText,
  ursb: Building2,
  moh: HeartPulse,
  mglsd: HandCoins,
  nssf: Briefcase,
  nlis: MapPinned,
  umeme: Zap,
  nwsc: Droplets,
  police: ShieldAlert,
  judiciary: Gavel,
  maaif: Wheat,
  dcic: IdCard,
};

const TIER_DOT: Record<string, string> = {
  standard: "bg-emerald-400",
  restricted: "bg-amber-400",
  "highly-restricted": "bg-red-400",
};

interface NinLookupPanelProps {
  id: string;
  onApplyIdentity: (name: string, homeLocation: HomeLocation) => void;
}

export default function NinLookupPanel({ id, onApplyIdentity }: NinLookupPanelProps) {
  const [idType, setIdType] = useState<"NIN" | "Refugee ID" | "Alien ID">("NIN");
  const path: IdentityPath = idType === "NIN" ? "citizen" : "non-citizen";
  const rootKey = path === "citizen" ? "nira" : "dcic";

  const [envelopes, setEnvelopes] = useState<Record<string, SourceEnvelope>>({});
  const [activeKey, setActiveKey] = useState<string>(rootKey);
  const [audit, setAudit] = useState<{ ts: string; text: string }[]>([]);
  const [auditOpen, setAuditOpen] = useState(false);
  const [applied, setApplied] = useState(false);

  const identity = useMemo(() => resolveIdentity(id), [id]);

  const visibleSources = useMemo(
    () => SOURCES.filter((s) => s.path === "both" || s.path === path),
    [path]
  );

  const logAudit = (cfg: SourceConfig) => {
    setAudit((a) => [
      { ts: new Date().toLocaleTimeString(), text: `Queried ${cfg.agency} (${cfg.label}) for ${idType} ${id}` },
      ...a,
    ]);
  };

  const fetchNow = async (key: string) => {
    setEnvelopes((e) => ({ ...e, [key]: { source: key, status: "loading" } }));
    const result = await simulateFetch(key, id);
    setEnvelopes((e) => ({ ...e, [key]: result }));
  };

  const openTab = (cfg: SourceConfig) => {
    setActiveKey(cfg.key);
    if (envelopes[cfg.key]) return;
    logAudit(cfg);
    if (cfg.tier === "restricted" || cfg.tier === "highly-restricted") {
      setEnvelopes((e) => ({ ...e, [cfg.key]: { source: cfg.key, status: "consent-required" } }));
      return;
    }
    fetchNow(cfg.key);
  };

  const grantConsent = (cfg: SourceConfig) => {
    const verb = cfg.tier === "highly-restricted" ? "Vetting authorization captured" : "Consent captured";
    setAudit((a) => [{ ts: new Date().toLocaleTimeString(), text: `${verb} for ${cfg.agency} (${cfg.label}) — ${idType} ${id}` }, ...a]);
    fetchNow(cfg.key);
  };

  // Reset and auto-run the root identity lookup whenever the ID or path changes.
  useEffect(() => {
    setEnvelopes({});
    setActiveKey(rootKey);
    setApplied(false);
    const cfg = SOURCES.find((s) => s.key === rootKey)!;
    logAudit(cfg);
    fetchNow(rootKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, idType]);

  const activeCfg = SOURCES.find((s) => s.key === activeKey)!;
  const activeEnvelope = envelopes[activeKey];
  const rootEnvelope = envelopes[rootKey];

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/60 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-gray-900">National ID Registration Lookup</h4>
          <DemoDataBadge label="Sample Interface" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Path</span>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {(["NIN", "Refugee ID", "Alien ID"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setIdType(t)}
                className={`px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  idType === t ? "bg-purple-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
      <p className="px-4 pt-2.5 text-[11px] text-gray-500">
        Concept preview of a multi-source government &amp; financial lookup, keyed on{" "}
        <span className="font-mono font-semibold text-gray-700">{id}</span>. Every source below is simulated — no live
        connection to NIRA, URA, CRB, or any other agency exists yet.
      </p>

      {rootEnvelope?.status === "success" && (
        <div className="mx-4 mt-3 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs">
          <span className="text-emerald-800">
            Resolved: <span className="font-bold">{identity.name}</span> · {identity.sex} · DOB {identity.dob} · {identity.homeLocation.village}, {identity.homeLocation.parish}
          </span>
          <button
            type="button"
            onClick={() => {
              onApplyIdentity(identity.name, identity.homeLocation);
              setApplied(true);
            }}
            disabled={applied}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-default transition-colors"
          >
            <UserCheck size={13} /> {applied ? "Identity Applied" : "Use This Identity"}
          </button>
        </div>
      )}

      {/* Tab chips */}
      <div className="px-4 py-3 flex flex-wrap gap-1.5 border-b border-gray-100 mt-3">
        {visibleSources.map((cfg) => {
          const Icon = ICONS[cfg.key] ?? BadgeCheck;
          const env = envelopes[cfg.key];
          const isActive = activeKey === cfg.key;
          return (
            <button
              key={cfg.key}
              type="button"
              onClick={() => openTab(cfg)}
              className={`flex items-center gap-1.5 pl-2.5 pr-2 py-1.5 rounded-full text-[11px] font-semibold border transition-colors ${
                isActive
                  ? "bg-purple-600 border-purple-600 text-white"
                  : "bg-white border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-700"
              }`}
            >
              <Icon size={12} className="shrink-0" />
              <span>{cfg.label}</span>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? "bg-white/70" : TIER_DOT[cfg.tier]}`} title={cfg.tier} />
              {env?.status === "loading" && <Loader2 size={11} className="animate-spin shrink-0" />}
              {env?.status === "success" && <CheckCircle2 size={11} className={`shrink-0 ${isActive ? "text-white" : "text-emerald-500"}`} />}
              {(env?.status === "error" || env?.status === "unavailable") && (
                <XCircle size={11} className={`shrink-0 ${isActive ? "text-white" : "text-red-400"}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Active tab content */}
      <div className="p-4 bg-white">
        <SourceTabContent cfg={activeCfg} envelope={activeEnvelope} onGrantConsent={() => grantConsent(activeCfg)} />
      </div>

      {/* Audit trail */}
      <div className="border-t border-gray-100 bg-gray-50/60">
        <button
          type="button"
          onClick={() => setAuditOpen((o) => !o)}
          className="w-full px-4 py-2 flex items-center justify-between text-[11px] font-bold text-gray-600 hover:text-gray-900"
        >
          <span className="flex items-center gap-2">
            <History size={12} /> Audit Trail ({audit.length} {audit.length === 1 ? "entry" : "entries"})
          </span>
          {auditOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
        {auditOpen && (
          <div className="px-4 pb-3 max-h-28 overflow-y-auto space-y-1">
            {audit.map((entry, i) => (
              <div key={i} className="text-[10px] text-gray-500 font-mono">
                {entry.ts} — {entry.text}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SourceTabContent({
  cfg,
  envelope,
  onGrantConsent,
}: {
  cfg: SourceConfig;
  envelope?: SourceEnvelope;
  onGrantConsent: () => void;
}) {
  const status = envelope?.status ?? "idle";

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-bold text-gray-900">{cfg.label}</h3>
        <TierBadge tier={cfg.tier} />
      </div>
      <p className="text-xs text-gray-500 mb-4">{cfg.agency} · {cfg.consentNote}</p>

      {status === "loading" && (
        <div className="flex items-center gap-2 text-sm text-gray-500 py-8 justify-center">
          <Loader2 size={16} className="animate-spin" /> Contacting {cfg.agency}…
        </div>
      )}

      {status === "consent-required" && (
        <div className={`rounded-xl border p-4 flex gap-3 ${cfg.tier === "highly-restricted" ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`}>
          {cfg.tier === "highly-restricted" ? (
            <Lock size={18} className="text-red-500 shrink-0 mt-0.5" />
          ) : (
            <ShieldCheck size={18} className="text-amber-500 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <div className={`text-sm font-bold ${cfg.tier === "highly-restricted" ? "text-red-800" : "text-amber-800"}`}>
              {cfg.tier === "highly-restricted" ? "Statutory vetting authorization required" : "Explicit subject consent required"}
            </div>
            <div className={`text-xs mt-1 mb-3 ${cfg.tier === "highly-restricted" ? "text-red-700" : "text-amber-700"}`}>{cfg.consentNote}</div>
            <button
              type="button"
              onClick={onGrantConsent}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors ${cfg.tier === "highly-restricted" ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700"}`}
            >
              {cfg.tier === "highly-restricted" ? "Authorize Vetting Check" : "Capture Subject Consent"}
            </button>
          </div>
        </div>
      )}

      {(status === "error" || status === "unavailable") && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex gap-3">
          <AlertTriangle size={18} className="text-orange-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-bold text-gray-800">
              {status === "unavailable" ? "Source unavailable" : "Lookup failed"}
            </div>
            <div className="text-xs text-gray-500 mt-1">{envelope?.error}</div>
          </div>
        </div>
      )}

      {status === "success" && envelope?.data && (
        <div className="space-y-4">
          {envelope.data.flag && <FlagBanner flag={envelope.data.flag} />}
          {envelope.data.fields.length > 0 && (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {envelope.data.fields.map((f, i) => (
                <div key={i} className="border-b border-gray-100 pb-2">
                  <dt className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{f.label}</dt>
                  <dd className="text-sm text-gray-800 font-medium">{f.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {envelope.data.records?.map((rec, i) => (
            <div key={i} className="rounded-xl border border-gray-200 p-3">
              <div className="text-xs font-bold text-gray-700 mb-2">{rec.title}</div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                {rec.fields.map((f, j) => (
                  <div key={j}>
                    <dt className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{f.label}</dt>
                    <dd className="text-xs text-gray-700 font-medium">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
          <div className="text-[10px] text-gray-400">
            Fetched {envelope.fetchedAt ? new Date(envelope.fetchedAt).toLocaleTimeString() : ""} · simulated response
          </div>
        </div>
      )}
    </div>
  );
}

function FlagBanner({ flag }: { flag: { level: "info" | "warning" | "critical"; message: string } }) {
  const styles = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    critical: "bg-red-50 border-red-200 text-red-800",
  };
  return (
    <div className={`rounded-lg border px-3 py-2 text-xs font-semibold flex items-center gap-2 ${styles[flag.level]}`}>
      <AlertTriangle size={13} /> {flag.message}
    </div>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const labels: Record<string, string> = {
    standard: "Standard Consent",
    restricted: "Restricted — Explicit Consent",
    "highly-restricted": "Highly Restricted",
  };
  const styles: Record<string, string> = {
    standard: "bg-emerald-50 text-emerald-700 border-emerald-200",
    restricted: "bg-amber-50 text-amber-700 border-amber-200",
    "highly-restricted": "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full border ${styles[tier]}`}>
      {labels[tier]}
    </span>
  );
}
