import { create } from 'zustand';
import { api } from '@/lib/config';

const ACCOUNTANT_ENDPOINT = '/api/accountant';

// ─── Module-level cache (survives re-renders & component unmounts) ────────────
const TTL = {
  dashboard:       5  * 60 * 1000,  // 5 min
  reconciledSales: 5  * 60 * 1000,  // 5 min
  incomeStatement: 10 * 60 * 1000,  // 10 min
  balanceSheet:    10 * 60 * 1000,  // 10 min
  cashflow:        5  * 60 * 1000,  // 5 min
  keyRatios:       10 * 60 * 1000,  // 10 min
  profitLoss:      5  * 60 * 1000,  // 5 min
  incomeReport:    5  * 60 * 1000,  // 5 min
  shiftDetails:    10 * 60 * 1000,  // 10 min
  taxReport:       5  * 60 * 1000,  // 5 min
};

const _cache = {
  dashboard:       { data: null, ts: 0, key: '' },
  reconciledSales: { data: null, ts: 0, key: '' },
  incomeStatement: { data: null, ts: 0, key: '' },
  balanceSheet:    { data: null, ts: 0, key: '' },
  cashflow:        { data: null, ts: 0, key: '' },
  keyRatios:       { data: null, ts: 0, key: '' },
  profitLoss:      { data: null, ts: 0, key: '' },
  incomeReport:    { data: null, ts: 0, key: '' },
  shiftDetails:    { data: null, ts: 0, key: '' },
  taxReport:       { data: null, ts: 0, key: '' },
};

// In-flight deduplication — if a fetch is already in progress for a given key,
// subsequent callers wait for the same promise instead of firing a new request.
const _inflight = {};

function isFresh(slot, ttlKey, cacheKey = '') {
  return (
    slot.data !== null &&
    (cacheKey === '' || slot.key === cacheKey) &&
    Date.now() - slot.ts < TTL[ttlKey]
  );
}

function setCache(slot, data, cacheKey = '') {
  slot.data = data;
  slot.ts   = Date.now();
  slot.key  = cacheKey;
}
// ─────────────────────────────────────────────────────────────────────────────

