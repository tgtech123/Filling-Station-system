import { create } from "zustand";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API || "http://localhost:5000";

const usePaymentStore = create((set, get) => ({
  // ── State
  currentPlan: null,
  loading: false,
  error: null,
  paymentLoading: false,

  // ── Fetch current plan
  fetchCurrentPlan: async () => {
    try {
      set({ loading: true });
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/api/payments/current-plan`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set({ currentPlan: response.data.data, loading: false });
    } catch (err) {
      set({ loading: false });
    }
  },

  // ── Initialize Paystack payment
  initializePayment: async (planSlug, billingCycle) => {
    try {
      set({ paymentLoading: true });
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BASE_URL}/api/payments/initialize`,
        { planSlug, billingCycle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set({ paymentLoading: false });
      // Redirect to Paystack checkout
      window.location.href = response.data.data.authorizationUrl;
      return response.data.data;
    } catch (err) {
      set({ paymentLoading: false });
      throw err;
    }
  },

  // ── Verify payment after Paystack callback
  verifyPayment: async (reference) => {
    try {
      set({ paymentLoading: true });

      // Don't require token for verify
      const token = localStorage.getItem("token");
      const headers = token
        ? { Authorization: `Bearer ${token}` }
        : {};

      const response = await axios.get(
        `${BASE_URL}/api/payments/verify/${reference}`,
        { headers }
      );

      set({ paymentLoading: false });
      await get().fetchCurrentPlan();
      return response.data;
    } catch (err) {
      set({ paymentLoading: false });
      throw err;
    }
  },
}));

export default usePaymentStore;
