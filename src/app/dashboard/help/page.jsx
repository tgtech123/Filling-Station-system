"use client";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, MessageSquare, Send, CheckCircle, Clock, AlertCircle } from "lucide-react";
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

// Each FAQ carries `roles` — who it's relevant to. No `roles` (or "all") means
// everyone. Managers/admins always see every group; other roles see only theirs.
const STATIC_FAQ_GROUPS = [
  {
    category: "Getting Started",
    faqs: [
      {
        _id: "s1",
        roles: ["cashier"],
        question: "I am a new cashier. What do I need to do first?",
        answer: "Your manager will create your account and share your login credentials. Log in, change your password immediately (go to your Profile > Change Password), and then start recording daily sales and reconciliations.",
      },
      {
        _id: "s2",
        question: "Can I use FuelDesk on my phone?",
        answer: "Yes. FuelDesk is a web app that works in any modern mobile browser. Open your browser, go to the FuelDesk website, and log in normally. For the best experience on mobile, use Chrome or Safari.",
      },
      {
        _id: "s3",
        question: "Can two people be logged in as the same user at the same time?",
        answer: "The system allows it, but it is not recommended. If you notice unfamiliar activity on your account, go to System Settings > Active Sessions and click Logout Others immediately, then change your password.",
      },
      {
        _id: "s16",
        question: "Should I let the browser save my password? And what does \"Remember me\" do?",
        answer: "It depends on whose device it is. On YOUR OWN phone or laptop, accepting the browser's \"Save password?\" prompt is safe — the browser stores it encrypted on your device and it saves you typing. On a SHARED station computer, always tap \"Never\": a saved password would auto-fill for the next person on the same machine, so sales and reconciliations could be recorded under your name by someone else. The \"Remember me\" checkbox on the login page is different — it keeps your session active for 30 days and pre-fills your email (never your password), so on your own device you usually go straight to your dashboard without logging in at all.",
      },
    ],
  },
  {
    category: "Shifts & Operations",
    faqs: [
      {
        _id: "s4",
        roles: ["attendant", "supervisor"],
        question: "How do I know when a tank is running low?",
        answer: "You will receive a Low Stock Alert notification. Also check Tank Status in the menu — any tank below its threshold will be shown in amber or red.",
      },
      {
        _id: "s5",
        roles: ["attendant", "supervisor", "cashier"],
        question: "What happens if the internet goes down during a shift?",
        answer: "Save your meter readings manually (write them down). Once the connection is restored, enter the readings into the system. Contact your supervisor to note the time gap.",
      },
      {
        _id: "s6",
        roles: ["attendant", "supervisor"],
        question: "What is the difference between a Dip Reading and a Shift Reading?",
        answer: "A Shift Reading is recorded by an attendant at the pump (opening and closing meter values) — it tracks litres sold per pump per shift. A Dip Reading is recorded by a supervisor with a physical measuring rod inside the tank — it confirms the actual fuel level and catches losses not recorded by the pump.",
      },
      {
        _id: "s7",
        roles: ["attendant", "supervisor"],
        question: "An attendant started a shift but forgot to enter the correct meter reading. What now?",
        answer: "A Supervisor or Manager can review the shift detail and flag it. Contact your supervisor — they can note the discrepancy before approving the shift.",
      },
    ],
  },
  {
    category: "Subscription & Billing",
    roles: ["manager"],
    faqs: [
      {
        _id: "s8",
        question: "My subscription expired but I cannot upgrade. What do I do?",
        answer: "Go to System Settings > Subscription & Billing and click Upgrade Plan. If the payment fails, try a different card or contact your bank. You can also contact FuelDesk support for help.",
      },
      {
        _id: "s9",
        question: "The billing history section shows empty. Why?",
        answer: "Billing history only shows successful payments made through Paystack. If you are on the Free Plan, no payments have been made yet and the section will be empty.",
      },
      {
        _id: "s10",
        question: "Can I downgrade my plan immediately?",
        answer: "No. Downgrades are scheduled — they take effect at the end of your current billing period. This means you keep all your current features and staff limits until the day you have already paid for. The effective date is shown clearly before you confirm the downgrade.",
      },
      {
        _id: "s11",
        question: "I scheduled a downgrade but changed my mind. Can I cancel it?",
        answer: "Yes. Go to System Settings > Subscription & Billing, find the amber downgrade notice on your plan card, and click Cancel Downgrade. The scheduled downgrade is removed instantly and your plan stays unchanged.",
      },
      {
        _id: "s15",
        question: "The downgrade screen says \"Remove N\" staff. How do I remove them?",
        answer: "The lower plan allows fewer staff in that role, so you must reduce your team before downgrading. The \"Remove N\" badge tells you how many to remove per role — it is a guide, not a button. To remove staff, go to Staff Management, open the staff member, and terminate/remove them. Then return to System Settings > Subscription & Billing and try the downgrade again — once your counts fit the new plan, it will let you schedule it. Note: the manager (station owner) account is never counted against you, so you are never asked to remove yourself.",
      },
      {
        _id: "s14",
        question: "I am on the highest plan and the Upgrade button is missing. Is this a bug?",
        answer: "No, this is correct. If you are already on the highest available plan, the button changes to Renew Plan instead. Click it to extend your current plan by another month or year.",
      },
    ],
  },
  {
    category: "Accounting",
    roles: ["accountant"],
    faqs: [
      {
        _id: "a1",
        question: "I opened Accounting and everything is empty. What do I do first?",
        answer: "The accounting module never invents data — it starts empty so your books are real. Open Accounting > Chart of Accounts and create your accounts (click \"System Codes\" to see the standard codes and create them with those exact numbers). Then set your tax codes under Tax Engine, and if you already have fuel in your tanks, record it once under Period Close > Inventory Valuation > Opening/Adjust Stock. After that the reports fill in as you record invoices and post sales.",
      },
      {
        _id: "a2",
        question: "How does each product's revenue and profit get tracked separately?",
        answer: "Each product (PMS, Diesel/AGO, Kerosene, Lubricant, Gas) has its own revenue account (4010–4200) and cost account (5010–5200). Once a month you click Period Close > Post Product Sales: the system gathers that month's fuel, lubricant and gas sales and books each product's revenue and its cost of sales automatically. The Income Statement then shows gross profit per product with no manual work.",
      },
      {
        _id: "a3",
        question: "Why can the accountant see Accounting but the manager only sees an overview?",
        answer: "The full accounting workspace is the accountant's. Managers and admins can view the executive Accounting overview (totals, ratios, trends) for oversight, but the working screens — chart of accounts, journals, payables, receivables, tax, reports — are accountant-only by design.",
      },
      {
        _id: "a4",
        question: "What is cost of sales / COGS and where does it come from?",
        answer: "Cost of sales is what the fuel you sold actually cost you. The system values stock at weighted-average cost: every purchase blends into the average, and every sale is costed at that average when you post the month's sales. You don't calculate anything — just keep recording deliveries and procurements, and run the monthly sales posting.",
      },
    ],
  },
  {
    // Written for the till first. A cashier reads this mid-shift with a queue
    // waiting, so every answer says which button, in order, in plain words.
    category: "Shop & Store Sales",
    faqs: [
      {
        _id: "shop1",
        roles: ["cashier"],
        question: "A customer wants a pack or a carton, not one bottle. How do I sell that?",
        answer:
          "Scan or add the item as normal, then use the \"Sold as\" box on that line. It lists every way the product is sold — for example: piece, Pack of 12, Carton of 24 — each with its price. Pick the one the customer is buying and the price updates by itself.\n\nQuantity means how many of THAT unit. So to sell two packs of 12, choose \"Pack of 12\" and set quantity to 2. The system takes 24 bottles off the shelf and the receipt says 2 Packs.\n\nIf a product has no \"Sold as\" box, it is only sold singly — nothing to choose.",
      },
      {
        _id: "shop2",
        roles: ["cashier"],
        question: "The carton has its own barcode on the box. Can I just scan that?",
        answer:
          "Yes. If your manager registered the carton's barcode, scanning the box picks the carton automatically — you do not have to change \"Sold as\" yourself. Check the line says the carton price before you take payment.",
      },
      {
        _id: "shop3",
        roles: ["cashier"],
        question: "I scanned an item and it says \"no product with this barcode\". What do I do?",
        answer:
          "Call your manager or supervisor and give them the barcode shown on screen. They add it and set its price — a cashier cannot register or price products, because a wrong price would sell the item at a loss.\n\nOnce they have added it, refresh the sales page and scan again. Do not type a price into another item to get around it.",
      },
      {
        _id: "shop4",
        roles: ["cashier"],
        question: "How do I use the customer-facing screen?",
        answer:
          "Press \"Customer screen\" once at the start of your shift. A window opens on the second monitor showing the customer their items and total as you scan. Leave it open all day.\n\nIf it opens on your own screen instead, drag it across to the customer's monitor and press F11 to make it full screen. It only ever shows items, prices and the total — never stock or cost.",
      },
      {
        _id: "shop5",
        roles: ["cashier"],
        question: "A customer wants their receipt again after the sale is finished.",
        answer:
          "Scroll to the sales list below the till, find the sale by receipt number, and press the print icon on that row. You can reprint any past sale as many times as you need. Nothing is deducted from stock again.",
      },
      {
        _id: "shop6",
        roles: ["manager", "supervisor"],
        question: "How do I set up a product that sells by the piece AND by the pack?",
        answer:
          "Go to Lubricant Management > Add Lubricant. Enter the product as normal — stock is always counted in the SMALLEST unit, so 20 cartons of 12 is 240 pieces, not 20.\n\nThen under \"Also sold in packs?\" add each bigger unit: its name (Pack, Carton, Dozen, Bag), how many pieces it holds, and the profit percentage you want on it. The price works itself out from the cost, and you can see the sum on screen as you type.\n\nIf the box carries its own barcode, add it too — then your cashier can just scan the box.",
      },
      {
        _id: "shop7",
        roles: ["manager", "supervisor"],
        question: "Why do I enter a percentage instead of typing the pack price?",
        answer:
          "So the price cannot go stale or land below cost. Cartons and bags are priced from what the supplier charged you plus your profit; packs and dozens are priced from the single price less a discount, because no supplier ever sells you a \"pack\" — you make one by opening a carton.\n\nThe real benefit is at delivery: when a supplier's cost changes, every price moves with it automatically and your margin holds. If you typed prices by hand, the ones you forgot to update would quietly sell at last month's margin.\n\nYou can still override any price — type over it and yours is kept.",
      },
      {
        _id: "shop8",
        roles: ["manager", "supervisor"],
        question: "Where do I set the profit percentages for my whole shop?",
        answer:
          "Lubricant Management > Pricing defaults. Set the profit you expect by category (lubricants, drinks, snacks, other) and by unit (pack, dozen, carton, bag). Every new product starts from those, so nobody has to remember that snacks are 15%.\n\nSaving here does NOT re-price products you already have — they keep the percentage they were given. Change an individual product from its own page.",
      },
      {
        _id: "shop9",
        roles: ["manager", "supervisor"],
        question: "I bought goods from the market with a paper invoice, not a purchase order. How do I enter them?",
        answer:
          "Use Lubricant Management > Purchases. Enter the supplier, the invoice number, the date, how you paid, and the items with what you actually paid. Stock goes up and the prices are recalculated from the new cost — the same as a delivery against a purchase order.\n\nKeep the invoice number accurate: it is what ties the paper in your file to the entry in the system when anyone checks later.",
      },
      {
        _id: "shop10",
        roles: ["manager", "supervisor"],
        question: "A delivery arrived and the supplier's price went up. What do I do?",
        answer:
          "Open the purchase order and press Mark Received. On the confirmation screen enter what actually arrived and the new cost per item. The selling price recalculates from your profit percentage, and every pack and carton recalculates too — all of it editable before you confirm.\n\nCheck the per-piece figures next to each pack before saving. If one is flagged as dearer per piece than a single, the percentages need a look.",
      },
    ],
  },
  {
    category: "Loyalty Programme",
    roles: ["manager"],
    faqs: [
      {
        _id: "s12",
        question: "How do SMS Portal Notifications work, and who pays for them?",
        answer: "The station (Manager) pays for SMS credits upfront at ₦6 per credit. When a new customer is enrolled in the Loyalty Programme, the system automatically sends them one SMS with a link to view their points — that uses one credit. The customer pays nothing. Go to Loyalty > Settings > SMS Portal Notifications to top up at any time.",
      },
      {
        _id: "s13",
        question: "I purchased SMS credits through Paystack but the balance still shows 0. What happened?",
        answer: "After paying, Paystack redirects you back to the Loyalty Settings page. If the balance has not updated within a few seconds, try refreshing the page — the system verifies your payment on return and updates the balance automatically. If it still shows 0 after refreshing, contact FuelDesk support with your Paystack payment reference number.",
      },
    ],
  },
];

