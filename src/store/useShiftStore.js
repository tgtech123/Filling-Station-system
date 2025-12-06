// import { create } from "zustand";

// const API_URL = process.env.NEXT_PUBLIC_API || "";

// const useShiftStore = create((set, get) => ({
//   shifts: [],
//   currentShift: null,
//   activeShifts: [],
//   availablePumps: [],
//   loading: false,
//   error: null,

//   // Utility function to get auth headers
//   getAuthHeaders: () => {
//     const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
//     return {
//       "Content-Type": "application/json",
//       Authorization: token ? `Bearer ${token}` : "",
//     };
//   },

//   // Start a new shift
//   startShift: async (shiftData) => {
//     set({ loading: true, error: null });
//     try {
//       const res = await fetch(`${API_URL}/api/shifts/start`, {
//         method: "POST",
//         headers: get().getAuthHeaders(),
//         body: JSON.stringify(shiftData),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || "Failed to start shift");
//       }

//       set({
//         currentShift: data.data,
//         loading: false,
//       });

//       return { success: true, data: data.data };
//     } catch (err) {
//       set({ error: err.message, loading: false });
//       return { success: false, error: err.message };
//     }
//   },

//   // End current shift
//   endShift: async (shiftId, closingMeterReading) => {
//     set({ loading: true, error: null });
//     try {
//       const res = await fetch(`${API_URL}/api/shifts/${shiftId}/end`, {
//         method: "PUT",
//         headers: get().getAuthHeaders(),
//         body: JSON.stringify({ closingMeterReading }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || "Failed to end shift");
//       }

//       set({
//         currentShift: null,
//         loading: false,
//       });

//       // Refresh shifts list
//       get().fetchShifts();

//       return { success: true, data: data.data };
//     } catch (err) {
//       set({ error: err.message, loading: false });
//       return { success: false, error: err.message };
//     }
//   },

//   // Get all shifts (with optional filters)
//   fetchShifts: async (filters = {}) => {
//     set({ loading: true, error: null });
//     try {
//       const queryParams = new URLSearchParams();
      
//       // Add filters to query params
//       if (filters.page) queryParams.append("page", filters.page);
//       if (filters.limit) queryParams.append("limit", filters.limit);
//       if (filters.status) queryParams.append("status", filters.status);
//       if (filters.startDate) queryParams.append("startDate", filters.startDate);
//       if (filters.endDate) queryParams.append("endDate", filters.endDate);
//       if (filters.attendantId) queryParams.append("attendantId", filters.attendantId);

//       const url = `${API_URL}/api/shifts?${queryParams.toString()}`;
      
//       const res = await fetch(url, {
//         method: "GET",
//         headers: get().getAuthHeaders(),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || "Failed to fetch shifts");
//       }

//       set({
//         shifts: data.data || [],
//         loading: false,
//       });

//       return { 
//         success: true, 
//         data: data.data, 
//         pagination: data.pagination 
//       };
//     } catch (err) {
//       set({ error: err.message, loading: false });
//       return { success: false, error: err.message };
//     }
//   },

//   // Get active shifts and available pumps
//   fetchActiveShiftsAndPumps: async () => {
//     set({ loading: true, error: null });
//     try {
//       const res = await fetch(`${API_URL}/api/shifts/active`, {
//         method: "GET",
//         headers: get().getAuthHeaders(),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || "Failed to fetch active shifts");
//       }

//       set({
//         activeShifts: data.data.activeShifts || [],
//         availablePumps: data.data.availablePumps || [],
//         loading: false,
//       });

//       return { success: true, data: data.data };
//     } catch (err) {
//       set({ error: err.message, loading: false });
//       return { success: false, error: err.message };
//     }
//   },

//   // Get current shift for logged-in attendant
//   fetchCurrentShift: async () => {
//     set({ loading: true, error: null });
//     try {
//       const res = await fetch(`${API_URL}/api/shifts/current`, {
//         method: "GET",
//         headers: get().getAuthHeaders(),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || "Failed to fetch current shift");
//       }

//       set({
//         currentShift: data.data,
//         loading: false,
//       });

//       return { success: true, data: data.data };
//     } catch (err) {
//       set({ error: err.message, loading: false });
//       return { success: false, error: err.message };
//     }
//   },

//   // Clear current shift (useful when logging out)
//   clearCurrentShift: () => {
//     set({ currentShift: null });
//   },

//   // Clear error
//   clearError: () => {
//     set({ error: null });
//   },

//   // Reset store
//   resetStore: () => {
//     set({
//       shifts: [],
//       currentShift: null,
//       activeShifts: [],
//       availablePumps: [],
//       loading: false,
//       error: null,
//     });
//   },
// }));

// export default useShiftStore;

import { create } from "zustand";

const API_URL = process.env.NEXT_PUBLIC_API || "";

