import { create } from 'zustand';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const TRENDS_ENDPOINT = '/api/trends';

// Helper function to get auth token
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const useTrendsStore = create((set, get) => ({
  // State
  dashboard: null,
  kpis: null,
  salesRevenueTrend: [],
  profitAnalysis: [],
  paymentMethods: [],
  commissionPayouts: [],
  
  // Loading states
  loading: {
    dashboard: false,
  },

  // Error states
  errors: {
    dashboard: null,
  },

  // Actions

  // Set loading state
  setLoading: (key, value) => 
    set((state) => ({
      loading: { ...state.loading, [key]: value },
    })),

  // Set error state
  setError: (key, error) =>
    set((state) => ({
      errors: { ...state.errors, [key]: error },
    })),

  // Clear error
  clearError: (key) =>
    set((state) => ({
      errors: { ...state.errors, [key]: null },
    })),

  // Fetch Trends Dashboard
  fetchDashboard: async (duration = 'thismonth') => {
    const { setLoading, setError } = get();
    setLoading('dashboard', true);
    setError('dashboard', null);

    try {
      const response = await axios.get(`${API_BASE_URL}${TRENDS_ENDPOINT}/dashboard`, {
        params: { duration },
        headers: getAuthHeaders(),
      });
      
      const data = response.data.data;
      
      set({ 
        dashboard: data,
        kpis: data.kpis,
        salesRevenueTrend: data.salesRevenueTrend || [],
        profitAnalysis: data.profitAnalysis || [],
        paymentMethods: data.paymentMethods || [],
        commissionPayouts: data.commissionPayouts || [],
      });
      
      return data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch trends dashboard';
      setError('dashboard', errorMsg);
      throw error;
    } finally {
      setLoading('dashboard', false);
    }
  },

  // Reset store
  reset: () =>
    set({
      dashboard: null,
      kpis: null,
      salesRevenueTrend: [],
      profitAnalysis: [],
      paymentMethods: [],
      commissionPayouts: [],
      loading: {
        dashboard: false,
      },
      errors: {
        dashboard: null,
      },
    }),
}));

export default useTrendsStore;