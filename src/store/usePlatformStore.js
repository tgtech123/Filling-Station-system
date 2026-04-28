import { create } from "zustand";
import axios from "axios";

const usePlatformStore = create((set) => ({
  settings: null,
  loading: false,
  error: null,
  saving: false,

  fetchPublicSettings: async () => {
    try {
      set({ loading: true });
      const response = await axios.get(`/api/public/settings`);
      set({ settings: response.data.data, loading: false });
    } catch (err) {
      set({ loading: false });
    }
  },

  fetchAdminSettings: async () => {
    try {
      set({ loading: true });
      const token = localStorage.getItem("token");
      const response = await axios.get(`/api/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ settings: response.data.data, loading: false });
    } catch (err) {
      set({ loading: false });
    }
  },

  updateSettings: async (updates) => {
    try {
      set({ saving: true });
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `/api/admin/settings`,
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set({ settings: response.data.data, saving: false });
      return { success: true };
    } catch (err) {
      set({ saving: false });
      return { success: false, error: err.response?.data?.error };
    }
  },
}));

export default usePlatformStore;
