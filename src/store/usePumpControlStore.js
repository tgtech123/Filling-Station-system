import { create } from "zustand";
import axios from "axios";

const usePumpControlStore = create((set) => ({
  // State
  pumpData: null,
  loading: {
    pumpControl: false,
  },
  errors: {
    pumpControl: null,
  },

  // Fetch Pump Control Data
  fetchPumpControl: async (token) => {
    set((state) => ({
      loading: { ...state.loading, pumpControl: true },
      errors: { ...state.errors, pumpControl: null },
    }));

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/api/dashboard/pump-control`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Pump control response:", response.data);

      set((state) => ({
        pumpData: response.data.data,
        loading: { ...state.loading, pumpControl: false },
      }));

      return response.data.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
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
