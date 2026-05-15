import { create } from 'zustand';
import { api } from '@/lib/config';

const ENDPOINT = '/api/fixed-assets';

const useFixedAssetStore = create((set, get) => ({
  assets: [],
  loading: false,
  saving: false,
  error: null,

  fetchAssets: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(ENDPOINT);
      set({ assets: res.data.data });
      return res.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || err.message || 'Failed to load assets' });
    } finally {
      set({ loading: false });
    }
  },

  createAsset: async (payload) => {
    set({ saving: true, error: null });
    try {
      const res = await api.post(ENDPOINT, payload);
      set((state) => ({ assets: [res.data.data, ...state.assets] }));
      return res.data.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create asset';
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ saving: false });
    }
  },

  updateAsset: async (id, payload) => {
    set({ saving: true, error: null });
    try {
      const res = await api.put(`${ENDPOINT}/${id}`, payload);
      set((state) => ({
        assets: state.assets.map((a) => (a._id === id ? res.data.data : a)),
      }));
      return res.data.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update asset';
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ saving: false });
    }
  },

  deleteAsset: async (id) => {
    set({ saving: true, error: null });
    try {
      await api.delete(`${ENDPOINT}/${id}`);
      set((state) => ({ assets: state.assets.filter((a) => a._id !== id) }));
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete asset';
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ saving: false });
    }
  },
}));

export default useFixedAssetStore;
