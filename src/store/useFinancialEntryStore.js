import { create } from 'zustand';
import { api } from '@/lib/config';

const BASE = '/api/financial-entries';

const useFinancialEntryStore = create((set, get) => ({
  entries: [],
  unpaidDeliveries: [],
  totalOwed: 0,
  loading: false,
  saving: false,
  error: null,

  fetchEntries: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(BASE);
      set({ entries: res.data.data });
    } catch (err) {
      set({ error: err.response?.data?.message || err.message || 'Failed to load entries' });
    } finally {
      set({ loading: false });
    }
  },

  fetchUnpaidDeliveries: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`${BASE}/unpaid-deliveries`);
      set({ unpaidDeliveries: res.data.data.deliveries, totalOwed: res.data.data.totalOwed });
    } catch (err) {
      set({ error: err.response?.data?.message || err.message || 'Failed to load deliveries' });
    } finally {
      set({ loading: false });
    }
  },

  createEntry: async (payload) => {
    set({ saving: true, error: null });
    try {
      const res = await api.post(BASE, payload);
      set((s) => ({ entries: [res.data.data, ...s.entries] }));
      return res.data.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create entry';
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ saving: false });
    }
  },

  updateEntry: async (id, payload) => {
    set({ saving: true, error: null });
    try {
      const res = await api.put(`${BASE}/${id}`, payload);
      set((s) => ({ entries: s.entries.map((e) => (e._id === id ? res.data.data : e)) }));
      return res.data.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update entry';
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ saving: false });
    }
  },

  deleteEntry: async (id) => {
    set({ saving: true, error: null });
    try {
      await api.delete(`${BASE}/${id}`);
      set((s) => ({ entries: s.entries.filter((e) => e._id !== id) }));
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete entry';
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ saving: false });
    }
  },

  markDeliveryPaid: async (deliveryId) => {
    set({ saving: true, error: null });
    try {
      await api.patch(`${BASE}/deliveries/${deliveryId}/mark-paid`);
      set((s) => ({
        unpaidDeliveries: s.unpaidDeliveries.filter((d) => d._id !== deliveryId),
      }));
      // Recalculate totalOwed
      const remaining = get().unpaidDeliveries;
      const totalOwed = remaining.reduce((sum, d) => sum + d.quantity * d.pricePerLtr, 0);
      set({ totalOwed });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to mark delivery as paid';
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ saving: false });
    }
  },
}));

export default useFinancialEntryStore;
