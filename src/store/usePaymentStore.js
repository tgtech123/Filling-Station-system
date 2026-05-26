import { create } from "zustand";
import { api } from "@/lib/config";

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
      const response = await api.get("/api/payments/current-plan");
      set({ currentPlan: response.data.data, loading: false });
      return response.data.data;
    } catch (err) {
      set({ loading: false });
      return null;
    }
  },

  // ── Initialize Paystack payment
  initializePayment: async (planSlug, billingCycle) => {
    try {
      set({ paymentLoading: true });
      const response = await api.post(
        "/api/payments/initialize",
        { planSlug, billingCycle }
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
      const response = await api.get(`/api/payments/verify/${reference}`);
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
