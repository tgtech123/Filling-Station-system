import { create } from "zustand";
import { api, extractApiError } from "@/lib/config";

const usePumpControlStore = create((set) => ({
  pumpData: null,
  loading: {
    pumpControl: false,
  },
  errors: {
    pumpControl: null,
  },

  fetchPumpControl: async () => {
    set((state) => ({
      loading: { ...state.loading, pumpControl: true },
      errors: { ...state.errors, pumpControl: null },
    }));

    try {
      const response = await api.get("/api/dashboard/pump-control");

      set((state) => ({
        pumpData: response.data.data,
        loading: { ...state.loading, pumpControl: false },
      }));

      return response.data.data;
    } catch (error) {
      const errorMsg =
        extractApiError(error) ||
        error.message ||
        "Failed to fetch pump control data";

      set((state) => ({
        loading: { ...state.loading, pumpControl: false },
        errors: { ...state.errors, pumpControl: errorMsg },
      }));

      console.error("❌ Error fetching pump control data:", errorMsg);
      return null;
    }
  },
}));

export default usePumpControlStore;
