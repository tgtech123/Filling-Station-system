import { create } from "zustand";
import { api } from "@/lib/config";

const usePlatformStore = create((set) => ({
  settings: null,
  loading: false,
  error: null,
  saving: false,

  fetchPublicSettings: async () => {
    try {
      set({ loading: true });
      const response = await api.get(`/api/public/settings`);
      set({ settings: response.data.data, loading: false });
    } catch (err) {
      set({ loading: false });
    }
  },

  fetchAdminSettings: async () => {
    try {
      set({ loading: true });
      const response = await api.get(`/api/admin/settings`);
      set({ settings: response.data.data, loading: false });
    } catch (err) {
      set({ loading: false });
    }
  },

  updateSettings: async (updates) => {
    try {
      set({ saving: true });
      const response = await api.patch(`/api/admin/settings`, updates);
      set({ settings: response.data.data, saving: false });
      return { success: true };
    } catch (err) {
      set({ saving: false });
      return { success: false, error: err.response?.data?.error };
    }
  },
}));

export default usePlatformStore;
