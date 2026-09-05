import { create } from "zustand";
import { api, extractApiError } from "@/lib/config";

const useStaffManagementStore = create((set) => ({
  staffData: null,
  loading: {
    staffManagement: false,
  },
  errors: {
    staffManagement: null,
  },

  fetchStaffManagement: async () => {
    set((state) => ({
      loading: { ...state.loading, staffManagement: true },
      errors: { ...state.errors, staffManagement: null },
    }));

    try {
      const response = await api.get("/api/dashboard/staff-management");

      set((state) => ({
        staffData: response.data.data,
        loading: { ...state.loading, staffManagement: false },
      }));

      return response.data.data;
    } catch (error) {
      const errorMsg =
        extractApiError(error) ||
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
