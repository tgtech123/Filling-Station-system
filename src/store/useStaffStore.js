import { create } from "zustand";
import { api, extractApiError } from "@/lib/config";

const _cache = { staff: { data: null, ts: 0 } };
const STAFF_TTL = 3 * 60_000;
const isFresh = () => _cache.staff.data !== null && Date.now() - _cache.staff.ts < STAFF_TTL;
const bustCache = () => { _cache.staff.ts = 0; };

const useStaffStore = create((set, get) => ({

  /**
   * Drop every cached slot so the next fetch actually hits the network.
   *
   * Each store serves a short TTL cache, and the freshness check runs BEFORE
   * the request — so a socket event arriving mid-TTL would refetch and get the
   * same stale data back. Zeroing `ts` makes isFresh() false whatever the slot
   * shape is, which is what makes the live updates real rather than eventual.
   */
  invalidate: () => {
    Object.values(_cache).forEach((slot) => {
      if (slot && typeof slot === "object" && "ts" in slot) slot.ts = 0;
    });
    // Refetch, don't just expire. Busting the cache alone means the screen only
    // updates on the next navigation — which is exactly the "I had to refresh"
    // problem. Refetching here is what makes the socket update visible.
    get().getAllStaff();
  },
  staff: [],
  loading: {
    fetching: false,
    creating: false,
    updatingId: null,
    deletingId: null,
  },
  error: null,

  createStaff: async (staffData) => {
    set((state) => ({ loading: { ...state.loading, creating: true }, error: null }));
    try {
      const res = await api.post("/api/auth", staffData);
      const data = res.data;
      bustCache();
      set((state) => ({
        staff: [...state.staff, data.staff],
        loading: { ...state.loading, creating: false },
      }));
      return data.staff;
    } catch (err) {
      const errorMsg = extractApiError(err) || err.message;
      set((state) => ({ loading: { ...state.loading, creating: false }, error: errorMsg }));
      throw err;
    }
  },

  getAllStaff: async () => {
    if (isFresh()) {
      set((state) => ({
        staff: _cache.staff.data,
        loading: { ...state.loading, fetching: false },
      }));
      return;
    }
    set((state) => ({ loading: { ...state.loading, fetching: true }, error: null }));
    try {
      const res = await api.get("/api/auth");
      const data = res.data.staff || [];
      _cache.staff = { data, ts: Date.now() };
      set((state) => ({ staff: data, loading: { ...state.loading, fetching: false } }));
    } catch (err) {
      const errorMsg = extractApiError(err) || err.message;
      set((state) => ({ loading: { ...state.loading, fetching: false }, error: errorMsg }));
    }
  },

  updateStaff: async (id, updatedData) => {
    set((state) => ({ loading: { ...state.loading, updatingId: id }, error: null }));
    try {
      const res = await api.post(`/api/auth/update-staff/${id}`, updatedData);
      bustCache();
      set((state) => ({
        staff: state.staff.map((s) => (s._id === id ? res.data.staff : s)),
        loading: { ...state.loading, updatingId: null },
      }));
    } catch (err) {
      const errorMsg = extractApiError(err) || err.message;
      set((state) => ({ loading: { ...state.loading, updatingId: null }, error: errorMsg }));
    }
  },

  deleteStaff: async (id) => {
    set((state) => ({ loading: { ...state.loading, deletingId: id }, error: null }));
    try {
      await api.post(`/api/auth/delete-staff/${id}`, {});
      bustCache();
      set((state) => ({
        staff: state.staff.filter((s) => s._id !== id),
        loading: { ...state.loading, deletingId: null },
      }));
    } catch (err) {
      const errorMsg = extractApiError(err) || err.message;
      set((state) => ({ loading: { ...state.loading, deletingId: null }, error: errorMsg }));
    }
  },
}));

export default useStaffStore;
