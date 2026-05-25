import { create } from "zustand";
import { api } from "@/lib/config";

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
      const response = await api.get(`/api/branches`);
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
      const response = await api.post(`/api/branches/switch`, { targetStationId });

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
      const response = await api.get(`/api/branches/overview`);
      set({
        overview: response.data,
        loading: false,
      });
    } catch (err) {
      set({ loading: false });
    }
  },

  // ── Create a new branch station (optionally with manager invite)
  createBranch: async (branchData) => {
    try {
      set({ loading: true });
      const response = await api.post(`/api/branches/create`, branchData);
      set({ loading: false });
      await get().fetchBranches();
      return response.data;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  // ── Send / resend invite to a branch manager
  inviteManager: async (branchId, { firstName, lastName, email }) => {
    const response = await api.post(`/api/branches/${branchId}/invite`, {
      firstName,
      lastName,
      email,
    });
    return response.data;
  },
}));

export default useBranchStore;
