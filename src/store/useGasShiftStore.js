import { create } from "zustand";
import { api } from "@/lib/config";

const useGasShiftStore = create((set, get) => ({
  currentShift: null,
  shifts: [],
  loading: false,
  error: null,

  fetchCurrentShift: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get("/api/gas/shifts/current");
      set({ currentShift: data.data });
    } catch (e) {
      set({ error: e.response?.data?.message || e.message });
    } finally { set({ loading: false }); }
  },

  startShift: async (payload) => {
    try {
      const { data } = await api.post("/api/gas/shifts/start", payload);
      set({ currentShift: data.data });
      return { success: true, data: data.data };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || e.message };
    }
  },

  endShift: async (shiftId, payload) => {
    try {
      const { data } = await api.patch(`/api/gas/shifts/${shiftId}/end`, payload);
      set({ currentShift: null });
      return { success: true, data: data.data };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || e.message };
    }
  },

  fetchShifts: async (params = {}) => {
    set({ loading: true });
    try {
      const { data } = await api.get("/api/gas/shifts", { params });
      set({ shifts: data.data || [] });
    } catch (e) {
      set({ error: e.response?.data?.message || e.message });
    } finally { set({ loading: false }); }
  },
}));

export default useGasShiftStore;
