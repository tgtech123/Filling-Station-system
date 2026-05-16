import { create } from "zustand";
import { api } from "@/lib/config";

const ENDPOINT = "/api/salary";

const useSalaryStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────────
  draft: null,
  pendingDrafts: [],
  history: [],
  historyDetail: null,

  loading: {
    draft: false,
    saving: false,
    submitting: false,
    pending: false,
    validating: false,
    history: false,
    detail: false,
  },

  error: null,

  // ── Helpers ────────────────────────────────────────────────────────────────
  setLoading: (key, val) =>
    set((s) => ({ loading: { ...s.loading, [key]: val } })),

  setError: (msg) => set({ error: msg }),
  clearError: () => set({ error: null }),

  // ── Accountant: get or create draft for a month ───────────────────────────
  fetchDraft: async (month) => {
    const { setLoading } = get();
    setLoading("draft", true);
    set({ error: null });
    try {
      const res = await api.get(`${ENDPOINT}/draft`, { params: { month } });
      set({ draft: res.data.data });
      return res.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to load draft" });
      throw err;
    } finally {
      setLoading("draft", false);
    }
  },

  // ── Accountant: save draft entries ────────────────────────────────────────
  saveDraft: async (id, entries, pensionEnabled) => {
    const { setLoading } = get();
    setLoading("saving", true);
    set({ error: null });
    try {
      const res = await api.put(`${ENDPOINT}/draft/${id}`, { entries, pensionEnabled });
      set({ draft: res.data.data });
      return res.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to save draft" });
      throw err;
    } finally {
      setLoading("saving", false);
    }
  },

  // ── Accountant: submit draft to manager ───────────────────────────────────
  submitDraft: async (id) => {
    const { setLoading } = get();
    setLoading("submitting", true);
    set({ error: null });
    try {
      const res = await api.post(`${ENDPOINT}/draft/${id}/submit`);
      set({ draft: res.data.data });
      return res.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to submit draft" });
      throw err;
    } finally {
      setLoading("submitting", false);
    }
  },

  // ── Manager: list submitted / validated drafts ────────────────────────────
  fetchPending: async () => {
    const { setLoading } = get();
    setLoading("pending", true);
    set({ error: null });
    try {
      const res = await api.get(`${ENDPOINT}/pending`);
      set({ pendingDrafts: res.data.data });
      return res.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to load pending drafts" });
      throw err;
    } finally {
      setLoading("pending", false);
    }
  },

  // ── Manager: validate a draft ─────────────────────────────────────────────
  validateDraft: async (id) => {
    const { setLoading } = get();
    setLoading("validating", true);
    set({ error: null });
    try {
      const res = await api.post(`${ENDPOINT}/${id}/validate`);
      // Update in pendingDrafts list
      set((s) => ({
        pendingDrafts: s.pendingDrafts.map((d) =>
          d._id === id ? res.data.data : d
        ),
        historyDetail: res.data.data,
      }));
      return res.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to validate draft" });
      throw err;
    } finally {
      setLoading("validating", false);
    }
  },

  // ── Both: list validated history ──────────────────────────────────────────
  fetchHistory: async () => {
    const { setLoading } = get();
    setLoading("history", true);
    set({ error: null });
    try {
      const res = await api.get(`${ENDPOINT}/history`);
      set({ history: res.data.data });
      return res.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to load history" });
      throw err;
    } finally {
      setLoading("history", false);
    }
  },

  // ── Both: get full record detail ──────────────────────────────────────────
  fetchRecord: async (id) => {
    const { setLoading } = get();
    setLoading("detail", true);
    set({ error: null });
    try {
      const res = await api.get(`${ENDPOINT}/${id}`);
      set({ historyDetail: res.data.data });
      return res.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to load record" });
      throw err;
    } finally {
      setLoading("detail", false);
    }
  },

  clearDetail: () => set({ historyDetail: null }),
  clearDraft: () => set({ draft: null }),
}));

export default useSalaryStore;
