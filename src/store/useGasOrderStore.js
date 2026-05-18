import { create } from "zustand";
import { api } from "@/lib/config";

const useGasOrderStore = create((set, get) => ({
  inbox: [],
  orders: [],
  total: 0,
  loading: { inbox: false, orders: false },
  error: null,

  fetchInbox: async () => {
    set(s => ({ loading: { ...s.loading, inbox: true } }));
    try {
      const { data } = await api.get("/api/gas/orders/inbox");
      set({ inbox: data.data || [] });
    } catch (e) {
      set({ error: e.response?.data?.message || e.message });
    } finally { set(s => ({ loading: { ...s.loading, inbox: false } })); }
  },

  markViewed: async (id) => {
    try {
      await api.patch(`/api/gas/orders/${id}/view`);
      set(s => ({
        inbox: s.inbox.map(o => o._id === id ? { ...o, status: "viewed" } : o),
      }));
    } catch {}
  },

  confirmOrder: async (id) => {
    try {
      const { data } = await api.patch(`/api/gas/orders/${id}/confirm`);
      set(s => ({ inbox: s.inbox.filter(o => o._id !== id) }));
      return { success: true, data: data.data };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || e.message };
    }
  },

  cancelOrder: async (id, cancelReason) => {
    try {
      await api.patch(`/api/gas/orders/${id}/cancel`, { cancelReason });
      set(s => ({ inbox: s.inbox.filter(o => o._id !== id) }));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || e.message };
    }
  },

  fetchOrders: async (params = {}) => {
    set(s => ({ loading: { ...s.loading, orders: true } }));
    try {
      const { data } = await api.get("/api/gas/orders", { params });
      set({ orders: data.data || [], total: data.total || 0 });
    } catch (e) {
      set({ error: e.response?.data?.message || e.message });
    } finally { set(s => ({ loading: { ...s.loading, orders: false } })); }
  },
}));

export default useGasOrderStore;
