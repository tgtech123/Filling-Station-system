import { create } from "zustand";

const API_URL = process.env.NEXT_PUBLIC_API;

export const useLubricantStore = create((set, get) => ({
  lubricants: [],
  purchases: [],
  sales: [],
  weeklySummary: {},
  loading: false,
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
  },


  saveLubricantPurchase: async (purchaseData) => {
  set({ loading: true, error: null });
  try {
    const response = await fetch(`${API_URL}/api/lubricant/purchases`, {
      method: 'POST',
      headers: get().getAuthHeaders(),
      body: JSON.stringify(purchaseData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to save purchase');
    }

    set((state) => ({
      purchases: [...(state.purchases || []), data.data],
      loading: false,
    }));

    return { success: true, data: data.data };
  } catch (error) {
    set({ error: error.message, loading: false });
    return { success: false, error: error.message };
  }
},


  // Optional: Get all purchases
  getAllPurchases: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/api/lubricant/purchases`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch purchases');
      }

      set({ purchases: data.data, loading: false });
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Optional: Get single purchase by ID
  getPurchaseById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/api/lubricant/purchases/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch purchase');
      }

      set({ loading: false });
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },


}));