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
  // 🆕 NEW: Lubricant-specific state
  weeklyLubricantSummary: {
    data: [],
    topThree: [],
    period: null,
    totalLubricants: 0,
  },
  dailyLubricantSummary: null,
  monthlyLubricantSummary: {
    data: [],
    topThree: [],
    period: null,
    summary: null,
  },
  lubricantTransactions: [],
  isLoading: false,
  isBackgroundRefreshing: false,
  error: null,
  _pollInterval: null,

  // Fetch cashier dashboard data
  fetchDashboard: async ({ silent = false } = {}) => {
    if (!silent) {
      set({ isLoading: true, error: null });
    }

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
        ...(silent ? {} : { error: errorMessage }),
      });
      console.error('Error fetching cashier dashboard:', error);
      return { success: false, error: errorMessage };
    }
  },

  // 🆕 NEW: Fetch weekly lubricant summary (calendar week: Mon-Sun)
  fetchWeeklyLubricantSummary: async () => {
    set({ isLoading: true, error: null });
    
    try {
      console.log('🔍 Fetching weekly lubricant summary...');
      
      const response = await api.get('/api/lubricant/weekly-summary');

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📊 WEEKLY LUBRICANT SUMMARY');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Period:', response.data.period);
      console.log('Total Lubricants:', response.data.totalLubricants);
      console.log('Top Three:', response.data.topThree);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      set({
        weeklyLubricantSummary: {
          data: response.data.data || [],
          topThree: response.data.topThree || [],
          period: response.data.period,
          totalLubricants: response.data.totalLubricants || 0,
        },
        isLoading: false,
        error: null,
      });

      return { 
        success: true, 
        data: response.data 
      };
    } catch (error) {
      console.error('❌ Error fetching weekly lubricant summary:', error);
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to fetch weekly lubricant summary';
      set({
        isLoading: false,
        error: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  },

  // 🆕 NEW: Fetch daily lubricant summary
  fetchDailyLubricantSummary: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.get('/api/lubricant/daily-summary');

      console.log('📅 Daily Lubricant Summary:', response.data);

      set({
        dailyLubricantSummary: response.data.summary,
        isLoading: false,
        error: null,
      });

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to fetch daily lubricant summary';
      set({
        isLoading: false,
        error: errorMessage,
      });
      console.error('Error fetching daily lubricant summary:', error);
      return { success: false, error: errorMessage };
    }
  },

  // 🆕 NEW: Fetch monthly lubricant summary
  fetchMonthlyLubricantSummary: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.get('/api/lubricant/monthly-summary');

      console.log('📆 Monthly Lubricant Summary:', response.data);

      set({
        monthlyLubricantSummary: {
          data: response.data.data || [],
          topThree: response.data.topThree || [],
          period: response.data.period,
          summary: response.data.summary,
        },
        isLoading: false,
        error: null,
      });

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to fetch monthly lubricant summary';
      set({
        isLoading: false,
        error: errorMessage,
      });
      console.error('Error fetching monthly lubricant summary:', error);
      return { success: false, error: errorMessage };
    }
  },

  // 🆕 NEW: Fetch all lubricant transactions
  fetchLubricantTransactions: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.get('/api/lubricant/transactions');

      set({
        lubricantTransactions: response.data.data || [],
        isLoading: false,
        error: null,
      });

      return { 
        success: true, 
        data: response.data.data,
        total: response.data.total
      };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to fetch lubricant transactions';
      set({
        isLoading: false,
        error: errorMessage,
      });
      console.error('Error fetching lubricant transactions:', error);
      return { success: false, error: errorMessage };
    }
  },

  // Fetch daily attendant sales for reconciliation
  fetchDailySales: async (filters = {}, { silent = false } = {}) => {
    if (silent) {
      set({ isBackgroundRefreshing: true });
    } else {
      set({ isLoading: true, error: null });
    }

    try {
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

      set({
        dailySales: response.data.data || [],
        isLoading: false,
        isBackgroundRefreshing: false,
        error: null,
      });

      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error('❌ API ERROR:', error);

      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.message ||
                          error.message ||
                          'Failed to fetch daily sales';
      set({
        isLoading: false,
        isBackgroundRefreshing: false,
        ...(silent ? {} : { error: errorMessage }),
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

  startPolling: () => {
    if (get()._pollInterval) return;
    const interval = setInterval(() => {
      get().fetchDailySales({ limit: 100 }, { silent: true });
    }, 5000);
    set({ _pollInterval: interval });
  },

  stopPolling: () => {
    const interval = get()._pollInterval;
    if (interval) {
      clearInterval(interval);
      set({ _pollInterval: null });
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
      weeklyLubricantSummary: {
        data: [],
        topThree: [],
        period: null,
        totalLubricants: 0,
      },
      dailyLubricantSummary: null,
      monthlyLubricantSummary: {
        data: [],
        topThree: [],
        period: null,
        summary: null,
      },
      lubricantTransactions: [],
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

// 🆕 NEW: Hook for weekly lubricant summary
export const useWeeklyLubricantSummary = () => {
  const weeklyLubricantSummary = useCashierDashboardStore((state) => state.weeklyLubricantSummary);
  const isLoading = useCashierDashboardStore((state) => state.isLoading);
  const error = useCashierDashboardStore((state) => state.error);
  const fetchWeeklyLubricantSummary = useCashierDashboardStore((state) => state.fetchWeeklyLubricantSummary);

  return { weeklyLubricantSummary, isLoading, error, fetchWeeklyLubricantSummary };
};

// 🆕 NEW: Hook for daily lubricant summary
export const useDailyLubricantSummary = () => {
  const dailyLubricantSummary = useCashierDashboardStore((state) => state.dailyLubricantSummary);
  const isLoading = useCashierDashboardStore((state) => state.isLoading);
  const error = useCashierDashboardStore((state) => state.error);
  const fetchDailyLubricantSummary = useCashierDashboardStore((state) => state.fetchDailyLubricantSummary);

  return { dailyLubricantSummary, isLoading, error, fetchDailyLubricantSummary };
};

// 🆕 NEW: Hook for monthly lubricant summary
export const useMonthlyLubricantSummary = () => {
  const monthlyLubricantSummary = useCashierDashboardStore((state) => state.monthlyLubricantSummary);
  const isLoading = useCashierDashboardStore((state) => state.isLoading);
  const error = useCashierDashboardStore((state) => state.error);
  const fetchMonthlyLubricantSummary = useCashierDashboardStore((state) => state.fetchMonthlyLubricantSummary);

  return { monthlyLubricantSummary, isLoading, error, fetchMonthlyLubricantSummary };
};

// 🆕 NEW: Hook for lubricant transactions
export const useLubricantTransactions = () => {
  const lubricantTransactions = useCashierDashboardStore((state) => state.lubricantTransactions);
  const isLoading = useCashierDashboardStore((state) => state.isLoading);
  const error = useCashierDashboardStore((state) => state.error);
  const fetchLubricantTransactions = useCashierDashboardStore((state) => state.fetchLubricantTransactions);

  return { lubricantTransactions, isLoading, error, fetchLubricantTransactions };
};

// Hook for daily attendant sales
export const useDailySales = () => {
  const dailySales = useCashierDashboardStore((state) => state.dailySales);
  const isLoading = useCashierDashboardStore((state) => state.isLoading);
  const isBackgroundRefreshing = useCashierDashboardStore((state) => state.isBackgroundRefreshing);
  const error = useCashierDashboardStore((state) => state.error);
  const fetchDailySales = useCashierDashboardStore((state) => state.fetchDailySales);
  const reconcileCash = useCashierDashboardStore((state) => state.reconcileCash);
  const startPolling = useCashierDashboardStore((state) => state.startPolling);
  const stopPolling = useCashierDashboardStore((state) => state.stopPolling);

  return { dailySales, isLoading, isBackgroundRefreshing, error, fetchDailySales, reconcileCash, startPolling, stopPolling };
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


// // FILE: @/store/useCashierDashboardStore.js

// import { create } from 'zustand';
// import axios from 'axios';

// // API Base URL - adjust according to your setup
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// // Helper function to get auth token
// const getAuthToken = () => {
//   if (typeof window !== 'undefined') {
//     return localStorage.getItem('token') || sessionStorage.getItem('token');
//   }
//   return null;
// };

// // Create axios instance with default config
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Add auth token to all requests
// api.interceptors.request.use(
//   (config) => {
//     const token = getAuthToken();
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Zustand store for Cashier Dashboard
// export const useCashierDashboardStore = create((set, get) => ({
//   // State
//   dashboardData: null,
//   dailySales: [],
//   reconciliationReport: {
//     data: [],
//     pagination: null,
//   },
//   isLoading: false,
//   error: null,

//   // Fetch cashier dashboard data
//   fetchDashboard: async () => {
//     set({ isLoading: true, error: null });
    
//     try {
//       const response = await api.get('/api/cashier/dashboard');

//       set({
//         dashboardData: response.data.data,
//         isLoading: false,
//         error: null,
//       });

//       return { success: true, data: response.data.data };
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || 
//                           error.response?.data?.message || 
//                           error.message || 
//                           'Failed to fetch dashboard data';
//       set({
//         isLoading: false,
//         error: errorMessage,
//       });
//       console.error('Error fetching cashier dashboard:', error);
//       return { success: false, error: errorMessage };
//     }
//   },

//   // Fetch daily attendant sales for reconciliation
//   fetchDailySales: async (filters = {}) => {
//     set({ isLoading: true, error: null });
    
//     try {
//       console.log('🔍 Fetching daily sales with filters:', filters);
      
//       const response = await api.get('/api/cashier/daily-sales', {
//         params: {
//           page: filters.page,
//           limit: filters.limit || 20,
//           startDate: filters.startDate,
//           endDate: filters.endDate,
//           attendantId: filters.attendantId,
//           status: filters.status,
//         },
//       });

//       // 🔥 EXTENSIVE DEBUG LOGGING
//       console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//       console.log('📡 DAILY SALES API RESPONSE');
//       console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//       console.log('Full Response:', response.data);
//       console.log('Message:', response.data.message);
//       console.log('Data Array Length:', response.data.data?.length);
      
//       if (response.data.data && response.data.data.length > 0) {
//         console.log('\n📋 FIRST SALE ITEM:');
//         console.log(JSON.stringify(response.data.data[0], null, 2));
        
//         console.log('\n🔑 SPECIFIC FIELDS:');
//         console.log('attendant:', response.data.data[0].attendant);
//         console.log('attendant type:', typeof response.data.data[0].attendant);
//         console.log('product:', response.data.data[0].product);
//         console.log('product type:', typeof response.data.data[0].product);
//         console.log('pumpNo:', response.data.data[0].pumpNo);
//         console.log('amount:', response.data.data[0].amount);
//       } else {
//         console.log('⚠️ No data returned from API');
//       }
//       console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

//       set({
//         dailySales: response.data.data || [],
//         isLoading: false,
//         error: null,
//       });

//       return { 
//         success: true, 
//         data: response.data.data, 
//         pagination: response.data.pagination 
//       };
//     } catch (error) {
//       console.error('❌ API ERROR:', error);
//       console.error('Error Response:', error.response?.data);
      
//       const errorMessage = error.response?.data?.error || 
//                           error.response?.data?.message || 
//                           error.message || 
//                           'Failed to fetch daily sales';
//       set({
//         isLoading: false,
//         error: errorMessage,
//       });
//       return { success: false, error: errorMessage };
//     }
//   },

//   // Fetch reconciliation report (all reconciled shifts)
//   fetchReconciliationReport: async (filters = {}) => {
//     set({ isLoading: true, error: null });
    
//     try {
//       const response = await api.get('/api/reconcile', {
//         params: {
//           page: filters.page,
//           limit: filters.limit || 50,
//           status: filters.status,
//           startDate: filters.startDate,
//           endDate: filters.endDate,
//           attendantId: filters.attendantId,
//         },
//       });

//       const formattedData = response.data.data.map(item => ({
//         id: item._id,
//         date: new Date(item.shiftDate).toLocaleDateString('en-US', {
//           month: 'short',
//           day: 'numeric',
//           year: 'numeric'
//         }),
//         attendant: item.attendant?.fullName || 
//                    `${item.attendant?.firstName} ${item.attendant?.lastName}`,
//         pumpNo: item.pumpTitle,
//         product: item.product,
//         shiftType: item.shiftType,
//         litresSold: item.litresSold,
//         pricePerLtr: item.pricePerLtr,
//         expectedAmount: item.expectedAmount,
//         cashReceived: item.cashReceived,
//         discrepancy: item.discrepancy,
//         status: item.status,
//         reconciledBy: item.reconciledBy?.fullName || 
//                       `${item.reconciledBy?.firstName} ${item.reconciledBy?.lastName}`,
//         notes: item.notes,
//         createdAt: item.createdAt,
//       }));

//       set({
//         reconciliationReport: {
//           data: formattedData,
//           pagination: response.data.pagination,
//         },
//         isLoading: false,
//         error: null,
//       });

//       return { 
//         success: true, 
//         data: formattedData, 
//         pagination: response.data.pagination 
//       };
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || 
//                           error.response?.data?.message || 
//                           error.message || 
//                           'Failed to fetch reconciliation report';
//       set({
//         isLoading: false,
//         error: errorMessage,
//       });
//       console.error('Error fetching reconciliation report:', error);
//       return { success: false, error: errorMessage };
//     }
//   },

//   // Reconcile cash for a shift
//   reconcileCash: async (shiftId, cashReceived, notes = '') => {
//     set({ isLoading: true, error: null });
    
//     try {
//       const response = await api.post('/api/reconcile', {
//         shiftId,
//         cashReceived,
//         notes,
//       });

//       get().fetchDailySales();
//       get().fetchReconciliationReport();

//       set({
//         isLoading: false,
//         error: null,
//       });

//       return { success: true, data: response.data.data };
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || 
//                           error.response?.data?.message || 
//                           error.message || 
//                           'Failed to reconcile cash';
//       set({
//         isLoading: false,
//         error: errorMessage,
//       });
//       console.error('Error reconciling cash:', error);
//       return { success: false, error: errorMessage };
//     }
//   },

//   // Update existing reconciliation
//   updateReconciliation: async (reconciliationId, cashReceived, notes = '') => {
//     set({ isLoading: true, error: null });
    
//     try {
//       const response = await api.put(`/api/reconcile/${reconciliationId}`, {
//         cashReceived,
//         notes,
//       });

//       get().fetchDailySales();
//       get().fetchReconciliationReport();

//       set({
//         isLoading: false,
//         error: null,
//       });

//       return { success: true, data: response.data.data };
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || 
//                           error.response?.data?.message || 
//                           error.message || 
//                           'Failed to update reconciliation';
//       set({
//         isLoading: false,
//         error: errorMessage,
//       });
//       console.error('Error updating reconciliation:', error);
//       return { success: false, error: errorMessage };
//     }
//   },

//   // Delete reconciliation
//   deleteReconciliation: async (reconciliationId) => {
//     set({ isLoading: true, error: null });
    
//     try {
//       await api.delete(`/api/reconcile/${reconciliationId}`);

//       get().fetchDailySales();
//       get().fetchReconciliationReport();

//       set({
//         isLoading: false,
//         error: null,
//       });

//       return { success: true };
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || 
//                           error.response?.data?.message || 
//                           error.message || 
//                           'Failed to delete reconciliation';
//       set({
//         isLoading: false,
//         error: errorMessage,
//       });
//       console.error('Error deleting reconciliation:', error);
//       return { success: false, error: errorMessage };
//     }
//   },

//   clearError: () => {
//     set({ error: null });
//   },

//   reset: () => {
//     set({
//       dashboardData: null,
//       dailySales: [],
//       reconciliationReport: {
//         data: [],
//         pagination: null,
//       },
//       isLoading: false,
//       error: null,
//     });
//   },
// }));

// // Hook for cashier dashboard
// export const useCashierDashboard = () => {
//   const dashboardData = useCashierDashboardStore((state) => state.dashboardData);
//   const isLoading = useCashierDashboardStore((state) => state.isLoading);
//   const error = useCashierDashboardStore((state) => state.error);
//   const fetchDashboard = useCashierDashboardStore((state) => state.fetchDashboard);

//   return { dashboardData, isLoading, error, fetchDashboard };
// };

// // Hook for daily attendant sales
// export const useDailySales = () => {
//   const dailySales = useCashierDashboardStore((state) => state.dailySales);
//   const isLoading = useCashierDashboardStore((state) => state.isLoading);
//   const error = useCashierDashboardStore((state) => state.error);
//   const fetchDailySales = useCashierDashboardStore((state) => state.fetchDailySales);
//   const reconcileCash = useCashierDashboardStore((state) => state.reconcileCash);

//   return { dailySales, isLoading, error, fetchDailySales, reconcileCash };
// };

// // Hook for reconciliation report
// export const useReconciliationReport = () => {
//   const reconciliationReport = useCashierDashboardStore((state) => state.reconciliationReport);
//   const isLoading = useCashierDashboardStore((state) => state.isLoading);
//   const error = useCashierDashboardStore((state) => state.error);
//   const fetchReconciliationReport = useCashierDashboardStore((state) => state.fetchReconciliationReport);
//   const updateReconciliation = useCashierDashboardStore((state) => state.updateReconciliation);
//   const deleteReconciliation = useCashierDashboardStore((state) => state.deleteReconciliation);

//   return { 
//     reconciliationReport, 
//     isLoading, 
//     error, 
//     fetchReconciliationReport, 
//     updateReconciliation,
//     deleteReconciliation 
//   };
// };