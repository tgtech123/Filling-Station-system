import { create } from "zustand";
import axios from "axios";

const useEmergencyStore = create((set) => ({
  emergencyMode: false,
  loading: false,

  fetchStatus: async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/api/emergency/status`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set({ emergencyMode: res.data.data?.active ?? res.data.active ?? false });
    } catch (err) {
      console.error("Failed to fetch emergency status:", err);
    }
  },

  activateEmergency: async () => {
    set({ loading: true });
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API}/api/emergency/activate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set({ emergencyMode: true, loading: false });
      return { success: true };
    } catch (err) {
      set({ loading: false });
      return {
        success: false,
        error: err.response?.data?.message || err.message || "Failed to activate",
      };
    }
  },

  deactivateEmergency: async () => {
    set({ loading: true });
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API}/api/emergency/deactivate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set({ emergencyMode: false, loading: false });
      return { success: true };
    } catch (err) {
      set({ loading: false });
      return {
        success: false,
        error: err.response?.data?.message || err.message || "Failed to deactivate",
      };
    }
  },
}));

export default useEmergencyStore;
