import { create } from "zustand";
import { api, extractApiError } from "@/lib/config";

// ─── Module-level cache (survives re-renders & component unmounts) ────────────
const TTL = {
  metrics:    10 * 60 * 1000,  // 10 min — avoid loading screen on every visit
  tankStatus: 10 * 60 * 1000,
};

const _cache = {
  metrics:    { data: null, ts: 0 },
  tankStatus: { data: null, ts: 0 },
};

function isFresh(slot, ttlKey) {
  return slot.data !== null && Date.now() - slot.ts < TTL[ttlKey];
}

function setCache(slot, data) {
  slot.data = data;
  slot.ts   = Date.now();
}
// ─────────────────────────────────────────────────────────────────────────────

const useDashboardStore = create((set, get) => ({
  metrics:    null,
  tankStatus: null,
  loading: {
    metrics:    false,
    tankStatus: false,
  },
  errors: {
    metrics:    null,
    tankStatus: null,
  },

  // ── Fetch Dashboard Metrics ─────────────────────────────────────────────────
  fetchMetrics: async () => {
    if (isFresh(_cache.metrics, 'metrics')) {
      set((state) => ({ metrics: _cache.metrics.data, loading: { ...state.loading, metrics: false } }));
      return _cache.metrics.data;
    }

    set((state) => ({
      loading: { ...state.loading, metrics: true },
      errors:  { ...state.errors,  metrics: null  },
    }));

    try {
      const response = await api.get("/api/dashboard/metric");
      setCache(_cache.metrics, response.data);
      set((state) => ({
        metrics: response.data,
        loading: { ...state.loading, metrics: false },
      }));
      return response.data;
    } catch (error) {
      const errorMsg =
        extractApiError(error) || error.message || "Failed to fetch metrics";
      set((state) => ({
        loading: { ...state.loading, metrics: false },
        errors:  { ...state.errors,  metrics: errorMsg },
      }));
      return null;
    }
  },

  // ── Fetch Tank Status ───────────────────────────────────────────────────────
  fetchTankStatus: async () => {
    if (isFresh(_cache.tankStatus, 'tankStatus')) {
      set((state) => ({ tankStatus: _cache.tankStatus.data, loading: { ...state.loading, tankStatus: false } }));
      return _cache.tankStatus.data;
    }

    set((state) => ({
      loading: { ...state.loading, tankStatus: true },
      errors:  { ...state.errors,  tankStatus: null  },
    }));

    try {
      const response = await api.get("/api/dashboard/tank-status");
      setCache(_cache.tankStatus, response.data);
      set((state) => ({
        tankStatus: response.data,
        loading: { ...state.loading, tankStatus: false },
      }));
      return response.data;
    } catch (error) {
      const errorMsg =
        extractApiError(error) || error.message || "Failed to fetch tank status";
      set((state) => ({
        loading: { ...state.loading, tankStatus: false },
        errors:  { ...state.errors,  tankStatus: errorMsg },
      }));
      return null;
    }
  },

  // ── Fetch both at once ──────────────────────────────────────────────────────
  fetchDashboardData: async () => {
    const [metrics, tankStatus] = await Promise.all([
      get().fetchMetrics(),
      get().fetchTankStatus(),
    ]);
    return { metrics, tankStatus };
  },

  // ── Socket-triggered invalidation — bust cache and silently refetch ────────
  invalidate: () => {
    _cache.metrics.ts    = 0;
    _cache.tankStatus.ts = 0;
    get().fetchDashboardData();
  },

  // ── Clear (also busts caches) ───────────────────────────────────────────────
  clearDashboard: () => {
    _cache.metrics.data    = null;
    _cache.tankStatus.data = null;
    set({
      metrics:    null,
      tankStatus: null,
      loading: { metrics: false, tankStatus: false },
      errors:  { metrics: null,  tankStatus: null  },
    });
  },
}));

export default useDashboardStore;
