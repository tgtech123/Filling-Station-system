import { create } from "zustand";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API;

const useStaffStore = create((set, get) => ({
  staff: [],
  loading: {
    fetching: false,
    creating: false,
    updatingId: null,
    deletingId: null,
  },
  error: null,

  // ✅ Create new staff
  createStaff: async (staffData, token) => {
    set((state) => ({
      loading: { ...state.loading, creating: true },
      error: null,
    }));

    try {
      const res = await axios.post(`${API}/api/auth`, staffData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data;
      console.log("data==", data)

      // ✅ Add new staff to state immediately
      set((state) => ({
        staff: [...state.staff, data.staff], // ensure backend returns `staff` object
        loading: { ...state.loading, creating: false },
      }));

      return data.staff; // 👈 optional return for use in frontend (e.g., Success Modal)
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      set((state) => ({
        loading: { ...state.loading, creating: false },
        error: errorMsg,
      }));
      console.error("Create Staff Error:", errorMsg);
      throw err; // 👈 rethrow so frontend can also catch it
    }
  },

  // ✅ Fetch all staff
  getAllStaff: async (token) => {
    set((state) => ({
      loading: { ...state.loading, fetching: true },
      error: null,
    }));

    try {
      const res = await axios.get(`${API}/api/auth`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data;

      set((state) => ({
        staff: data.staff || [],
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

  // ✅ Update staff
  updateStaff: async (id, updatedData, token) => {
    set((state) => ({
      loading: { ...state.loading, updatingId: id },
      error: null,
    }));

    try {
      const res = await axios.post(`${API}/api/auth/update-staff/${id}`, updatedData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data;

      set((state) => ({
        staff: state.staff.map((s) => (s._id === id ? data.staff : s)),
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

  // ✅ Delete staff
  deleteStaff: async (id, token) => {
    set((state) => ({
      loading: { ...state.loading, deletingId: id },
      error: null,
    }));

    try {
      await axios.post(`${API}/api/auth/delete-staff/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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
