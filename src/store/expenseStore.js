// store/expenseStore.js
import { create } from 'zustand';
import axios from 'axios';

// For Next.js, use NEXT_PUBLIC_ prefix for client-side env variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const useExpenseStore = create((set, get) => ({
  // State
  expenses: [],
  currentExpense: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  filters: {
    status: null,
    category: null,
    startDate: null,
    endDate: null
  },
  loading: {
    expenses: false,
    currentExpense: false,
    create: false,
    update: false,
    delete: false,
    export: false
  },
  errors: {
    expenses: null,
    currentExpense: null,
    create: null,
    update: null,
    delete: null,
    export: null
  },

  // Get token from localStorage
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Set filters
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }));
  },

  // Clear filters
  clearFilters: () => {
    set({
      filters: {
        status: null,
        category: null,
        startDate: null,
        endDate: null
      }
    });
  },

  // Fetch All Expenses (with pagination and filters)
  fetchExpenses: async (params = {}) => {
    const token = get().getToken();
    const currentFilters = get().filters;
    const currentPagination = get().pagination;

    set((state) => ({
      loading: { ...state.loading, expenses: true },
      errors: { ...state.errors, expenses: null }
    }));

    try {
      const queryParams = {
        page: params.page || currentPagination.page,
        limit: params.limit || currentPagination.limit,
        ...(params.status || currentFilters.status) && { status: params.status || currentFilters.status },
        ...(params.category || currentFilters.category) && { category: params.category || currentFilters.category },
        ...(params.startDate || currentFilters.startDate) && { startDate: params.startDate || currentFilters.startDate },
        ...(params.endDate || currentFilters.endDate) && { endDate: params.endDate || currentFilters.endDate }
      };

      const response = await axios.get(`${API_BASE_URL}/expenses`, {
        params: queryParams,
        headers: { 'Authorization': `Bearer ${token}` }
      });

      set((state) => ({
        expenses: response.data.data,
        pagination: response.data.pagination,
        loading: { ...state.loading, expenses: false }
      }));

      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      set((state) => ({
        loading: { ...state.loading, expenses: false },
        errors: { ...state.errors, expenses: errorMsg }
      }));
      throw error;
    }
  },

  // Fetch Single Expense by ID
  fetchExpenseById: async (expenseId) => {
    const token = get().getToken();

    set((state) => ({
      loading: { ...state.loading, currentExpense: true },
      errors: { ...state.errors, currentExpense: null }
    }));

    try {
      const response = await axios.get(`${API_BASE_URL}/expenses/${expenseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      set((state) => ({
        currentExpense: response.data.data,
        loading: { ...state.loading, currentExpense: false }
      }));

      return response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      set((state) => ({
        loading: { ...state.loading, currentExpense: false },
        errors: { ...state.errors, currentExpense: errorMsg }
      }));
      throw error;
    }
  },

  // Create New Expense
  createExpense: async (expenseData) => {
    const token = get().getToken();

    set((state) => ({
      loading: { ...state.loading, create: true },
      errors: { ...state.errors, create: null }
    }));

    try {
      const payload = {
        category: expenseData.category,
        description: expenseData.description,
        amount: expenseData.amount,
        ...(expenseData.expenseDate && { expenseDate: expenseData.expenseDate })
      };

      const response = await axios.post(`${API_BASE_URL}/expenses`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      set((state) => ({
        loading: { ...state.loading, create: false }
      }));

      // Refresh expenses list after creation
      get().fetchExpenses();

      return response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      set((state) => ({
        loading: { ...state.loading, create: false },
        errors: { ...state.errors, create: errorMsg }
      }));
      throw error;
    }
  },

  // Update Expense
  updateExpense: async (expenseId, updateData, ) => {
    const token = get().getToken();

    set((state) => ({
      loading: { ...state.loading, update: true },
      errors: { ...state.errors, update: null }
    }));

    try {
      const response = await axios.put(
        `${API_BASE_URL}/expenses/${expenseId}`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      set((state) => ({
        loading: { ...state.loading, update: false },
        currentExpense: response.data.data
      }));

      // Refresh expenses list after update
      get().fetchExpenses();

      return response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      set((state) => ({
        loading: { ...state.loading, update: false },
        errors: { ...state.errors, update: errorMsg }
      }));
      throw error;
    }
  },

  // Approve Expense
  approveExpense: async (expenseId) => {
    return get().updateExpense(expenseId, { status: 'Approved' });
  },

  // Reject Expense
  rejectExpense: async (expenseId, rejectionReason) => {
    if (!rejectionReason) {
      throw new Error('Rejection reason is required');
    }
    return get().updateExpense(expenseId, {
      status: 'Rejected',
      rejectionReason
    });
  },

  // Delete Expense
  deleteExpense: async (expenseId) => {
    const token = get().getToken();

    set((state) => ({
      loading: { ...state.loading, delete: true },
      errors: { ...state.errors, delete: null }
    }));

    try {
      const response = await axios.delete(`${API_BASE_URL}/expenses/${expenseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      set((state) => ({
        loading: { ...state.loading, delete: false }
      }));

      // Refresh expenses list after deletion
      get().fetchExpenses();

      return response.data.message;
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      set((state) => ({
        loading: { ...state.loading, delete: false },
        errors: { ...state.errors, delete: errorMsg }
      }));
      throw error;
    }
  },

  // Export Expenses
  exportExpenses: async (filterParams = {}) => {
    const token = get().getToken();
    const currentFilters = get().filters;

    set((state) => ({
      loading: { ...state.loading, export: true },
      errors: { ...state.errors, export: null }
    }));

    try {
      const queryParams = {
        ...(filterParams.status || currentFilters.status) && { status: filterParams.status || currentFilters.status },
        ...(filterParams.category || currentFilters.category) && { category: filterParams.category || currentFilters.category },
        ...(filterParams.startDate || currentFilters.startDate) && { startDate: filterParams.startDate || currentFilters.startDate },
        ...(filterParams.endDate || currentFilters.endDate) && { endDate: filterParams.endDate || currentFilters.endDate }
      };

      const response = await axios.get(`${API_BASE_URL}/expenses/export`, {
        params: queryParams,
        headers: { 'Authorization': `Bearer ${token}` }
      });

      set((state) => ({
        loading: { ...state.loading, export: false }
      }));

      return response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      set((state) => ({
        loading: { ...state.loading, export: false },
        errors: { ...state.errors, export: errorMsg }
      }));
      throw error;
    }
  },

  // Export to CSV (using Papaparse)
  exportToCSV: async (filterParams = {}, filename = 'expenses.csv') => {
    try {
      const data = await get().exportExpenses(filterParams);
      
      // Dynamic import for Papaparse
      const Papa = (await import('papaparse')).default;
      const csv = Papa.unparse(data);
      
      // Create and download CSV file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw error;
    }
  },

  // Pagination helpers
  nextPage: async () => {
    const { pagination } = get();
    if (pagination.page < pagination.totalPages) {
      await get().fetchExpenses({ page: pagination.page + 1 });
    }
  },

  prevPage: async () => {
    const { pagination } = get();
    if (pagination.page > 1) {
      await get().fetchExpenses({ page: pagination.page - 1 });
    }
  },

  goToPage: async (page) => {
    await get().fetchExpenses({ page });
  },

  setPageSize: async (limit) => {
    set((state) => ({
      pagination: { ...state.pagination, limit, page: 1 }
    }));
    await get().fetchExpenses({ limit, page: 1 });
  },

  // Clear current expense
  clearCurrentExpense: () => {
    set({ currentExpense: null });
  },

  // Clear all errors
  clearErrors: () => {
    set({
      errors: {
        expenses: null,
        currentExpense: null,
        create: null,
        update: null,
        delete: null,
        export: null
      }
    });
  },

  // Reset store
  resetStore: () => {
    set({
      expenses: [],
      currentExpense: null,
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      },
      filters: {
        status: null,
        category: null,
        startDate: null,
        endDate: null
      },
      loading: {
        expenses: false,
        currentExpense: false,
        create: false,
        update: false,
        delete: false,
        export: false
      },
      errors: {
        expenses: null,
        currentExpense: null,
        create: null,
        update: null,
        delete: null,
        export: null
      }
    });
  }
}));