import { create } from "zustand";
import { api } from "@/lib/config";

/**
 * Money handed over at the end of a fuel shift, split by how it was paid.
 *
 * Three screens share this: the attendant declares, the cashier confirms, and
 * the accountant audits. One store because they are three views of the same
 * record, and a figure that differs between them would defeat the point.
 */
const useShiftTenderStore = create((set, get) => ({
  expected: null,
  pending: [],
  audit: { rows: [], totals: null, byProduct: [], awaiting: 0 },
  shortfalls: { rows: [], attendants: [], totals: null },
  mine: null,
  awaiting: [],
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  /** What the meter says this shift owes, read before the form is filled in. */
  fetchExpected: async (shiftId) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/api/shift-tender/expected/${shiftId}`);
      set({ expected: res.data?.data || null, loading: false });
      return res.data?.data || null;
    } catch (err) {
      set({ error: err?.response?.data?.error || "Could not read this shift", loading: false });
      return null;
    }
  },

  /**
   * The attendant's declaration.
   *
   * The server refuses anything that does not add up to the expected amount, so
   * the caller gets the whole refusal back rather than a generic failure: the
   * message names the direction and the amount, which is what makes it fixable
   * on the spot.
   */
  declare: async (payload) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/api/shift-tender", payload);
      set({ loading: false });
      // The warning rides along on a 200 now: a short declaration is recorded,
      // not refused, so the caller still needs to be told it did not balance.
      return {
        success: true,
        data: res.data?.data,
        message: res.data?.message,
        warning: res.data?.warning,
        balanced: res.data?.balanced,
      };
    } catch (err) {
      const body = err?.response?.data || {};
      set({ loading: false, error: body.error || "Could not submit" });
      return { success: false, ...body };
    }
  },

  /** The cashier's queue. */
  fetchPending: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/api/shift-tender/pending");
      set({ pending: res.data?.data || [], loading: false });
    } catch (err) {
      set({ error: err?.response?.data?.error || "Could not load", loading: false });
    }
  },

  confirm: async (id, body) => {
    set({ error: null });
    try {
      const res = await api.patch(`/api/shift-tender/${id}/confirm`, body || {});
      await get().fetchPending();
      return { success: true, message: res.data?.message, data: res.data?.data };
    } catch (err) {
      const b = err?.response?.data || {};
      return { success: false, ...b };
    }
  },

  /**
   * The shortage ledger: what each attendant still owes, rolled up per person.
   *
   * A single short shift is an incident. The same person short four times is a
   * pattern, and nobody sees a pattern by scrolling shifts one at a time.
   */
  fetchShortfalls: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/api/shift-tender/shortfalls", { params });
      const d = res.data?.data || {};
      set({
        shortfalls: {
          rows: d.rows || [],
          attendants: d.attendants || [],
          totals: d.totals || null,
        },
        loading: false,
      });
    } catch (err) {
      set({ error: err?.response?.data?.error || "Could not load", loading: false });
    }
  },

  /**
   * Shifts this attendant has closed but not yet handed in.
   *
   * Lets the tender screen be opened cold, from the sidebar, without a shift id
   * in the URL. Without it the only way in is a link nobody generates.
   */
  fetchAwaiting: async () => {
    try {
      const res = await api.get("/api/shift-tender/awaiting");
      set({ awaiting: res.data?.data || [] });
      return res.data?.data || [];
    } catch {
      set({ awaiting: [] });
      return [];
    }
  },

  /**
   * The attendant's own side: what they owe and what they must sign for.
   *
   * Scoped to the signed-in person by the server, never by a parameter here.
   */
  fetchMyShortfalls: async () => {
    try {
      const res = await api.get("/api/shift-tender/my-shortfalls");
      set({ mine: res.data?.data || null });
    } catch {
      // A dashboard card must never take the page down with it.
      set({ mine: null });
    }
  },

  /** The attendant's second signature: accept the shortage, or dispute it. */
  acknowledge: async (id, action, note) => {
    try {
      const res = await api.patch(`/api/shift-tender/${id}/acknowledge`, { action, note });
      await get().fetchMyShortfalls();
      return { success: true, message: res.data?.message };
    } catch (err) {
      return { success: false, error: err?.response?.data?.error || "Could not save" };
    }
  },

  /** Record that a shortage was repaid, written off, or put back as owing. */
  settleShortfall: async (id, action, note) => {
    try {
      const res = await api.patch(`/api/shift-tender/${id}/shortfall`, { action, note });
      return { success: true, message: res.data?.message };
    } catch (err) {
      return { success: false, error: err?.response?.data?.error || "Could not save" };
    }
  },

  /** The accountant's view: one attendant, or everyone, over a period. */
  fetchAudit: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/api/shift-tender/audit", { params });
      const d = res.data?.data || {};
      set({
        audit: {
          rows: d.rows || [],
          totals: d.totals || null,
          byProduct: d.byProduct || [],
          awaiting: d.awaiting || 0,
        },
        loading: false,
      });
    } catch (err) {
      set({ error: err?.response?.data?.error || "Could not load", loading: false });
    }
  },
}));

export default useShiftTenderStore;
