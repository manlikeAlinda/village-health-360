import { create } from "zustand";
import { api, ApiError } from "../lib/api";
import { Household, HouseholdInput } from "../lib/types";
import { firebaseAuth } from "../lib/firebaseClient";
import {
  cacheHouseholds,
  cacheHousehold,
  getCachedHouseholds,
  deleteCachedHousehold,
  queueMutation,
  getPendingMutations,
  getConflicts,
  newLocalId,
  isLocalId,
  removeConflict,
  ConflictRecord,
} from "../lib/offlineDb";
import { flushSyncQueue, onSyncStateChange } from "../lib/syncEngine";

interface HouseholdFilters {
  district?: string;
  subcounty?: string;
  riskLevel?: string;
  search?: string;
  reviewStatus?: string;
}

interface HouseholdsState {
  households: Household[];
  loading: boolean;
  error: string | null;
  offline: boolean;
  pendingIds: Set<string>;
  conflicts: ConflictRecord[];
  fetchAll: (filters?: HouseholdFilters) => Promise<void>;
  fetchOne: (id: string) => Promise<Household | null>;
  create: (input: HouseholdInput) => Promise<Household>;
  update: (id: string, input: Partial<HouseholdInput>) => Promise<Household>;
  remove: (id: string) => Promise<void>;
  reviewHousehold: (id: string, decision: "approved" | "rejected", reason?: string) => Promise<Household>;
  syncNow: () => Promise<void>;
  refreshOfflineState: () => Promise<void>;
  resolveConflict: (id: string, resolution: "keep-local" | "keep-server") => Promise<void>;
}

