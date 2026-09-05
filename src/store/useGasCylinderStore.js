import { create } from "zustand";
import { api, extractApiError } from "@/lib/config";

/**
 * Cylinder bottle retail — unit-based products sold instantly at the gas POS.
 * Products/restock are manager-only on the server; cashier sells and views stock.
 */
const useGasCylinderStore = create((set, get) => ({
  products: [],
  sales: [],
  total: 0,
  dailySummary: null, // { perProduct: [], totals: { units, revenue, profit, sales } }
  reorderItems: [],   // products ranked by urgency, with suggestedQty
  procurements: [],
  loading: { products: false, sales: false, creating: false, saving: false, procurement: false },
  error: null,

  _setLoading: (key, val) => set((s) => ({ loading: { ...s.loading, [key]: val } })),

  // ── Products ──────────────────────────────────────────────────────────────
  fetchProducts: async (includeInactive = false) => {
    get()._setLoading("products", true);
    try {
      const { data } = await api.get("/api/gas/cylinders", {
        params: includeInactive ? { includeInactive: "true" } : {},
      });
      set({ products: data.data || [] });
    } catch (e) {
      set({ error: extractApiError(e) || e.message });
    } finally {
      get()._setLoading("products", false);
    }
  },

  addProduct: async (payload) => {
    get()._setLoading("saving", true);
    try {
      const { data } = await api.post("/api/gas/cylinders", payload);
      await get().fetchProducts(true);
      return { success: true, data: data.data };
    } catch (e) {
      return { success: false, error: extractApiError(e) || e.message };
    } finally {
      get()._setLoading("saving", false);
    }
  },

  updateProduct: async (id, payload) => {
    get()._setLoading("saving", true);
    try {
      const { data } = await api.patch(`/api/gas/cylinders/${id}`, payload);
      await get().fetchProducts(true);
      return { success: true, data: data.data };
    } catch (e) {
      return { success: false, error: extractApiError(e) || e.message };
    } finally {
      get()._setLoading("saving", false);
    }
  },

  restockProduct: async (id, payload) => {
    get()._setLoading("saving", true);
    try {
      const { data } = await api.post(`/api/gas/cylinders/${id}/restock`, payload);
      await get().fetchProducts(true);
      return { success: true, data: data.data };
    } catch (e) {
      return { success: false, error: extractApiError(e) || e.message };
    } finally {
      get()._setLoading("saving", false);
    }
  },

  // ── Sales ─────────────────────────────────────────────────────────────────
  createSale: async (payload) => {
    get()._setLoading("creating", true);
    try {
      const { data } = await api.post("/api/gas/cylinders/sales", payload);
      // Refresh stock immediately so the POS shows the new level
      get().fetchProducts();
      return { success: true, data: data.data };
    } catch (e) {
      return { success: false, error: extractApiError(e) || e.message };
    } finally {
      get()._setLoading("creating", false);
    }
  },

  voidSale: async (id, voidReason) => {
    try {
      await api.patch(`/api/gas/cylinders/sales/${id}/void`, { voidReason });
      get().fetchProducts(true);
      return { success: true };
    } catch (e) {
      return { success: false, error: extractApiError(e) || e.message };
    }
  },

  fetchSales: async (params = {}) => {
    get()._setLoading("sales", true);
    try {
      const { data } = await api.get("/api/gas/cylinders/sales", { params });
      set({ sales: data.data || [], total: data.total || 0 });
    } catch (e) {
      set({ error: extractApiError(e) || e.message });
    } finally {
      get()._setLoading("sales", false);
    }
  },

  fetchDailySummary: async () => {
    try {
      const { data } = await api.get("/api/gas/cylinders/sales/daily-summary");
      set({ dailySummary: data.data || null });
    } catch {}
  },

  // ── Purchase orders (lubricant procurement pattern) ───────────────────────
  fetchReorderItems: async () => {
    try {
      const { data } = await api.get("/api/gas/cylinders/procurement/reorder-items");
      set({ reorderItems: data.data || [] });
      return data.data || [];
    } catch (e) {
      return [];
    }
  },

  fetchProcurements: async (params = {}) => {
    get()._setLoading("procurement", true);
    try {
      const { data } = await api.get("/api/gas/cylinders/procurement", { params });
      set({ procurements: data.data || [] });
    } catch (e) {
      set({ error: extractApiError(e) || e.message });
    } finally {
      get()._setLoading("procurement", false);
    }
  },

  createProcurement: async (payload) => {
    get()._setLoading("saving", true);
    try {
      const { data } = await api.post("/api/gas/cylinders/procurement", payload);
      await get().fetchProcurements();
      return { success: true, data: data.data };
    } catch (e) {
      return { success: false, error: extractApiError(e) || e.message };
    } finally {
      get()._setLoading("saving", false);
    }
  },

  submitProcurement: async (id) => {
    try {
      const { data } = await api.patch(`/api/gas/cylinders/procurement/${id}/submit`);
      await get().fetchProcurements();
      return { success: true, data: data.data };
    } catch (e) {
      return { success: false, error: extractApiError(e) || e.message };
    }
  },

  markProcurementOrdered: async (id) => {
    try {
      await api.patch(`/api/gas/cylinders/procurement/${id}/ordered`);
      await get().fetchProcurements();
      return { success: true };
    } catch (e) {
      return { success: false, error: extractApiError(e) || e.message };
    }
  },

  markProcurementReceived: async (id, receivedItems) => {
    try {
      const { data } = await api.patch(`/api/gas/cylinders/procurement/${id}/received`, { receivedItems });
      await Promise.all([get().fetchProcurements(), get().fetchProducts(true)]);
      return { success: true, message: data.message };
    } catch (e) {
      return { success: false, error: extractApiError(e) || e.message };
    }
  },

  recordProcurementPayment: async (id, payload) => {
    try {
      const { data } = await api.patch(`/api/gas/cylinders/procurement/${id}/payment`, payload);
      await get().fetchProcurements();
      return { success: true, message: data.message };
    } catch (e) {
      return { success: false, error: extractApiError(e) || e.message };
    }
  },

  deleteProcurement: async (id) => {
    try {
      await api.delete(`/api/gas/cylinders/procurement/${id}`);
      await get().fetchProcurements();
      return { success: true };
    } catch (e) {
      return { success: false, error: extractApiError(e) || e.message };
    }
  },
}));

export default useGasCylinderStore;
