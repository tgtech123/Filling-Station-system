import { create } from "zustand";
import { api, extractApiError } from "@/lib/config";

const useGasSaleStore = create((set, get) => ({
  sales: [],
  pendingSales: [],
  dailySummary: [],
  total: 0,
  loading: { sales: false, pending: false, creating: false },
  error: null,

  _setLoading: (key, val) => set(s => ({ loading: { ...s.loading, [key]: val } })),

  createSale: async (payload) => {
    get()._setLoading("creating", true);
    try {
      const { data } = await api.post("/api/gas/sales", payload);
      return { success: true, data: data.data };
    } catch (e) {
      return { success: false, error: extractApiError(e) || e.message };
    } finally { get()._setLoading("creating", false); }
  },

  fetchPendingSales: async () => {
    get()._setLoading("pending", true);
    try {
      const { data } = await api.get("/api/gas/sales/pending");
      set({ pendingSales: data.data || [] });
    } catch (e) {
      set({ error: extractApiError(e) || e.message });
    } finally { get()._setLoading("pending", false); }
  },

  confirmSale: async (id) => {
    try {
      const { data } = await api.patch(`/api/gas/sales/${id}/confirm`);
      set(s => ({ pendingSales: s.pendingSales.filter(p => p._id !== id) }));
      return { success: true, data: data.data };
    } catch (e) {
      return { success: false, error: extractApiError(e) || e.message };
    }
  },

  dispenseSale: async (id) => {
    try {
      const { data } = await api.patch(`/api/gas/sales/${id}/dispense`);
      return { success: true, data: data.data };
    } catch (e) {
      return { success: false, error: extractApiError(e) || e.message };
    }
  },

  voidSale: async (id, voidReason) => {
    try {
      await api.patch(`/api/gas/sales/${id}/void`, { voidReason });
      await get().fetchSales();
      return { success: true };
    } catch (e) {
      return { success: false, error: extractApiError(e) || e.message };
    }
  },

  fetchSales: async (params = {}) => {
    get()._setLoading("sales", true);
    try {
      const { data } = await api.get("/api/gas/sales", { params });
      set({ sales: data.data || [], total: data.total || 0 });
    } catch (e) {
      set({ error: extractApiError(e) || e.message });
    } finally { get()._setLoading("sales", false); }
  },

  fetchDailySummary: async () => {
    try {
      const { data } = await api.get("/api/gas/sales/daily-summary");
      set({ dailySummary: data.data || [] });
    } catch {}
  },
}));

export default useGasSaleStore;
