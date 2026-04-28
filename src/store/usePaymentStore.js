import { create } from "zustand";
import axios from "axios";

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
      const response = await axios.get("/api/payments/current-plan", {
        headers: { Authorization: `Bearer ${token}` },
      });
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
        "/api/payments/initialize",
        { planSlug, billingCycle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set({ paymentLoading: false });
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
      const token = localStorage.getItem("token");
      const response = await axios.get(`/api/payments/verify/${reference}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      set({ paymentLoading: false });
      // Only refresh plan for authenticated users — guests have no account yet
      const isGuest = response.data?.data?.isGuest === true;
      if (!isGuest) {
        await get().fetchCurrentPlan();
      }
      return response.data;
    } catch (err) {
      set({ paymentLoading: false });
      throw err;
    }
  },
}));

export default usePaymentStore;
