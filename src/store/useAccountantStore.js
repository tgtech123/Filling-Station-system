import { create } from 'zustand';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const ACCOUNTANT_ENDPOINT = '/api/accountant';

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

const useAccountantStore = create((set, get) => ({
  // State
  dashboard: null,
  reconciledSales: [],
  incomeStatement: null,
  balanceSheet: null,
  cashflow: null,
  keyRatios: null,
  profitLoss: null,
  incomeReport: null,
  
  // Pagination & Filters
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  
  filters: {
    search: '',
    shiftType: '',
    status: '',
    startDate: null,
    endDate: null,
    attendantId: null,
  },

  // Loading states
  loading: {
    dashboard: false,
    reconciledSales: false,
    incomeStatement: false,
    balanceSheet: false,
    cashflow: false,
    keyRatios: false,
    profitLoss: false,
    incomeReport: false,
  },

  // Error states
  errors: {
    dashboard: null,
    reconciledSales: null,
    incomeStatement: null,
    balanceSheet: null,
    cashflow: null,
    keyRatios: null,
    profitLoss: null,
    incomeReport: null,
    shiftDetails: null,
  },

  // Shift details state
  shiftDetails: null,

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
        shiftType: '',
        status: '',
        startDate: null,
        endDate: null,
        attendantId: null,
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
      },
    }),

  // Fetch Dashboard Data
  fetchDashboard: async (duration = 'today') => {
    const { setLoading, setError } = get();
    setLoading('dashboard', true);
    setError('dashboard', null);

    try {
      const response = await axios.get(`${API_BASE_URL}${ACCOUNTANT_ENDPOINT}/dashboard`, {
        params: { duration },
        headers: getAuthHeaders(),
      });
      
      set({ dashboard: response.data.data });
      return response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch dashboard';
      setError('dashboard', errorMsg);
      throw error;
    } finally {
      setLoading('dashboard', false);
    }
  },

  // Fetch Audited Reconciled Sales
  fetchReconciledSales: async (params = {}) => {
    const { setLoading, setError, filters, pagination } = get();
    setLoading('reconciledSales', true);
    setError('reconciledSales', null);

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

      const response = await axios.get(`${API_BASE_URL}${ACCOUNTANT_ENDPOINT}/audited-reconciled-sales`, {
        params: queryParams,
        headers: getAuthHeaders(),
      });
      
      set({ 
        reconciledSales: response.data.data.reconciliations,
        pagination: response.data.data.pagination,
      });
      
      return response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch reconciled sales';
      setError('reconciledSales', errorMsg);
      throw error;
    } finally {
      setLoading('reconciledSales', false);
    }
  },

  
 // Fixed Fetch Income Statement function
