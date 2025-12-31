import { create } from 'zustand';
import axios from 'axios';

// Configure axios base URL - Make sure it includes /api
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Remove any trailing slash and ensure /api is present
const normalizeBaseURL = (url) => {
  let normalized = url.replace(/\/+$/, ''); // Remove trailing slashes
  if (!normalized.endsWith('/api')) {
    normalized = normalized + '/api';
  }
  return normalized;
};

const NORMALIZED_API_URL = normalizeBaseURL(API_BASE_URL);

console.log('🔧 Report Store API Base URL:', NORMALIZED_API_URL);

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: NORMALIZED_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Add request interceptor to log and add auth
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    
    console.log('📤 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      params: config.params,
      hasToken: !!token,
    });

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('⚠️ No auth token found in localStorage');
    }

    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error logging
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      url: response.config.url,
      status: response.status,
      dataKeys: response.data ? Object.keys(response.data) : [],
    });
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('❌ Request Timeout:', error.message);
    } else if (error.code === 'ERR_NETWORK') {
      console.error('❌ Network Error - Cannot reach server:', {
        message: error.message,
        baseURL: NORMALIZED_API_URL,
        suggestion: 'Check if backend server is running and CORS is configured',
      });
    } else if (error.response) {
      console.error('❌ API Error Response:', {
        url: error.config?.url,
        method: error.config?.method,
        params: error.config?.params,
        status: error.response?.status,
        statusText: error.response?.statusText,
        errorData: error.response?.data,
      });
    } else if (error.request) {
      console.error('❌ No Response Received:', {
        url: error.config?.url,
        method: error.config?.method,
        message: 'Request was made but no response received',
      });
    } else {
      console.error('❌ Request Setup Error:', error.message);
    }
    return Promise.reject(error);
  }
);

