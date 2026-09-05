import { create } from "zustand";
import { api, extractApiError } from "@/lib/config";

// NOTE: Authorization header is injected automatically by the api interceptor
// in lib/config.js — no manual token handling needed here.

const usePumpStore = create((set) => ({
  pumps: [],
  loading: false,
  error: null,

  // 1. ADD PUMP
  addPump: async (pumpData) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/api/pump/add-pump", pumpData);
      set((state) => ({
        pumps: [...state.pumps, res.data?.data || res.data],
        loading: false,
      }));
    } catch (err) {
      const message = extractApiError(err) || err.message || "Failed to add pump";
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  // 2. GET ALL PUMPS
  getPumps: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/api/pump");
      set({ pumps: res.data?.data || res.data?.pumps || [], loading: false });
    } catch (err) {
      const message = extractApiError(err) || err.message || "Failed to fetch pumps";
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  // 3. UPDATE PUMP
  updatePump: async (pumpData) => {
    set({ loading: true, error: null });
    try {
      await api.post("/api/pump/update-pump", pumpData);
      set((state) => ({
        pumps: state.pumps.map((p) =>
          p.pumpId === pumpData.pumpId ? { ...p, ...pumpData } : p
        ),
        loading: false,
      }));
    } catch (err) {
      const message = extractApiError(err) || err.message || "Failed to update pump";
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  // 4. DELETE PUMP
  deletePump: async (pumpId) => {
    set({ loading: true, error: null });
    try {
      await api.post("/api/pump/delete-pump", { pumpId });
      set((state) => ({
        pumps: state.pumps.filter((p) => p.pumpId !== pumpId),
        loading: false,
      }));
    } catch (err) {
      const message = extractApiError(err) || err.message || "Failed to delete pump";
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  // 5. UPDATE PRICE BY FUEL TYPE
  updatePriceByFuel: async (priceData) => {
    set({ loading: true, error: null });
    try {
      await api.post("/api/pump/update-prices", priceData);
      set({ loading: false });
    } catch (err) {
      const message = extractApiError(err) || err.message || "Failed to update price";
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },
}));

export default usePumpStore;
