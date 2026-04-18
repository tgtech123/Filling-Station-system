import { create } from "zustand";
import axios from "axios";

const useTermsStore = create((set) => ({
  termsText: "",
  loading: false,
  error: null,

  fetchTerms: async () => {
    try {
      set({ loading: true, error: null });
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/api/admin/settings/public`
      );
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