import { create } from "zustand";

const API_URL = process.env.NEXT_PUBLIC_API;

export const useLubricantStore = create((set, get) => ({
  lubricants: [],
  sales: [],
  weeklySummary: {},
  loading: false,
  error: null,

  // Utility function to get token
  getAuthHeaders: () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  },

  // 🔹 Fetch all lubricants
  fetchLubricants: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/api/lubricant/`, {
        headers: get().getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch lubricants");
      const data = await res.json();
      set({ lubricants: data, loading: false });
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
}));
