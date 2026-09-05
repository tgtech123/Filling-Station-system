import { create } from "zustand";
import { api, extractApiError } from "@/lib/config";

/**
 * Shift types — built-ins + the station's manager-defined custom types.
 * Every shift-type dropdown (staff creation, supervisor scheduling) reads from
 * here so a type created once persists everywhere.
 *
 * Built-ins can't be renamed/deleted (their name is referenced by value on
 * shifts and staff), but a manager can HIDE a built-in it doesn't use so the
 * dropdowns stay short. Hidden built-ins are omitted from `fetchTypes` but
 * returned (flagged inactive) by `fetchAllTypes` for the management view.
 */
const useShiftTypeStore = create((set, get) => ({
  builtIn: [],
  custom: [],
  loading: false,

  // Merged list for dropdowns: visible built-ins first, then active custom types
  allTypes: () => [
    ...get().builtIn.filter((t) => t.isActive !== false),
    ...get().custom.filter((t) => t.isActive !== false),
  ],

  // Selection view — hidden built-ins already filtered out server-side
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

  // Management view — includes hidden built-ins and inactive custom types
  fetchAllTypes: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get("/api/shifts/types?includeInactive=true");
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
      return { success: false, error: extractApiError(e) || e.message };
    }
  },

  // Hide/show a built-in shift type for this station
  toggleBuiltIn: async (name, isActive, { includeInactive = false } = {}) => {
    try {
      await api.patch(`/api/shifts/types/builtin/${encodeURIComponent(name)}`, { isActive });
      await (includeInactive ? get().fetchAllTypes() : get().fetchTypes());
      return { success: true };
    } catch (e) {
      return { success: false, error: extractApiError(e) || e.message };
    }
  },
}));

export default useShiftTypeStore;