const useAccountantStore = create((set, get) => ({

  /**
   * Drop every cached slot so the next fetch actually hits the network.
   *
   * Each store serves a short TTL cache, and the freshness check runs BEFORE
   * the request — so a socket event arriving mid-TTL would refetch and get the
   * same stale data back. Zeroing `ts` makes isFresh() false whatever the slot
   * shape is, which is what makes the live updates real rather than eventual.
   */
  invalidate: () => {
    Object.values(_cache).forEach((slot) => {
      if (slot && typeof slot === "object" && "ts" in slot) slot.ts = 0;
    });
  },
  // State
  dashboard: null,
  reconciledSales: [],
  incomeStatement: null,
  balanceSheet: null,
  cashflow: null,
  keyRatios: null,
  profitLoss: null,
  incomeReport: null,
  shiftDetails: null,
  taxReport: null,

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
    shiftDetails: false,
    taxReport: false,
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
    taxReport: null,
  },

  // Helpers
  setLoading: (key, value) =>
    set((state) => ({ loading: { ...state.loading, [key]: value } })),

  setError: (key, error) =>
    set((state) => ({ errors: { ...state.errors, [key]: error } })),

  clearError: (key) =>
    set((state) => ({ errors: { ...state.errors, [key]: null } })),

  setFilters: (newFilters) =>
    set((state) => ({ filters: { ...state.filters, ...newFilters } })),

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
      pagination: { page: 1, limit: 10, total: 0, pages: 0 },
    }),

  // ── Fetch Dashboard ─────────────────────────────────────────────────────────
  fetchDashboard: async (duration = 'today', force = false) => {
    const { setLoading, setError } = get();

    if (!force && isFresh(_cache.dashboard, 'dashboard', duration)) {
      set({ dashboard: _cache.dashboard.data });
      return _cache.dashboard.data;
    }

    setLoading('dashboard', true);
    setError('dashboard', null);
    try {
      const response = await api.get(`${ACCOUNTANT_ENDPOINT}/dashboard`, {
        params: { duration },
      });
      const data = response.data.data;
      setCache(_cache.dashboard, data, duration);
      set({ dashboard: data });
      return data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch dashboard';
      setError('dashboard', errorMsg);
    } finally {
      setLoading('dashboard', false);
    }
  },

  // ── Fetch Reconciled Sales ──────────────────────────────────────────────────
  fetchReconciledSales: async (params = {}) => {
    const { setLoading, setError, filters, pagination } = get();

    const queryParams = {
      page:  params.page  || pagination.page,
      limit: params.limit || pagination.limit,
      ...filters,
      ...params,
    };
    Object.keys(queryParams).forEach((k) => {
      if (queryParams[k] === null || queryParams[k] === undefined || queryParams[k] === '')
        delete queryParams[k];
    });

    const cacheKey = JSON.stringify(queryParams);

    if (isFresh(_cache.reconciledSales, 'reconciledSales', cacheKey)) {
      const cached = _cache.reconciledSales.data;
      set({ reconciledSales: cached.reconciliations, pagination: cached.pagination });
      return cached;
    }

    setLoading('reconciledSales', true);
    setError('reconciledSales', null);
    try {
      const response = await api.get(`${ACCOUNTANT_ENDPOINT}/audited-reconciled-sales`, {
        params: queryParams,
      });
      const data = response.data.data;
      setCache(_cache.reconciledSales, data, cacheKey);
      set({ reconciledSales: data.reconciliations, pagination: data.pagination });
      return data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch reconciled sales';
      setError('reconciledSales', errorMsg);
    } finally {
      setLoading('reconciledSales', false);
    }
  },

  // ── Fetch Income Statement ──────────────────────────────────────────────────
  fetchIncomeStatement: async (startDate, endDate, compareStartDate = null, compareEndDate = null) => {
    const { setLoading, setError } = get();
    const cacheKey = `${startDate}-${endDate}-${compareStartDate}-${compareEndDate}`;

    if (isFresh(_cache.incomeStatement, 'incomeStatement', cacheKey)) {
      set({ incomeStatement: _cache.incomeStatement.data });
      return _cache.incomeStatement.data;
    }

    setLoading('incomeStatement', true);
    setError('incomeStatement', null);
    try {
      const params = { startDate, endDate };
      if (compareStartDate && compareEndDate) {
        params.compareStartDate = compareStartDate;
        params.compareEndDate   = compareEndDate;
      }
      const response = await api.get(
        `${ACCOUNTANT_ENDPOINT}/financial-statement/income-statement`,
        { params }
      );
      const data = response.data.data;
      setCache(_cache.incomeStatement, data, cacheKey);
      set({ incomeStatement: data });
      return data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch income statement';
      setError('incomeStatement', errorMsg);
    } finally {
      setLoading('incomeStatement', false);
    }
  },

  // ── Fetch Balance Sheet ─────────────────────────────────────────────────────
  fetchBalanceSheet: async (startDate, endDate) => {
    const { setLoading, setError } = get();
    const cacheKey = `${startDate}-${endDate}`;

    if (isFresh(_cache.balanceSheet, 'balanceSheet', cacheKey)) {
      set({ balanceSheet: _cache.balanceSheet.data });
      return _cache.balanceSheet.data;
    }

    setLoading('balanceSheet', true);
    setError('balanceSheet', null);
    try {
      const response = await api.get(
        `${ACCOUNTANT_ENDPOINT}/financial-statement/balance-sheet`,
        { params: { startDate, endDate } }
      );
      const data = response.data.data;
      setCache(_cache.balanceSheet, data, cacheKey);
      set({ balanceSheet: data });
      return data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch balance sheet';
      setError('balanceSheet', errorMsg);
    } finally {
      setLoading('balanceSheet', false);
    }
  },

  // ── Fetch Cashflow ──────────────────────────────────────────────────────────
  fetchCashflow: async (duration = 'today') => {
    const { setLoading, setError } = get();

    if (isFresh(_cache.cashflow, 'cashflow', duration)) {
      set({ cashflow: _cache.cashflow.data });
      return _cache.cashflow.data;
    }

    setLoading('cashflow', true);
    setError('cashflow', null);
    try {
      const response = await api.get(
        `${ACCOUNTANT_ENDPOINT}/financial-statement/cashflow`,
        { params: { duration } }
      );
      const data = response.data.data;
      setCache(_cache.cashflow, data, duration);
      set({ cashflow: data });
      return data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch cashflow';
      setError('cashflow', errorMsg);
    } finally {
      setLoading('cashflow', false);
    }
  },

  // ── Fetch Key Ratios ────────────────────────────────────────────────────────
  fetchKeyRatios: async (startDate, endDate) => {
    const { setLoading, setError } = get();
    const cacheKey = `${startDate}-${endDate}`;

    if (isFresh(_cache.keyRatios, 'keyRatios', cacheKey)) {
      set({ keyRatios: _cache.keyRatios.data });
      return _cache.keyRatios.data;
    }

    setLoading('keyRatios', true);
    setError('keyRatios', null);
    try {
      const response = await api.get(
        `${ACCOUNTANT_ENDPOINT}/financial-statement/key-ratios`,
        { params: { startDate, endDate } }
      );
      const data = response.data.data;
      setCache(_cache.keyRatios, data, cacheKey);
      set({ keyRatios: data });
      return data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch key ratios';
      setError('keyRatios', errorMsg);
    } finally {
      setLoading('keyRatios', false);
    }
  },

  // ── Fetch Profit & Loss ─────────────────────────────────────────────────────
  fetchProfitLoss: async (duration = 'last3months') => {
    const { setLoading, setError } = get();

    if (isFresh(_cache.profitLoss, 'profitLoss', duration)) {
      set({ profitLoss: _cache.profitLoss.data });
      return _cache.profitLoss.data;
    }

    setLoading('profitLoss', true);
    setError('profitLoss', null);
    try {
      const response = await api.get(`${ACCOUNTANT_ENDPOINT}/profit-loss`, {
        params: { duration },
      });
      const data = response.data.data;
      setCache(_cache.profitLoss, data, duration);
      set({ profitLoss: data });
      return data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch profit & loss';
      setError('profitLoss', errorMsg);
    } finally {
      setLoading('profitLoss', false);
    }
  },

  // ── Fetch Income Report ─────────────────────────────────────────────────────
  fetchIncomeReport: async (duration = 'thismonth') => {
    const { setLoading, setError } = get();

    if (isFresh(_cache.incomeReport, 'incomeReport', duration)) {
      set({ incomeReport: _cache.incomeReport.data });
      return _cache.incomeReport.data;
    }

    // If a request for this duration is already in flight, return the same promise
    const inflightKey = `incomeReport:${duration}`;
    if (_inflight[inflightKey]) return _inflight[inflightKey];

    setLoading('incomeReport', true);
    setError('incomeReport', null);

    const promise = api
      .get(`${ACCOUNTANT_ENDPOINT}/income`, { params: { duration } })
      .then((response) => {
        const data = response.data.data;
        setCache(_cache.incomeReport, data, duration);
        set({ incomeReport: data });
        return data;
      })
      .catch((error) => {
        const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch income report';
        setError('incomeReport', errorMsg);
      })
      .finally(() => {
        delete _inflight[inflightKey];
        setLoading('incomeReport', false);
      });

    _inflight[inflightKey] = promise;
    return promise;
  },

  // ── Fetch Single Shift Details ──────────────────────────────────────────────
  fetchShiftDetails: async (shiftId) => {
    const { setLoading, setError } = get();

    if (isFresh(_cache.shiftDetails, 'shiftDetails', shiftId)) {
      set({ shiftDetails: _cache.shiftDetails.data });
      return _cache.shiftDetails.data;
    }

    setLoading('shiftDetails', true);
    setError('shiftDetails', null);
    try {
      const response = await api.get(`/api/shift/${shiftId}`);
      const data = response.data.data || response.data;
      setCache(_cache.shiftDetails, data, shiftId);
      set({ shiftDetails: data });
      return data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch shift details';
      setError('shiftDetails', errorMsg);
    } finally {
      setLoading('shiftDetails', false);
    }
  },

  clearShiftDetails: () => set({ shiftDetails: null }),

  // ── Fetch Tax Report ────────────────────────────────────────────────────────
  fetchTaxReport: async (startDate, endDate) => {
    const { setLoading, setError } = get();
    const cacheKey = `${startDate}-${endDate}`;

    if (isFresh(_cache.taxReport, 'taxReport', cacheKey)) {
      set({ taxReport: _cache.taxReport.data });
      return _cache.taxReport.data;
    }

    setLoading('taxReport', true);
    setError('taxReport', null);
    try {
      const response = await api.get(`${ACCOUNTANT_ENDPOINT}/tax-report`, {
        params: { startDate, endDate },
      });
      const data = response.data.data;
      setCache(_cache.taxReport, data, cacheKey);
      set({ taxReport: data });
      return data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch tax report';
      setError('taxReport', errorMsg);
    } finally {
      setLoading('taxReport', false);
    }
  },

  // ── Pagination helpers ──────────────────────────────────────────────────────
  setPage: (page) =>
    set((state) => ({ pagination: { ...state.pagination, page } })),

  setLimit: (limit) =>
    set((state) => ({ pagination: { ...state.pagination, limit, page: 1 } })),

  nextPage: () => {
    const { pagination, fetchReconciledSales } = get();
    if (pagination.page < pagination.pages) {
      const newPage = pagination.page + 1;
      set((state) => ({ pagination: { ...state.pagination, page: newPage } }));
      fetchReconciledSales({ page: newPage });
    }
  },

  previousPage: () => {
    const { pagination, fetchReconciledSales } = get();
    if (pagination.page > 1) {
      const newPage = pagination.page - 1;
      set((state) => ({ pagination: { ...state.pagination, page: newPage } }));
      fetchReconciledSales({ page: newPage });
    }
  },

  // ── Reset store (also clears all caches) ───────────────────────────────────
  reset: () => {
    Object.values(_cache).forEach((slot) => { slot.data = null; slot.ts = 0; slot.key = ''; });
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
      taxReport: null,
      pagination: { page: 1, limit: 10, total: 0, pages: 0 },
      filters: {
        search: '', shiftType: '', status: '', startDate: null, endDate: null, attendantId: null,
      },
      loading: {
        dashboard: false, reconciledSales: false, incomeStatement: false,
        balanceSheet: false, cashflow: false, keyRatios: false,
        profitLoss: false, incomeReport: false, shiftDetails: false, taxReport: false,
      },
      errors: {
        dashboard: null, reconciledSales: null, incomeStatement: null,
        balanceSheet: null, cashflow: null, keyRatios: null,
        profitLoss: null, incomeReport: null, shiftDetails: null, taxReport: null,
      },
    });
  },
}));

export default useAccountantStore;
