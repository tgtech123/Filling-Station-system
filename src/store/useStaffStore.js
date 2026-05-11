import { create } from "zustand";
import { api } from "@/lib/config";

const useStaffStore = create((set, get) => ({
  staff: [],
  loading: {
    fetching: false,
    creating: false,
    updatingId: null,
    deletingId: null,
  },
  error: null,

  createStaff: async (staffData) => {
    set((state) => ({
      loading: { ...state.loading, creating: true },
      error: null,
    }));
    try {
      const res = await api.post("/api/auth", staffData);
      const data = res.data;
      set((state) => ({
        staff: [...state.staff, data.staff],
        loading: { ...state.loading, creating: false },
      }));
      return data.staff;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      set((state) => ({
        loading: { ...state.loading, creating: false },
        error: errorMsg,
      }));
      console.error("Create Staff Error:", errorMsg);
      throw err;
    }
  },

  getAllStaff: async () => {
    set((state) => ({
      loading: { ...state.loading, fetching: true },
      error: null,
    }));
    try {
      const res = await api.get("/api/auth");
      set((state) => ({
        staff: res.data.staff || [],
        loading: { ...state.loading, fetching: false },
      }));
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      set((state) => ({
        loading: { ...state.loading, fetching: false },
        error: errorMsg,
      }));
      console.error("Get All Staff Error:", errorMsg);
    }
  },

  updateStaff: async (id, updatedData) => {
    set((state) => ({
      loading: { ...state.loading, updatingId: id },
      error: null,
    }));
    try {
      const res = await api.post(`/api/auth/update-staff/${id}`, updatedData);
      set((state) => ({
        staff: state.staff.map((s) => (s._id === id ? res.data.staff : s)),
        loading: { ...state.loading, updatingId: null },
      }));
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      set((state) => ({
        loading: { ...state.loading, updatingId: null },
        error: errorMsg,
      }));
      console.error("Update Staff Error:", errorMsg);
    }
  },

  deleteStaff: async (id) => {
    set((state) => ({
      loading: { ...state.loading, deletingId: id },
      error: null,
    }));
    try {
      await api.post(`/api/auth/delete-staff/${id}`, {});
      set((state) => ({
        staff: state.staff.filter((s) => s._id !== id),
        loading: { ...state.loading, deletingId: null },
      }));
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      set((state) => ({
        loading: { ...state.loading, deletingId: null },
        error: errorMsg,
      }));
      console.error("Delete Staff Error:", errorMsg);
    }
  },
}));

export default useStaffStore;
