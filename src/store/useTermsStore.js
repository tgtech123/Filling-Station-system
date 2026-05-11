import { create } from "zustand";
import { api } from "@/lib/config";

const useTermsStore = create((set) => ({
  termsText: "",
  loading: false,
  error: null,

  fetchTerms: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.get(`/api/admin/settings/public`);
      set({
        termsText: response.data.data?.termsAndConditions || "No terms available",
        loading: false,
      });
    } catch (err) {
      set({
        loading: false,
        error: "Failed to load terms",
      });
    }
  },
}));

export default useTermsStore;