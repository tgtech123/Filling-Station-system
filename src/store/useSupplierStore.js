import { create } from "zustand";
import { api, extractApiError } from "@/lib/config";

const useSupplierStore = create((set, get) => ({
  suppliers: [],
  loading: false,
  saving: false,
  error: null,

  // Fetch suppliers — pass type: "gas" | "lubricant" | "both" | "all"
  fetchSuppliers: async (type = "all") => {
    set({ loading: true, error: null });
    try {
      const params = type && type !== "all" ? { type } : {};
      const { data } = await api.get("/api/suppliers", { params });
      set({ suppliers: data.data || [] });
    } catch (e) {
      set({ error: extractApiError(e) || e.message });
    } finally {
      set({ loading: false });
    }
  },

  // Create a new supplier and return it
  createSupplier: async (payload) => {
    set({ saving: true });
    try {
      const { data } = await api.post("/api/suppliers", payload);
      // Append to local list
      set((s) => ({ suppliers: [...s.suppliers, data.data] }));
      return { success: true, data: data.data };
    } catch (e) {
      return { success: false, error: extractApiError(e) || e.message };
    } finally {
      set({ saving: false });
    }
  },

  // Update supplier
  updateSupplier: async (id, payload) => {
    try {
      const { data } = await api.patch(`/api/suppliers/${id}`, payload);
      set((s) => ({
        suppliers: s.suppliers.map((sup) => (sup._id === id ? data.data : sup)),
      }));
      return { success: true, data: data.data };
    } catch (e) {
      return { success: false, error: extractApiError(e) || e.message };
    }
  },

  // Soft-delete supplier
  deleteSupplier: async (id) => {
    try {
      await api.delete(`/api/suppliers/${id}`);
      set((s) => ({ suppliers: s.suppliers.filter((sup) => sup._id !== id) }));
      return { success: true };
    } catch (e) {
      return { success: false, error: extractApiError(e) || e.message };
    }
  },
}));

export default useSupplierStore;
