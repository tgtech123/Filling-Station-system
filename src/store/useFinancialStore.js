// store/financialStore.js
import { create } from 'zustand';
import { api, extractApiError } from '@/lib/config';

export const useFinancialStore = create((set, get) => ({
  // State
  overview: null,
  revenueBreakdown: [],
  expenseBreakdown: [],
  revenueAnalysis: [],
  profitMargins: [],
  taxSummary: null,
  loading: {
    overview: false,
    revenueBreakdown: false,
    expenseBreakdown: false,
    revenueAnalysis: false,
    profitMargins: false,
    taxSummary: false,
  },
  errors: {
    overview: null,
    revenueBreakdown: null,
    expenseBreakdown: null,
    revenueAnalysis: null,
    profitMargins: null,
    taxSummary: null,
  },

  // Fetch Financial Overview
  fetchOverview: async () => {
    set((state) => ({
      loading: { ...state.loading, overview: true },
      errors: { ...state.errors, overview: null }
    }));

    try {
      const response = await api.get(`/api/financial/overview`);

      set((state) => ({
        overview: response.data.data,
        loading: { ...state.loading, overview: false }
      }));

      return response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      set((state) => ({
        loading: { ...state.loading, overview: false },
        errors: { ...state.errors, overview: errorMsg }
      }));
      throw error;
    }
  },

  // Fetch Revenue Breakdown
  fetchRevenueBreakdown: async (duration = 'today') => {
    set((state) => ({
      loading: { ...state.loading, revenueBreakdown: true },
      errors: { ...state.errors, revenueBreakdown: null }
    }));

    try {
      const response = await api.get(`/api/financial/revenue-breakdown`, { params: { duration } });

      set((state) => ({
        revenueBreakdown: response.data.data,
        loading: { ...state.loading, revenueBreakdown: false }
      }));

      return response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      set((state) => ({
        loading: { ...state.loading, revenueBreakdown: false },
        errors: { ...state.errors, revenueBreakdown: errorMsg }
      }));
      throw error;
    }
  },

  // Fetch Expense Breakdown
  fetchExpenseBreakdown: async (duration = 'today') => {
    set((state) => ({
      loading: { ...state.loading, expenseBreakdown: true },
      errors: { ...state.errors, expenseBreakdown: null }
    }));

    try {
      const response = await api.get(`/api/financial/expense-breakdown`, { params: { duration } });

      set((state) => ({
        expenseBreakdown: response.data.data,
        loading: { ...state.loading, expenseBreakdown: false }
      }));

      return response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      set((state) => ({
        loading: { ...state.loading, expenseBreakdown: false },
        errors: { ...state.errors, expenseBreakdown: errorMsg }
      }));
      throw error;
    }
  },

  // Fetch Revenue Analysis
  fetchRevenueAnalysis: async () => {
    set((state) => ({
      loading: { ...state.loading, revenueAnalysis: true },
      errors: { ...state.errors, revenueAnalysis: null }
    }));

    try {
      const response = await api.get(`/api/financial/revenue-analysis`);

      set((state) => ({
        revenueAnalysis: response.data.data,
        loading: { ...state.loading, revenueAnalysis: false }
      }));

      return response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      set((state) => ({
        loading: { ...state.loading, revenueAnalysis: false },
        errors: { ...state.errors, revenueAnalysis: errorMsg }
      }));
      throw error;
    }
  },

  // Fetch Profit Margins
  fetchProfitMargins: async (duration = 'thismonth') => {
    set((state) => ({
      loading: { ...state.loading, profitMargins: true },
      errors: { ...state.errors, profitMargins: null }
    }));

    try {
      const response = await api.get(`/api/financial/profit-margins`, { params: { duration } });

      set((state) => ({
        profitMargins: response.data.data,
        loading: { ...state.loading, profitMargins: false }
      }));

      return response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      set((state) => ({
        loading: { ...state.loading, profitMargins: false },
        errors: { ...state.errors, profitMargins: errorMsg }
      }));
      throw error;
    }
  },

  // Fetch Tax Summary (manager view of accountant-computed tax data)
  fetchTaxSummary: async (startDate, endDate) => {
    set((state) => ({
      loading: { ...state.loading, taxSummary: true },
      errors:  { ...state.errors,  taxSummary: null },
    }));
    try {
      const response = await api.get('/api/manager/tax-report', { params: { startDate, endDate } });
      const data = response.data.data;
      set((state) => ({
        taxSummary: data,
        loading: { ...state.loading, taxSummary: false },
      }));
      return data;
    } catch (error) {
      const errorMsg = extractApiError(error) || error.message;
      set((state) => ({
        loading: { ...state.loading, taxSummary: false },
        errors:  { ...state.errors,  taxSummary: errorMsg },
      }));
    }
  },

  // Clear all errors
  clearErrors: () => {
    set({
      errors: {
        overview: null,
        revenueBreakdown: null,
        expenseBreakdown: null,
        revenueAnalysis: null,
        profitMargins: null
      }
    });
  },

  // Reset store
  resetStore: () => {
    set({
      overview: null,
      revenueBreakdown: [],
      expenseBreakdown: [],
      revenueAnalysis: [],
      profitMargins: [],
      loading: {
        overview: false,
        revenueBreakdown: false,
        expenseBreakdown: false,
        revenueAnalysis: false,
        profitMargins: false
      },
      errors: {
        overview: null,
        revenueBreakdown: null,
        expenseBreakdown: null,
        revenueAnalysis: null,
        profitMargins: null
      }
    });
  }
}));