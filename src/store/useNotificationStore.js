import { create } from "zustand";
import { api, extractApiError } from "@/lib/config";

let _pollingInterval = null;

const useNotificationStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────────
  messages: [],
  alerts: [],
  messageUnreadCount: 0,
  alertUnreadCount: 0,
  loading: { messages: false, alerts: false },
  errors: { messages: null, alerts: null },

  // ── Helpers ────────────────────────────────────────────────────────────────
  _setLoading: (key, val) =>
    set((s) => ({ loading: { ...s.loading, [key]: val } })),
  _setError: (key, err) =>
    set((s) => ({ errors: { ...s.errors, [key]: err } })),

  /**
   * The API calls it `isRead`; everything in this store and in the header calls
   * it `read`. Nothing translated between the two, so `!m.read` was true for
   * every notification ever fetched: the badge never cleared, and "mark all as
   * read" only appeared to work until the next fetch (socket event or the
   * five-minute poll) overwrote the local flag with an undefined one.
   *
   * One adapter at the boundary, one vocabulary inside.
   */
  _normalize: (rows) =>
    (rows ?? []).map((r) => ({ ...r, read: r.isRead ?? r.read ?? false })),

  // ── Fetch messages ─────────────────────────────────────────────────────────
  fetchMessages: async () => {
    const { _setLoading, _setError } = get();
    _setLoading("messages", true);
    _setError("messages", null);
    try {
      const res = await api.get(`/api/notifications/messages`);
      const messages = get()._normalize(res.data?.messages ?? res.data ?? []);
      const messageUnreadCount = messages.filter((m) => !m.read).length;
      set({ messages, messageUnreadCount });
    } catch (err) {
      const msg =
        extractApiError(err) || err.message || "Failed to fetch messages";
      _setError("messages", msg);
    } finally {
      _setLoading("messages", false);
    }
  },

  // ── Fetch alerts ───────────────────────────────────────────────────────────
  fetchAlerts: async () => {
    const { _setLoading, _setError } = get();
    _setLoading("alerts", true);
    _setError("alerts", null);
    try {
      const res = await api.get(`/api/notifications/alerts`);
      const alerts = get()._normalize(res.data?.alerts ?? res.data ?? []);
      const alertUnreadCount = alerts.filter((a) => !a.read).length;
      set({ alerts, alertUnreadCount });
    } catch (err) {
      const msg =
        extractApiError(err) || err.message || "Failed to fetch alerts";
      _setError("alerts", msg);
    } finally {
      _setLoading("alerts", false);
    }
  },

  // ── Mark single message read ───────────────────────────────────────────────
  markMessageRead: async (id) => {
    try {
      await api.patch(
        `/api/notifications/messages/${id}/read`,
        {}
      );
      set((s) => {
        const messages = s.messages.map((m) =>
          m._id === id || m.id === id ? { ...m, read: true, isRead: true } : m
        );
        return { messages, messageUnreadCount: messages.filter((m) => !m.read).length };
      });
    } catch (_) {
      // optimistic — update UI regardless
      set((s) => {
        const messages = s.messages.map((m) =>
          m._id === id || m.id === id ? { ...m, read: true, isRead: true } : m
        );
        return { messages, messageUnreadCount: messages.filter((m) => !m.read).length };
      });
    }
  },

  // ── Mark single alert read ─────────────────────────────────────────────────
  markAlertRead: async (id) => {
    try {
      await api.patch(
        `/api/notifications/alerts/${id}/read`,
        {}
      );
    } catch (_) {}
    set((s) => {
      const alerts = s.alerts.map((a) =>
        a._id === id || a.id === id ? { ...a, read: true, isRead: true } : a
      );
      return { alerts, alertUnreadCount: alerts.filter((a) => !a.read).length };
    });
  },

  // ── Mark all messages read ─────────────────────────────────────────────────
  markAllMessagesRead: async () => {
    try {
      await api.patch(
        `/api/notifications/messages/read-all`,
        {}
      );
    } catch (_) {}
    set((s) => ({
      messages: s.messages.map((m) => ({ ...m, read: true, isRead: true })),
      messageUnreadCount: 0,
    }));
  },

  // ── Mark all alerts read ───────────────────────────────────────────────────
  markAllAlertsRead: async () => {
    try {
      await api.patch(
        `/api/notifications/alerts/read-all`,
        {}
      );
    } catch (_) {}
    set((s) => ({
      alerts: s.alerts.map((a) => ({ ...a, read: true, isRead: true })),
      alertUnreadCount: 0,
    }));
  },

  // ── Socket-triggered invalidation ─────────────────────────────────────────
  invalidate: () => {
    get().fetchMessages();
    get().fetchAlerts();
  },

  // ── Safety polling fallback (socket is primary) ───────────────────────────
  startPolling: () => {
    if (_pollingInterval) return;
    _pollingInterval = setInterval(() => {
      get().fetchMessages();
      get().fetchAlerts();
    }, 5 * 60 * 1000);
  },

  stopPolling: () => {
    if (_pollingInterval) {
      clearInterval(_pollingInterval);
      _pollingInterval = null;
    }
  },
}));

export default useNotificationStore;
