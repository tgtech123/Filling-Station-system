import { create } from "zustand";
import { api } from "@/lib/config";

/**
 * Wet-stock (fuel volume) reconciliation — yield-factor settings, pump-link audit,
 * and the reconcile / approve workflow. Mutations throw so callers can toast the
 * backend's error message; fetches store into state and fail soft.
 */
const useStockReconciliationStore = create((set, get) => ({
  settings: null, // { defaultYieldFactor, configured, tanks: [...] }
  settingsLoading: false,

  audit: null,
  auditLoading: false,

  reconciliations: [],
  pagination: null,
  listLoading: false,

  saving: false,

  // ── Settings (the "station litre" yield factor) ────────────────────────────
  fetchSettings: async () => {
    set({ settingsLoading: true });
    try {
      const res = await api.get("/api/stock-reconcile/settings/factors");
      set({ settings: res.data.data, settingsLoading: false });
      return res.data.data;
    } catch (e) {
      set({ settingsLoading: false });
      return null;
    }
  },

  setStationFactor: async (factor) => {
    const res = await api.put("/api/stock-reconcile/settings/station-factor", { factor });
    await get().fetchSettings();
    return res.data.data;
  },

  setTankFactor: async (tankId, factor) => {
    const res = await api.put("/api/stock-reconcile/settings/tank-factor", { tankId, factor });
    await get().fetchSettings();
    return res.data.data;
  },

  // ── Pump → tank link audit ─────────────────────────────────────────────────
  fetchAudit: async () => {
    set({ auditLoading: true });
    try {
      const res = await api.get("/api/stock-reconcile/audit/pump-links");
      set({ audit: res.data.data, auditLoading: false });
      return res.data.data;
    } catch (e) {
      set({ auditLoading: false });
      throw e;
    }
  },

  // ── Reconciliation workflow ────────────────────────────────────────────────
  previewReconciliation: async (payload) => {
    const res = await api.post("/api/stock-reconcile/preview", payload);
    return res.data.data;
  },

  createReconciliation: async (payload) => {
    set({ saving: true });
    try {
      const res = await api.post("/api/stock-reconcile", payload);
      set({ saving: false });
      return res.data.data;
    } catch (e) {
      set({ saving: false });
      throw e;
    }
  },

  fetchReconciliations: async (params = {}) => {
    set({ listLoading: true });
    try {
      const res = await api.get("/api/stock-reconcile", { params });
      set({
        reconciliations: res.data.data || [],
        pagination: res.data.pagination || null,
        listLoading: false,
      });
      return res.data;
    } catch (e) {
      set({ listLoading: false });
      return null;
    }
  },

  approveReconciliation: async (id) => {
    const res = await api.patch(`/api/stock-reconcile/${id}/approve`);
    return res.data.data;
  },

  rejectReconciliation: async (id, reason) => {
    const res = await api.patch(`/api/stock-reconcile/${id}/reject`, { reason });
    return res.data.data;
  },
}));

export default useStockReconciliationStore;
