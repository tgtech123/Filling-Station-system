import { create } from "zustand";
import { api } from "@/lib/config";

/**
 * Opening and closing stock — quantity and naira — across every product line the
 * station runs: lubricants, store goods, fuel, bulk LPG and cylinders.
 *
 * Read-only, so there is nothing here that throws for a caller to toast: a
 * failed fetch leaves the last good report on screen and puts the reason in
 * `error`, which the page shows above the table.
 */
const useStockPositionStore = create((set) => ({
  position: null, // { period, departments: [...], totals, estimatedCount, notes }
  loading: false,
  error: null,

  /**
   * Dates are sent as plain YYYY-MM-DD, never as an ISO instant. The server
   * anchors the window to its own midnight, and posting a browser in one
   * timezone to a server in another is how a month-end report quietly loses its
   * last evening of trade.
   */
  fetchStockPosition: async ({ from, to, department } = {}) => {
    set({ loading: true, error: null });
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      if (department && department !== "all") params.department = department;

      const res = await api.get("/api/stock-position", { params });
      set({ position: res.data.data, loading: false });
      return res.data.data;
    } catch (e) {
      const error =
        e?.response?.data?.error || e?.message || "Could not load the stock position";
      set({ loading: false, error });
      return null;
    }
  },
}));

export default useStockPositionStore;