const useShiftStore = create((set, get) => ({
  shifts: [],
  currentShift: null,
  activeShifts: [],
  availablePumps: [],
  salesReport: {
    data: [],
    summary: null,
    pagination: null,
  },
  loading: false,
  error: null,

  // Utility function to get auth headers
  getAuthHeaders: () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  },

  // Start a new shift
  startShift: async (shiftData) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/api/shifts/start`, {
        method: "POST",
        headers: get().getAuthHeaders(),
        body: JSON.stringify(shiftData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to start shift");
      }

      set({
        currentShift: data.data,
        loading: false,
      });

      return { success: true, data: data.data };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false, error: err.message };
    }
  },

  // End current shift
  endShift: async (shiftId, closingMeterReading) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/api/shifts/${shiftId}/end`, {
        method: "PUT",
        headers: get().getAuthHeaders(),
        body: JSON.stringify({ closingMeterReading }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to end shift");
      }

      set({
        currentShift: null,
        loading: false,
      });

      // Refresh shifts list and sales report
      get().fetchShifts();
      get().fetchSalesReport();

      return { success: true, data: data.data };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false, error: err.message };
    }
  },

  // Get all shifts (with optional filters)
  fetchShifts: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      if (filters.page) queryParams.append("page", filters.page);
      if (filters.limit) queryParams.append("limit", filters.limit);
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);
      if (filters.attendantId) queryParams.append("attendantId", filters.attendantId);

      const url = `${API_URL}/api/shifts?${queryParams.toString()}`;
      
      const res = await fetch(url, {
        method: "GET",
        headers: get().getAuthHeaders(),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch shifts");
      }

      set({
        shifts: data.data || [],
        loading: false,
      });

      return { 
        success: true, 
        data: data.data, 
        pagination: data.pagination 
      };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false, error: err.message };
    }
  },

  // Get active shifts and available pumps
  fetchActiveShiftsAndPumps: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/api/shifts/active`, {
        method: "GET",
        headers: get().getAuthHeaders(),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch active shifts");
      }

      set({
        activeShifts: data.data.activeShifts || [],
        availablePumps: data.data.availablePumps || [],
        loading: false,
      });

      return { success: true, data: data.data };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false, error: err.message };
    }
  },

  // Get current shift for logged-in attendant
  fetchCurrentShift: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/api/shifts/current`, {
        method: "GET",
        headers: get().getAuthHeaders(),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch current shift");
      }

      set({
        currentShift: data.data,
        loading: false,
      });

      return { success: true, data: data.data };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false, error: err.message };
    }
  },

  // ========== NEW: SALES REPORT FUNCTION ==========
  
  // Fetch sales report for the logged-in attendant
  fetchSalesReport: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      
      // Default to completed shifts for sales report
      queryParams.append("status", "Completed");
      
      // Add optional filters
      if (filters.page) queryParams.append("page", filters.page);
      if (filters.limit) queryParams.append("limit", filters.limit || "50"); // Default higher limit for reports
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);

      const url = `${API_URL}/api/shifts?${queryParams.toString()}`;
      
      const res = await fetch(url, {
        method: "GET",
        headers: get().getAuthHeaders(),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch sales report");
      }

      const shifts = data.data || [];

      // Calculate summary statistics
      const summary = {
        totalShifts: shifts.length,
        totalLitresSold: shifts.reduce((sum, shift) => sum + (shift.litresSold || 0), 0),
        totalRevenue: shifts.reduce((sum, shift) => sum + (shift.totalAmount || 0), 0),
        averageLitresPerShift: 0,
        averageRevenuePerShift: 0,
      };

      if (summary.totalShifts > 0) {
        summary.averageLitresPerShift = Math.round(summary.totalLitresSold / summary.totalShifts);
        summary.averageRevenuePerShift = Math.round(summary.totalRevenue / summary.totalShifts);
      }

      // Format data for table display
      const formattedData = shifts.map(shift => ({
        id: shift._id,
        date: new Date(shift.shiftDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        shiftType: shift.shiftType,
        pump: shift.pumpTitle,
        product: shift.product,
        startTime: new Date(shift.startTime).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        endTime: shift.endTime ? new Date(shift.endTime).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }) : 'N/A',
        openingReading: shift.openingMeterReading,
        closingReading: shift.closingMeterReading,
        litresSold: shift.litresSold,
        pricePerLtr: shift.pricePerLtr,
        totalAmount: shift.totalAmount,
        status: shift.status,
      }));

      set({
        salesReport: {
          data: formattedData,
          summary,
          pagination: data.pagination,
        },
        loading: false,
      });

      return { 
        success: true, 
        data: formattedData,
        summary,
        pagination: data.pagination 
      };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false, error: err.message };
    }
  },

  // Clear current shift (useful when logging out)
  clearCurrentShift: () => {
    set({ currentShift: null });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Reset store
  resetStore: () => {
    set({
      shifts: [],
      currentShift: null,
      activeShifts: [],
      availablePumps: [],
      salesReport: {
        data: [],
        summary: null,
        pagination: null,
      },
      loading: false,
      error: null,
    });
  },
}));

export default useShiftStore;