const useReportStore = create((set, get) => ({
  // STATE
  reports: [],
  currentReport: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },

  // ACTIONS

  // 1. Generate Sales Report
  generateSalesReport: async (params) => {
    set({ loading: true, error: null });
    try {
      const { startDate, endDate, productType, pumpNo } = params;
      
      // Validate required parameters
      if (!startDate || !endDate) {
        throw new Error('Start date and end date are required');
      }

      // Format dates to YYYY-MM-DD if they're Date objects
      const formatDate = (date) => {
        if (!date) return null;
        if (typeof date === 'string') return date;
        return new Date(date).toISOString().split('T')[0];
      };
      
      // Build query params object, only include defined values
      const queryParams = {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
      };
      
      if (productType) queryParams.productType = productType;
      if (pumpNo) queryParams.pumpNo = pumpNo;
      
      const response = await apiClient.get('/reports/sales', {
        params: queryParams,
      });
      
      set({ 
        currentReport: response.data.data,
        loading: false 
      });
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to generate sales report';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // 2. Generate Cash Reconciliation Report
  generateCashReconciliationReport: async (params) => {
    set({ loading: true, error: null });
    try {
      const { startDate, endDate, status } = params;
      
      if (!startDate || !endDate) {
        throw new Error('Start date and end date are required');
      }

      const formatDate = (date) => {
        if (!date) return null;
        if (typeof date === 'string') return date;
        return new Date(date).toISOString().split('T')[0];
      };
      
      const queryParams = {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
      };
      
      if (status) queryParams.status = status;
      
      const response = await apiClient.get('/reports/cash-reconciliation', {
        params: queryParams,
      });
      
      set({ 
        currentReport: response.data.data,
        loading: false 
      });
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to generate cash reconciliation report';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // 3. Generate Shift Report
  generateShiftReport: async (params) => {
    set({ loading: true, error: null });
    try {
      const { startDate, endDate, shiftType, attendantId } = params;
      
      if (!startDate || !endDate) {
        throw new Error('Start date and end date are required');
      }

      const formatDate = (date) => {
        if (!date) return null;
        if (typeof date === 'string') return date;
        return new Date(date).toISOString().split('T')[0];
      };
      
      const queryParams = {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
      };
      
      if (shiftType) queryParams.shiftType = shiftType;
      if (attendantId) queryParams.attendantId = attendantId;
      
      const response = await apiClient.get('/reports/shifts', {
        params: queryParams,
      });
      
      set({ 
        currentReport: response.data.data,
        loading: false 
      });
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to generate shift report';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // 4. Generate Fuel Inventory Report
  generateFuelInventoryReport: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get('/reports/fuel-inventory');
      
      set({ 
        currentReport: response.data.data,
        loading: false 
      });
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to generate fuel inventory report';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // 5. Generate Staff Performance Report
  generateStaffPerformanceReport: async (params) => {
    set({ loading: true, error: null });
    try {
      const { startDate, endDate, role } = params;
      
      if (!startDate || !endDate) {
        throw new Error('Start date and end date are required');
      }

      const formatDate = (date) => {
        if (!date) return null;
        if (typeof date === 'string') return date;
        return new Date(date).toISOString().split('T')[0];
      };
      
      const queryParams = {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
      };
      
      if (role) queryParams.role = role;
      
      const response = await apiClient.get('/reports/staff-performance', {
        params: queryParams,
      });
      
      set({ 
        currentReport: response.data.data,
        loading: false 
      });
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to generate staff performance report';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // 6. Generate Activity Logs Report
  generateActivityLogsReport: async (params) => {
    set({ loading: true, error: null });
    try {
      const { startDate, endDate } = params;
      
      if (!startDate || !endDate) {
        throw new Error('Start date and end date are required');
      }

      const formatDate = (date) => {
        if (!date) return null;
        if (typeof date === 'string') return date;
        return new Date(date).toISOString().split('T')[0];
      };
      
      const queryParams = {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
      };
      
      const response = await apiClient.get('/reports/activity-logs', {
        params: queryParams,
      });
      
      set({ 
        currentReport: response.data.data,
        loading: false 
      });
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to generate activity logs report';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // 7. Generate Lubricant Inventory Report
  generateLubricantInventoryReport: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get('/reports/lubricant-inventory');
      
      set({ 
        currentReport: response.data.data,
        loading: false 
      });
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to generate lubricant inventory report';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // 8. Get All Reports
  getAllReports: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const { page = 1, limit = 20, reportType } = params;
      
      const queryParams = { page, limit };
      if (reportType) queryParams.reportType = reportType;
      
      const response = await apiClient.get('/reports', {
        params: queryParams,
      });
      
      set({ 
        reports: response.data.data || [],
        pagination: response.data.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
        loading: false 
      });
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch reports';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // 9. Get Report By ID
  getReportById: async (reportId) => {
    set({ loading: true, error: null });
    try {
      if (!reportId) {
        throw new Error('Report ID is required');
      }
      
      const response = await apiClient.get(`/reports/${reportId}`);
      
      set({ 
        currentReport: response.data.data,
        loading: false 
      });
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch report';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // UTILITY ACTIONS

  // Clear current report
  clearCurrentReport: () => {
    set({ currentReport: null, error: null });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Reset store
  resetStore: () => {
    set({
      reports: [],
      currentReport: null,
      loading: false,
      error: null,
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    });
  },

  // Set pagination
  setPagination: (page, limit) => {
    set((state) => ({
      pagination: {
        ...state.pagination,
        page,
        limit,
      },
    }));
  },

  // HELPER METHODS

  // Format date for API (YYYY-MM-DD)
  formatDate: (date) => {
    if (!date) return null;
    if (typeof date === 'string') return date;
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  },

  // Validate date range
  validateDateRange: (startDate, endDate) => {
    if (!startDate || !endDate) {
      return { valid: false, error: 'Both start date and end date are required' };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { valid: false, error: 'Invalid date format' };
    }

    if (start > end) {
      return { valid: false, error: 'Start date cannot be after end date' };
    }

    return { valid: true };
  },

  // Download report as JSON
  downloadReportAsJSON: (reportData, filename) => {
    try {
      const dataStr = JSON.stringify(reportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename || 'report'}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
      throw error;
    }
  },

  // Export report as CSV
  exportReportAsCSV: (data, filename) => {
    try {
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No data to export');
      }

      const headers = Object.keys(data[0] || {}).join(',');
      const rows = data.map(row => 
        Object.values(row).map(val => {
          if (typeof val === 'object' && val !== null) {
            return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
          }
          if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        }).join(',')
      );
      const csv = [headers, ...rows].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename || 'report'}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      throw error;
    }
  },
}));

export default useReportStore;