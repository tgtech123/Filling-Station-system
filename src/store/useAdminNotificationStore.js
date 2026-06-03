import { create } from "zustand";
import { API_URL } from "@/lib/config";

const useAdminNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  _pollingTimer: null,

  getAuthHeaders: () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  },

  fetchNotifications: async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/notifications?limit=30`, {
        headers: get().getAuthHeaders(),
      });
      if (!res.ok) return;
      const data = await res.json();
      set({
        notifications: data.notifications || [],
        unreadCount: data.unreadCount ?? 0,
      });
    } catch {}
  },

  fetchUnreadCount: async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/notifications/count`, {
        headers: get().getAuthHeaders(),
      });
      if (!res.ok) return;
      const data = await res.json();
      set({ unreadCount: data.unreadCount ?? 0 });
    } catch {}
  },

  markRead: async (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        (n.id || n._id) === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
    try {
      await fetch(`${API_URL}/api/admin/notifications/${id}/read`, {
        method: "PATCH",
        headers: get().getAuthHeaders(),
      });
    } catch {}
  },

  markAllRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
    try {
      await fetch(`${API_URL}/api/admin/notifications/read-all`, {
        method: "PATCH",
        headers: get().getAuthHeaders(),
      });
    } catch {}
  },

  startPolling: () => {
    const existing = get()._pollingTimer;
    if (existing) clearInterval(existing);
    const timer = setInterval(() => get().fetchNotifications(), 30000);
    set({ _pollingTimer: timer });
  },

  stopPolling: () => {
    const timer = get()._pollingTimer;
    if (timer) clearInterval(timer);
    set({ _pollingTimer: null });
  },
}));

export default useAdminNotificationStore;
