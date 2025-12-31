import { create } from 'zustand';
import axios from 'axios';

// Get base URL from environment variable or use default
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/supervisor';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const useSupervisorStore = create((set, get) => ({
  // State
  dashboard: null,
  pendingShifts: [],
  approvedShifts: [],
  attendantDirectory: null,
  scheduledAttendants: null,
  scheduledAttendantsByType: null,
  salesOverview: null,
  cashOverview: null,
  activityLogs: null,
  dipReadings: null,
  dipReadingHistory: null,
  pumpPerformance: null,
  staffPerformance: null,
  staffDetailedPerformance: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // 1. Dashboard
  fetchDashboard: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/dashboard');
      set({ dashboard: response.data.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      throw error;
    }
  },

  // 2. Shift Approval
  fetchPendingShifts: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/shift-approval/pending',  { params } );
      set({
        pendingShifts: response.data.data.shifts,
        pagination: response.data.data.pagination,
        loading: false,
      });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      throw error;
    }
  },

  fetchApprovedShifts: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/shift-approval/approved', params );
      set({
        approvedShifts: response.data.data.shifts,
        pagination: response.data.data.pagination,
        loading: false,
      });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      throw error;
    }
  },

 approveShift: async (shiftId, data) => {
  try {
    set({ loading: true, error: null });
    
    // Debug logs
    console.log('Approving shift:', shiftId);
    console.log('Approval data:', data);
    console.log('Full URL:', `/shift-approval/${shiftId}/approve`);
    
    const response = await api.post(`/shift-approval/${shiftId}/approve`, data);
    set({ loading: false });
    await get().fetchPendingShifts();
    return response.data;
  } catch (error) {
    console.error('Approval error:', error.response?.data); // See full error
    set({ error: error.response?.data?.message || error.message, loading: false });
    throw error;
  }
},

  // 3. Schedule Shift
  fetchAttendantDirectory: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/schedule/attendant-directory', { params });
      set({ attendantDirectory: response.data.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      throw error;
    }
  },

  fetchScheduledAttendants: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/schedule/scheduled-attendants', { params });
      set({ scheduledAttendants: response.data.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      throw error;
    }
  },

  fetchScheduledAttendantsByType: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/schedule/scheduled-attendants-by-type');
      set({ scheduledAttendantsByType: response.data.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      throw error;
    }
  },

  scheduleAttendant: async (params) => {
  try {
    set({ loading: true, error: null });
    const response = await api.post("/schedule/attendant", params); 
    set({ loading: false });
    // Refresh scheduled attendants after scheduling
    await get().fetchScheduledAttendants();
    return response.data;
  } catch (error) {
    set({ error: error.response?.data?.message || error.message, loading: false });
    throw error;
  }
},

  // 4. Sales & Cash Report
  fetchSalesOverview: async (params = { duration: 'thismonth' }) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/reports/sales-overview', { params });
      set({ salesOverview: response.data.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      throw error;
    }
  },

  fetchCashOverview: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/reports/cash-overview', { params });
      set({
        cashOverview: response.data.data,
        pagination: response.data.data.pagination,
        loading: false,
      });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      throw error;
    }
  },

  exportReport: async (data) => {
    try {
      set({ loading: true, error: null });
      const response = await api.post('/reports/export', data);
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      throw error;
    }
  },

  // 5. Activity Logs
  fetchActivityLogs: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/activity-logs', { params });
      set({
        activityLogs: response.data.data,
        pagination: response.data.data.pagination,
        loading: false,
      });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      throw error;
    }
  },

  // 6. Dip Reading
  fetchDipReadings: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/dip-reading');
      set({ dipReadings: response.data.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      throw error;
    }
  },

  // submitDipReading: async (data) => {
  //   try {
  //     set({ loading: true, error: null });
  //     const response = await api.post('/dip-reading', data);
  //     set({ loading: false });
  //     // Refresh dip readings after submission
  //     await get().fetchDipReadings();
  //     return response.data;
  //   } catch (error) {
  //     set({ error: error.response?.data?.message || error.message, loading: false });
  //     throw error;
  //   }
  // },
  submitDipReading: async (data) => {
  try {
    set({ loading: true, error: null });
    
    // DEBUG
    console.log('Store: submitDipReading called with:', data);
    
    const response = await api.post('/dip-reading', data);
    
    console.log('Store: Response received:', response.data);
    
    set({ loading: false });
    await get().fetchDipReadings();
    return response.data;
  } catch (error) {
    console.error('Store: Error submitting dip reading:', error.response?.data);
    set({ error: error.response?.data?.message || error.message, loading: false });
    throw error;
  }
},

  fetchDipReadingHistory: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/dip-reading/history', { params });
      set({
        dipReadingHistory: response.data.data,
        pagination: response.data.data.pagination,
        loading: false,
      });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      throw error;
    }
  },

  // 7. Pump Performance
  fetchPumpPerformance: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/pump-performance');
      set({ pumpPerformance: response.data.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      throw error;
    }
  },

  // 8. Staff Performance
  fetchStaffPerformance: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/staff-performance', { params });
      set({
        staffPerformance: response.data.data,
        pagination: response.data.data.pagination,
        loading: false,
      });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      throw error;
    }
  },

  fetchStaffDetailedPerformance: async (staffId, params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get(`/staff-performance/${staffId}`, { params });
      set({ staffDetailedPerformance: response.data.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      throw error;
    }
  },

  // Reset store
  resetStore: () => set({
    dashboard: null,
    pendingShifts: [],
    approvedShifts: [],
    attendantDirectory: null,
    scheduledAttendants: null,
    scheduledAttendantsByType: null,
    salesOverview: null,
    cashOverview: null,
    activityLogs: null,
    dipReadings: null,
    dipReadingHistory: null,
    pumpPerformance: null,
    staffPerformance: null,
    staffDetailedPerformance: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    },
  }),
}));

export default useSupervisorStore;