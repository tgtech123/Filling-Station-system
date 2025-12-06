// FILE: @/store/useCashierDashboardStore.js

import { create } from 'zustand';
import axios from 'axios';

// API Base URL - adjust according to your setup
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Helper function to get auth token
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }
  return null;
};

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Zustand store for Cashier Dashboard
export const useCashierDashboardStore = create((set, get) => ({
  // State
  dashboardData: null,
  dailySales: [],
  reconciliationReport: {
    data: [],
    pagination: null,
  },
  isLoading: false,
  error: null,

  // Fetch cashier dashboard data
  fetchDashboard: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.get('/api/cashier/dashboard');

      set({
        dashboardData: response.data.data,
        isLoading: false,
        error: null,
      });

      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to fetch dashboard data';
      set({
        isLoading: false,
        error: errorMessage,
      });
      console.error('Error fetching cashier dashboard:', error);
      return { success: false, error: errorMessage };
    }
  },

  // Fetch daily attendant sales for reconciliation
  fetchDailySales: async (filters = {}) => {
    set({ isLoading: true, error: null });
    
    try {
      console.log('🔍 Fetching daily sales with filters:', filters);
      
      const response = await api.get('/api/cashier/daily-sales', {
        params: {
          page: filters.page,
          limit: filters.limit || 20,
          startDate: filters.startDate,
          endDate: filters.endDate,
          attendantId: filters.attendantId,
          status: filters.status,
        },
      });

      // 🔥 EXTENSIVE DEBUG LOGGING
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📡 DAILY SALES API RESPONSE');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Full Response:', response.data);
      console.log('Message:', response.data.message);
      console.log('Data Array Length:', response.data.data?.length);
      
      if (response.data.data && response.data.data.length > 0) {
        console.log('\n📋 FIRST SALE ITEM:');
        console.log(JSON.stringify(response.data.data[0], null, 2));
        
        console.log('\n🔑 SPECIFIC FIELDS:');
        console.log('attendant:', response.data.data[0].attendant);
        console.log('attendant type:', typeof response.data.data[0].attendant);
        console.log('product:', response.data.data[0].product);
        console.log('product type:', typeof response.data.data[0].product);
        console.log('pumpNo:', response.data.data[0].pumpNo);
        console.log('amount:', response.data.data[0].amount);
      } else {
        console.log('⚠️ No data returned from API');
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      set({
        dailySales: response.data.data || [],
        isLoading: false,
        error: null,
      });

      return { 
        success: true, 
        data: response.data.data, 
        pagination: response.data.pagination 
      };
    } catch (error) {
      console.error('❌ API ERROR:', error);
      console.error('Error Response:', error.response?.data);
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to fetch daily sales';
      set({
        isLoading: false,
        error: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  },

  // Fetch reconciliation report (all reconciled shifts)
  fetchReconciliationReport: async (filters = {}) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.get('/api/reconcile', {
        params: {
          page: filters.page,
          limit: filters.limit || 50,
          status: filters.status,
          startDate: filters.startDate,
          endDate: filters.endDate,
          attendantId: filters.attendantId,
        },
      });

      const formattedData = response.data.data.map(item => ({
        id: item._id,
        date: new Date(item.shiftDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        attendant: item.attendant?.fullName || 
                   `${item.attendant?.firstName} ${item.attendant?.lastName}`,
        pumpNo: item.pumpTitle,
        product: item.product,
        shiftType: item.shiftType,
        litresSold: item.litresSold,
        pricePerLtr: item.pricePerLtr,
        expectedAmount: item.expectedAmount,
        cashReceived: item.cashReceived,
        discrepancy: item.discrepancy,
        status: item.status,
        reconciledBy: item.reconciledBy?.fullName || 
                      `${item.reconciledBy?.firstName} ${item.reconciledBy?.lastName}`,
        notes: item.notes,
        createdAt: item.createdAt,
      }));

      set({
        reconciliationReport: {
          data: formattedData,
          pagination: response.data.pagination,
        },
        isLoading: false,
        error: null,
      });

      return { 
        success: true, 
        data: formattedData, 
        pagination: response.data.pagination 
      };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to fetch reconciliation report';
      set({
        isLoading: false,
        error: errorMessage,
      });
      console.error('Error fetching reconciliation report:', error);
      return { success: false, error: errorMessage };
    }
  },

  // Reconcile cash for a shift
  reconcileCash: async (shiftId, cashReceived, notes = '') => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.post('/api/reconcile', {
        shiftId,
        cashReceived,
        notes,
      });

      get().fetchDailySales();
      get().fetchReconciliationReport();

      set({
        isLoading: false,
        error: null,
      });

      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to reconcile cash';
      set({
        isLoading: false,
        error: errorMessage,
      });
      console.error('Error reconciling cash:', error);
      return { success: false, error: errorMessage };
    }
  },

  // Update existing reconciliation
  updateReconciliation: async (reconciliationId, cashReceived, notes = '') => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.put(`/api/reconcile/${reconciliationId}`, {
        cashReceived,
        notes,
      });

      get().fetchDailySales();
      get().fetchReconciliationReport();

      set({
        isLoading: false,
        error: null,
      });

      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to update reconciliation';
      set({
        isLoading: false,
        error: errorMessage,
      });
      console.error('Error updating reconciliation:', error);
      return { success: false, error: errorMessage };
    }
  },

  // Delete reconciliation
  deleteReconciliation: async (reconciliationId) => {
    set({ isLoading: true, error: null });
    
    try {
      await api.delete(`/api/reconcile/${reconciliationId}`);

      get().fetchDailySales();
      get().fetchReconciliationReport();

      set({
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to delete reconciliation';
      set({
        isLoading: false,
        error: errorMessage,
      });
      console.error('Error deleting reconciliation:', error);
      return { success: false, error: errorMessage };
    }
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set({
      dashboardData: null,
      dailySales: [],
      reconciliationReport: {
        data: [],
        pagination: null,
      },
      isLoading: false,
      error: null,
    });
  },
}));

