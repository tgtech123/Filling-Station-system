import { create } from "zustand";
import axios from "axios";

const useFuelManagementStore = create((set) => ({
  // State
  fuelData: null,
  loading: {
    fuelManagement: false,
  },
  errors: {
    fuelManagement: null,
  },

  // Fetch Fuel Management Data
  fetchFuelManagement: async (token) => {
    set((state) => ({
      loading: { ...state.loading, fuelManagement: true },
      errors: { ...state.errors, fuelManagement: null },
    }));

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/api/dashboard/fuel-management`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Fuel management response:", response.data);

      set((state) => ({
        fuelData: response.data.data,
        loading: { ...state.loading, fuelManagement: false },
      }));

      return response.data.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch fuel management data";

      set((state) => ({
        loading: { ...state.loading, fuelManagement: false },
        errors: { ...state.errors, fuelManagement: errorMsg },
      }));

      console.error("❌ Error fetching fuel management data:", errorMsg);
      return null;
    }
  },
}));

export default useFuelManagementStore;
