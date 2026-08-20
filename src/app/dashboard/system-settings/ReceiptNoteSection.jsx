"use client";
import { useEffect, useState } from "react";
import { Receipt, Loader2, Check, Lock } from "lucide-react";
import { API_URL } from "@/lib/config";
import { getCurrentUser } from "@/lib/currentUser";

const MAX_LEN = 200;

/**
 * What the station prints on every receipt, under the totals.
 *
 * Owner-only, and the server enforces that against the database rather than the
 * token. This is a statement the business makes to its customers and may have
 * to stand behind at the counter, so it is not a hired manager's to rewrite.
 *
 * Empty is a valid answer. A station that prints no terms should not be made to
 * carry a default it never chose.
 */
export default function ReceiptNoteSection() {
  const [note, setNote] = useState("");
  const [savedNote, setSavedNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => setIsOwner(Boolean(getCurrentUser()?.isOwner)), []);

  const headers = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}/api/receipt-settings`, { headers: headers() })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled || !d?.data) return;
        setNote(d.data.receiptNote || "");
        setSavedNote(d.data.receiptNote || "");
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const dirty = note !== savedNote;

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/api/receipt-settings`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({ receiptNote: note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save");
      setSavedNote(data.data?.receiptNote ?? note);
      setMessage({ tone: "ok", text: data.message || "Saved." });
    } catch (err) {
      setMessage({ tone: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
      <div className="flex items-start gap-3 p-5 pb-4 border-b border-neutral-200">
        <div className="mt-0.5 flex items-center justify-center w-9 h-9 rounded-xl shrink-0" style={{ background: "#0f766e18" }}>
          <Receipt size={18} style={{ color: "#0f766e" }} />
        </div>
        <div>
          <h2 className="text-base font-semibold leading-tight">Receipt Terms</h2>
          <p className="text-sm text-neutral-400 mt-0.5">
            Printed on every sales receipt, under the total
          </p>
        </div>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <Loader2 size={16} className="animate-spin" /> Loading…
          </div>
        ) : !isOwner ? (
          <div className="flex items-start gap-2.5 bg-neutral-50 border border-neutral-200 rounded-xl p-3.5">
            <Lock size={16} className="text-neutral-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-neutral-600 font-medium">
                {savedNote || "No terms are printed on receipts."}
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Only the station owner can change what the receipt says.
              </p>
            </div>
          </div>
        ) : (
          <>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, MAX_LEN))}
              rows={2}
              placeholder="e.g. No refund of money after payment."
              className="w-full min-w-0 border-2 border-neutral-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-500 resize-y"
            />

            <div className="flex items-center justify-between gap-3 mt-2 flex-wrap">
              <p className="text-xs text-neutral-400">
                {note.length}/{MAX_LEN} · leave empty to print nothing
              </p>

              <div className="flex items-center gap-2">
                {message && (
                  <span className={`text-xs font-medium ${message.tone === "ok" ? "text-green-600" : "text-red-600"}`}>
                    {message.text}
                  </span>
                )}
                <button
                  onClick={save}
                  disabled={saving || !dirty}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Save
                </button>
              </div>
            </div>

            {/* Shown as it will print, so the wording is judged in place rather
                than imagined. Uppercase and centred is how the slip sets it. */}
            <div className="mt-4 border-t border-dashed border-neutral-300 pt-3">
              <p className="text-[11px] text-neutral-400 mb-1.5">On the receipt:</p>
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg py-3 px-4 font-mono">
                <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-700 text-center">
                  {note || "(nothing will print)"}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
