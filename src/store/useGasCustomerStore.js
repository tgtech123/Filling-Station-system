import { create } from "zustand";
import { api } from "@/lib/config";

const useGasCustomerStore = create((set, get) => ({
  customers: [],
  selectedCustomer: null,
  loyaltyTxns: [],
  total: 0,
  loading: { list: false, search: false, register: false },
  error: null,

  registerCustomer: async (payload) => {
    set(s => ({ loading: { ...s.loading, register: true } }));
    try {
      const { data } = await api.post("/api/gas/customers", payload);
      return { success: true, data: data.data };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || e.message };
    } finally { set(s => ({ loading: { ...s.loading, register: false } })); }
  },

  searchByPhone: async (phone) => {
    set(s => ({ loading: { ...s.loading, search: true }, selectedCustomer: null }));
    try {
      const { data } = await api.get("/api/gas/customers/search", { params: { phone } });
      set({ selectedCustomer: data.data });
      return data.data;
    } catch {
      return null;
    } finally { set(s => ({ loading: { ...s.loading, search: false } })); }
  },

  clearSelectedCustomer: () => set({ selectedCustomer: null }),

  fetchCustomers: async (params = {}) => {
    set(s => ({ loading: { ...s.loading, list: true } }));
    try {
      const { data } = await api.get("/api/gas/customers", { params });
      set({ customers: data.data || [], total: data.total || 0 });
    } catch (e) {
      set({ error: e.response?.data?.message || e.message });
    } finally { set(s => ({ loading: { ...s.loading, list: false } })); }
  },

  fetchCustomer: async (id) => {
    try {
      const { data } = await api.get(`/api/gas/customers/${id}`);
      set({ selectedCustomer: data.data?.customer });
      return { ok: true, ...data.data };
    } catch (e) {
      const msg = e.response?.data?.message || e.message || "Failed to load customer";
      return { ok: false, error: msg };
    }
  },

  fetchLoyaltyTransactions: async (id) => {
    try {
      const { data } = await api.get(`/api/gas/customers/${id}/transactions`);
      set({ loyaltyTxns: data.data || [] });
    } catch {}
  },

  updateCustomer: async (id, payload) => {
    try {
      const { data } = await api.patch(`/api/gas/customers/${id}`, payload);
      return { success: true, data: data.data };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || e.message };
    }
  },
}));

export default useGasCustomerStore;
