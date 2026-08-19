"use client";
import { useEffect, useState } from "react";
import { Megaphone, Send, Loader2, EyeOff, CheckCircle, Users } from "lucide-react";
import { api } from "@/lib/config";

/**
 * Where the system owner writes what shipped.
 *
 * Publishing reaches every station unconditionally. `targetRole` says who the
 * change is FOR, which shapes how it is worded and badged, but it narrows
 * nobody out: owners and managers are copied on everything, because they answer
 * for a change to a screen they will never press themselves.
 */

const ROLES = [
  { value: "all",        label: "Everyone" },
  { value: "manager",    label: "Managers" },
  { value: "supervisor", label: "Supervisors" },
  { value: "accountant", label: "Accountants" },
  { value: "cashier",    label: "Cashiers" },
  { value: "attendant",  label: "Attendants" },
];

const fmt = (d) => {
  try { return new Date(d).toLocaleString("en-GB"); } catch { return ""; }
};

export default function Announcements() {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [message, setMessage]   = useState(null);

  const [form, setForm] = useState({ title: "", version: "", targetRole: "all", body: "" });

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/announcements/admin");
      setItems(res.data?.data || []);
    } catch (err) {
      setMessage({ tone: "error", text: "Could not load announcements." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const publish = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!form.title.trim() || !form.body.trim()) {
      setMessage({ tone: "error", text: "A title and a description of what changed are both required." });
      return;
    }

    setSaving(true);
    try {
      await api.post("/api/announcements", form);
      setForm({ title: "", version: "", targetRole: "all", body: "" });
      setMessage({ tone: "success", text: "Published to every station." });
      load();
    } catch (err) {
      setMessage({
        tone: "error",
        text: err?.response?.data?.error || "Could not publish. Try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const withdraw = async (id) => {
    if (!window.confirm("Withdraw this announcement? It stops showing as a banner but stays in history.")) return;
    try {
      await api.patch(`/api/announcements/${id}/withdraw`);
      load();
    } catch {
      setMessage({ tone: "error", text: "Could not withdraw it." });
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl">
      <div className="flex items-center gap-2 mb-1">
        <Megaphone size={20} className="text-indigo-500" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Announcements</h1>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Tell every station what changed. Shown as a banner for three days or until it is read,
        then it stays in their history.
      </p>

      {/* Compose */}
      <form onSubmit={publish} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 sm:p-5 mb-8">
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <div className="flex-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1 block">
              Title *
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Store items now sell by pack or carton"
              maxLength={160}
              className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
            />
          </div>
          <div className="w-full sm:w-32">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1 block">
              Version
            </label>
            <input
              value={form.version}
              onChange={(e) => setForm((p) => ({ ...p, version: e.target.value }))}
              placeholder="v2.4"
              maxLength={40}
              className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1 block">
            Who is this change for?
          </label>
          <select
            value={form.targetRole}
            onChange={(e) => setForm((p) => ({ ...p, targetRole: e.target.value }))}
            className="w-full sm:w-64 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
            <Users size={12} className="shrink-0" />
            Owners and managers are copied on every announcement, whoever it targets.
          </p>
        </div>

        <div className="mb-4">
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1 block">
            What changed? *
          </label>
          <textarea
            value={form.body}
            onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
            rows={6}
            maxLength={5000}
            placeholder={"Describe the change in plain words.\n\nSay what it does, where to find it, and what someone should do differently."}
            className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 resize-y"
          />
          <p className="text-xs text-gray-400 mt-0.5">{form.body.length}/5000</p>
        </div>

        {message && (
          <p className={`text-sm font-medium mb-3 ${message.tone === "success" ? "text-green-600" : "text-red-600"}`}>
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          Publish to all stations
        </button>
      </form>

      {/* History */}
      <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">Published</h2>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-400 py-6">
          <Loader2 size={16} className="animate-spin" /> Loading…
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-400 py-6">Nothing published yet.</p>
      ) : (
        <div className="space-y-2">
          {items.map((a) => (
            <div
              key={a._id}
              className={`border rounded-xl p-3 sm:p-4 ${
                a.isActive
                  ? "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  : "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 opacity-70"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {a.version && <span className="text-indigo-600 dark:text-indigo-400">{a.version} · </span>}
                    {a.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 whitespace-pre-line">{a.body}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-gray-400">
                    <span>{fmt(a.publishedAt)}</span>
                    <span className="capitalize">For: {a.targetRole === "all" ? "everyone" : a.targetRole}</span>
                    <span className="flex items-center gap-1">
                      <CheckCircle size={11} /> {a.readCount ?? 0} read
                    </span>
                    {!a.isActive && <span className="text-red-400 font-semibold">Withdrawn</span>}
                  </div>
                </div>

                {a.isActive && (
                  <button
                    onClick={() => withdraw(a._id)}
                    title="Withdraw"
                    className="shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 hover:text-red-600 hover:border-red-300 transition-colors"
                  >
                    <EyeOff size={13} /> Withdraw
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
