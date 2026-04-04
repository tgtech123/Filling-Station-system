import { create } from 'zustand';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API || 'http://localhost:5000';

const getAuthHeaders = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  return {};
};

let _pollingInterval = null;

const useActivityFeedStore = create((set, get) => ({
  // ─── State ────────────────────────────────────────────────────────────────────
  // Arrays stored directly — no envelope wrapper
  activities: [],      // Activity[]  from GET /api/activity
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
  // GET /api/activity
  // Response: { message, total, activities[] }   (no station field)
  fetchActivity: async () => {
    const { setLoading, setError } = get();

    setLoading('activities', true);
    setError('activities', null);

    try {
      const response = await axios.get(`${API_BASE_URL}/api/activity`, {
        headers: getAuthHeaders(),
      });
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
      throw error;
    } finally {
      setLoading('activities', false);
    }
  },

  // ─── 2. Product Levels ────────────────────────────────────────────────────────
  // GET /api/product-levels
  // Response: { message, station, total, productLevels[] }
  fetchProductLevels: async () => {
    const { setLoading, setError } = get();

    setLoading('productLevels', true);
    setError('productLevels', null);

    try {
      const response = await axios.get(`${API_BASE_URL}/api/product-levels`, {
        headers: getAuthHeaders(),
      });
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
      throw error;
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

  // ─── 4. Polling ──────────────────────────────────────────────────────────────
  startPolling: () => {
    if (_pollingInterval) return;
    _pollingInterval = setInterval(() => {
      get().fetchActivity();
    }, 30000);
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
