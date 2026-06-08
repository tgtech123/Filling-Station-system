import { create } from 'zustand';
import { api } from '@/lib/config';

let _pollingInterval = null;

const useActivityFeedStore = create((set, get) => ({
  // ─── State ────────────────────────────────────────────────────────────────────
  activities:    [],   // Activity[]     from GET /api/activity
  productLevels: [],   // ProductLevel[] from GET /api/product-levels

  loading: {
    activities:    false,
    productLevels: false,
  },

  errors: {
    activities:    null,
    productLevels: null,
  },

  // ─── Helpers ──────────────────────────────────────────────────────────────────
  setLoading: (key, value) =>
    set((state) => ({ loading: { ...state.loading, [key]: value } })),

  setError: (key, error) =>
    set((state) => ({ errors: { ...state.errors, [key]: error } })),

  // ─── 1. Recent Activity ───────────────────────────────────────────────────────
  fetchActivity: async () => {
    const { setLoading, setError } = get();
    setLoading('activities', true);
    setError('activities', null);
    try {
      const response = await api.get('/api/activity');
      const activities = response.data.activities ?? [];
      set({ activities });
      return activities;
    } catch (error) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch recent activity';
      setError('activities', msg);
      return [];
    } finally {
      setLoading('activities', false);
    }
  },

  // ─── 2. Product Levels ────────────────────────────────────────────────────────
  fetchProductLevels: async () => {
    const { setLoading, setError } = get();
    setLoading('productLevels', true);
    setError('productLevels', null);
    try {
      const response = await api.get('/api/product-levels');
      const productLevels = response.data.productLevels ?? [];
      set({ productLevels });
      return productLevels;
    } catch (error) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch product levels';
      setError('productLevels', msg);
      return [];
    } finally {
      setLoading('productLevels', false);
    }
  },

  // ─── 3. Fetch both at once ────────────────────────────────────────────────────
  fetchActivityFeedData: async () => {
    const [activities, productLevels] = await Promise.allSettled([
      get().fetchActivity(),
      get().fetchProductLevels(),
    ]);
    return {
      activities:    activities.status    === 'fulfilled' ? activities.value    : [],
      productLevels: productLevels.status === 'fulfilled' ? productLevels.value : [],
    };
  },

  // ─── Socket-triggered invalidation ───────────────────────────────────────────
  invalidate: () => {
    get().fetchActivity();
  },

  // ─── 4. Safety polling (5 min fallback — socket handles the fast path) ───────
  startPolling: () => {
    if (_pollingInterval) return;
    _pollingInterval = setInterval(() => {
      get().fetchActivity();
    }, 5 * 60 * 1000);
  },

  stopPolling: () => {
    if (_pollingInterval) {
      clearInterval(_pollingInterval);
      _pollingInterval = null;
    }
  },

  // ─── Reset ────────────────────────────────────────────────────────────────────
  reset: () =>
    set({
      activities:    [],
      productLevels: [],
      loading: { activities: false, productLevels: false },
      errors:  { activities: null,  productLevels: null  },
    }),
}));

export default useActivityFeedStore;
