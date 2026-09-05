import { create } from "zustand";
import { api, API_URL, extractApiError } from "@/lib/config";

const BASE = "/api/fuel-loyalty";

const useFuelLoyaltyStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────────
  customers: [],
  selectedCustomer: null,
  transactions: [],
  redemptions: [],
  settings: null,
  auditReport: [],
  total: 0,
  redemptionTotal: 0,
  loading: {
    customers: false,
    customer: false,
    search: false,
    register: false,
    earn: false,
    redemption: false,
    settings: false,
    audit: false,
  },
  searchResult: null,
  error: null,

  // ── Settings ───────────────────────────────────────────────────────────────
  fetchSettings: async () => {
    set(s => ({ loading: { ...s.loading, settings: true } }));
    try {
      const { data } = await api.get(`${BASE}/staff/settings`);
      set({ settings: data.data });
    } catch (e) {
      set({ error: extractApiError(e) || e.message });
    } finally {
      set(s => ({ loading: { ...s.loading, settings: false } }));
    }
  },

  updateSettings: async (payload) => {
    try {
      const { data } = await api.patch(`${BASE}/staff/settings`, payload);
      set({ settings: data.data });
      return { success: true, data: data.data };
    } catch (e) {
      return { success: false, error: extractApiError(e) || e.message };
    }
  },

  // ── Customers ──────────────────────────────────────────────────────────────
  fetchCustomers: async (params = {}) => {
    set(s => ({ loading: { ...s.loading, customers: true } }));
    try {
      const { data } = await api.get(`${BASE}/staff/customers`, { params });
      set({ customers: data.data || [], total: data.total || 0 });
    } catch (e) {
      set({ error: extractApiError(e) || e.message });
    } finally {
      set(s => ({ loading: { ...s.loading, customers: false } }));
    }
  },

  searchCustomer: async (q) => {
    set(s => ({ loading: { ...s.loading, search: true }, searchResult: null }));
    try {
      const { data } = await api.get(`${BASE}/staff/customers/search`, { params: { q } });
      set({ searchResult: data.data });
      return data.data;
    } catch {
      return null;
    } finally {
      set(s => ({ loading: { ...s.loading, search: false } }));
    }
  },

  clearSearchResult: () => set({ searchResult: null }),

  fetchCustomer: async (id) => {
    set(s => ({ loading: { ...s.loading, customer: true } }));
    try {
      const { data } = await api.get(`${BASE}/staff/customers/${id}`);
      set({ selectedCustomer: data.data?.customer, transactions: data.data?.transactions || [], redemptions: data.data?.redemptions || [] });
      return { ok: true, ...data.data };
    } catch (e) {
      return { ok: false, error: extractApiError(e) || e.message };
    } finally {
      set(s => ({ loading: { ...s.loading, customer: false } }));
    }
  },

  registerCustomer: async (payload) => {
    set(s => ({ loading: { ...s.loading, register: true } }));
    try {
      const { data } = await api.post(`${BASE}/staff/customers`, payload);
      return { success: true, data: data.data };
    } catch (e) {
      return { success: false, error: extractApiError(e) || e.message };
    } finally {
      set(s => ({ loading: { ...s.loading, register: false } }));
    }
  },

  updateCustomer: async (id, payload) => {
    try {
      const { data } = await api.patch(`${BASE}/staff/customers/${id}`, payload);
      return { success: true, data: data.data };
    } catch (e) {
      return { success: false, error: extractApiError(e) || e.message };
    }
  },

  // ── Transactions ───────────────────────────────────────────────────────────
  recordEarn: async (payload) => {
    set(s => ({ loading: { ...s.loading, earn: true } }));
    try {
      const { data } = await api.post(`${BASE}/staff/transactions`, payload);
      return { success: true, data: data.data, message: data.message };
    } catch (e) {
      return { success: false, error: extractApiError(e) || e.message };
    } finally {
      set(s => ({ loading: { ...s.loading, earn: false } }));
    }
  },

  fetchTransactions: async (params = {}) => {
    try {
      const { data } = await api.get(`${BASE}/staff/transactions`, { params });
      set({ transactions: data.data || [], total: data.total || 0 });
    } catch {}
  },

  // ── Redemptions ────────────────────────────────────────────────────────────
  requestRedemption: async (payload) => {
    set(s => ({ loading: { ...s.loading, redemption: true } }));
    try {
      const { data } = await api.post(`${BASE}/staff/redemptions`, payload);
      return { success: true, data: data.data, message: data.message };
    } catch (e) {
      return { success: false, error: extractApiError(e) || e.message };
    } finally {
      set(s => ({ loading: { ...s.loading, redemption: false } }));
    }
  },

  fetchRedemptions: async (params = {}) => {
    set(s => ({ loading: { ...s.loading, redemption: true } }));
    try {
      const { data } = await api.get(`${BASE}/staff/redemptions`, { params });
      set({ redemptions: data.data || [], redemptionTotal: data.total || 0 });
    } catch (e) {
      set({ error: extractApiError(e) || e.message });
    } finally {
      set(s => ({ loading: { ...s.loading, redemption: false } }));
    }
  },

  approveRedemption: async (id) => {
    try {
      const { data } = await api.patch(`${BASE}/staff/redemptions/${id}/approve`);
      return { success: true, data: data.data, message: data.message };
    } catch (e) {
      return { success: false, error: extractApiError(e) || e.message };
    }
  },

  rejectRedemption: async (id, note) => {
    try {
      const { data } = await api.patch(`${BASE}/staff/redemptions/${id}/reject`, { note });
      return { success: true, data: data.data };
    } catch (e) {
      return { success: false, error: extractApiError(e) || e.message };
    }
  },

  // ── Audit ──────────────────────────────────────────────────────────────────
  fetchAudit: async (date) => {
    set(s => ({ loading: { ...s.loading, audit: true } }));
    try {
      const { data } = await api.get(`${BASE}/staff/audit`, { params: date ? { date } : {} });
      set({ auditReport: data.data || [] });
    } catch (e) {
      set({ error: extractApiError(e) || e.message });
    } finally {
      set(s => ({ loading: { ...s.loading, audit: false } }));
    }
  },

  // ── Portal (public, uses separate token stored in sessionStorage) ──────────
  portalToken: typeof window !== "undefined" ? sessionStorage.getItem("portal_token") : null,
  portalCustomer: null,
  portalTransactions: [],

  portalLookup: async (stationId, q) => {
    try {
      const res = await fetch(`${API_URL}/api/fuel-loyalty/portal/${stationId}/lookup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.message };
      return { success: true, data: data.data };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  portalSetPin: async (stationId, q, pin) => {
    try {
      const res = await fetch(`${API_URL}/api/fuel-loyalty/portal/${stationId}/set-pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q, pin }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.message };
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  portalLogin: async (stationId, q, pin) => {
    try {
      const res = await fetch(`${API_URL}/api/fuel-loyalty/portal/${stationId}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q, pin }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.message };
      sessionStorage.setItem("portal_token", data.token);
      set({ portalToken: data.token });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  portalFetchMe: async () => {
    const token = get().portalToken || sessionStorage.getItem("portal_token");
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/fuel-loyalty/portal/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) set({ portalCustomer: data.data });
    } catch {}
  },

  portalFetchTransactions: async () => {
    const token = get().portalToken || sessionStorage.getItem("portal_token");
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/fuel-loyalty/portal/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) set({ portalTransactions: data.data || [] });
    } catch {}
  },

  portalRedemptions: [],

  portalFetchRedemptions: async () => {
    const token = get().portalToken || sessionStorage.getItem("portal_token");
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/fuel-loyalty/portal/redemptions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) set({ portalRedemptions: data.data || [] });
    } catch {}
  },

  // The customer claims their own reward. Nothing is deducted here — the claim
  // carries a code they present at the station, and a manager or supervisor
  // approves it before any fuel moves.
  portalClaimReward: async (product) => {
    const token = get().portalToken || sessionStorage.getItem("portal_token");
    if (!token) return { success: false, error: "Please sign in again" };
    try {
      const res = await fetch(`${API_URL}/api/fuel-loyalty/portal/redemptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.message };
      await get().portalFetchRedemptions();
      return { success: true, data: data.data, message: data.message };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  portalLogout: () => {
    sessionStorage.removeItem("portal_token");
    set({ portalToken: null, portalCustomer: null, portalTransactions: [], portalRedemptions: [] });
  },

  // Staff side: the attendant confirms they handed the reward over. This is what
  // ties it to their shift so it is not counted as a cash shortage — and for a
  // shop reward, `items` is what takes the goods off stock.
  confirmDispensed: async (id, items) => {
    try {
      const { data } = await api.patch(`${BASE}/staff/redemptions/${id}/dispensed`, items ? { items } : {});
      return { success: true, message: data.message, data: data.data };
    } catch (e) {
      return { success: false, error: extractApiError(e) || e.message };
    }
  },

  // What a shop reward can be taken as: in stock, and within the reward's value.
  // Served by the loyalty API rather than the lubricants list, which attendants
  // and supervisors cannot read.
  fetchShopRewardOptions: async (id) => {
    try {
      const { data } = await api.get(`${BASE}/staff/redemptions/${id}/shop-options`);
      return { success: true, data: data.data };
    } catch (e) {
      return { success: false, error: extractApiError(e) || e.message };
    }
  },
}));

export default useFuelLoyaltyStore;
