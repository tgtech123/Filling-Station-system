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
  /**
   * Verify a payment, with retries.
   *
   * This runs at the single worst moment to fail: the customer's card has been
   * charged and they are waiting to be taken to station setup. A one-off network
   * blip here previously dumped them back on the pricing page with "something
   * went wrong", which reads as "my money is gone".
   *
   * Two deliberate choices:
   *
   *  - SAME-ORIGIN. It calls the app's own /api/payments/verify proxy rather
   *    than the backend directly. Mobile browsers throw "Load failed" on some
   *    direct cross-origin calls — the same problem the accounting screens hit
   *    and solved this way — and a redirect arriving from Paystack is exactly
   *    the situation where a browser is fussiest.
   *
   *  - RETRIES. Render can be waking from idle, and the first verify after a
   *    payment also calls Paystack and sends a receipt, so it is the slowest
   *    request in the flow. Three attempts with backoff costs a few seconds and
   *    saves a registration.
   *
   * A 4xx is NOT retried — that is a real answer (unknown reference, amount
   * mismatch) and repeating it just delays telling the customer.
   */
  verifyPayment: async (reference) => {
    set({ paymentLoading: true });

    const attempts = 3;
    let lastError;

    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        const res = await fetch(`/api/payments/verify/${encodeURIComponent(reference)}`, {
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        let body = null;
        try { body = await res.json(); } catch { /* empty or non-JSON body */ }

        if (res.ok) {
          set({ paymentLoading: false });
          // Only refresh the plan for authenticated users — guests have no account yet
          if (body?.data?.isGuest !== true) {
            await get().fetchCurrentPlan();
          }
          return body;
        }

        // A definite answer from the server — do not retry it.
        if (res.status >= 400 && res.status < 500) {
          set({ paymentLoading: false });
          throw Object.assign(new Error(body?.error || body?.message || "Verification failed"), {
            response: { status: res.status, data: body },
            final: true,
          });
        }

        lastError = new Error(body?.error || `Server error (${res.status})`);
      } catch (err) {
        if (err?.final) throw err;   // 4xx — already decided
        lastError = err;             // network/5xx — worth another go
      }

      if (attempt < attempts) {
        await new Promise((r) => setTimeout(r, attempt * 1500));
      }
    }

    set({ paymentLoading: false });
    throw lastError || new Error("Could not verify the payment");
  },
}));

export default usePaymentStore;
