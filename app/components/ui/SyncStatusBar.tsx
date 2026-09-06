"use client";

import { useState } from "react";
import { WifiOff, RefreshCw, AlertTriangle, Loader2, X } from "lucide-react";
import { useHouseholdsStore } from "../../store/householdsStore";

export default function SyncStatusBar() {
  const { offline, pendingIds, conflicts, syncNow, resolveConflict } = useHouseholdsStore();
  const [syncing, setSyncing] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const handleSyncNow = async () => {
    setSyncing(true);
    try {
      await syncNow();
    } finally {
      setSyncing(false);
    }
  };

  const handleResolve = async (id: string, resolution: "keep-local" | "keep-server") => {
    setResolvingId(id);
    try {
      await resolveConflict(id, resolution);
    } finally {
      setResolvingId(null);
    }
  };

  if (!offline && pendingIds.size === 0 && conflicts.length === 0) return null;

  return (
    <div className="mb-6 space-y-3">
      {(offline || pendingIds.size > 0) && (
        <div className="flex items-center justify-between gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm">
          <div className="flex items-center gap-2 text-amber-800">
            {offline ? <WifiOff size={16} /> : <RefreshCw size={16} />}
            <span>
              {offline
                ? `Offline — changes are saved locally and will sync automatically once you're back online.`
                : `${pendingIds.size} change${pendingIds.size === 1 ? "" : "s"} waiting to sync.`}
              {pendingIds.size > 0 && offline && ` (${pendingIds.size} pending)`}
            </span>
          </div>
          {!offline && pendingIds.size > 0 && (
            <button
              onClick={handleSyncNow}
              disabled={syncing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 disabled:opacity-60"
            >
              {syncing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
              Sync Now
            </button>
          )}
        </div>
      )}

      {conflicts.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-2 text-red-800 font-bold text-sm mb-3">
            <AlertTriangle size={16} />
            {conflicts.length} sync conflict{conflicts.length === 1 ? "" : "s"} — this record was edited elsewhere while you were offline
          </div>
          <div className="space-y-3">
            {conflicts.map((c) => (
              <div key={c.id} className="bg-white border border-red-100 rounded-lg p-3">
                <p className="text-sm font-bold text-gray-900 mb-2">{c.serverRecord.head} <span className="font-mono text-xs text-gray-400">({c.id})</span></p>
                <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                  <div className="p-2 bg-gray-50 rounded border border-gray-200">
                    <p className="font-bold text-gray-500 uppercase tracking-wide mb-1">Your offline edit</p>
                    <p className="text-gray-700">Risk: {c.localPayload.riskLevel} · Health: {c.localPayload.healthStatus}</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded border border-gray-200">
                    <p className="font-bold text-gray-500 uppercase tracking-wide mb-1">Current server version</p>
                    <p className="text-gray-700">Risk: {c.serverRecord.riskLevel} · Health: {c.serverRecord.healthStatus}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleResolve(c.id, "keep-local")}
                    disabled={resolvingId === c.id}
                    className="flex-1 px-3 py-1.5 text-xs font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-60"
                  >
                    Keep My Edit
                  </button>
                  <button
                    onClick={() => handleResolve(c.id, "keep-server")}
                    disabled={resolvingId === c.id}
                    className="flex-1 px-3 py-1.5 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-60"
                  >
                    Keep Server Version
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
