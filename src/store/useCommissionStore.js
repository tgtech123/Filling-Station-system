import { create } from 'zustand';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const COMMISSION_ENDPOINT = '/api/commissions';

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

const useCommissionStore = create((set, get) => ({
  // State
  overview: null,
  staffTracking: [],
  commissionStructure: [],
  bonusStructure: [],
  paymentHistory: [],
  calculationResult: null,
  
  // Pagination for payment history
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  
  // Filters for payment history
  filters: {
    search: '',
    status: '',
    startDate: null,
    endDate: null,
    month: null,
    year: null,
  },

  // Loading states
  loading: {
    overview: false,
    staffTracking: false,
    commissionStructure: false,
    bonusStructure: false,
    paymentHistory: false,
    calculating: false,
    markingPaid: false,
    updatingCommission: false,
    updatingBonus: false,
  },

  // Error states
  errors: {
    overview: null,
    staffTracking: null,
    commissionStructure: null,
    bonusStructure: null,
    paymentHistory: null,
    calculating: null,
    markingPaid: null,
    updatingCommission: null,
    updatingBonus: null,
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

  // Update filters
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  // Reset filters
  resetFilters: () =>
    set({
      filters: {
        search: '',
        status: '',
        startDate: null,
        endDate: null,
        month: null,
        year: null,
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
      },
    }),

  // Fetch Commissions Overview
  fetchOverview: async (duration = 'thismonth') => {
    const { setLoading, setError } = get();
    setLoading('overview', true);
    setError('overview', null);

    try {
      const response = await axios.get(`${API_BASE_URL}${COMMISSION_ENDPOINT}/overview`, {
        params: { duration },
        headers: getAuthHeaders(),
      });
      
      set({ overview: response.data.data });
      return response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch overview';
      setError('overview', errorMsg);
      throw error;
    } finally {
      setLoading('overview', false);
    }
  },

  // Fetch Staff Tracking
  fetchStaffTracking: async (month = null, year = null) => {
    const { setLoading, setError } = get();
    setLoading('staffTracking', true);
    setError('staffTracking', null);

    try {
      const params = {};
      if (month) params.month = month;
      if (year) params.year = year;

      const response = await axios.get(`${API_BASE_URL}${COMMISSION_ENDPOINT}/staff-tracking`, {
        params,
        headers: getAuthHeaders(),
      });
      
      set({ staffTracking: response.data.data.payments });
      return response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch staff tracking';
      setError('staffTracking', errorMsg);
      throw error;
    } finally {
      setLoading('staffTracking', false);
    }
  },

  // Fetch Commission Structure
  fetchCommissionStructure: async () => {
    const { setLoading, setError } = get();
    setLoading('commissionStructure', true);
    setError('commissionStructure', null);

    try {
      const response = await axios.get(`${API_BASE_URL}${COMMISSION_ENDPOINT}/structure`, {
        headers: getAuthHeaders(),
      });
      
      set({ commissionStructure: response.data.data.structures });
      return response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch commission structure';
      setError('commissionStructure', errorMsg);
      throw error;
    } finally {
      setLoading('commissionStructure', false);
    }
  },

  // Update Commission Structure
  updateCommissionStructure: async (structures) => {
    const { setLoading, setError, fetchCommissionStructure } = get();
    setLoading('updatingCommission', true);
    setError('updatingCommission', null);

    try {
      const response = await axios.put(
        `${API_BASE_URL}${COMMISSION_ENDPOINT}/structure`,
        { structures },
        { headers: getAuthHeaders() }
      );
      
      // Refresh the commission structure
      await fetchCommissionStructure();
      
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update commission structure';
      setError('updatingCommission', errorMsg);
      throw error;
    } finally {
      setLoading('updatingCommission', false);
    }
  },

  // Fetch Bonus Structure
  fetchBonusStructure: async () => {
    const { setLoading, setError } = get();
    setLoading('bonusStructure', true);
    setError('bonusStructure', null);

    try {
      const response = await axios.get(`${API_BASE_URL}${COMMISSION_ENDPOINT}/bonus-structure`, {
        headers: getAuthHeaders(),
      });
      
      set({ bonusStructure: response.data.data.structures });
      return response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch bonus structure';
      setError('bonusStructure', errorMsg);
      throw error;
    } finally {
      setLoading('bonusStructure', false);
    }
  },

  // Update Bonus Structure
  updateBonusStructure: async (structures) => {
    const { setLoading, setError, fetchBonusStructure } = get();
    setLoading('updatingBonus', true);
    setError('updatingBonus', null);

    try {
      const response = await axios.put(
        `${API_BASE_URL}${COMMISSION_ENDPOINT}/bonus-structure`,
        { structures },
        { headers: getAuthHeaders() }
      );
      
      // Refresh the bonus structure
      await fetchBonusStructure();
      
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update bonus structure';
      setError('updatingBonus', errorMsg);
      throw error;
    } finally {
      setLoading('updatingBonus', false);
    }
  },

  // Fetch Payment History
  fetchPaymentHistory: async (params = {}) => {
    const { setLoading, setError, filters, pagination } = get();
    setLoading('paymentHistory', true);
    setError('paymentHistory', null);

    try {
      const queryParams = {
        page: params.page || pagination.page,
        limit: params.limit || pagination.limit,
        ...filters,
        ...params,
      };

      // Remove null/undefined values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === null || queryParams[key] === undefined || queryParams[key] === '') {
          delete queryParams[key];
        }
      });

      const response = await axios.get(`${API_BASE_URL}${COMMISSION_ENDPOINT}/payment-history`, {
        params: queryParams,
        headers: getAuthHeaders(),
      });
      
      set({ 
        paymentHistory: response.data.data.payments,
        pagination: response.data.data.pagination,
      });
      
      return response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch payment history';
      setError('paymentHistory', errorMsg);
      throw error;
    } finally {
      setLoading('paymentHistory', false);
    }
  },

  // Calculate Commissions
  calculateCommissions: async (month, year) => {
    const { setLoading, setError } = get();
    setLoading('calculating', true);
    setError('calculating', null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}${COMMISSION_ENDPOINT}/calculate`,
        { month, year },
        { headers: getAuthHeaders() }
      );
      
      set({ calculationResult: response.data.data });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to calculate commissions';
      setError('calculating', errorMsg);
      throw error;
    } finally {
      setLoading('calculating', false);
    }
  },

  // Mark Payment as Paid
  markPaymentAsPaid: async (paymentId, notes = '') => {
    const { setLoading, setError, fetchPaymentHistory } = get();
    setLoading('markingPaid', true);
    setError('markingPaid', null);

    try {
      const response = await axios.put(
        `${API_BASE_URL}${COMMISSION_ENDPOINT}/payment/${paymentId}/mark-paid`,
        { notes },
        { headers: getAuthHeaders() }
      );
      
      // Refresh payment history
      await fetchPaymentHistory();
      
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to mark payment as paid';
      setError('markingPaid', errorMsg);
      throw error;
    } finally {
      setLoading('markingPaid', false);
    }
  },

  // Pagination helpers
  setPage: (page) =>
    set((state) => ({
      pagination: { ...state.pagination, page },
    })),

  setLimit: (limit) =>
    set((state) => ({
      pagination: { ...state.pagination, limit, page: 1 },
    })),

  nextPage: () => {
    const { pagination, fetchPaymentHistory } = get();
    if (pagination.page < pagination.pages) {
      const newPage = pagination.page + 1;
      set((state) => ({
        pagination: { ...state.pagination, page: newPage },
      }));
      fetchPaymentHistory({ page: newPage });
    }
  },

  previousPage: () => {
    const { pagination, fetchPaymentHistory } = get();
    if (pagination.page > 1) {
      const newPage = pagination.page - 1;
      set((state) => ({
        pagination: { ...state.pagination, page: newPage },
      }));
      fetchPaymentHistory({ page: newPage });
    }
  },

  // Reset store
  reset: () =>
    set({
      overview: null,
      staffTracking: [],
      commissionStructure: [],
      bonusStructure: [],
      paymentHistory: [],
      calculationResult: null,
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
      },
      filters: {
        search: '',
        status: '',
        startDate: null,
        endDate: null,
        month: null,
        year: null,
      },
      loading: {
        overview: false,
        staffTracking: false,
        commissionStructure: false,
        bonusStructure: false,
        paymentHistory: false,
        calculating: false,
        markingPaid: false,
        updatingCommission: false,
        updatingBonus: false,
      },
      errors: {
        overview: null,
        staffTracking: null,
        commissionStructure: null,
        bonusStructure: null,
        paymentHistory: null,
        calculating: null,
        markingPaid: null,
        updatingCommission: null,
        updatingBonus: null,
      },
    }),
}));

export default useCommissionStore;