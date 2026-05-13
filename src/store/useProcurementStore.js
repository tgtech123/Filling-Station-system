import { create } from "zustand";
import { API_URL } from "@/lib/config";

const authHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

const useProcurementStore = create((set, get) => ({
  reorderItems: [],
  procurements: [],
  activeProcurement: null,
  loading: false,
  reorderLoading: false,
  error: null,

  fetchReorderItems: async () => {
    set({ reorderLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/api/procurement/reorder-items`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch reorder items");
      set({ reorderItems: data.data || [], reorderLoading: false });
    } catch (err) {
      set({ error: err.message, reorderLoading: false });
    }
  },

  fetchProcurements: async (status = "") => {
    set({ loading: true, error: null });
    try {
      const url = status
        ? `${API_URL}/api/procurement?status=${status}`
        : `${API_URL}/api/procurement`;
      const res = await fetch(url, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch procurements");
      set({ procurements: data.data || [], loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchProcurementById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/api/procurement/${id}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      set({ activeProcurement: data.data, loading: false });
      return data.data;
    } catch (err) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  createProcurement: async (payload) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/api/procurement`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create procurement");
      set((s) => ({ procurements: [data.data, ...s.procurements], loading: false }));
      return { success: true, data: data.data };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false, error: err.message };
    }
  },

  updateProcurement: async (id, payload) => {
    try {
      const res = await fetch(`${API_URL}/api/procurement/${id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update");
      set((s) => ({
        procurements: s.procurements.map((p) => (p._id === id ? data.data : p)),
        activeProcurement: s.activeProcurement?._id === id ? data.data : s.activeProcurement,
      }));
      return { success: true, data: data.data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  submitProcurement: async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/procurement/${id}/submit`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit");
      set((s) => ({
        procurements: s.procurements.map((p) => (p._id === id ? data.data : p)),
      }));
      return { success: true, data: data.data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  markOrdered: async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/procurement/${id}/ordered`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      set((s) => ({
        procurements: s.procurements.map((p) => (p._id === id ? data.data : p)),
      }));
      return { success: true, data: data.data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  markReceived: async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/procurement/${id}/received`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      set((s) => ({
        procurements: s.procurements.map((p) => (p._id === id ? data.data : p)),
      }));
      return { success: true, data: data.data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  deleteProcurement: async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/procurement/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }
      set((s) => ({ procurements: s.procurements.filter((p) => p._id !== id) }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },
}));

export default useProcurementStore;
