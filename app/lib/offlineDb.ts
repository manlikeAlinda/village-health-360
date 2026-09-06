import { openDB, DBSchema, IDBPDatabase } from "idb";
import { Household, HouseholdInput } from "./types";

// A pending mutation is either a create (targetId is a temporary "local_..." id,
// not yet known to the server) or an update (targetId is a real household id,
// baseUpdatedAt captures what `updatedAt` looked like when the edit was made,
// which is how conflict detection knows whether anything changed server-side
// in the meantime).
export interface PendingMutation {
  id: string;
  type: "create" | "update";
  targetId: string;
  payload: HouseholdInput;
  baseUpdatedAt?: string;
  queuedAt: string;
}

export interface ConflictRecord {
  id: string; // = the real household id
  localPayload: HouseholdInput;
  serverRecord: Household;
  detectedAt: string;
}

interface OfflineDBSchema extends DBSchema {
  households: { key: string; value: Household };
  mutations: { key: string; value: PendingMutation };
  conflicts: { key: string; value: ConflictRecord };
}

let dbPromise: Promise<IDBPDatabase<OfflineDBSchema>> | null = null;

function getDb() {
  if (typeof window === "undefined") {
    // Server-side render pass — nothing to open. Callers on the server never
    // reach the functions below in practice (this module is only used from
    // client components), but guard anyway rather than throwing at import time.
    return null;
  }
  if (!dbPromise) {
    dbPromise = openDB<OfflineDBSchema>("village-health-360-offline", 1, {
      upgrade(db) {
        db.createObjectStore("households", { keyPath: "id" });
        db.createObjectStore("mutations", { keyPath: "id" });
        db.createObjectStore("conflicts", { keyPath: "id" });
      },
    });
  }
  return dbPromise;
}

export function newLocalId(): string {
  return `local_${crypto.randomUUID()}`;
}

export function isLocalId(id: string): boolean {
  return id.startsWith("local_");
}

// --- Households cache (last-known-good snapshot for offline reads) ---

export async function cacheHouseholds(households: Household[]): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const tx = db.transaction("households", "readwrite");
  await Promise.all(households.map((h) => tx.store.put(h)));
  await tx.done;
}

export async function cacheHousehold(household: Household): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.put("households", household);
}

export async function getCachedHouseholds(): Promise<Household[]> {
  const db = await getDb();
  if (!db) return [];
  return db.getAll("households");
}

export async function deleteCachedHousehold(id: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete("households", id);
}

export async function replaceCachedHouseholdId(oldId: string, updated: Household): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const tx = db.transaction("households", "readwrite");
  await tx.store.delete(oldId);
  await tx.store.put(updated);
  await tx.done;
}

// --- Mutation queue ---

export async function queueMutation(mutation: Omit<PendingMutation, "id" | "queuedAt">): Promise<PendingMutation> {
  const db = await getDb();
  const full: PendingMutation = { ...mutation, id: newLocalId(), queuedAt: new Date().toISOString() };
  if (!db) return full;

  // At most one pending mutation per target (same-session re-edits of an
  // unsynced record replace the earlier queued mutation rather than stacking).
  const existing = await db.getAll("mutations");
  const superseded = existing.find((m) => m.targetId === mutation.targetId);
  const tx = db.transaction("mutations", "readwrite");
  if (superseded) await tx.store.delete(superseded.id);
  await tx.store.put(full);
  await tx.done;
  return full;
}

export async function getPendingMutations(): Promise<PendingMutation[]> {
  const db = await getDb();
  if (!db) return [];
  return db.getAll("mutations");
}

export async function removeMutation(id: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete("mutations", id);
}

// --- Conflicts ---

export async function addConflict(conflict: ConflictRecord): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.put("conflicts", conflict);
}

export async function getConflicts(): Promise<ConflictRecord[]> {
  const db = await getDb();
  if (!db) return [];
  return db.getAll("conflicts");
}

export async function removeConflict(id: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete("conflicts", id);
}
