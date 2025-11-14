import { create } from "zustand";

const API_URL = process.env.NEXT_PUBLIC_API;

export const useLubricantStore = create((set, get) => ({
  lubricants: [],
  sales: [],
  weeklySummary: {},
  loading: false,
  error: null,
  selectedProductForSale: null, // 🆕 New state for selected product

  // Utility function to get token
  getAuthHeaders: () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  },

  // 🆕 Set selected product for sale
  setSelectedProductForSale: (product) => {
    set({ selectedProductForSale: product });
  },

  // 🆕 Clear selected product
  clearSelectedProductForSale: () => {
    set({ selectedProductForSale: null });
  },

  //fetch lubricants
  fetchLubricants: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/api/lubricant`, {
        method: "GET",
        headers: get().getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch lubricants");
      const result = await res.json();

      // Grab the array inside data
      set({ lubricants: result.data || [], loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // 🔹 Get lubricant by barcode
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

  // 🔹 Add lubricant
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

      set((state) => ({
        lubricants: [...state.lubricants, data.data],
        loading: false,
      }));

      return data.data;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  // 🔹 Sell lubricant
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

  // 🔹 Get all lubricant sales
  fetchAllSales: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/api/lubricant/lubricant-sales`, {
        headers: get().getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch lubricant sales");
      const data = await res.json();
      set({ sales: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // 🔹 Get weekly summary (includes top 3 sales)
  fetchWeeklySummary: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(
        `${API_URL}/api/lubricant/lubricant-weekly-summary`,
        { headers: get().getAuthHeaders() }
      );
      if (!res.ok) throw new Error("Failed to fetch weekly summary");
      const data = await res.json();
      set({ weeklySummary: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // 🔹 Search lubricants by product name or barcode
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
      const filtered = lubricants.filter((lub) => 
        lub.productName.toLowerCase().includes(lower) ||
        (lub.barcode && lub.barcode.includes(searchTerm))
      );

      return filtered;
    } catch (err) {
      console.error("Error searching lubricants:", err);
      return [];
    }
  }
}));