// Hook for cashier dashboard
export const useCashierDashboard = () => {
  const dashboardData = useCashierDashboardStore((state) => state.dashboardData);
  const isLoading = useCashierDashboardStore((state) => state.isLoading);
  const error = useCashierDashboardStore((state) => state.error);
  const fetchDashboard = useCashierDashboardStore((state) => state.fetchDashboard);

  return { dashboardData, isLoading, error, fetchDashboard };
};

// Hook for daily attendant sales
export const useDailySales = () => {
  const dailySales = useCashierDashboardStore((state) => state.dailySales);
  const isLoading = useCashierDashboardStore((state) => state.isLoading);
  const error = useCashierDashboardStore((state) => state.error);
  const fetchDailySales = useCashierDashboardStore((state) => state.fetchDailySales);
  const reconcileCash = useCashierDashboardStore((state) => state.reconcileCash);

  return { dailySales, isLoading, error, fetchDailySales, reconcileCash };
};

// Hook for reconciliation report
export const useReconciliationReport = () => {
  const reconciliationReport = useCashierDashboardStore((state) => state.reconciliationReport);
  const isLoading = useCashierDashboardStore((state) => state.isLoading);
  const error = useCashierDashboardStore((state) => state.error);
  const fetchReconciliationReport = useCashierDashboardStore((state) => state.fetchReconciliationReport);
  const updateReconciliation = useCashierDashboardStore((state) => state.updateReconciliation);
  const deleteReconciliation = useCashierDashboardStore((state) => state.deleteReconciliation);

  return { 
    reconciliationReport, 
    isLoading, 
    error, 
    fetchReconciliationReport, 
    updateReconciliation,
    deleteReconciliation 
  };
};