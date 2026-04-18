import { create } from "zustand";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API || "http://localhost:5000";

const usePlatformStore = create((set) => ({
  settings: null,
  loading: false,
  error: null,
  saving: false,

  fetchPublicSettings: async () => {
    try {
      set({ loading: true });
      const response = await axios.get(`${BASE_URL}/api/public/settings`);
      set({ settings: response.data.data, loading: false });
    } catch (err) {
      set({ loading: false });
    }
  },

  fetchAdminSettings: async () => {
    try {
      set({ loading: true });
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/admin/settings`, {
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
        `${BASE_URL}/api/admin/settings`,
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
