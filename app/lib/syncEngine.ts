import { api } from "./api";
import { Household } from "./types";
import {
  PendingMutation,
  getPendingMutations,
  removeMutation,
  addConflict,
  cacheHousehold,
  replaceCachedHouseholdId,
  isLocalId,
} from "./offlineDb";

export interface SyncResult {
  synced: number;
  conflicts: number;
  failed: number;
}

type Listener = () => void;
const listeners = new Set<Listener>();

/** Subscribe to "something changed" (mutation queued, sync ran, conflict resolved). Returns an unsubscribe fn. */
export function onSyncStateChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach((l) => l());
}

let syncing = false;

/** Attempts to flush every queued mutation against the real API. Safe to call repeatedly (e.g. on every 'online' event) — it's a no-op if already running or the queue is empty. */
export async function flushSyncQueue(): Promise<SyncResult> {
  if (syncing) return { synced: 0, conflicts: 0, failed: 0 };
  if (typeof navigator !== "undefined" && !navigator.onLine) return { synced: 0, conflicts: 0, failed: 0 };

  syncing = true;
  const result: SyncResult = { synced: 0, conflicts: 0, failed: 0 };
  try {
    const pending = await getPendingMutations();
    for (const mutation of pending) {
      try {
        const outcome = await applyMutation(mutation);
        if (outcome === "synced") result.synced++;
        else if (outcome === "conflict") result.conflicts++;
      } catch {
        // Network blip or server error mid-flush — leave it queued, try again next time.
        result.failed++;
      }
    }
  } finally {
    syncing = false;
    notify();
  }
  return result;
}

async function applyMutation(mutation: PendingMutation): Promise<"synced" | "conflict"> {
  if (mutation.type === "create") {
    const { data } = await api.post<{ data: Household }>("/api/households", mutation.payload);
    await replaceCachedHouseholdId(mutation.targetId, data);
    await removeMutation(mutation.id);
    return "synced";
  }

  // Update: fetch the current server state first to detect a real conflict —
  // someone else may have edited this record while we were offline.
  const { data: serverRecord } = await api.get<{ data: Household }>(`/api/households/${mutation.targetId}`);
  if (mutation.baseUpdatedAt && serverRecord.updatedAt !== mutation.baseUpdatedAt) {
    await addConflict({
      id: mutation.targetId,
      localPayload: mutation.payload,
      serverRecord,
      detectedAt: new Date().toISOString(),
    });
    await removeMutation(mutation.id);
    return "conflict";
  }

  const { data: updated } = await api.put<{ data: Household }>(`/api/households/${mutation.targetId}`, mutation.payload);
  await cacheHousehold(updated);
  await removeMutation(mutation.id);
  return "synced";
}

export function queuedMutationTargetsAreLocal(targetId: string): boolean {
  return isLocalId(targetId);
}

export { notify as notifySyncStateChange };
