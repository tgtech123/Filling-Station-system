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

  /**
   * `orderType` is "lubricant" | "store" | "" (everything).
   *
   * Lubricants and shop stock come from different suppliers, so the person
   * raising an order needs the list already filtered — asking them to pick the
   * right lines out of one mixed list is the step that goes wrong.
   */
  fetchReorderItems: async (orderType = "") => {
    set({ reorderLoading: true, error: null });
    try {
      const url = orderType
        ? `${API_URL}/api/procurement/reorder-items?orderType=${orderType}`
        : `${API_URL}/api/procurement/reorder-items`;
      const res = await fetch(url, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch reorder items");
      set({ reorderItems: data.data || [], reorderLoading: false });
    } catch (err) {
      set({ error: err.message, reorderLoading: false });
    }
  },

  fetchProcurements: async (status = "", orderType = "") => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (orderType) params.set("orderType", orderType);
      const qs = params.toString();
      const url = qs ? `${API_URL}/api/procurement?${qs}` : `${API_URL}/api/procurement`;
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

  /**
   * Record the supplier's reply to a PO.
   *
   * items: [{ lubricantId, confirmedQuantity, confirmedUnitCost, confirmedSellingPrice }]
   * The server returns a `changes` list of every line whose quantity or price
   * differs from what was requested — that is what the manager reviews.
   */
  confirmProcurement: async (id, items, supplierNotes = "") => {
    try {
      const res = await fetch(`${API_URL}/api/procurement/${id}/confirm`, {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ items, supplierNotes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      set((s) => ({
        procurements: s.procurements.map((p) => (p._id === id ? data.data : p)),
      }));
      return { success: true, data: data.data, changes: data.changes || [], message: data.message };
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

  markReceived: async (id, receivedItems = []) => {
    try {
      const res = await fetch(`${API_URL}/api/procurement/${id}/received`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ receivedItems }),
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

  recordPayment: async (id, payload) => {
    try {
      const res = await fetch(`${API_URL}/api/procurement/${id}/payment`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to record payment");
      set((s) => ({
        procurements: s.procurements.map((p) => (p._id === id ? data.data : p)),
        activeProcurement: s.activeProcurement?._id === id ? data.data : s.activeProcurement,
      }));
      return { success: true, data: data.data, totalCost: data.totalCost, balance: data.balance };
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
