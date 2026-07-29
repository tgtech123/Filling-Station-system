import { create } from 'zustand';
import { api } from '@/lib/config';

const COMMISSION_ENDPOINT = '/api/commissions';

// ─── Module-level cache (survives re-renders & component unmounts) ────────────
const TTL = {
  overview:            5  * 60 * 1000,  // 5 min
  staffTracking:       5  * 60 * 1000,  // 5 min
  commissionStructure: 30 * 60 * 1000,  // 30 min – rarely changes
  bonusStructure:      30 * 60 * 1000,  // 30 min – rarely changes
  paymentHistory:      5  * 60 * 1000,  // 5 min
};

const _cache = {
  overview:            { data: null, ts: 0, key: '' },
  staffTracking:       { data: null, ts: 0, key: '' },
  commissionStructure: { data: null, ts: 0 },
  bonusStructure:      { data: null, ts: 0 },
  paymentHistory:      { data: null, ts: 0, key: '' },
};

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

const useCommissionStore = create((set, get) => ({

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
  overview: null,
  staffTracking: [],
  commissionStructure: [],
  bonusStructure: [],
  paymentHistory: [],
  calculationResult: null,

  // Pagination for payment history
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },

  // Filters for payment history
  filters: {
    search: '',
    status: '',
    startDate: null,
    endDate: null,
    month: null,
    year: null,
  },

  // Loading states
  loading: {
    overview: false,
    staffTracking: false,
    commissionStructure: false,
    bonusStructure: false,
    paymentHistory: false,
    calculating: false,
    markingPaid: false,
    updatingCommission: false,
    updatingBonus: false,
  },

  // Error states
  errors: {
    overview: null,
    staffTracking: null,
    commissionStructure: null,
    bonusStructure: null,
    paymentHistory: null,
    calculating: null,
    markingPaid: null,
    updatingCommission: null,
    updatingBonus: null,
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
        status: '',
        startDate: null,
        endDate: null,
        month: null,
        year: null,
      },
      pagination: { page: 1, limit: 10, total: 0, pages: 0 },
    }),

  // ── Fetch Overview ──────────────────────────────────────────────────────────
  fetchOverview: async (duration = 'thismonth') => {
    const { setLoading, setError } = get();

    if (isFresh(_cache.overview, 'overview', duration)) {
      set({ overview: _cache.overview.data });
      return _cache.overview.data;
    }

    setLoading('overview', true);
    setError('overview', null);
    try {
      const response = await api.get(`${COMMISSION_ENDPOINT}/overview`, {
        params: { duration },
      });
      const data = response.data.data;
      setCache(_cache.overview, data, duration);
      set({ overview: data });
      return data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch overview';
      setError('overview', errorMsg);
    } finally {
      setLoading('overview', false);
    }
  },

  // ── Fetch Staff Tracking ────────────────────────────────────────────────────
  fetchStaffTracking: async (month = null, year = null) => {
    const { setLoading, setError } = get();
    const cacheKey = `${month}-${year}`;

    if (isFresh(_cache.staffTracking, 'staffTracking', cacheKey)) {
      set({ staffTracking: _cache.staffTracking.data });
      return _cache.staffTracking.data;
    }

    setLoading('staffTracking', true);
    setError('staffTracking', null);
    try {
      const params = {};
      if (month) params.month = month;
      if (year)  params.year  = year;

      const response = await api.get(`${COMMISSION_ENDPOINT}/staff-tracking`, { params });
      const data = response.data.data.payments;
      setCache(_cache.staffTracking, data, cacheKey);
      set({ staffTracking: data });
      return response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch staff tracking';
      setError('staffTracking', errorMsg);
    } finally {
      setLoading('staffTracking', false);
    }
  },

  // ── Fetch Commission Structure ──────────────────────────────────────────────
  fetchCommissionStructure: async () => {
    const { setLoading, setError } = get();

    if (isFresh(_cache.commissionStructure, 'commissionStructure')) {
      set({ commissionStructure: _cache.commissionStructure.data });
      return _cache.commissionStructure.data;
    }

    setLoading('commissionStructure', true);
    setError('commissionStructure', null);
    try {
      const response = await api.get(`${COMMISSION_ENDPOINT}/structure`);
      const data = response.data.data.structures;
      setCache(_cache.commissionStructure, data);
      set({ commissionStructure: data });
      return response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch commission structure';
      setError('commissionStructure', errorMsg);
    } finally {
      setLoading('commissionStructure', false);
    }
  },

  // ── Update Commission Structure (busts cache) ───────────────────────────────
  updateCommissionStructure: async (structures) => {
    const { setLoading, setError, fetchCommissionStructure } = get();
    setLoading('updatingCommission', true);
    setError('updatingCommission', null);
    try {
      const response = await api.put(`${COMMISSION_ENDPOINT}/structure`, { structures });
      _cache.commissionStructure.data = null; // bust cache
      await fetchCommissionStructure();
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update commission structure';
      setError('updatingCommission', errorMsg);
      throw error;
    } finally {
      setLoading('updatingCommission', false);
    }
  },

  // ── Fetch Bonus Structure ───────────────────────────────────────────────────
  fetchBonusStructure: async () => {
    const { setLoading, setError } = get();

    if (isFresh(_cache.bonusStructure, 'bonusStructure')) {
      set({ bonusStructure: _cache.bonusStructure.data });
      return _cache.bonusStructure.data;
    }

    setLoading('bonusStructure', true);
    setError('bonusStructure', null);
    try {
      const response = await api.get(`${COMMISSION_ENDPOINT}/bonus-structure`);
      const data = response.data.data.structures;
      setCache(_cache.bonusStructure, data);
      set({ bonusStructure: data });
      return response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch bonus structure';
      setError('bonusStructure', errorMsg);
    } finally {
      setLoading('bonusStructure', false);
    }
  },

  // ── Update Bonus Structure (busts cache) ────────────────────────────────────
  updateBonusStructure: async (structures) => {
    const { setLoading, setError, fetchBonusStructure } = get();
    setLoading('updatingBonus', true);
    setError('updatingBonus', null);
    try {
      const response = await api.put(`${COMMISSION_ENDPOINT}/bonus-structure`, { structures });
      _cache.bonusStructure.data = null; // bust cache
      await fetchBonusStructure();
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update bonus structure';
      setError('updatingBonus', errorMsg);
      throw error;
    } finally {
      setLoading('updatingBonus', false);
    }
  },

  // ── Fetch Payment History ───────────────────────────────────────────────────
  fetchPaymentHistory: async (params = {}) => {
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

    if (isFresh(_cache.paymentHistory, 'paymentHistory', cacheKey)) {
      const cached = _cache.paymentHistory.data;
      set({ paymentHistory: cached.payments, pagination: cached.pagination });
      return cached;
    }

    setLoading('paymentHistory', true);
    setError('paymentHistory', null);
    try {
      const response = await api.get(`${COMMISSION_ENDPOINT}/payment-history`, {
        params: queryParams,
      });
      const data = response.data.data;
      setCache(_cache.paymentHistory, data, cacheKey);
      set({ paymentHistory: data.payments, pagination: data.pagination });
      return data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch payment history';
      setError('paymentHistory', errorMsg);
    } finally {
      setLoading('paymentHistory', false);
    }
  },

  // ── Calculate Commissions ───────────────────────────────────────────────────
  calculateCommissions: async (month, year) => {
    const { setLoading, setError } = get();
    setLoading('calculating', true);
    setError('calculating', null);
    try {
      const response = await api.post(`${COMMISSION_ENDPOINT}/calculate`, { month, year });
      set({ calculationResult: response.data.data });
      // Bust caches that calculation affects
      _cache.staffTracking.data   = null;
      _cache.paymentHistory.data  = null;
      _cache.overview.data        = null;
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to calculate commissions';
      setError('calculating', errorMsg);
      throw error;
    } finally {
      setLoading('calculating', false);
    }
  },

  // ── Mark Payment as Paid (busts payment history cache) ─────────────────────
  markPaymentAsPaid: async (paymentId, notes = '') => {
    const { setLoading, setError, fetchPaymentHistory } = get();
    setLoading('markingPaid', true);
    setError('markingPaid', null);
    try {
      const response = await api.put(`${COMMISSION_ENDPOINT}/payment/${paymentId}/mark-paid`, { notes });
      _cache.paymentHistory.data = null; // bust cache so fresh data loads
      await fetchPaymentHistory();
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to mark payment as paid';
      setError('markingPaid', errorMsg);
      throw error;
    } finally {
      setLoading('markingPaid', false);
    }
  },

  // ── Pagination helpers ──────────────────────────────────────────────────────
  setPage: (page) =>
    set((state) => ({ pagination: { ...state.pagination, page } })),

  setLimit: (limit) =>
    set((state) => ({ pagination: { ...state.pagination, limit, page: 1 } })),

  nextPage: () => {
    const { pagination, fetchPaymentHistory } = get();
    if (pagination.page < pagination.pages) {
      const newPage = pagination.page + 1;
      set((state) => ({ pagination: { ...state.pagination, page: newPage } }));
      fetchPaymentHistory({ page: newPage });
    }
  },

  previousPage: () => {
    const { pagination, fetchPaymentHistory } = get();
    if (pagination.page > 1) {
      const newPage = pagination.page - 1;
      set((state) => ({ pagination: { ...state.pagination, page: newPage } }));
      fetchPaymentHistory({ page: newPage });
    }
  },

  // ── Reset store (also clears all caches) ───────────────────────────────────
  reset: () => {
    Object.values(_cache).forEach((slot) => { slot.data = null; slot.ts = 0; slot.key = ''; });
    set({
      overview: null,
      staffTracking: [],
      commissionStructure: [],
      bonusStructure: [],
      paymentHistory: [],
      calculationResult: null,
      pagination: { page: 1, limit: 10, total: 0, pages: 0 },
      filters: {
        search: '', status: '', startDate: null, endDate: null, month: null, year: null,
      },
      loading: {
        overview: false, staffTracking: false, commissionStructure: false,
        bonusStructure: false, paymentHistory: false, calculating: false,
        markingPaid: false, updatingCommission: false, updatingBonus: false,
      },
      errors: {
        overview: null, staffTracking: null, commissionStructure: null,
        bonusStructure: null, paymentHistory: null, calculating: null,
        markingPaid: null, updatingCommission: null, updatingBonus: null,
      },
    });
  },
}));

export default useCommissionStore;
