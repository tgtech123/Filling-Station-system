import { create } from "zustand";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API || "http://localhost:5000";

const usePlansStore = create((set, get) => ({
  // ── State 
  plans: [],
  adminPlans: [],
  loading: false,
  error: null,

  // ── Public Plans (no auth) 
  fetchPublicPlans: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(
        `${BASE_URL}/api/public/plans`
      );
      set({
        plans: response.data.plans || response.data.data || [],
        loading: false,
      });
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Failed to fetch plans";
      set({ loading: false, error: errorMsg });
      console.error("❌ fetchPublicPlans:", errorMsg);
    }
  },

  // ── Admin Plans 
  fetchAdminPlans: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/api/admin/plans`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set({
        adminPlans: response.data.plans || response.data.data || [],
        loading: false,
      });
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Failed to fetch admin plans";
      set({ loading: false, error: errorMsg });
      console.error("❌ fetchAdminPlans:", errorMsg);
    }
  },

  // ── Create Plan 
  createPlan: async (planData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BASE_URL}/api/admin/plans`,
        planData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newPlan = response.data.plan || response.data.data;
      if (newPlan) {
        set((state) => ({ adminPlans: [...state.adminPlans, newPlan] }));
      }
      // Sync public plans so pricing page auto-updates
      await get().fetchPublicPlans();
      return { success: true, plan: newPlan };
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Failed to create plan";
      console.error("❌ createPlan:", errorMsg);
      return { success: false, error: errorMsg };
    }
  },

  // ── Update Plan 
  updatePlan: async (planId, updates) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${BASE_URL}/api/admin/plans/${planId}`,
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = response.data.plan || response.data.data;
      set((state) => ({
        adminPlans: state.adminPlans.map((p) =>
          p._id === planId || p.id === planId ? { ...p, ...updated } : p
        ),
      }));
      return { success: true, plan: updated };
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Failed to update plan";
      console.error("❌ updatePlan:", errorMsg);
      return { success: false, error: errorMsg };
    }
  },

  // ── Delete Plan 
  deletePlan: async (planId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${BASE_URL}/api/admin/plans/${planId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set((state) => ({
        adminPlans: state.adminPlans.filter(
          (p) => p._id !== planId && p.id !== planId
        ),
      }));
      return { success: true };
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Failed to delete plan";
      console.error("❌ deletePlan:", errorMsg);
      return { success: false, error: errorMsg };
    }
  },
}));

export default usePlansStore;
