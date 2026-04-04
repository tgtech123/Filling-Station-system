import { create } from "zustand";
import axios from "axios";

const useStaffManagementStore = create((set) => ({
  // State
  staffData: null,
  loading: {
    staffManagement: false,
  },
  errors: {
    staffManagement: null,
  },

  // Fetch Staff Management Data
  fetchStaffManagement: async (token) => {
    set((state) => ({
      loading: { ...state.loading, staffManagement: true },
      errors: { ...state.errors, staffManagement: null },
    }));

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/api/dashboard/staff-management`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Staff management response:", response.data);

      set((state) => ({
        staffData: response.data.data,
        loading: { ...state.loading, staffManagement: false },
      }));

      return response.data.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch staff management data";

      set((state) => ({
        loading: { ...state.loading, staffManagement: false },
        errors: { ...state.errors, staffManagement: errorMsg },
      }));

      console.error("❌ Error fetching staff management data:", errorMsg);
      return null;
    }
  },
}));

export default useStaffManagementStore;