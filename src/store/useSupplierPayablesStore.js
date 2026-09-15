import { create } from "zustand";
import { api } from "@/lib/config";

/**
 * What the station owes each supplier, and what is late.
 *
 * Read-only, so nothing here throws for a caller to toast: a failed fetch
 * leaves the last good statement on screen and puts the reason in `error`.
 */
const useSupplierPayablesStore = create((set) => ({
  payables: null, // { asOf, suppliers: [...], totals, ageing, counts, notes }
  loading: false,
  error: null,

  /**
   * `asOf` goes as a plain YYYY-MM-DD. Ageing is measured in whole days from a
   * due date, so posting a browser instant to a server in another timezone
   * would shift an invoice a day either side of its deadline.
   */
  fetchSupplierPayables: async ({ asOf, supplierId, status } = {}) => {
    set({ loading: true, error: null });
    try {
      const params = {};
      if (asOf) params.asOf = asOf;
      if (supplierId) params.supplierId = supplierId;
      if (status && status !== "all") params.status = status;

      const res = await api.get("/api/suppliers/payables", { params });
      set({ payables: res.data.data, loading: false });
      return res.data.data;
    } catch (e) {
      const error =
        e?.response?.data?.error || e?.message || "Could not load supplier payables";
      set({ loading: false, error });
      return null;
    }
  },
}));

export default useSupplierPayablesStore;
