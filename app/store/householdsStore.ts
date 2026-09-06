import { create } from "zustand";
import { api } from "../lib/api";
import { Household, HouseholdInput } from "../lib/types";

interface HouseholdFilters {
  district?: string;
  subcounty?: string;
  riskLevel?: string;
  search?: string;
}

interface HouseholdsState {
  households: Household[];
  loading: boolean;
  error: string | null;
  fetchAll: (filters?: HouseholdFilters) => Promise<void>;
  fetchOne: (id: string) => Promise<Household | null>;
  create: (input: HouseholdInput) => Promise<Household>;
  update: (id: string, input: Partial<HouseholdInput>) => Promise<Household>;
  remove: (id: string) => Promise<void>;
}

function buildQuery(filters?: HouseholdFilters): string {
  if (!filters) return "";
  const params = new URLSearchParams();
  if (filters.district) params.set("district", filters.district);
  if (filters.subcounty) params.set("subcounty", filters.subcounty);
  if (filters.riskLevel && filters.riskLevel !== "All") params.set("riskLevel", filters.riskLevel);
  if (filters.search) params.set("search", filters.search);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const useHouseholdsStore = create<HouseholdsState>((set, get) => ({
  households: [],
  loading: false,
  error: null,

  fetchAll: async (filters) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get<{ data: Household[] }>(`/api/households${buildQuery(filters)}`);
      set({ households: data, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  fetchOne: async (id) => {
    try {
      const { data } = await api.get<{ data: Household }>(`/api/households/${id}`);
      return data;
    } catch {
      return null;
    }
  },

  create: async (input) => {
    const { data } = await api.post<{ data: Household }>("/api/households", input);
    set({ households: [...get().households, data] });
    return data;
  },

  update: async (id, input) => {
    const { data } = await api.put<{ data: Household }>(`/api/households/${id}`, input);
    set({ households: get().households.map((h) => (h.id === id ? data : h)) });
    return data;
  },

  remove: async (id) => {
    await api.delete(`/api/households/${id}`);
    set({ households: get().households.filter((h) => h.id !== id) });
  },
}));
