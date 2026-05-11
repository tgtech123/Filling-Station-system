import { create } from "zustand";
import { api } from "@/lib/config";

const useAnalyticsStore = create((set, get) => ({
  revenueTrend: null,
  staffPerformance: null,
  fuelBreakdown: null,
  comparison: null,
  loading: false,
  period: "monthly",

  fetchRevenueTrend: async (period = "monthly") => {
    try {
      const res = await api.get(`/api/dashboard/analytics/revenue?period=${period}`);
      set({ revenueTrend: res.data });
    } catch (err) {
      console.error(err);
    }
  },

  fetchStaffPerformance: async () => {
    try {
      const res = await api.get(`/api/dashboard/analytics/staff-performance`);
      set({ staffPerformance: res.data });
    } catch (err) {
      console.error(err);
    }
  },

  fetchFuelBreakdown: async (period = "month") => {
    try {
      const res = await api.get(`/api/dashboard/analytics/fuel-breakdown?period=${period}`);
      set({ fuelBreakdown: res.data });
    } catch (err) {
      console.error(err);
    }
  },

  fetchComparison: async () => {
    try {
      const res = await api.get(`/api/dashboard/analytics/comparison`);
      set({ comparison: res.data });
    } catch (err) {
      console.error(err);
    }
  },

  fetchAll: async (period) => {
    set({ loading: true, period });
    const { fetchRevenueTrend, fetchStaffPerformance, fetchFuelBreakdown, fetchComparison } = get();
    await Promise.all([
      fetchRevenueTrend(period),
      fetchStaffPerformance(),
      fetchFuelBreakdown(period),
      fetchComparison(),
    ]);
    set({ loading: false });
  },
}));

export default useAnalyticsStore;