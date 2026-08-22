"use client";
import { useEffect, useState } from "react";
import useShiftTenderStore from "@/store/useShiftTenderStore";
import { useSocket } from "@/hooks/useSocket";
import { TrendingDown, CheckCircle2, AlertTriangle } from "lucide-react";

/**
 * What the attendant owes, on their own dashboard.
 *
 * Nobody can be expected to settle a figure they were never shown, and a debt
 * that only appears in the accountant's report is one the attendant first hears
 * about in an argument. So it sits on the screen they open every morning, in
 * the largest type on the card.
 *
 * It is also where the second signature is collected. The cashier counted the
 * money, which settles what the station received; it does not settle whether
 * the attendant agrees they owe it. Accepting or disputing is theirs alone, and
 * both answers stay on the record.
 *
 * Renders nothing at all when there is nothing owed, so a clean attendant never
 * sees an accusation-shaped empty state.
 */

const naira = (n) => `₦${Number(n || 0).toLocaleString()}`;

const when = (d) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  } catch { return ""; }
};

export default function MyShortfallCard() {
  const { mine, fetchMyShortfalls, acknowledge } = useShiftTenderStore();
  const [busyId, setBusyId] = useState(null);
  const [disputing, setDisputing] = useState(null);
  const [note, setNote] = useState("");
  const [feedback, setFeedback] = useState(null);

  useEffect(() => { fetchMyShortfalls(); }, [fetchMyShortfalls]);
  useSocket({ "tender:confirmed": () => fetchMyShortfalls() });

  const act = async (id, action) => {
    setBusyId(id);
    const res = await acknowledge(id, action, note);
    setBusyId(null);
    setDisputing(null);
    setNote("");
    setFeedback({ ok: res.success, text: res.message || res.error });
  };

  // Nothing owed and nothing to sign: show nothing.
  if (!mine || (!mine.outstanding && !mine.awaitingSignature?.length)) return null;

  const pending = mine.awaitingSignature || [];

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-red-300 rounded-2xl overflow-hidden mb-4">
      <div className="p-4 bg-red-50 dark:bg-gray-900">
        <p className="text-xs font-bold uppercase tracking-wide text-red-700 dark:text-red-400 flex items-center gap-1.5">
          <TrendingDown size={14} /> You are short
        </p>
        <p className="text-4xl font-extrabold tabular-nums text-red-700 dark:text-red-400 mt-1 leading-none">
          {naira(mine.outstanding)}
        </p>
        <p className="text-xs text-red-800/70 dark:text-gray-400 mt-1.5">
          across {mine.shifts} shift{mine.shifts === 1 ? "" : "s"}. Settle it with the accountant.
        </p>
      </div>

      {feedback && (
        <p className={`text-xs px-4 py-2 ${
          feedback.ok ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"
        }`}>
          {feedback.text}
        </p>
      )}

      {/* The second signature. Only what has not been answered yet. */}
      {pending.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs font-bold text-gray-700 dark:text-gray-200 mb-2">
            Waiting for your answer
          </p>

          <div className="space-y-3">
            {pending.map((r) => (
              <div key={r._id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {r.shift?.pumpTitle || "Pump"} · {r.product || r.shift?.product || "Fuel"}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {when(r.declaredAt)} · you declared {naira(r.declaredTotal)}, the cashier
                      counted {naira(r.receivedTotal)} against {naira(r.expectedAmount)} sold
                    </p>
                  </div>
                  <p className="text-lg font-extrabold tabular-nums text-red-700 dark:text-red-400 shrink-0">
                    {naira(r.shortfall)}
                  </p>
                </div>

                {disputing === r._id ? (
                  <div className="mt-2.5">
                    <input
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="What do you disagree with? (required)"
                      className="w-full min-w-0 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => act(r._id, "disputed")}
                        disabled={busyId === r._id || !note.trim()}
                        className="flex-1 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold"
                      >
                        Send to manager
                      </button>
                      <button
                        onClick={() => { setDisputing(null); setNote(""); }}
                        className="px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 mt-2.5">
                    <button
                      onClick={() => act(r._id, "accepted")}
                      disabled={busyId === r._id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gray-800 hover:bg-gray-900 disabled:opacity-50 text-white text-xs font-bold"
                    >
                      <CheckCircle2 size={13} /> I accept this
                    </button>
                    <button
                      onClick={() => setDisputing(r._id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border-2 border-amber-300 text-amber-700 text-xs font-bold"
                    >
                      <AlertTriangle size={13} /> I disagree
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <p className="text-[11px] text-gray-400 mt-3">
            Disputing does not cancel the amount. It puts a manager between your
            account and the cashier's, and both stay on the record.
          </p>
        </div>
      )}
    </div>
  );
}
