// store/financialStore.js
import { create } from 'zustand';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const useFinancialStore = create((set, get) => ({
  // State
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
  },

  // Get token from localStorage
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Fetch Financial Overview
  fetchOverview: async () => {
    const token = get().getToken();
    
    set((state) => ({
      loading: { ...state.loading, overview: true },
      errors: { ...state.errors, overview: null }
    }));

    try {
      const response = await axios.get(`${API_BASE_URL}/financial/overview`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

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
    const token = get().getToken();
    
    set((state) => ({
      loading: { ...state.loading, revenueBreakdown: true },
      errors: { ...state.errors, revenueBreakdown: null }
    }));

    try {
      const response = await axios.get(
        `${API_BASE_URL}/financial/revenue-breakdown`,
        {
          params: { duration },
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

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
    const token = get().getToken();
    
    set((state) => ({
      loading: { ...state.loading, expenseBreakdown: true },
      errors: { ...state.errors, expenseBreakdown: null }
    }));

    try {
      const response = await axios.get(
        `${API_BASE_URL}/financial/expense-breakdown`,
        {
          params: { duration },
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

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
    const token = get().getToken();
    
    set((state) => ({
      loading: { ...state.loading, revenueAnalysis: true },
      errors: { ...state.errors, revenueAnalysis: null }
    }));

    try {
      const response = await axios.get(
        `${API_BASE_URL}/financial/revenue-analysis`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

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
    const token = get().getToken();
    
    set((state) => ({
      loading: { ...state.loading, profitMargins: true },
      errors: { ...state.errors, profitMargins: null }
    }));

    try {
      const response = await axios.get(
        `${API_BASE_URL}/financial/profit-margins`,
        {
          params: { duration },
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

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