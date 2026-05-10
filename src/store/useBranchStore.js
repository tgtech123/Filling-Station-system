import { create } from "zustand";
import axios from "axios";

const useBranchStore = create((set, get) => ({
  // ── State
  branches: [],
  currentStation: null,
  overview: null,
  loading: false,
  switching: false,
  error: null,

  // ── Fetch all branches for this manager
  fetchBranches: async () => {
    try {
      set({ loading: true });
      const token = localStorage.getItem("token");
      const response = await axios.get(`/api/branches`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({
        branches: response.data.stations || [],
        currentStation: response.data.currentStation,
        loading: false,
      });
    } catch (err) {
      set({ loading: false });
    }
  },

  // ── Switch active station context
  switchStation: async (targetStationId) => {
    try {
      set({ switching: true });
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `/api/branches/switch`,
        { targetStationId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update token with new station context
      const newToken = response.data.token;
      localStorage.setItem("token", newToken);

      // Update user station in localStorage (super manager by definition can switch)
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      user.station = targetStationId;
      user.isSuperManager = true;
      localStorage.setItem("user", JSON.stringify(user));

      set({ switching: false });

      // Reload dashboard with new station context
      window.location.href = "/dashboard/manager";

      return response.data;
    } catch (err) {
      set({ switching: false });
      throw err;
    }
  },

  // ── Fetch overview across all branches
  fetchOverview: async () => {
    try {
      set({ loading: true });
      const token = localStorage.getItem("token");
      const response = await axios.get(`/api/branches/overview`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({
        overview: response.data,
        loading: false,
      });
    } catch (err) {
      set({ loading: false });
    }
  },

  // ── Create a new branch station
  createBranch: async (branchData) => {
    try {
      set({ loading: true });
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `/api/branches/create`,
        branchData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set({ loading: false });
      // Refresh branches after creation
      await get().fetchBranches();
      return response.data;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },
}));

export default useBranchStore;
