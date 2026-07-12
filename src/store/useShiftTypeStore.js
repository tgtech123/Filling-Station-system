import { create } from "zustand";
import { api } from "@/lib/config";

/**
 * Shift types — built-ins + the station's manager-defined custom types.
 * Every shift-type dropdown (staff creation, supervisor scheduling) reads from
 * here so a type created once persists everywhere.
 */
const useShiftTypeStore = create((set, get) => ({
  builtIn: [],
  custom: [],
  loading: false,

  // Merged list for dropdowns: built-ins first, then active custom types
  allTypes: () => [...get().builtIn, ...get().custom.filter((t) => t.isActive !== false)],

  fetchTypes: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get("/api/shifts/types");
      set({
        builtIn: data.data?.builtIn || [],
        custom: data.data?.custom || [],
        loading: false,
      });
    } catch (e) {
      set({ loading: false });
    }
  },

  createType: async (payload) => {
    try {
      const { data } = await api.post("/api/shifts/types", payload);
      await get().fetchTypes();
      return { success: true, data: data.data };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || e.message };
    }
  },
}));

export default useShiftTypeStore;
