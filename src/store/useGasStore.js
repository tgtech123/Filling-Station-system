import { create } from "zustand";
import { api } from "@/lib/config";

const useGasStore = create((set, get) => ({
  pricing:        null,
  pricingHistory: [],
  cylinderSizes:  [],
  inventory:      null,   // { tanks[], pumps[], totalStockKg, totalCapacityKg, pricePerKg, stockValue }
  tanks:          [],
  pumps:          [],
  gasStaff:       [],
  settings:       null,
  loyaltyConfig:  null,   // { pointsPerK, minRedeem, nairaPerPoint }
  gasEnabled:     null,   // null = not yet fetched, true = enabled, false = disabled
  loading: {
    pricing: false, inventory: false, cylinderSizes: false,
    staff: false, settings: false, tanks: false, pumps: false, loyalty: false, status: false,
  },
  errors: {
    pricing: null, inventory: null, cylinderSizes: null,
    staff: null, settings: null, tanks: null, pumps: null, loyalty: null, status: null,
  },

  _setLoading: (key, val) => set(s => ({ loading: { ...s.loading, [key]: val } })),
  _setError:   (key, val) => set(s => ({ errors:  { ...s.errors,  [key]: val } })),

  // ─── Gas Department Status & Toggle ───────────────────────────────────────

  fetchGasStatus: async () => {
    if (get().gasEnabled !== null) return; // already loaded — don't re-fetch
    get()._setLoading("status", true);
    try {
      const { data } = await api.get("/api/gas/status");
      set({ gasEnabled: data.data?.gasEnabled ?? true });
    } catch {
      set({ gasEnabled: true }); // default to enabled on error
    } finally { get()._setLoading("status", false); }
  },

  toggleGasDepartment: async () => {
    try {
      const { data } = await api.patch("/api/gas/toggle");
      set({ gasEnabled: data.data?.gasEnabled });
      return { success: true, gasEnabled: data.data?.gasEnabled };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || e.message };
    }
  },

  // ─── Pricing ───────────────────────────────────────────────────────────────

  fetchPricing: async () => {
    get()._setLoading("pricing", true);
    try {
      const { data } = await api.get("/api/gas/pricing");
      set({ pricing: data.data });
    } catch (e) {
      get()._setError("pricing", e.response?.data?.message || e.message);
    } finally { get()._setLoading("pricing", false); }
  },

  fetchPricingHistory: async () => {
    try {
      const { data } = await api.get("/api/gas/pricing/history");
      set({ pricingHistory: data.data || [] });
    } catch {}
  },

  setPrice: async (pricePerKg) => {
    try {
      const { data } = await api.post("/api/gas/pricing", { pricePerKg });
      set({ pricing: data.data });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || e.message };
    }
  },

  // ─── Cylinder Sizes ────────────────────────────────────────────────────────

  fetchCylinderSizes: async () => {
    get()._setLoading("cylinderSizes", true);
    try {
      const { data } = await api.get("/api/gas/cylinder-sizes");
      set({ cylinderSizes: data.data || [] });
    } catch (e) {
      get()._setError("cylinderSizes", e.response?.data?.message || e.message);
    } finally { get()._setLoading("cylinderSizes", false); }
  },

  addCylinderSize: async (payload) => {
    try {
      await api.post("/api/gas/cylinder-sizes", payload);
      await get().fetchCylinderSizes();
      return { success: true };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || e.message };
    }
  },

  toggleCylinderSize: async (id) => {
    try {
      await api.patch(`/api/gas/cylinder-sizes/${id}`);
      await get().fetchCylinderSizes();
      return { success: true };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || e.message };
    }
  },

  // ─── Inventory (aggregated from tanks) ────────────────────────────────────

  fetchInventory: async () => {
    get()._setLoading("inventory", true);
    try {
      const { data } = await api.get("/api/gas/inventory");
      set({ inventory: data.data, tanks: data.data?.tanks || [], pumps: data.data?.pumps || [] });
    } catch (e) {
      get()._setError("inventory", e.response?.data?.message || e.message);
    } finally { get()._setLoading("inventory", false); }
  },

  // ─── Tanks ─────────────────────────────────────────────────────────────────

  fetchTanks: async () => {
    get()._setLoading("tanks", true);
    try {
      const { data } = await api.get("/api/gas/tanks");
      set({ tanks: data.data || [] });
    } catch (e) {
      get()._setError("tanks", e.response?.data?.message || e.message);
    } finally { get()._setLoading("tanks", false); }
  },

  addTank: async (payload) => {
    try {
      const { data } = await api.post("/api/gas/tanks", payload);
      await get().fetchTanks();
      return { success: true, data: data.data };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || e.message };
    }
  },

  updateTank: async (id, payload) => {
    try {
      const { data } = await api.patch(`/api/gas/tanks/${id}`, payload);
      await get().fetchTanks();
      return { success: true, data: data.data };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || e.message };
    }
  },

  // ─── Pumps ─────────────────────────────────────────────────────────────────

  fetchPumps: async () => {
    get()._setLoading("pumps", true);
    try {
      const { data } = await api.get("/api/gas/pumps");
      set({ pumps: data.data || [] });
    } catch (e) {
      get()._setError("pumps", e.response?.data?.message || e.message);
    } finally { get()._setLoading("pumps", false); }
  },

  addPump: async (payload) => {
    try {
      const { data } = await api.post("/api/gas/pumps", payload);
      await get().fetchPumps();
      return { success: true, data: data.data };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || e.message };
    }
  },

  updatePump: async (id, payload) => {
    try {
      const { data } = await api.patch(`/api/gas/pumps/${id}`, payload);
      await get().fetchPumps();
      return { success: true, data: data.data };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || e.message };
    }
  },

  // ─── Loyalty Config ────────────────────────────────────────────────────────

  fetchLoyaltyConfig: async () => {
    get()._setLoading("loyalty", true);
    try {
      const { data } = await api.get("/api/gas/loyalty-config");
      set({ loyaltyConfig: data.data });
    } catch (e) {
      get()._setError("loyalty", e.response?.data?.message || e.message);
    } finally { get()._setLoading("loyalty", false); }
  },

  updateLoyaltyConfig: async ({ pointsPerK, minRedeem, nairaPerPoint }) => {
    try {
      const { data } = await api.patch("/api/gas/settings", {
        gasLoyaltyPointsPerK:    pointsPerK,
        gasLoyaltyMinRedeem:     minRedeem,
        gasLoyaltyNairaPerPoint: nairaPerPoint,
      });
      // Reflect in loyaltyConfig state
      set({
        loyaltyConfig: {
          pointsPerK:    data.data?.gasLoyaltyPointsPerK    ?? pointsPerK,
          minRedeem:     data.data?.gasLoyaltyMinRedeem     ?? minRedeem,
          nairaPerPoint: data.data?.gasLoyaltyNairaPerPoint ?? nairaPerPoint,
        },
      });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || e.message };
    }
  },

  // ─── Gas Staff ─────────────────────────────────────────────────────────────

  fetchGasStaff: async () => {
    get()._setLoading("staff", true);
    try {
      const { data } = await api.get("/api/gas/staff");
      set({ gasStaff: data.data || [] });
    } catch (e) {
      get()._setError("staff", e.response?.data?.message || e.message);
    } finally { get()._setLoading("staff", false); }
  },

  assignStaff: async (id, department) => {
    try {
      await api.patch(`/api/gas/staff/${id}/assign`, { department });
      await get().fetchGasStaff();
      return { success: true };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || e.message };
    }
  },

  unassignStaff: async (id) => {
    try {
      await api.patch(`/api/gas/staff/${id}/unassign`);
      await get().fetchGasStaff();
      return { success: true };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || e.message };
    }
  },

  updateGasSettings: async (payload) => {
    try {
      const { data } = await api.patch("/api/gas/settings", payload);
      set({ settings: data.data });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || e.message };
    }
  },
}));

export default useGasStore;