/**
 * One question and its answer.
 *
 * The answer keeps `whitespace-pre-line`: several answers are three ordered
 * steps, and without it they ran together as one block of text — which is
 * exactly the thing someone reads mid-shift with a queue at the counter.
 */
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
        <div className="px-5 pb-4 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3 leading-relaxed whitespace-pre-line">
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
  const [waFloatEnabled, setWaFloatEnabled] = useState(false);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    setWaFloatEnabled(localStorage.getItem("wa_float_enabled") === "1");
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setUserRole((user.role || "").toLowerCase().trim());
    } catch {}
  }, []);

  // Role-scoped static FAQs: managers/admins see everything; every other role
  // only sees groups/questions tagged for them (untagged = relevant to all).
  const seesAll = userRole === "manager" || userRole === "admin";
  const roleMatches = (roles) =>
    seesAll || !roles || roles.includes("all") || roles.includes(userRole);
  const visibleStaticGroups = STATIC_FAQ_GROUPS
    .filter((group) => roleMatches(group.roles))
    .map((group) => ({
      ...group,
      faqs: group.faqs.filter((faq) => roleMatches(faq.roles)),
    }))
    .filter((group) => group.faqs.length > 0);

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

  const toggleWaFloat = () => {
    const next = !waFloatEnabled;
    setWaFloatEnabled(next);
    localStorage.setItem("wa_float_enabled", next ? "1" : "0");
    window.dispatchEvent(new Event("wa-float-toggle"));
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

      {/* WhatsApp banner + float toggle */}
      {hasWhatsApp && whatsappUrl && (
        <div className="space-y-3">
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

          {/* Floating button toggle */}
          <div className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                <FaWhatsapp size={18} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Floating shortcut</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {waFloatEnabled ? "WhatsApp button visible on all pages" : "Only available on this page"}
                </p>
              </div>
            </div>
            <button
              onClick={toggleWaFloat}
              aria-label="Toggle floating WhatsApp button"
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                waFloatEnabled ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${
                  waFloatEnabled ? "left-7" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>
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
          {/* Category filter for server FAQs */}
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

          {/* Server-fetched FAQs */}
          {loading ? (
            <p className="text-gray-400 text-sm">Loading FAQs...</p>
          ) : filteredFaqs.length > 0 ? (
            <div className="space-y-2">
              {filteredFaqs.map((faq) => <FAQItem key={faq._id} faq={faq} />)}
            </div>
          ) : null}

          {/* Static general FAQs — always shown */}
          {filteredFaqs.length > 0 && (
            <div className="flex items-center gap-3 pt-2">
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
              <span className="text-xs text-gray-400 font-medium px-1">General Questions</span>
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
            </div>
          )}
          <div className="space-y-6">
            {visibleStaticGroups.map((group) => (
              <div key={group.category} className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-1">
                  {group.category}
                </p>
                {group.faqs.map((faq) => <FAQItem key={faq._id} faq={faq} />)}
              </div>
            ))}
          </div>
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
