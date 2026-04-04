// useManagerReportsStore.js
// Zustand store for all manager report state + axios calls in one file.
// Follows the same pattern as your existing stores.

import { create } from 'zustand';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ─── Auth helpers ─────────────────────────────────────────────────────────────
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ─── Client-side search filter for activity logs ──────────────────────────────
const applySearchFilter = (logs = [], search = '') => {
  if (!search.trim()) return logs;
  const q = search.toLowerCase();
  return logs.filter(
    (log) =>
      log.user?.toLowerCase().includes(q) ||
      log.action?.toLowerCase().includes(q) ||
      log.description?.toLowerCase().includes(q)
  );
};

// ─── Default filter values 
const defaultSalesAndCashFilters = { duration: 'thismonth' };
const defaultActivityLogsFilters = { page: 1, limit: 10 };

// ─── Store 
const useManagerReportsStore = create((set, get) => ({

  // ─── State 
  salesOverview: null,
  salesOverviewDuration: 'thismonth',

  cashOverview: null,
  cashOverviewPage: 1,
  cashOverviewLimit: 10,

  salesAndCash: null,
  salesAndCashFilters: { ...defaultSalesAndCashFilters },

  exportResult: null,

  activityLogs: null,
  activityLogsFilters: { ...defaultActivityLogsFilters },
  filteredActivityLogs: [],

  // ─── Loading states 
  // salesOverview : stat cards skeleton (initial page mount only)
  // salesChart    : chart area skeleton (duration dropdown changes in SalesAndProductChart)
  // cashOverview  : cash tab stat cards skeleton
  loading: {
    salesOverview: false,
    salesChart:    false, // ← NEW: isolated to chart/donut area
    cashOverview:  false,
    salesAndCash:  false,
    export:        false,
    activityLogs:  false,
  },

  // ─── Error states 
  errors: {
    salesOverview: null,
    cashOverview:  null,
    salesAndCash:  null,
    export:        null,
    activityLogs:  null,
  },

  // ─── Loading / error helpers  
  setLoading: (key, value) =>
    set((state) => ({ loading: { ...state.loading, [key]: value } })),

  setError: (key, error) =>
    set((state) => ({ errors: { ...state.errors, [key]: error } })),

  clearError: (key) =>
    set((state) => ({ errors: { ...state.errors, [key]: null } })),

  // ─── 1. Sales Overview 
  // GET /api/manager/reports/sales-overview
  //
  // isChartRefetch (boolean, default false):
  //   false → sets loading.salesOverview  (used on initial page mount — skeletons stat cards + chart)
  //   true  → sets loading.salesChart     (used on duration dropdown change — skeletons chart area only)
  
  setSalesOverviewDuration: (duration) => set({ salesOverviewDuration: duration }),

  fetchSalesOverview: async (duration, isChartRefetch = false) => {
    const { setLoading, setError } = get();
    const resolved   = duration ?? get().salesOverviewDuration;
    const loadingKey = isChartRefetch ? 'salesChart' : 'salesOverview';

    setLoading(loadingKey, true);
    setError('salesOverview', null);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/manager/reports/sales-overview`,
        {
          headers: getAuthHeaders(),
          params: { duration: resolved },
        }
      );
      const data = response.data.data;
      set({ salesOverview: data, salesOverviewDuration: resolved });
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to fetch sales overview';
      setError('salesOverview', msg);
      throw error;
    } finally {
      setLoading(loadingKey, false);
    }
  },

  // ─── 2. Cash Overview 
  // GET /api/manager/reports/cash-overview
  
  setCashOverviewPage:  (page)  => set({ cashOverviewPage: page }),
  setCashOverviewLimit: (limit) => set({ cashOverviewLimit: limit }),

  fetchCashOverview: async (page, limit) => {
    const { setLoading, setError } = get();
    const resolvedPage  = page  ?? get().cashOverviewPage;
    const resolvedLimit = limit ?? get().cashOverviewLimit;

    setLoading('cashOverview', true);
    setError('cashOverview', null);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/manager/reports/cash-overview`,
        {
          headers: getAuthHeaders(),
          params: { page: resolvedPage, limit: resolvedLimit },
        }
      );
      const data = response.data.data;
      set({ cashOverview: data, cashOverviewPage: resolvedPage, cashOverviewLimit: resolvedLimit });
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to fetch cash overview';
      setError('cashOverview', msg);
      throw error;
    } finally {
      setLoading('cashOverview', false);
    }
  },

  // ─── 3. Sales & Cash Combined 
  // GET /api/manager/reports/sales-and-cash
  
  setSalesAndCashFilters: (filters) =>
    set((state) => ({
      salesAndCashFilters: { ...state.salesAndCashFilters, ...filters },
    })),

  resetSalesAndCashFilters: () =>
    set({ salesAndCashFilters: { ...defaultSalesAndCashFilters } }),

  fetchSalesAndCash: async (filters) => {
    const { setLoading, setError } = get();
    const merged = { ...get().salesAndCashFilters, ...filters };

    setLoading('salesAndCash', true);
    setError('salesAndCash', null);

    try {
      const params = {};
      if (merged.duration)    params.duration    = merged.duration;
      if (merged.startDate)   params.startDate   = merged.startDate;
      if (merged.endDate)     params.endDate     = merged.endDate;
      if (merged.pumpNumber)  params.pumpNumber  = merged.pumpNumber;
      if (merged.role)        params.role        = merged.role;
      if (merged.productType) params.productType = merged.productType;
      if (merged.shiftType)   params.shiftType   = merged.shiftType;

      const response = await axios.get(
        `${API_BASE_URL}/api/manager/reports/sales-and-cash`,
        { headers: getAuthHeaders(), params }
      );
      const data = response.data.data;
      set({ salesAndCash: data, salesAndCashFilters: merged });
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to fetch sales and cash report';
      setError('salesAndCash', msg);
      throw error;
    } finally {
      setLoading('salesAndCash', false);
    }
  },

  // ─── 4. Export Report (JSON) ──────────────────────────────────────────────────
  // POST /api/manager/reports/export  { format: "json" }
  // ─────────────────────────────────────────────────────────────────────────────
  exportReport: async (params) => {
    const { setLoading, setError } = get();

    setLoading('export', true);
    setError('export', null);
    set({ exportResult: null });

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/manager/reports/export`,
        { ...params, format: 'json' },
        { headers: getAuthHeaders() }
      );
      const result = response.data;
      set({ exportResult: result });
      return result;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to export report';
      setError('export', msg);
      throw error;
    } finally {
      setLoading('export', false);
    }
  },

  // ─── 5. Download Report CSV ───────────────────────────────────────────────────
  // POST /api/manager/reports/export  { format: "csv" }
  // ─────────────────────────────────────────────────────────────────────────────
  downloadReportCsv: async (params, filename) => {
    const { setLoading, setError } = get();

    setLoading('export', true);
    setError('export', null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/manager/reports/export`,
        { ...params, format: 'csv' },
        { headers: getAuthHeaders(), responseType: 'blob' }
      );

      const disposition = response.headers['content-disposition'] || '';
      const match = disposition.match(/filename="?([^"]+)"?/);
      const downloadName = filename ?? match?.[1] ?? `${params.reportType}_report.csv`;

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', downloadName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to download CSV';
      setError('export', msg);
      throw error;
    } finally {
      setLoading('export', false);
    }
  },

  clearExportResult: () => set({ exportResult: null }),

  // ─── 6. Activity Logs ─────────────────────────────────────────────────────────
  // GET /api/manager/activity-logs
  // ─────────────────────────────────────────────────────────────────────────────
  setActivityLogsFilters: (filters) =>
    set((state) => {
      const updated = { ...state.activityLogsFilters, ...filters };
      const filtered = applySearchFilter(state.activityLogs?.logs ?? [], updated.search);
      return { activityLogsFilters: updated, filteredActivityLogs: filtered };
    }),

  resetActivityLogsFilters: () =>
    set((state) => ({
      activityLogsFilters: { ...defaultActivityLogsFilters },
      filteredActivityLogs: state.activityLogs?.logs ?? [],
    })),

  fetchActivityLogs: async (filters) => {
    const { setLoading, setError } = get();
    const merged = { ...get().activityLogsFilters, ...filters };

    setLoading('activityLogs', true);
    setError('activityLogs', null);

    try {
      const params = { page: merged.page ?? 1, limit: merged.limit ?? 10 };
      if (merged.startDate) params.startDate = merged.startDate;
      if (merged.endDate)   params.endDate   = merged.endDate;
      if (merged.role)      params.role      = merged.role;
      if (merged.status)    params.status    = merged.status;

      const response = await axios.get(
        `${API_BASE_URL}/api/manager/activity-logs`,
        { headers: getAuthHeaders(), params }
      );
      const data = response.data.data;
      const filtered = applySearchFilter(data.logs, merged.search);
      set({ activityLogs: data, filteredActivityLogs: filtered, activityLogsFilters: merged });
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to fetch activity logs';
      setError('activityLogs', msg);
      throw error;
    } finally {
      setLoading('activityLogs', false);
    }
  },

  // ─── Reset entire store ───────────────────────────────────────────────────────
  reset: () =>
    set({
      salesOverview:         null,
      salesOverviewDuration: 'thismonth',
      cashOverview:          null,
      cashOverviewPage:      1,
      cashOverviewLimit:     10,
      salesAndCash:          null,
      salesAndCashFilters:   { ...defaultSalesAndCashFilters },
      exportResult:          null,
      activityLogs:          null,
      activityLogsFilters:   { ...defaultActivityLogsFilters },
      filteredActivityLogs:  [],
      loading: {
        salesOverview: false,
        salesChart:    false,
        cashOverview:  false,
        salesAndCash:  false,
        export:        false,
        activityLogs:  false,
      },
      errors: {
        salesOverview: null,
        cashOverview:  null,
        salesAndCash:  null,
        export:        null,
        activityLogs:  null,
      },
    }),
}));

export default useManagerReportsStore;