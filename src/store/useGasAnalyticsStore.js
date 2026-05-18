import { create } from "zustand";
import { api } from "@/lib/config";

const useGasAnalyticsStore = create((set, get) => ({
  revenue: null,
  dailySales: [],
  profitLoss: null,
  inventoryMovement: null,
  ordersVsSales: null,
  cashierPerformance: [],
  topCustomers: [],
  reconciliation: null,
  loading: {},
  errors: {},

  _set: (key, val)   => set(s => ({ [key]: val })),
  _load: (key, bool) => set(s => ({ loading: { ...s.loading, [key]: bool } })),
  _err:  (key, msg)  => set(s => ({ errors:  { ...s.errors,  [key]: msg  } })),

  fetchRevenue: async (params = {}) => {
    get()._load("revenue", true);
    try {
      const { data } = await api.get("/api/gas/analytics/revenue", { params });
      get()._set("revenue", data.data);
    } catch (e) { get()._err("revenue", e.response?.data?.message || e.message); }
    finally { get()._load("revenue", false); }
  },

  fetchDailySales: async (params = {}) => {
    get()._load("dailySales", true);
    try {
      const { data } = await api.get("/api/gas/analytics/daily-sales", { params });
      get()._set("dailySales", data.data || []);
    } catch (e) { get()._err("dailySales", e.response?.data?.message || e.message); }
    finally { get()._load("dailySales", false); }
  },

  fetchProfitLoss: async (params = {}) => {
    get()._load("profitLoss", true);
    try {
      const { data } = await api.get("/api/gas/analytics/profit-loss", { params });
      get()._set("profitLoss", data.data);
    } catch (e) { get()._err("profitLoss", e.response?.data?.message || e.message); }
    finally { get()._load("profitLoss", false); }
  },

  fetchInventoryMovement: async () => {
    get()._load("inventoryMovement", true);
    try {
      const { data } = await api.get("/api/gas/analytics/inventory-movement");
      get()._set("inventoryMovement", data.data);
    } catch (e) { get()._err("inventoryMovement", e.response?.data?.message || e.message); }
    finally { get()._load("inventoryMovement", false); }
  },

  fetchOrdersVsSales: async () => {
    get()._load("ordersVsSales", true);
    try {
      const { data } = await api.get("/api/gas/analytics/orders-vs-sales");
      get()._set("ordersVsSales", data.data);
    } catch (e) { get()._err("ordersVsSales", e.response?.data?.message || e.message); }
    finally { get()._load("ordersVsSales", false); }
  },

  fetchCashierPerformance: async () => {
    try {
      const { data } = await api.get("/api/gas/analytics/cashier-performance");
      get()._set("cashierPerformance", data.data || []);
    } catch {}
  },

  fetchTopCustomers: async () => {
    try {
      const { data } = await api.get("/api/gas/analytics/top-customers");
      get()._set("topCustomers", data.data || []);
    } catch {}
  },

  fetchReconciliation: async () => {
    get()._load("reconciliation", true);
    try {
      const { data } = await api.get("/api/gas/reconciliation/today");
      get()._set("reconciliation", data.data);
    } catch (e) { get()._err("reconciliation", e.response?.data?.message || e.message); }
    finally { get()._load("reconciliation", false); }
  },

  submitReconciliation: async (payload) => {
    try {
      const { data } = await api.post("/api/gas/reconciliation", payload);
      return { success: true, data: data.data };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || e.message };
    }
  },
}));

export default useGasAnalyticsStore;
