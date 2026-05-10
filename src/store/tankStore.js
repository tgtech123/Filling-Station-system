import { create } from "zustand";

export const useTankStore = create((set) => ({
  tanks: [],
  loading: false,
  error: null,

  fetchTanks: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const res = await fetch("/api/tank", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      // Backend returns 404 with empty data when no tanks exist — treat as empty, not an error
      if (!res.ok && res.status !== 404) throw new Error(data.message || "Failed to fetch tanks");

      set({ tanks: data.data || [] });
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },
}));
