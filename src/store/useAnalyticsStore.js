import { create } from "zustand";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API || "http://localhost:5000";

const useAnalyticsStore = create((set, get) => ({
  revenueTrend: null,
  staffPerformance: null,
  fuelBreakdown: null,
  comparison: null,
  loading: false,
  period: "monthly",

  fetchRevenueTrend: async (period = "monthly") => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${BASE_URL}/api/dashboard/analytics/revenue?period=${period}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set({ revenueTrend: res.data });
    } catch (err) {
      console.error(err);
    }
  },

  fetchStaffPerformance: async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${BASE_URL}/api/dashboard/analytics/staff-performance`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set({ staffPerformance: res.data });
    } catch (err) {
      console.error(err);
    }
  },

  fetchFuelBreakdown: async (period = "month") => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${BASE_URL}/api/dashboard/analytics/fuel-breakdown?period=${period}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set({ fuelBreakdown: res.data });
    } catch (err) {
      console.error(err);
    }
  },

  fetchComparison: async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${BASE_URL}/api/dashboard/analytics/comparison`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
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