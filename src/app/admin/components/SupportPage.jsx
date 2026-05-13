"use client";
import { useEffect, useState } from "react";
import { Send, Trash2, Edit2, Plus, X, ChevronDown, ChevronUp, CheckCircle, Clock, AlertCircle, Eye } from "lucide-react";
import useSupportStore from "@/store/useSupportStore";
import toast from "react-hot-toast";

const PRIORITY_BADGE = {
  urgent: "bg-red-100 text-red-700 border border-red-200",
  high:   "bg-orange-100 text-orange-700 border border-orange-200",
  medium: "bg-blue-100 text-blue-700 border border-blue-200",
  low:    "bg-green-100 text-green-700 border border-green-200",
};

const STATUS_STYLES = {
  open:        "bg-yellow-100 text-yellow-700",
  in_progress: "bg-blue-100 text-blue-700",
  resolved:    "bg-green-100 text-green-700",
};

const STATUS_ICON = {
  open:        <Clock size={13} />,
  in_progress: <AlertCircle size={13} />,
  resolved:    <CheckCircle size={13} />,
};

const FAQ_CATEGORIES = ["General", "Fuel Management", "Payments", "Staff Management", "System & Settings", "Reports"];

// ── Ticket Detail Modal ────────────────────────────────────────
function TicketModal({ ticket, onClose, onRespond, onStatusChange }) {
  const [text, setText] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    const result = await onRespond(ticket._id, { text, videoUrl });
    setSending(false);
    if (result.success) {
      toast.success("Response sent!");
      setText("");
      setVideoUrl("");
      onClose();
    } else {
      toast.error(result.error || "Failed to send response");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div>
            <div className="flex flex-wrap gap-2 mb-1">
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${PRIORITY_BADGE[ticket.priority]}`}>
                {ticket.priority?.toUpperCase()}
              </span>
              <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[ticket.status]}`}>
                {STATUS_ICON[ticket.status]} {ticket.status.replace("_", " ")}
              </span>
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{ticket.title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {ticket.userName} · {ticket.stationName} · {ticket.planTier} · {new Date(ticket.createdAt).toLocaleString()}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-4">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Original message */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">User message</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{ticket.message}</p>
          </div>

          {/* Previous replies */}
          {ticket.replies?.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase">Previous responses</p>
              {ticket.replies.map((reply, i) => (
                <div key={i} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{reply.text}</p>
                  {reply.videoUrl && (
                    <a href={reply.videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline mt-2 inline-block">
                      🎥 {reply.videoUrl}
                    </a>
                  )}
                  <p className="text-xs text-gray-400 mt-2">{new Date(reply.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}

          {/* Status change */}
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 shrink-0">Status:</p>
            <select
              value={ticket.status}
              onChange={(e) => onStatusChange(ticket._id, e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm dark:bg-gray-800 dark:text-white outline-none focus:border-blue-500"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Response form */}
          {ticket.status !== "resolved" && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Send response</p>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your response here..."
                rows={4}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white resize-none"
              />
              <input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Optional: Paste a Loom or YouTube video URL"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              />
              <button
                onClick={handleSend}
                disabled={sending || !text.trim()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
              >
                <Send size={14} />
                {sending ? "Sending..." : "Send Response"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── FAQ Form Modal ─────────────────────────────────────────────
function FaqModal({ faq, onClose, onSave }) {
  const [form, setForm] = useState({
    question: faq?.question || "",
    answer: faq?.answer || "",
    category: faq?.category || "General",
    order: faq?.order ?? 0,
    isPublished: faq?.isPublished !== false,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      toast.error("Question and answer are required");
      return;
    }
    setSaving(true);
    const result = await onSave(form);
    setSaving(false);
    if (result.success) {
      toast.success(faq ? "FAQ updated" : "FAQ created");
      onClose();
    } else {
      toast.error(result.error || "Failed to save FAQ");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-white">{faq ? "Edit FAQ" : "New FAQ"}</h3>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1">Question *</label>
            <input
              value={form.question}
              onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1">Answer *</label>
            <textarea
              value={form.answer}
              onChange={(e) => setForm((p) => ({ ...p, answer: e.target.value }))}
              rows={5}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              >
                {FAQ_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1">Display Order</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm((p) => ({ ...p, isPublished: e.target.checked }))}
              className="accent-blue-600 w-4 h-4"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Published (visible to users)</span>
          </label>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
          >
            {saving ? "Saving..." : faq ? "Save Changes" : "Create FAQ"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function SupportPage() {
  const {
    adminTickets, faqs, loading,
    fetchAllTickets, respondToTicket, updateTicketStatus,
    fetchAdminFaqs, createFaq, updateFaq, deleteFaq,
  } = useSupportStore();

  const [activeTab, setActiveTab] = useState("tickets");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [faqModal, setFaqModal] = useState(null); // null | "new" | faq object

  useEffect(() => {
    fetchAllTickets();
    fetchAdminFaqs();
  }, []);

  const handleFilterChange = (filters) => {
    fetchAllTickets(filters);
  };

  const filteredTickets = adminTickets.filter((t) => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (priorityFilter && t.priority !== priorityFilter) return false;
    return true;
  });

  const openCount = adminTickets.filter((t) => t.status === "open").length;

  const handleStatusChange = async (ticketId, status) => {
    const result = await updateTicketStatus(ticketId, status);
    if (result.success) {
      toast.success("Status updated");
      if (selectedTicket?._id === ticketId) {
        setSelectedTicket((prev) => ({ ...prev, status }));
      }
    } else {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteFaq = async (faqId) => {
    if (!confirm("Delete this FAQ?")) return;
    const result = await deleteFaq(faqId);
    if (result.success) toast.success("FAQ deleted");
    else toast.error(result.error || "Failed to delete");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Help & Support</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            Manage support tickets and FAQ content
          </p>
        </div>
        {openCount > 0 && (
          <span className="bg-red-100 text-red-700 border border-red-200 text-sm font-semibold px-3 py-1 rounded-full">
            {openCount} open {openCount === 1 ? "ticket" : "tickets"}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {["tickets", "faqs"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
            }`}
          >
            {tab}
            {tab === "tickets" && adminTickets.length > 0 && (
              <span className="ml-1.5 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs px-1.5 py-0.5 rounded-full">
                {adminTickets.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tickets Tab ───────────────────────────────── */}
      {activeTab === "tickets" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:text-white outline-none focus:border-blue-500"
            >
              <option value="">All statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:text-white outline-none focus:border-blue-500"
            >
              <option value="">All priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {loading ? (
            <p className="text-gray-400 text-sm">Loading tickets...</p>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <CheckCircle size={36} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No tickets match the current filters.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket._id}
                  onClick={() => setSelectedTicket(ticket)}
                  className="flex items-start gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-4 cursor-pointer hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 dark:text-white text-sm truncate">{ticket.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${PRIORITY_BADGE[ticket.priority]}`}>
                        {ticket.priority}
                      </span>
                      <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[ticket.status]}`}>
                        {STATUS_ICON[ticket.status]} {ticket.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {ticket.userName} · {ticket.stationName} · {ticket.planTier} · {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Eye size={16} className="text-gray-400 mt-1 shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── FAQs Tab ──────────────────────────────────── */}
      {activeTab === "faqs" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setFaqModal("new")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
            >
              <Plus size={16} /> Add FAQ
            </button>
          </div>

          {loading ? (
            <p className="text-gray-400 text-sm">Loading FAQs...</p>
          ) : faqs.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-sm">No FAQs yet. Create the first one.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {faqs.map((faq) => (
                <div
                  key={faq._id}
                  className="flex items-start gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">{faq.category}</span>
                      {!faq.isPublished && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Draft</span>
                      )}
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm mt-1">{faq.question}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">{faq.answer}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setFaqModal(faq)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteFaq(faq._id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onRespond={respondToTicket}
          onStatusChange={handleStatusChange}
        />
      )}

      {faqModal && (
        <FaqModal
          faq={faqModal === "new" ? null : faqModal}
          onClose={() => setFaqModal(null)}
          onSave={faqModal === "new" ? createFaq : (data) => updateFaq(faqModal._id, data)}
        />
      )}
    </div>
  );
}
