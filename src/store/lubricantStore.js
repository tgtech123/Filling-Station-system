import { create } from "zustand";
import { API_URL } from "@/lib/config";

export const useLubricantStore = create((set, get) => ({
  lubricants: [],
  purchases: [],
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
  getLubricantByBarcode: async (barcode) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/api/lubricant/get-lubricant`, {
        method: "POST",
        headers: get().getAuthHeaders(),
        body: JSON.stringify({ barcode }),
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

  addLubricant: async (lubricantData) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/api/lubricant/add-lubricant`, {
        method: "POST",
        headers: get().getAuthHeaders(),
        body: JSON.stringify(lubricantData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add lubricant");

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
      set({ purchases: purchasesData, loading: false });
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
