import { create } from "zustand";
import { api } from "@/lib/config";

/**
 * What sold over a chosen window, and what was made on it — fuel and bulk gas
 * by product, cylinders, lubricants and the shop item by item.
 *
 * Read-only, so nothing here throws for a caller to toast: a failed fetch
 * leaves the last good report on screen and puts the reason in `error`, which
 * the page shows above the tables. A blank screen after a dropped connection
 * loses the figures the reader was mid-way through reading.
 */
const useSalesAnalysisStore = create((set) => ({
  analysis: null, // { period, sections: [...], totals, highlights, notes }
  loading: false,
  error: null,

  /**
   * Dates go as plain YYYY-MM-DD, never as an ISO instant. The server anchors
   * the window to its own midnight, and posting a browser in one timezone to a
   * server in another is how a month-end report quietly loses its last evening
   * of trade.
   */
  fetchSalesAnalysis: async ({ from, to, compare } = {}) => {
    set({ loading: true, error: null });
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      // Comparison costs a second full pass on the server, so it is only asked
      // for when the reader has actually turned it on.
      if (compare) params.compare = 1;

      const res = await api.get("/api/sales-analysis", { params });
      set({ analysis: res.data.data, loading: false });
      return res.data.data;
    } catch (e) {
      const error =
        e?.response?.data?.error || e?.message || "Could not load the sales analysis";
      set({ loading: false, error });
      return null;
    }
  },
}));

export default useSalesAnalysisStore;