// Fetch Income Statement
fetchIncomeStatement: async (startDate, endDate, compareStartDate = null, compareEndDate = null) => {
  const { setLoading, setError } = get();
  setLoading('incomeStatement', true);
  setError('incomeStatement', null);

  try {
    const params = { startDate, endDate };
    if (compareStartDate && compareEndDate) {
      params.compareStartDate = compareStartDate;
      params.compareEndDate = compareEndDate;
    }

    // ✅ FIXED: Added parentheses after axios.get
    const response = await axios.get(`${API_BASE_URL}${ACCOUNTANT_ENDPOINT}/financial-statement/income-statement`, {
      params,
      headers: getAuthHeaders(),
    });
    
    set({ incomeStatement: response.data.data });
    return response.data.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch income statement';
    setError('incomeStatement', errorMsg);
    console.error('Income Statement Error:', error.response?.data || error);
    throw error;
  } finally {
    setLoading('incomeStatement', false);
  }
},

  // Fetch Balance Sheet
  fetchBalanceSheet: async (startDate, endDate) => {
    const { setLoading, setError } = get();
    setLoading('balanceSheet', true);
    setError('balanceSheet', null);

    try {
      const response = await axios.get(`${API_BASE_URL}${ACCOUNTANT_ENDPOINT}/financial-statement/balance-sheet`, {
        params: { startDate, endDate },
        headers: getAuthHeaders(),
      });
      
      set({ balanceSheet: response.data.data });
      return response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch balance sheet';
      setError('balanceSheet', errorMsg);
      throw error;
    } finally {
      setLoading('balanceSheet', false);
    }
  },

  // Fetch Cashflow
  fetchCashflow: async (duration = 'today') => {
    const { setLoading, setError } = get();
    setLoading('cashflow', true);
    setError('cashflow', null);

    try {
      const response = await axios.get(`${API_BASE_URL}${ACCOUNTANT_ENDPOINT}/financial-statement/cashflow`, {
        params: { duration },
        headers: getAuthHeaders(),
      });
      
      set({ cashflow: response.data.data });
      return response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch cashflow';
      setError('cashflow', errorMsg);
      throw error;
    } finally {
      setLoading('cashflow', false);
    }
  },

  // Fetch Key Ratios
  fetchKeyRatios: async (startDate, endDate) => {
    const { setLoading, setError } = get();
    setLoading('keyRatios', true);
    setError('keyRatios', null);

    try {
      const response = await axios.get(`${API_BASE_URL}${ACCOUNTANT_ENDPOINT}/financial-statement/key-ratios`, {
        params: { startDate, endDate },
        headers: getAuthHeaders(),
      });
      
      set({ keyRatios: response.data.data });
      return response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch key ratios';
      setError('keyRatios', errorMsg);
      throw error;
    } finally {
      setLoading('keyRatios', false);
    }
  },

  // Fetch Profit & Loss
  fetchProfitLoss: async (duration = 'lastquarter') => {
    const { setLoading, setError } = get();
    setLoading('profitLoss', true);
    setError('profitLoss', null);

    try {
      const response = await axios.get(`${API_BASE_URL}${ACCOUNTANT_ENDPOINT}/profit-loss`, {
        params: { duration },
        headers: getAuthHeaders(),
      });
      
      set({ profitLoss: response.data.data });
      return response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch profit & loss';
      setError('profitLoss', errorMsg);
      throw error;
    } finally {
      setLoading('profitLoss', false);
    }
  },

  // Fetch Income Report
  fetchIncomeReport: async (duration = 'thismonth') => {
    const { setLoading, setError } = get();
    setLoading('incomeReport', true);
    setError('incomeReport', null);

    try {
      const response = await axios.get(`${API_BASE_URL}${ACCOUNTANT_ENDPOINT}/income`, {
        params: { duration },
        headers: getAuthHeaders(),
      });
      
      set({ incomeReport: response.data.data });
      return response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch income report';
      setError('incomeReport', errorMsg);
      throw error;
    } finally {
      setLoading('incomeReport', false);
    }
  },

  // Fetch Single Shift Details
  fetchShiftDetails: async (shiftId) => {
    const { setLoading, setError } = get();
    setLoading('shiftDetails', true);
    setError('shiftDetails', null);

    try {
      const response = await axios.get(`${API_BASE_URL}/api/shift/${shiftId}`, {
        headers: getAuthHeaders(),
      });
      
      set({ shiftDetails: response.data.data || response.data });
      return response.data.data || response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch shift details';
      setError('shiftDetails', errorMsg);
      throw error;
    } finally {
      setLoading('shiftDetails', false);
    }
  },

  // Clear shift details
  clearShiftDetails: () => set({ shiftDetails: null }),

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
    const { pagination, fetchReconciledSales } = get();
    if (pagination.page < pagination.pages) {
      const newPage = pagination.page + 1;
      set((state) => ({
        pagination: { ...state.pagination, page: newPage },
      }));
      fetchReconciledSales({ page: newPage });
    }
  },

  previousPage: () => {
    const { pagination, fetchReconciledSales } = get();
    if (pagination.page > 1) {
      const newPage = pagination.page - 1;
      set((state) => ({
        pagination: { ...state.pagination, page: newPage },
      }));
      fetchReconciledSales({ page: newPage });
    }
  },

  // Reset store
  reset: () =>
    set({
      dashboard: null,
      reconciledSales: [],
      incomeStatement: null,
      balanceSheet: null,
      cashflow: null,
      keyRatios: null,
      profitLoss: null,
      incomeReport: null,
      shiftDetails: null,
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
      },
      filters: {
        search: '',
        shiftType: '',
        status: '',
        startDate: null,
        endDate: null,
        attendantId: null,
      },
      loading: {
        dashboard: false,
        reconciledSales: false,
        incomeStatement: false,
        balanceSheet: false,
        cashflow: false,
        keyRatios: false,
        profitLoss: false,
        incomeReport: false,
        shiftDetails: false,
      },
      errors: {
        dashboard: null,
        reconciledSales: null,
        incomeStatement: null,
        balanceSheet: null,
        cashflow: null,
        keyRatios: null,
        profitLoss: null,
        incomeReport: null,
        shiftDetails: null,
      },
    }),
}));

export default useAccountantStore;