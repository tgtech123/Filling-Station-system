import { create } from "zustand";
import { api } from "@/lib/config";

const useGasProcurementStore = create((set, get) => ({
  procurements: [],
  total: 0,
  loading: false,
  error: null,

  fetchProcurements: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get("/api/gas/procurement", { params });
      set({ procurements: data.data || [], total: data.total || 0 });
    } catch (e) {
      set({ error: e.response?.data?.message || e.message });
    } finally { set({ loading: false }); }
  },

  createProcurement: async (payload) => {
    try {
      const { data } = await api.post("/api/gas/procurement", payload);
      await get().fetchProcurements();
      return { success: true, data: data.data };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || e.message };
    }
  },

  confirmDelivery: async (id, payload) => {
    try {
      const { data } = await api.patch(`/api/gas/procurement/${id}/confirm-delivery`, payload);
      await get().fetchProcurements();
      return { success: true, data: data.data };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || e.message };
    }
  },

  validateProcurement: async (id, targetTankId) => {
    try {
      const { data } = await api.patch(`/api/gas/procurement/${id}/validate`, { targetTankId });
      await get().fetchProcurements();
      return { success: true, data: data.data };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || e.message };
    }
  },

  cancelProcurement: async (id) => {
    try {
      await api.patch(`/api/gas/procurement/${id}/cancel`);
      await get().fetchProcurements();
      return { success: true };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || e.message };
    }
  },

  resendEmail: async (id, email) => {
    try {
      await api.post(`/api/gas/procurement/${id}/resend-email`, { email });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || e.message };
    }
  },
}));

export default useGasProcurementStore;
