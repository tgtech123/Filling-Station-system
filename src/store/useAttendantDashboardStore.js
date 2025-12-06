import { create } from 'zustand';

// API Base URL - adjust according to your setup
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Helper function to get auth token
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }
  return null;
};

// Helper function for API calls
const apiCall = async (endpoint) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Zustand store
export const useAttendantDashboardStore = create((set, get) => ({
  // Initial state
  dashboardData: null,
  salesOverview: [],
  dailyLiveSales: [],
  isLoading: false,
  error: null,

  // Fetch complete dashboard data
  fetchDashboard: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await apiCall('/api/attendant/dashboard');

      set({
        dashboardData: response.data,
        salesOverview: response.data.salesOverview,
        dailyLiveSales: response.data.dailyLiveSales,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dashboard data';
      set({
        isLoading: false,
        error: errorMessage,
      });
      console.error('Error fetching dashboard:', error);
    }
  },

  // Fetch only sales overview data
  fetchSalesOverview: async () => {
    const { dashboardData } = get();
    
    // If we already have dashboard data, use it
    if (dashboardData?.salesOverview) {
      set({ salesOverview: dashboardData.salesOverview });
      return;
    }

    // Otherwise fetch complete dashboard
    set({ isLoading: true, error: null });
    
    try {
      const response = await apiCall('/api/attendant/dashboard');

      set({
        salesOverview: response.data.salesOverview,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch sales overview';
      set({
        isLoading: false,
        error: errorMessage,
      });
      console.error('Error fetching sales overview:', error);
    }
  },

  // Fetch only daily live sales data
  fetchDailyLiveSales: async () => {
    const { dashboardData } = get();
    
    // If we already have dashboard data, use it
    if (dashboardData?.dailyLiveSales) {
      set({ dailyLiveSales: dashboardData.dailyLiveSales });
      return;
    }

    // Otherwise fetch complete dashboard
    set({ isLoading: true, error: null });
    
    try {
      const response = await apiCall('/api/attendant/dashboard');

      set({
        dailyLiveSales: response.data.dailyLiveSales,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch daily live sales';
      set({
        isLoading: false,
        error: errorMessage,
      });
      console.error('Error fetching daily live sales:', error);
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Reset store to initial state
  reset: () => {
    set({
      dashboardData: null,
      salesOverview: [],
      dailyLiveSales: [],
      isLoading: false,
      error: null,
    });
  },
}));

// Selector hooks for better performance
export const useAttendantDashboard = () => {
  const dashboardData = useAttendantDashboardStore((state) => state.dashboardData);
  const isLoading = useAttendantDashboardStore((state) => state.isLoading);
  const error = useAttendantDashboardStore((state) => state.error);
  const fetchDashboard = useAttendantDashboardStore((state) => state.fetchDashboard);

  return { dashboardData, isLoading, error, fetchDashboard };
};

export const useSalesOverview = () => {
  const salesOverview = useAttendantDashboardStore((state) => state.salesOverview);
  const isLoading = useAttendantDashboardStore((state) => state.isLoading);
  const error = useAttendantDashboardStore((state) => state.error);
  const fetchSalesOverview = useAttendantDashboardStore((state) => state.fetchSalesOverview);

  return { salesOverview, isLoading, error, fetchSalesOverview };
};

export const useDailyLiveSales = () => {
  const dailyLiveSales = useAttendantDashboardStore((state) => state.dailyLiveSales);
  const isLoading = useAttendantDashboardStore((state) => state.isLoading);
  const error = useAttendantDashboardStore((state) => state.error);
  const fetchDailyLiveSales = useAttendantDashboardStore((state) => state.fetchDailyLiveSales);

  return { dailyLiveSales, isLoading, error, fetchDailyLiveSales };
};