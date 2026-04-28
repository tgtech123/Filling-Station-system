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

      if (!res.ok) throw new Error("Failed to fetch tanks");

      const data = await res.json();
      set({ tanks: data.data || [] });
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },
}));
