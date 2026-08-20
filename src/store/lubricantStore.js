import { create } from "zustand";
import { API_URL } from "@/lib/config";

export const useLubricantStore = create((set, get) => ({
  lubricants: [],
  purchases: [],
  purchaseSummary: null,
  stockAudit: null,
  sales: [],
  transactions: [],
  weeklySummary: {},
  dailySummary: {},
  loading: false,
  transactionsLoading: false,
  error: null,
  selectedProductForSale: null,

  // Utility function to get token
  getAuthHeaders: () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  },

  // Set selected product for sale
  setSelectedProductForSale: (product) => {
    set({ selectedProductForSale: product });
  },

  // Clear selected product
  clearSelectedProductForSale: () => {
    set({ selectedProductForSale: null });
  },

  // Fetch lubricants
  fetchLubricants: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/api/lubricant`, {
        method: "GET",
        headers: get().getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch lubricants");
      const result = await res.json();

      // Handle both { data: [...] } and direct array responses
      const lubricantsData = (Array.isArray(result) ? result : result.data || []).filter(Boolean);
      set({ lubricants: lubricantsData, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // Get lubricant by barcode
  /**
   * `purpose` tells the server which job this lookup is for.
   *
   * Selling refuses an empty shelf; receiving must not, because that is exactly
   * when a product has run out. Same endpoint, opposite expectations.
   */
  getLubricantByBarcode: async (barcode, purpose = "sale") => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/api/lubricant/get-lubricant`, {
        method: "POST",
        headers: get().getAuthHeaders(),
        body: JSON.stringify({ barcode, purpose }),
      });
      if (!res.ok) throw new Error("Failed to get lubricant by barcode");
      const data = await res.json();
      set({ loading: false });
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  // Add lubricant
  /**
   * The station's standing margins, by category and by unit name.
   *
   * Cached on the store rather than fetched per modal open: the add-product form
   * needs it the instant a category is chosen, and a round trip at that moment
   * shows the user an empty percentage box that fills in a beat later.
   */
  pricingSettings: null,

  fetchPricingSettings: async () => {
    try {
      const res = await fetch(`${API_URL}/api/lubricant/pricing-settings`, {
        headers: get().getAuthHeaders(),
      });
      const data = await res.json();
      if (res.ok) set({ pricingSettings: data.data });
      return data.data;
    } catch {
      return null;
    }
  },

  updatePricingSettings: async (payload) => {
    try {
      const res = await fetch(`${API_URL}/api/lubricant/pricing-settings`, {
        method: "PATCH",
        headers: get().getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || "Failed to save" };
      set({ pricingSettings: data.data });
      return { success: true, message: data.message, data: data.data };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  /**
   * Correct a count to what is physically on the shelf.
   *
   * `expectedBefore` is the figure the person was looking at when they counted.
   * The server refuses if it has moved since — a sale made mid-count must not be
   * silently undone by an absolute figure typed a minute ago.
   */
  adjustStock: async (id, { quantityAfter, reason, note, expectedBefore }) => {
    try {
      const res = await fetch(`${API_URL}/api/lubricant/${id}/adjust-stock`, {
        method: "POST",
        headers: get().getAuthHeaders(),
        body: JSON.stringify({ quantityAfter, reason, note, expectedBefore }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || "Could not adjust stock" };
      await get().fetchLubricants();
      return { success: true, message: data.message, data: data.data };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  /** Everything that ever moved this product's stock. */
  fetchProductHistory: async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/lubricant/${id}/history`, {
        headers: get().getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || "Could not load history" };
      return { success: true, data: data.data };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  /**
   * Opening stock, movements and closing stock for a window — the audit sheet.
   *
   * Dates go up as plain YYYY-MM-DD. The server owns the day boundaries (a
   * closing date has to include its own day), and sending an ISO timestamp from
   * a browser in one timezone to a server in another is how a month-end report
   * quietly loses its last evening of trade.
   */
  fetchStockAudit: async ({ from, to, category } = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      if (category && category !== "all") params.set("category", category);

      const res = await fetch(
        `${API_URL}/api/lubricant/reports/stock-audit?${params.toString()}`,
        { headers: get().getAuthHeaders() }
      );
      const data = await res.json();
      if (!res.ok) {
        set({ loading: false, error: data.error });
        return { success: false, error: data.error || "Could not load the stock report" };
      }
      set({ stockAudit: data.data, loading: false });
      return { success: true, data: data.data };
    } catch (e) {
      set({ loading: false, error: e.message });
      return { success: false, error: e.message };
    }
  },

  /** Every consignment still holding stock, across the station. */
  fetchOpenBatches: async () => {
    try {
      const res = await fetch(`${API_URL}/api/lubricant/reports/open-batches`, {
        headers: get().getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || "Could not load consignments" };
      return { success: true, data: data.data, totalValue: data.totalValue };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  addLubricant: async (lubricantData) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/api/lubricant/add-lubricant`, {
        method: "POST",
        headers: get().getAuthHeaders(),
        body: JSON.stringify(lubricantData),
      });

      const data = await res.json();
      // This endpoint reports failures as `error`, not `message` — reading only
      // `message` meant every rejection reached the user as a bare "Failed to
      // add lubricant", including "access denied" and "duplicate barcode",
      // which are the two a person can actually do something about.
      if (!res.ok) {
        throw new Error(
          data.error ||
            data.message ||
            (res.status === 403
              ? "You do not have permission to register products. Ask a manager."
              : "Failed to add lubricant")
        );
      }

      const newItem = data.data || data.lubricant || data;
      set((state) => ({
        lubricants: newItem
          ? [...state.lubricants, newItem]
          : state.lubricants,
        loading: false,
      }));

      return newItem;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  // Sell lubricant
  sellLubricant: async (saleData) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/api/lubricant/sell-lubricant`, {
        method: "POST",
        headers: get().getAuthHeaders(),
        body: JSON.stringify(saleData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to record sale");

      set((state) => ({
        sales: [...state.sales, data.data],
        loading: false,
      }));

      return data.data;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  // Get all lubricant sales
  fetchAllSales: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/api/lubricant/lubricant-sales`, {
        headers: get().getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch lubricant sales");
      const data = await res.json();


      // Handle both { data: [...] } and direct array responses
      const salesData = Array.isArray(data)
        ? data
        : data.data || data.sales || [];


      set({ sales: salesData, loading: false });
      return salesData;
    } catch (err) {
      console.error("Error fetching sales:", err);
      set({ error: err.message, loading: false });
    }
  },

  // Get weekly summary (includes top 3 sales) - NOW USES TRANSACTIONS
  fetchWeeklySummary: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(
        `${API_URL}/api/lubricant/lubricant-weekly-summary`,
        { headers: get().getAuthHeaders() }
      );
      if (!res.ok) throw new Error("Failed to fetch weekly summary");
      const data = await res.json();


      // Handle nested data structure - the summary is in data.data
      const summaryData = data.data || data;
      set({ weeklySummary: summaryData, loading: false });

      return summaryData;
    } catch (err) {
      console.error("Error fetching weekly summary:", err);
      set({ error: err.message, loading: false });
    }
  },

  // Get daily summary (today's sales, inventory value, low stock count)
  fetchDailySummary: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(
        `${API_URL}/api/lubricant/lubricant-daily-summary`,
        { headers: get().getAuthHeaders() }
      );
      if (!res.ok) throw new Error("Failed to fetch daily summary");
      const data = await res.json();


      // Handle nested data structure
      const summaryData = data.summary || data;
      set({ dailySummary: summaryData, loading: false });

      return summaryData;
    } catch (err) {
      console.error("Error fetching daily summary:", err);
      set({ error: err.message, loading: false });
    }
  },
  fetchMonthlySummary: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(
        `${API_URL}/api/lubricant/lubricant-monthly-summary`,
        { headers: get().getAuthHeaders() }
      );
      if (!res.ok) throw new Error("Failed to fetch monthly summary");
      const data = await res.json();


      // Handle nested data structure - the summary is in data.data
      const summaryData = data.data || data;
      set({ monthlySummary: summaryData, loading: false });

      return summaryData;
    } catch (err) {
      console.error("Error fetching monthly summary:", err);
      set({ error: err.message, loading: false });
    }
  },
  // Search lubricants by product name or barcode
  searchLubricants: async (searchTerm) => {
    const lower = searchTerm.toLowerCase();

    try {
      // Fetch all lubricants if not already loaded
      let lubricants = get().lubricants;
      if (!lubricants.length) {
        await get().fetchLubricants();
        lubricants = get().lubricants;
      }

      // Filter by productName or barcode
      const filtered = lubricants.filter(
        (lub) =>
          lub.productName.toLowerCase().includes(lower) ||
          (lub.barcode && lub.barcode.includes(searchTerm))
      );

      return filtered;
    } catch (err) {
      console.error("Error searching lubricants:", err);
      return [];
    }
  },

  // Save lubricant purchase
  saveLubricantPurchase: async (purchaseData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/api/lubricant/purchases`, {
        method: "POST",
        headers: get().getAuthHeaders(),
        body: JSON.stringify(purchaseData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save purchase");
      }

      set((state) => ({
        purchases: [...(state.purchases || []), data.data],
        loading: false,
      }));

      // Refresh lubricants so the search cache reflects the new unitPrices
      // written by the purchase (fire-and-forget — modal closes after a 3s delay anyway)
      get().fetchLubricants();

      return { success: true, data: data.data };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Get all purchases
  getAllPurchases: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/api/lubricant/purchases`, {
        method: "GET",
        headers: get().getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch purchases");
      }

      const purchasesData = Array.isArray(data) ? data : data.data || [];
      // The money the list never carried. Totalled by the server over the whole
      // query, so it stays right when the table is only showing one page of it.
      set({ purchases: purchasesData, purchaseSummary: data.summary || null, loading: false });
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Get single purchase by ID
  getPurchaseById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/api/lubricant/purchases/${id}`, {
        method: "GET",
        headers: get().getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch purchase");
      }

      set({ loading: false });
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Get all lubricant transactions (sales grouped)
  fetchAllTransactions: async () => {
    set({ transactionsLoading: true });
    try {
      const res = await fetch(`${API_URL}/api/lubricant/transactions`, {
        method: "GET",
        headers: get().getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch transactions");
      const data = await res.json();
      const transactionsData = Array.isArray(data) ? data : data.data || [];
      set({ transactions: transactionsData, transactionsLoading: false });
    } catch (err) {
      set({ error: err.message, transactionsLoading: false });
    }
  },
}));
