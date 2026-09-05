import { create } from 'zustand';
import { api, extractApiError } from '@/lib/config';

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
  clearPendingShifts: () => set({ pendingShifts: [] }),

  // 1. Dashboard
  fetchDashboard: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/api/supervisor/dashboard');
      set({ dashboard: response.data.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: extractApiError(error) || error.message, loading: false });
      throw error;
    }
  },

  // 2. Shift Approval
  fetchPendingShifts: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/api/supervisor/shift-approval/pending',  { params } );
      set({
        pendingShifts: response.data.data.shifts,
        pagination: response.data.data.pagination,
        loading: false,
      });
      return response.data;
    } catch (error) {
      set({ error: extractApiError(error) || error.message, loading: false });
      throw error;
    }
  },

  fetchApprovedShifts: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/api/supervisor/shift-approval/approved', { params });
      set({
        approvedShifts: response.data.data.shifts,
        pagination: response.data.data.pagination,
        loading: false,
      });
      return response.data;
    } catch (error) {
      set({ error: extractApiError(error) || error.message, loading: false });
      throw error;
    }
  },

  clearStaleShifts: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.delete('/api/supervisor/shift-approval/clear-stale');
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ error: extractApiError(error) || error.message, loading: false });
      throw error;
    }
  },

 approveShift: async (shiftId, data) => {
  try {
    set({ loading: true, error: null });

    const response = await api.post(`/api/supervisor/shift-approval/${shiftId}/approve`, data);
    // Immediately remove the approved shift from the list so the card disappears at once
    set((s) => ({
      loading: false,
      pendingShifts: s.pendingShifts.filter((shift) => shift._id !== shiftId),
    }));
    await get().fetchPendingShifts();
    await get().fetchApprovedShifts();
    return response.data;
  } catch (error) {
    console.error('Approval error:', error.response?.data); // See full error
    set({ error: extractApiError(error) || error.message, loading: false });
    throw error;
  }
},

  // 3. Schedule Shift
  fetchAttendantDirectory: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/api/supervisor/schedule/attendant-directory', { params });
      set({ attendantDirectory: response.data.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: extractApiError(error) || error.message, loading: false });
      throw error;
    }
  },

  fetchScheduledAttendants: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/api/supervisor/schedule/scheduled-attendants', { params });
      set({ scheduledAttendants: response.data.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: extractApiError(error) || error.message, loading: false });
      throw error;
    }
  },

  fetchScheduledAttendantsByType: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/api/supervisor/schedule/scheduled-attendants-by-type');
      set({ scheduledAttendantsByType: response.data.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: extractApiError(error) || error.message, loading: false });
      throw error;
    }
  },

  scheduleAttendant: async (params) => {
  try {
    set({ loading: true, error: null });
    const response = await api.post("/api/supervisor/schedule/attendant", params);
    set({ loading: false });
    // Refresh both — ScheduledAttendantsCard reads from dashboard.scheduledAttendants
    await get().fetchScheduledAttendants();
    await get().fetchDashboard();
    return response.data;
  } catch (error) {
    set({ error: extractApiError(error) || error.message, loading: false });
    throw error;
  }
},

  // 4. Sales & Cash Report
  fetchSalesOverview: async (params = { duration: 'thismonth' }) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/api/supervisor/reports/sales-overview', { params });
      set({ salesOverview: response.data.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: extractApiError(error) || error.message, loading: false });
      throw error;
    }
  },

  fetchCashOverview: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/api/supervisor/reports/cash-overview', { params });
      set({
        cashOverview: response.data.data,
        pagination: response.data.data.pagination,
        loading: false,
      });
      return response.data;
    } catch (error) {
      set({ error: extractApiError(error) || error.message, loading: false });
      throw error;
    }
  },

  exportReport: async (data) => {
    try {
      set({ loading: true, error: null });
      const response = await api.post('/api/supervisor/reports/export', data);
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ error: extractApiError(error) || error.message, loading: false });
      throw error;
    }
  },

  // 5. Activity Logs
  fetchActivityLogs: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/api/supervisor/activity-logs', { params });
      set({
        activityLogs: response.data.data,
        pagination: response.data.data.pagination,
        loading: false,
      });
      return response.data;
    } catch (error) {
      set({ error: extractApiError(error) || error.message, loading: false });
      throw error;
    }
  },

  // 6. Dip Reading
  fetchDipReadings: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/api/supervisor/dip-reading');
      set({ dipReadings: response.data.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: extractApiError(error) || error.message, loading: false });
      throw error;
    }
  },

  // submitDipReading: async (data) => {
  //   try {
  //     set({ loading: true, error: null });
  //     const response = await api.post('/api/supervisor/dip-reading', data);
  //     set({ loading: false });
  //     // Refresh dip readings after submission
  //     await get().fetchDipReadings();
  //     return response.data;
  //   } catch (error) {
  //     set({ error: extractApiError(error) || error.message, loading: false });
  //     throw error;
  //   }
  // },
  submitDipReading: async (data) => {
  try {
    set({ loading: true, error: null });
    
    const response = await api.post('/api/supervisor/dip-reading', data);
    
    set({ loading: false });
    await get().fetchDipReadings();
    return response.data;
  } catch (error) {
    console.error('Store: Error submitting dip reading:', error.response?.data);
    set({ error: extractApiError(error) || error.message, loading: false });
    throw error;
  }
},

  fetchDipReadingHistory: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/api/supervisor/dip-reading/history', { params });
      set({
        dipReadingHistory: response.data.data,
        pagination: response.data.data.pagination,
        loading: false,
      });
      return response.data;
    } catch (error) {
      set({ error: extractApiError(error) || error.message, loading: false });
      throw error;
    }
  },

  // 7. Pump Performance
  fetchPumpPerformance: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/api/supervisor/pump-performance');
      set({ pumpPerformance: response.data.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: extractApiError(error) || error.message, loading: false });
      throw error;
    }
  },

  // 8. Staff Performance
  fetchStaffPerformance: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/api/supervisor/staff-performance', { params });
      set({
        staffPerformance: response.data.data,
        pagination: response.data.data.pagination,
        loading: false,
      });
      return response.data;
    } catch (error) {
      set({ error: extractApiError(error) || error.message, loading: false });
      throw error;
    }
  },

  fetchStaffDetailedPerformance: async (staffId, params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get(`/api/supervisor/staff-performance/${staffId}`, { params });
      set({ staffDetailedPerformance: response.data.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: extractApiError(error) || error.message, loading: false });
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