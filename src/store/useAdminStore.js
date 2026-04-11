import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

const useAdminStore = create((set, get) => ({
  // State
  overview: null,
  stationsStats: null,
  networkGrowth: { monthly: [], yearly: [] },
  stations: [],
  selectedStation: null,
  stationDetail: null,
  stationStats: null,
  stationStaff: [],
  stationShifts: [],
  stationTanks: [],
  stationActivity: [],
  stationErrors: [],
  activityLogs: [],
  loading: false,
  error: null,
  searchTerm: "",

  // ── Payments
  paymentStats: null,
  payments: [],
  paymentsPagination: {
    currentPage: 1,
    totalItems: 0,
    itemsPerPage: 10,
    totalPages: 0,
  },
  paymentsLoading: false,
  paymentsError: null,

  // ── Overview ──────────────────────────────────────────────
  fetchOverview: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/api/admin/overview`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set({ overview: response.data.data, loading: false });
      return response.data.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Failed to fetch overview";
      set({ loading: false, error: errorMsg });
      console.error("❌ fetchOverview:", errorMsg);
      return null;
    }
  },

  // ── Stations Stats ─────────────────────────────────────────
  fetchStationsStats: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/api/admin/overview`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const d = response.data.data || {};
      set({
        stationsStats: {
          totalRegisteredStations: d.totalRegisteredStations ?? null,
          totalRegisteredStationsGrowth: d.totalRegisteredStationsGrowth ?? 0,
          activeSubscriptions: d.activeSubscriptions ?? null,
          activeSubscriptionsGrowth: d.activeSubscriptionsGrowth ?? 0,
          expiredSubscriptions: d.expiredSubscriptions ?? null,
          expiredSubscriptionsGrowth: d.expiredSubscriptionsGrowth ?? 0,
          suspendedStations: d.suspendedStations ?? null,
          suspendedStationsGrowth: d.suspendedStationsGrowth ?? 0,
        },
      });
    } catch (error) {
      console.error("❌ fetchStationsStats:", error.message);
    }
  },

  // ── Reset Owner Password ───────────────────────────────────
  resetStaffPassword: async (stationId, ownerId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API}/api/admin/stations/${stationId}/reset-owner-password`,
        { ownerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { success: true };
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Failed to reset password";
      console.error("❌ resetStaffPassword:", errorMsg);
      return { success: false, error: errorMsg };
    }
  },

  // ── Network Growth ─────────────────────────────────────────
  fetchNetworkGrowth: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/api/admin/network-growth`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = response.data.data || {};
      set({
        networkGrowth: {
          monthly: data.monthly || [],
          yearly: data.yearly || [],
        },
      });
      return data;
    } catch (error) {
      console.error("❌ fetchNetworkGrowth:", error.message);
      return null;
    }
  },

  // ── Stations ──────────────────────────────────────────────
  fetchStations: async (search = "") => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/api/admin/stations`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: search ? { search } : {},
        }
      );
      set({
        stations: response.data.stations || response.data.data || [],
        loading: false,
      });
      return response.data.stations || response.data.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Failed to fetch stations";
      set({ loading: false, error: errorMsg, stations: [] });
      console.error("❌ fetchStations:", errorMsg);
      return null;
    }
  },

  // ── Station Detail ─────────────────────────────────────────
  fetchStationDetail: async (id) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/api/admin/stations/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set({
        stationDetail: response.data.station || response.data.data || response.data,
        stationStats: response.data.stats || null,
        loading: false,
      });
      return response.data.station || response.data.data || response.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Failed to fetch station detail";
      set({ loading: false, error: errorMsg });
      console.error("❌ fetchStationDetail:", errorMsg);
      return null;
    }
  },

  // ── Station Staff ──────────────────────────────────────────
  fetchStationStaff: async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/api/admin/stations/${id}/staff`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Backend returns: { message, total, staff: [...] }
      const staff = response.data.staff || response.data.data || [];
      set({ stationStaff: Array.isArray(staff) ? staff : [] });
      return staff;
    } catch (error) {
      set({ stationStaff: [] });
      console.error("❌ fetchStationStaff:", error.message);
      return null;
    }
  },

  // ── Station Shifts ─────────────────────────────────────────
  fetchStationShifts: async (id, params = {}) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/api/admin/stations/${id}/shifts`,
        { headers: { Authorization: `Bearer ${token}` }, params }
      );
      // Backend returns: { message, total, shifts: [...] }
      const shifts = response.data.shifts || response.data.data || [];
      set({ stationShifts: Array.isArray(shifts) ? shifts : [] });
      return shifts;
    } catch (error) {
      set({ stationShifts: [] });
      console.error("❌ fetchStationShifts:", error.message);
      return null;
    }
  },

  // ── Station Tanks ──────────────────────────────────────────
  fetchStationTanks: async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/api/admin/stations/${id}/tanks`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Backend returns: { message, tanks: [...] }
      const tanks = response.data.tanks || response.data.data || [];
      set({ stationTanks: Array.isArray(tanks) ? tanks : [] });
      return tanks;
    } catch (error) {
      set({ stationTanks: [] });
      console.error("❌ fetchStationTanks:", error.message);
      return null;
    }
  },

  // ── Station Activity ───────────────────────────────────────
  fetchStationActivity: async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/api/admin/stations/${id}/activity`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Backend returns: { message, total, activities: [...] }
      const activities = response.data.activities || response.data.data || [];
      set({ stationActivity: Array.isArray(activities) ? activities : [] });
      return activities;
    } catch (error) {
      set({ stationActivity: [] });
      console.error("❌ fetchStationActivity:", error.message);
      return null;
    }
  },

  // ── Station Errors ─────────────────────────────────────────
  fetchStationErrors: async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/api/admin/stations/${id}/errors`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Backend returns: { message, total, errors: [...] }
      const errors = response.data.errors || response.data.data || [];
      set({ stationErrors: Array.isArray(errors) ? errors : [] });
      return errors;
    } catch (error) {
      set({ stationErrors: [] });
      console.error("❌ fetchStationErrors:", error.message);
      return null;
    }
  },

  // ── Activity Logs ──────────────────────────────────────────
  fetchActivityLogs: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/api/admin/activity-logs`,
        { headers: { Authorization: `Bearer ${token}` }, params }
      );
      const logs =
        response.data.logs ||
        response.data.data ||
        (Array.isArray(response.data) ? response.data : []);
      set({ activityLogs: logs, loading: false });
      return logs;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Failed to fetch activity logs";
      set({ loading: false, error: errorMsg, activityLogs: [] });
      console.error("❌ fetchActivityLogs:", errorMsg);
      return null;
    }
  },

  // ── Update Station Status 
  updateStationStatus: async (id, isActive) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API}/api/admin/stations/${id}/status`,
        { isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set((state) => ({
        stations: state.stations.map((s) =>
          s._id === id || s.id === id
            ? { ...s, isActive, status: isActive ? "Active" : "Suspended" }
            : s
        ),
        stationDetail:
          state.stationDetail &&
          (state.stationDetail._id === id || state.stationDetail.id === id)
            ? {
                ...state.stationDetail,
                isActive,
                status: isActive ? "Active" : "Suspended",
              }
            : state.stationDetail,
      }));
      return { success: true, data: response.data };
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Failed to update status";
      console.error("❌ updateStationStatus:", errorMsg);
      return { success: false, error: errorMsg };
    }
  },

  // ── Restore Station ────────────────────────────────────────
  restoreStation: async (stationId) => {
    try {
      set({ loading: true });
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API}/api/admin/stations/${stationId}/restore`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set((state) => ({
        stations: state.stations.map((s) =>
          s.id === stationId || s._id === stationId
            ? { ...s, isDeleted: false, isActive: true, accessMode: "full" }
            : s
        ),
        loading: false,
      }));
      toast.success("Station restored successfully");
      return { success: true };
    } catch (err) {
      set({ loading: false });
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to restore station";
      console.error("❌ restoreStation:", errorMsg);
      return { success: false, error: errorMsg };
    }
  },

  // ── Delete Station
  deleteStation: async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API}/api/admin/stations/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set((state) => ({
        stations: state.stations.filter((s) => s._id !== id && s.id !== id),
      }));
      return { success: true };
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Failed to delete station";
      console.error("❌ deleteStation:", errorMsg);
      return { success: false, error: errorMsg };
    }
  },

  // ── Payment Stats ──────────────────────────────────────────
  fetchPaymentStats: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/api/admin/payments/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set({ paymentStats: response.data.data });
    } catch (err) {
      console.error("fetchPaymentStats:", err);
    }
  },

  // ── Payments List ──────────────────────────────────────────
  fetchPayments: async (params = {}) => {
    try {
      set({ paymentsLoading: true });
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);
      if (params.status && params.status !== "all")
        queryParams.append("status", params.status);
      if (params.search) queryParams.append("search", params.search);
      if (params.duration && params.duration !== "Duration")
        queryParams.append("duration", params.duration);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/api/admin/payments?${queryParams.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set({
        payments: response.data.data.rows || [],
        paymentsPagination: response.data.data.pagination,
        paymentsLoading: false,
      });
    } catch (err) {
      set({ paymentsLoading: false, paymentsError: err.message });
    }
  },

  // ── Helpers ────────────────────────────────────────────────
  setSearchTerm: (term) => set({ searchTerm: term }),

  clearStationData: () =>
    set({
      stationDetail: null,
      stationStats: null,
      stationStaff: [],
      stationShifts: [],
      stationTanks: [],
      stationActivity: [],
      stationErrors: [],
    }),
}));

export default useAdminStore;