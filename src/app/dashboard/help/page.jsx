"use client";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, MessageSquare, Phone, Send, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import usePaymentStore from "@/store/usePaymentStore";
import useSupportStore from "@/store/useSupportStore";
import usePlatformStore from "@/store/usePlatformStore";
import toast from "react-hot-toast";

const FAQ_PLANS    = ["pro", "pro-max", "enterprise", "enterprise-pro", "enterprise-max"];
const WHATSAPP_PLANS = ["pro-max", "enterprise", "enterprise-pro", "enterprise-max"];
const TICKET_PLANS   = ["enterprise", "enterprise-pro", "enterprise-max"];

const PRIORITY_BADGE = {
  urgent: "bg-red-100 text-red-700",
  high:   "bg-orange-100 text-orange-700",
  medium: "bg-blue-100 text-blue-700",
  low:    "bg-green-100 text-green-700",
};

const STATUS_ICON = {
  open:        <Clock size={14} className="text-yellow-500" />,
  in_progress: <AlertCircle size={14} className="text-blue-500" />,
  resolved:    <CheckCircle size={14} className="text-green-500" />,
};

function FAQItem({ faq }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <span className="font-medium text-gray-900 dark:text-white text-sm">{faq.question}</span>
        {open ? <ChevronUp size={18} className="text-gray-400 shrink-0" /> : <ChevronDown size={18} className="text-gray-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3 leading-relaxed">
          {faq.answer}
        </div>
      )}
    </div>
  );
}

function TicketCard({ ticket }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900 dark:text-white text-sm truncate">{ticket.title}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_BADGE[ticket.priority]}`}>
              {ticket.priority}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {STATUS_ICON[ticket.status]}
            <span className="capitalize">{ticket.status.replace("_", " ")}</span>
            <span>·</span>
            <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400 mt-1 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 mt-1 shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-700 pt-3 space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Your message</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{ticket.message}</p>
          </div>
          {ticket.replies?.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase">Support response</p>
              {ticket.replies.map((reply, i) => (
                <div key={i} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap mb-3">{reply.text}</p>
                  {reply.videoUrl && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-2 font-medium">Video Guide</p>
                      <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700" style={{ aspectRatio: "16/9", maxWidth: 480 }}>
                        <iframe
                          src={toEmbedUrl(reply.videoUrl)}
                          title="Support video"
                          className="w-full h-full"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">{new Date(reply.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function toEmbedUrl(url) {
  if (!url) return "";
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  // Loom
  const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
  if (loomMatch) return `https://www.loom.com/embed/${loomMatch[1]}`;
  return url;
}

export default function HelpPage() {
  const { currentPlan, fetchCurrentPlan } = usePaymentStore();
  const { faqs, tickets, loading, fetchFaqs, fetchMyTickets, submitTicket } = useSupportStore();
  const { settings, fetchPublicSettings } = usePlatformStore();

  const [activeTab, setActiveTab] = useState("faq");
  const [faqCategory, setFaqCategory] = useState("All");
  const [form, setForm] = useState({ title: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const plan = currentPlan?.plan || "free";
  const hasFaq      = FAQ_PLANS.includes(plan);
  const hasWhatsApp = WHATSAPP_PLANS.includes(plan);
  const hasTickets  = TICKET_PLANS.includes(plan);

  useEffect(() => {
    fetchCurrentPlan();
    fetchPublicSettings();
  }, []);

  useEffect(() => {
    if (hasFaq) fetchFaqs();
    if (hasTickets) fetchMyTickets();
  }, [hasFaq, hasTickets]);

  const categories = ["All", ...Array.from(new Set(faqs.map((f) => f.category).filter(Boolean)))];
  const filteredFaqs = faqCategory === "All" ? faqs : faqs.filter((f) => f.category === faqCategory);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) return;
    setSubmitting(true);
    const result = await submitTicket(form);
    setSubmitting(false);
    if (result.success) {
      toast.success("Ticket submitted! We'll respond shortly.");
      setForm({ title: "", message: "" });
      setActiveTab("tickets");
    } else {
      toast.error(result.error || "Failed to submit ticket");
    }
  };

  const whatsappNumber = settings?.supportWhatsApp?.replace(/\D/g, "") || "";
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=Hi%2C%20I%20need%20support%20with%20my%20filling%20station%20dashboard.`
    : null;

  if (!hasFaq && !hasWhatsApp && !hasTickets) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <MessageSquare size={28} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Help & Support</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
          Upgrade to a Pro plan or higher to access our Help & Support features including FAQs, WhatsApp support, and ticket submissions.
        </p>
        <a
          href="/pricing"
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
        >
          View Plans
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Help & Support</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {hasTickets ? "Browse FAQs, chat on WhatsApp, or submit a support ticket." : hasWhatsApp ? "Browse FAQs or chat with us on WhatsApp." : "Browse our FAQ to find answers to common questions."}
        </p>
      </div>

      {/* WhatsApp banner */}
      {hasWhatsApp && whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 bg-green-500 hover:bg-green-600 transition-colors text-white rounded-xl px-5 py-4"
        >
          <FaWhatsapp size={28} />
          <div>
            <p className="font-semibold text-sm">Chat with us on WhatsApp</p>
            <p className="text-xs text-green-100">Tap to open a conversation — we typically reply within minutes</p>
          </div>
        </a>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {hasFaq && (
          <button
            onClick={() => setActiveTab("faq")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "faq" ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
            }`}
          >
            FAQs
          </button>
        )}
        {hasTickets && (
          <>
            <button
              onClick={() => setActiveTab("submit")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "submit" ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
              }`}
            >
              New Ticket
            </button>
            <button
              onClick={() => setActiveTab("tickets")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "tickets" ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
              }`}
            >
              My Tickets {tickets.length > 0 && <span className="ml-1 bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full">{tickets.length}</span>}
            </button>
          </>
        )}
      </div>

      {/* FAQ Tab */}
      {activeTab === "faq" && hasFaq && (
        <div className="space-y-4">
          {/* Category filter */}
          {categories.length > 2 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFaqCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    faqCategory === cat ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
          {loading ? (
            <p className="text-gray-400 text-sm">Loading FAQs...</p>
          ) : filteredFaqs.length === 0 ? (
            <p className="text-gray-400 text-sm">No FAQs available yet.</p>
          ) : (
            <div className="space-y-2">
              {filteredFaqs.map((faq) => <FAQItem key={faq._id} faq={faq} />)}
            </div>
          )}
        </div>
      )}

      {/* Submit Ticket Tab */}
      {activeTab === "submit" && hasTickets && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Submit a Support Ticket</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            Describe your issue and our support team will respond via email and in your ticket history.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1">Subject *</label>
              <input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Unable to add a new tank"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1">Describe your issue *</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                placeholder="Please describe the problem in as much detail as possible..."
                rows={6}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white resize-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
            >
              <Send size={14} />
              {submitting ? "Submitting..." : "Submit Ticket"}
            </button>
          </form>
        </div>
      )}

      {/* My Tickets Tab */}
      {activeTab === "tickets" && hasTickets && (
        <div className="space-y-3">
          {loading ? (
            <p className="text-gray-400 text-sm">Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No tickets yet. Submit one if you need help.</p>
              <button
                onClick={() => setActiveTab("submit")}
                className="mt-3 text-blue-600 text-sm font-medium hover:underline"
              >
                Submit a ticket →
              </button>
            </div>
          ) : (
            tickets.map((ticket) => <TicketCard key={ticket._id} ticket={ticket} />)
          )}
        </div>
      )}
    </div>
  );
}
