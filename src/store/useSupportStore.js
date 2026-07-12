import { create } from "zustand";
import { API_URL } from "@/lib/config";

const getAuthHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

const useSupportStore = create((set) => ({
  faqs: [],
  tickets: [],
  adminTickets: [],
  loading: false,
  error: null,

  // ── User-facing ──────────────────────────────────

  fetchFaqs: async () => {
    set({ loading: true, error: null });
    try {
      // Auth header so the server can scope FAQs to the caller's role.
      const res = await fetch(`${API_URL}/api/support/faqs`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      set({ faqs: data.data || [], loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchMyTickets: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/api/support/tickets`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      set({ tickets: data.data || [], loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  submitTicket: async (payload) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/api/support/tickets`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit ticket");
      set((state) => ({ tickets: [data.data, ...state.tickets], loading: false }));
      return { success: true };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false, error: err.message };
    }
  },

  // ── Admin-facing ─────────────────────────────────

  fetchAllTickets: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await fetch(`${API_URL}/api/admin/support/tickets${params ? `?${params}` : ""}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      set({ adminTickets: data.data || [], loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  respondToTicket: async (ticketId, payload) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/api/admin/support/tickets/${ticketId}/respond`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send response");
      set((state) => ({
        adminTickets: state.adminTickets.map((t) => (t._id === ticketId ? data.data : t)),
        loading: false,
      }));
      return { success: true };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false, error: err.message };
    }
  },

  updateTicketStatus: async (ticketId, status) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/support/tickets/${ticketId}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      set((state) => ({
        adminTickets: state.adminTickets.map((t) => (t._id === ticketId ? data.data : t)),
      }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  fetchAdminFaqs: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/api/admin/support/faqs`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      set({ faqs: data.data || [], loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  createFaq: async (payload) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/support/faqs`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create FAQ");
      set((state) => ({ faqs: [...state.faqs, data.data] }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  updateFaq: async (faqId, payload) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/support/faqs/${faqId}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update FAQ");
      set((state) => ({
        faqs: state.faqs.map((f) => (f._id === faqId ? data.data : f)),
      }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  deleteFaq: async (faqId) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/support/faqs/${faqId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete FAQ");
      }
      set((state) => ({ faqs: state.faqs.filter((f) => f._id !== faqId) }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },
}));

export default useSupportStore;
