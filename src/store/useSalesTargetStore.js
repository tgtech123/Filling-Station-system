import { create } from "zustand";
import { api } from "@/lib/config";

const API_BASE_URL = process.env.NEXT_PUBLIC_API || process.env.NEXT_PUBLIC_API_URL || "https://fueldesk-station-server.onrender.com";

const getAuthHeaders = () => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  return {};
};

const getStaffId = () => {
  if (typeof window !== "undefined") {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user._id || user.id || null;
    } catch {
      return null;
    }
  }
  return null;
};

const useSalesTargetStore = create((set) => ({
  target: null,
  loading: false,
  error: null,

  fetchMyTarget: async () => {
    const staffId = getStaffId();
    if (!staffId) {
      set({ error: "No staff ID found", loading: false });
      return;
    }
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/api/staff/${staffId}/target`);
      const target = res.data?.target ?? null;
      set({ target, loading: false });
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Failed to fetch target";
      set({ error: msg, loading: false });
    }
  },
}));

export default useSalesTargetStore;
