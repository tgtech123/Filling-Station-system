import { create } from "zustand";
import { api, extractApiError } from "@/lib/config";

const useEmergencyStore = create((set) => ({
  emergencyMode: false,
  loading: false,

  fetchStatus: async () => {
    try {
      const res = await api.get("/api/emergency/status");
      set({ emergencyMode: res.data.data?.active ?? res.data.active ?? false });
    } catch (err) {
      console.error("Failed to fetch emergency status:", err);
    }
  },

  activateEmergency: async () => {
    set({ loading: true });
    try {
      await api.post("/api/emergency/activate", {});
      set({ emergencyMode: true, loading: false });
      return { success: true };
    } catch (err) {
      set({ loading: false });
      return {
        success: false,
        error: extractApiError(err) || err.message || "Failed to activate",
      };
    }
  },

  deactivateEmergency: async () => {
    set({ loading: true });
    try {
      await api.post("/api/emergency/deactivate", {});
      set({ emergencyMode: false, loading: false });
      return { success: true };
    } catch (err) {
      set({ loading: false });
      return {
        success: false,
        error: extractApiError(err) || err.message || "Failed to deactivate",
      };
    }
  },
}));

export default useEmergencyStore;
