import { create } from "zustand";
import axios from "axios";

const useDashboardStore = create((set, get) => ({
  // State
  metrics: null,
  tankStatus: null,
  loading: {
    metrics: false,
    tankStatus: false,
  },
  errors: {
    metrics: null,
    tankStatus: null,
  },

  // Fetch Dashboard Metrics
  fetchMetrics: async (token) => {
    set((state) => ({
      loading: { ...state.loading, metrics: true },
      errors: { ...state.errors, metrics: null },
    }));

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/api/dashboard/metric`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      set((state) => ({
        metrics: response.data,
        loading: { ...state.loading, metrics: false },
      }));

      return response.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Failed to fetch metrics";

      set((state) => ({
        loading: { ...state.loading, metrics: false },
        errors: { ...state.errors, metrics: errorMsg },
      }));

      console.error("❌ Error fetching metrics:", errorMsg);
      return null;
    }
  },

  // Fetch Tank Status
  fetchTankStatus: async (token) => {
    set((state) => ({
      loading: { ...state.loading, tankStatus: true },
      errors: { ...state.errors, tankStatus: null },
    }));

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/api/dashboard/tank-status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      set((state) => ({
        tankStatus: response.data,
        loading: { ...state.loading, tankStatus: false },
      }));

      return response.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Failed to fetch tank status";

      set((state) => ({
        loading: { ...state.loading, tankStatus: false },
        errors: { ...state.errors, tankStatus: errorMsg },
      }));

      console.error("❌ Error fetching tank status:", errorMsg);
      return null;
    }
  },

  // Fetch all dashboard data at once
  fetchDashboardData: async (token) => {
    const metrics = await get().fetchMetrics(token);
    const tankStatus = await get().fetchTankStatus(token);
    return { metrics, tankStatus };
  },

  // Clear dashboard data
  clearDashboard: () => {
    set({
      metrics: null,
      tankStatus: null,
      loading: { metrics: false, tankStatus: false },
      errors: { metrics: null, tankStatus: null },
    });
  },
}));

export default useDashboardStore;