function buildQuery(filters?: HouseholdFilters): string {
  if (!filters) return "";
  const params = new URLSearchParams();
  if (filters.district) params.set("district", filters.district);
  if (filters.subcounty) params.set("subcounty", filters.subcounty);
  if (filters.riskLevel && filters.riskLevel !== "All") params.set("riskLevel", filters.riskLevel);
  if (filters.search) params.set("search", filters.search);
  if (filters.reviewStatus && filters.reviewStatus !== "All") params.set("reviewStatus", filters.reviewStatus);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function isNetworkError(err: unknown): boolean {
  // A real ApiError means the request reached the server and was rejected
  // (validation, auth, 404, ...) — that's not "offline", replaying it later
  // would just fail the same way. Anything else (fetch() itself throwing) is
  // the browser telling us it couldn't reach the network at all.
  return !(err instanceof ApiError);
}

export const useHouseholdsStore = create<HouseholdsState>((set, get) => {
  // Keep pending/conflict state in sync with IndexedDB whenever the sync
  // engine does something (flush completes, a mutation gets queued, etc).
  if (typeof window !== "undefined") {
    onSyncStateChange(() => {
      get().refreshOfflineState();
    });
    window.addEventListener("online", () => {
      set({ offline: false });
      flushSyncQueue().then(() => get().fetchAll());
    });
    window.addEventListener("offline", () => set({ offline: true }));
  }

  return {
    households: [],
    loading: false,
    error: null,
    offline: typeof navigator !== "undefined" ? !navigator.onLine : false,
    pendingIds: new Set(),
    conflicts: [],

    refreshOfflineState: async () => {
      const [mutations, conflicts] = await Promise.all([getPendingMutations(), getConflicts()]);
      set({ pendingIds: new Set(mutations.map((m) => m.targetId)), conflicts });
    },

    fetchAll: async (filters) => {
      set({ loading: true, error: null });
      try {
        const { data } = await api.get<{ data: Household[] }>(`/api/households${buildQuery(filters)}`);
        set({ households: data, loading: false, offline: false });
        await cacheHouseholds(data);
      } catch (err) {
        if (isNetworkError(err)) {
          // Offline (or the API is unreachable) — fall back to the last-known cache.
          const cached = await getCachedHouseholds();
          set({ households: cached, loading: false, offline: true, error: null });
        } else {
          set({ error: (err as Error).message, loading: false });
        }
      }
      await get().refreshOfflineState();
    },

    fetchOne: async (id) => {
      if (isLocalId(id)) {
        // A record that only exists as an unsynced local create — the server
        // has never heard of it, so don't bother asking.
        const cached = await getCachedHouseholds();
        return cached.find((h) => h.id === id) || null;
      }
      try {
        const { data } = await api.get<{ data: Household }>(`/api/households/${id}`);
        await cacheHousehold(data);
        return data;
      } catch (err) {
        if (isNetworkError(err)) {
          const cached = await getCachedHouseholds();
          return cached.find((h) => h.id === id) || null;
        }
        return null;
      }
    },

    create: async (input) => {
      try {
        const { data } = await api.post<{ data: Household }>("/api/households", input);
        set({ households: [...get().households, data] });
        await cacheHousehold(data);
        return data;
      } catch (err) {
        if (!isNetworkError(err)) throw err;

        // Offline: synthesize a local record so the UI updates immediately,
        // and queue the real creation for when connectivity returns.
        const uid = firebaseAuth.currentUser?.uid || "offline-pending";
        const now = new Date().toISOString();
        const localHousehold: Household = {
          ...input,
          id: newLocalId(),
          createdAt: now,
          createdBy: uid,
          updatedAt: now,
          updatedBy: uid,
          // The real status (pending vs. auto-approved) depends on the actor's
          // role, which the server decides — this is just a safe placeholder
          // until the queued mutation syncs and replaces it with the real record.
          reviewStatus: "pending",
        };
        await cacheHousehold(localHousehold);
        await queueMutation({ type: "create", targetId: localHousehold.id, payload: input });
        set({ households: [...get().households, localHousehold] });
        await get().refreshOfflineState();
        return localHousehold;
      }
    },

    update: async (id, input) => {
      try {
        const { data } = await api.put<{ data: Household }>(`/api/households/${id}`, input);
        set({ households: get().households.map((h) => (h.id === id ? data : h)) });
        await cacheHousehold(data);
        return data;
      } catch (err) {
        if (!isNetworkError(err)) throw err;
        if (isLocalId(id)) throw err; // never-synced record with no network — nothing sensible to queue

        const current = get().households.find((h) => h.id === id);
        const updated: Household = { ...(current as Household), ...input, updatedAt: new Date().toISOString() };
        await cacheHousehold(updated);
        await queueMutation({ type: "update", targetId: id, payload: { ...(current as Household), ...input }, baseUpdatedAt: current?.updatedAt });
        set({ households: get().households.map((h) => (h.id === id ? updated : h)) });
        await get().refreshOfflineState();
        return updated;
      }
    },

    remove: async (id) => {
      await api.delete(`/api/households/${id}`);
      await deleteCachedHousehold(id);
      set({ households: get().households.filter((h) => h.id !== id) });
    },

    reviewHousehold: async (id, decision, reason) => {
      const { data } = await api.put<{ data: Household }>(`/api/households/${id}/review`, { decision, reason });
      set({ households: get().households.map((h) => (h.id === id ? data : h)) });
      await cacheHousehold(data);
      return data;
    },

    syncNow: async () => {
      await flushSyncQueue();
      await get().fetchAll();
    },

    resolveConflict: async (id, resolution) => {
      const conflict = get().conflicts.find((c) => c.id === id);
      if (!conflict) return;

      if (resolution === "keep-server") {
        await cacheHousehold(conflict.serverRecord);
        set({ households: get().households.map((h) => (h.id === id ? conflict.serverRecord : h)) });
      } else {
        const { data } = await api.put<{ data: Household }>(`/api/households/${id}`, conflict.localPayload);
        await cacheHousehold(data);
        set({ households: get().households.map((h) => (h.id === id ? data : h)) });
      }

      await removeConflict(id);
      await get().refreshOfflineState();
    },
  };
});
