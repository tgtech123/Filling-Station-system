import { create } from "zustand";
import { api } from "@/lib/config";

/**
 * The supplier invoice register — every invoice, paid and unpaid, searchable.
 *
 * Read-only, so nothing here throws for a caller to toast: a failed fetch
 * leaves the last good page on screen and puts the reason in `error`.
 */
const useInvoiceLogStore = create((set) => ({
  log: null, // { rows, page, pages, matched, counts, grandTotal, suppliers }
  loading: false,
  error: null,

  fetchInvoiceLog: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/api/suppliers/invoice-log", { params });
      set({ log: res.data.data, loading: false });
      return res.data.data;
    } catch (e) {
      const error =
        e?.response?.data?.error || e?.message || "Could not load the invoice log";
      set({ loading: false, error });
      return null;
    }
  },

  /**
   * Every matching row, unpaged, for the export.
   *
   * Deliberately does NOT touch `log` — the screen must not flicker to 500 rows
   * while a download is being prepared. `limit: 0` is the server's "no paging".
   */
  fetchAllForExport: async (params = {}) => {
    const res = await api.get("/api/suppliers/invoice-log", {
      params: { ...params, limit: 0 },
    });
    return res.data.data.rows || [];
  },
}));

export default useInvoiceLogStore;
