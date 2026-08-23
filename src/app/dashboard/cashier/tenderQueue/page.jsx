"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import useShiftTenderStore from "@/store/useShiftTenderStore";
import { useSocket } from "@/hooks/useSocket";
import ConfirmedTakings from "./ConfirmedTakings";
import RepayModal from "./RepayModal";
import { Loader2, CheckCircle2, AlertTriangle, Banknote, CreditCard, Landmark, TrendingDown } from "lucide-react";

/**
 * What attendants have handed over, waiting to be counted and confirmed.
 *
 * The cashier's side of the same record. Confirming without touching anything
 * means "exactly as declared", which is the common case and should not require
 * retyping three numbers.
 *
 * A difference never blocks the confirmation. The cashier records what is
 * actually in front of them, and anything missing against the meter becomes a
 * shortfall carried against the attendant: settled on the spot, or left
 * outstanding and added to what that person already owes. Refusing to record it
 * would leave the money uncounted AND the debt untracked.
 */

const naira = (n) => `₦${Number(n || 0).toLocaleString()}`;

const nameOf = (p) =>
  [p?.firstName, p?.lastName].filter(Boolean).join(" ").trim() || "Attendant";

const ROWS = [
  { key: "cash", label: "Cash", icon: Banknote, tone: "text-green-600" },
  { key: "POS", label: "POS", icon: CreditCard, tone: "text-blue-600" },
  { key: "transfer", label: "Transfer", icon: Landmark, tone: "text-purple-600" },
];

export default function TenderQueuePage() {
  const { pending, loading, fetchPending, confirm, shortfalls, fetchShortfalls } =
    useShiftTenderStore();

  const [openId, setOpenId] = useState(null);
  const [counted, setCounted] = useState({ cash: "", POS: "", transfer: "" });
  const [note, setNote] = useState("");
  const [settleNow, setSettleNow] = useState(false);
  const [repaying, setRepaying] = useState(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchPending();
    fetchShortfalls({ status: "outstanding" });
  }, [fetchPending, fetchShortfalls]);

  /** A declaration lands while the cashier is looking at this page. */
  const reload = () => {
    fetchPending();
    fetchShortfalls({ status: "outstanding" });
  };

  useSocket({
    "tender:declared": () => reload(),
    "tender:confirmed": () => reload(),
  });

  const openFor = (row) => {
    setOpenId(row._id);
    /**
     * All three prefilled with what the attendant declared, and all three
     * editable. Matching is the common case and should not cost three typed
     * numbers; the cashier changes only the box that disagrees with what is in
     * front of them.
     *
     * Each field shows the declared figure underneath and turns amber the
     * moment it is edited, so a changed number is visible at a glance rather
     * than buried in a total.
     */
    setCounted({
      cash: String(row.declared?.cash ?? 0),
      POS: String(row.declared?.POS ?? 0),
      transfer: String(row.declared?.transfer ?? 0),
    });
    setNote("");
    setSettleNow(false);
    setFeedback(null);
  };

  /**
   * Only takings nobody has counted yet get a card.
   *
   * The server already filters these out, so this is not the fix — it is the
   * guard that stops the fix being undone by a stale response sitting in the
   * store. A card whose button the server will refuse is worse than no card:
   * the cashier reads it as work waiting for them and then gets told it is
   * already done.
   */
  const uncounted = (pending || []).filter((row) => !row.received);

  const total = (s) =>
    (Number(s.cash) || 0) + (Number(s.POS) || 0) + (Number(s.transfer) || 0);

  const submit = async (row) => {
    setBusy(true);
    setFeedback(null);
    const res = await confirm(row._id, {
      received: {
        cash: Number(counted.cash) || 0,
        POS: Number(counted.POS) || 0,
        transfer: Number(counted.transfer) || 0,
      },
      note: note.trim() || undefined,
      settleNow,
    });
    setBusy(false);

    if (res.success) {
      setOpenId(null);
      // A new shortage changes the list above, not just this card.
      fetchShortfalls({ status: "outstanding" });
      setFeedback({ tone: "ok", text: res.message });
    } else {
      setFeedback({ tone: "bad", text: res.error });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto pb-12">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Shift takings to confirm</h1>
        <p className="text-sm text-gray-500 mt-0.5 mb-5">
          Count what the attendant hands you, then confirm it against what they submitted.
        </p>

        {feedback && (
          <p className={`mb-4 text-sm rounded-xl p-3 border ${
            feedback.tone === "ok"
              ? "text-green-700 bg-green-50 border-green-200"
              : "text-red-700 bg-red-50 border-red-200"
          }`}>
            {feedback.text}
          </p>
        )}

        {/* Standing in front of the attendant is the moment this matters. A
            report the next morning is too late to ask them about it. */}
        {shortfalls?.attendants?.some((a) => a.outstanding > 0) && (
          <div className="bg-white dark:bg-gray-800 border-2 border-red-200 rounded-2xl overflow-hidden mb-5">
            <div className="px-4 py-2.5 bg-red-50 dark:bg-gray-900 border-b border-red-200">
              <p className="text-sm font-bold text-red-800 dark:text-red-300 flex items-center gap-1.5">
                <TrendingDown size={15} /> Attendants currently short
              </p>
              <p className="text-[11px] text-red-700/70 dark:text-gray-400">
                Money owed from earlier shifts, still unpaid
              </p>
            </div>
            {/* One line per short shift, because a repayment is made against a
                particular shift rather than against a person in general. */}
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {(shortfalls.rows || [])
                .filter((r) => r.shortfallStatus === "outstanding")
                .map((r) => {
                  const owed = Math.max(
                    0,
                    Math.round(((r.shortfall || 0) - (r.repaidTotal || 0)) * 100) / 100
                  );
                  return (
                    <div key={r._id} className="flex items-center justify-between gap-3 px-4 py-2.5 flex-wrap">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {nameOf(r.attendant)}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {r.shift?.pumpTitle || "Pump"} · {r.product || r.shift?.product || "Fuel"}
                          {r.repaidTotal > 0 && ` · ${naira(r.repaidTotal)} paid back so far`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <p className="text-base font-extrabold tabular-nums text-red-700 dark:text-red-400">
                          {naira(owed)}
                        </p>
                        <button
                          onClick={() => setRepaying(r)}
                          className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-colors"
                        >
                          Record repayment
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
            <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-gray-500">Total owed</span>
              <span className="text-base font-extrabold tabular-nums text-red-700 dark:text-red-400">
                {naira(shortfalls.totals?.outstanding)}
              </span>
            </div>
          </div>
        )}

        {loading && uncounted.length === 0 ? (
          <div className="flex items-center gap-2 text-gray-400 py-12 justify-center">
            <Loader2 size={18} className="animate-spin" /> Loading…
          </div>
        ) : uncounted.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle2 size={32} className="text-green-500 mx-auto mb-3" />
            <p className="text-gray-500">Nothing waiting. Every shift handed in has been confirmed.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {uncounted.map((row) => {
              const open = openId === row._id;
              const declaredTotal = Number(row.declaredTotal || 0);
              const expectedAmount = Number(row.expectedAmount || 0);
              const countedTotal = total(counted);
              const gap = Math.round((countedTotal - declaredTotal) * 100) / 100;
              const matches = Math.abs(gap) <= 0.5;

              /**
               * What is missing measured against the METER, not against what
               * the attendant claimed. Someone who declares 480,000 on a
               * 500,000 shift and hands over all of it has still not handed
               * over 20,000, and anchoring on the declaration would call that
               * a clean shift.
               */
              const shortfall = Math.max(0, Math.round((expectedAmount - countedTotal) * 100) / 100);

              return (
                <div
                  key={row._id}
                  className={`bg-white dark:bg-gray-800 border-2 rounded-2xl overflow-hidden ${
                    row.status === "disputed" ? "border-amber-300" : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white">{nameOf(row.attendant)}</p>
                        {(() => {
                          const owed = shortfalls?.attendants?.find(
                            (a) => a.attendantId === String(row.attendant?._id || row.attendant)
                          )?.outstanding;
                          return owed > 0 ? (
                            <p className="text-[11px] font-bold text-red-700 dark:text-red-400">
                              Already owes {naira(owed)} from earlier shifts
                            </p>
                          ) : null;
                        })()}
                        <p className="text-xs text-gray-500 mt-0.5">
                          {row.shift?.pumpTitle || "Pump"} · {row.shift?.product || "Fuel"} ·{" "}
                          {Number(row.shift?.litresSold || 0).toLocaleString()} L
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xl font-extrabold tabular-nums text-[#0080ff]">
                          {naira(declaredTotal)}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          declared against {naira(expectedAmount)} sold
                        </p>
                        {Math.abs(declaredTotal - expectedAmount) > 0.5 && (
                          <p className="text-[11px] font-bold text-amber-700">
                            Declared {declaredTotal < expectedAmount ? "short" : "over"} by{" "}
                            {naira(Math.abs(declaredTotal - expectedAmount))}
                          </p>
                        )}
                        {row.status === "disputed" && (
                          <p className="text-[11px] font-bold text-amber-700">Disputed</p>
                        )}
                      </div>
                    </div>

                    {/* The declared split, always visible: this is what the
                        cashier is checking the envelope against. */}
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {ROWS.map((t) => {
                        const Icon = t.icon;
                        return (
                          <div key={t.key} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-2 text-center">
                            <Icon size={14} className={`${t.tone} mx-auto`} />
                            <p className="text-[11px] text-gray-400 mt-1">{t.label}</p>
                            <p className="text-sm font-bold tabular-nums text-gray-800 dark:text-gray-100">
                              {naira(row.declared?.[t.key])}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {(row.posReference || row.transferReference) && (
                      <p className="text-[11px] text-gray-400 mt-2">
                        {row.posReference && `POS ref: ${row.posReference}`}
                        {row.posReference && row.transferReference && " · "}
                        {row.transferReference && `Transfer ref: ${row.transferReference}`}
                      </p>
                    )}

                    {!open ? (
                      <button
                        onClick={() => openFor(row)}
                        className="mt-3 w-full py-2.5 rounded-xl bg-[#0080ff] hover:bg-blue-700 text-white text-sm font-bold transition-colors"
                      >
                        Count and confirm
                      </button>
                    ) : (
                      <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                          What you actually counted
                        </p>
                        <p className="text-[11px] text-gray-400 mb-2">
                          Filled in with what the attendant declared. Change any box that
                          does not match what is in front of you.
                        </p>

                        <div className="grid grid-cols-3 gap-2">
                          {ROWS.map((t) => {
                            const declaredHere = Number(row.declared?.[t.key] ?? 0);
                            const edited =
                              Math.abs((Number(counted[t.key]) || 0) - declaredHere) > 0.5;
                            return (
                              <div key={t.key}>
                                <label className="text-[11px] text-gray-500 block mb-1">{t.label}</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={counted[t.key]}
                                  onChange={(e) => setCounted((p) => ({ ...p, [t.key]: e.target.value }))}
                                  className={`w-full min-w-0 text-right tabular-nums border-2 rounded-lg px-2 py-2 text-sm dark:bg-gray-700 dark:text-white outline-none focus:border-[#0080ff] ${
                                    edited
                                      ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20 font-bold"
                                      : "border-gray-200 dark:border-gray-600"
                                  }`}
                                />
                                {/* The figure being corrected, kept in view so a
                                    changed box is obvious without arithmetic. */}
                                <p className={`text-[10px] mt-1 text-right ${
                                  edited ? "text-amber-700 font-semibold" : "text-gray-400"
                                }`}>
                                  {edited ? `was ${naira(declaredHere)}` : `declared ${naira(declaredHere)}`}
                                </p>
                              </div>
                            );
                          })}
                        </div>

                        {/* Back to square one in a click, for a mis-typed correction. */}
                        {!matches && (
                          <button
                            onClick={() =>
                              setCounted({
                                cash: String(row.declared?.cash ?? 0),
                                POS: String(row.declared?.POS ?? 0),
                                transfer: String(row.declared?.transfer ?? 0),
                              })
                            }
                            className="mt-2 text-[11px] font-semibold text-gray-500 hover:text-[#0080ff] underline"
                          >
                            Reset to what was declared
                          </button>
                        )}

                        <div className={`mt-3 rounded-xl px-3 py-2 text-sm font-semibold ${
                          matches
                            ? "bg-green-50 text-green-700"
                            : gap < 0
                            ? "bg-red-50 text-red-800"
                            : "bg-amber-50 text-amber-700"
                        }`}>
                          {matches ? (
                            <span className="flex items-center gap-1.5">
                              <CheckCircle2 size={14} /> Matches what was declared
                            </span>
                          ) : gap < 0 ? (
                            /* Not merely a difference. The attendant wrote down
                               money that is not in front of you, which is a
                               different conversation from an honest short shift. */
                            <span className="flex items-start gap-1.5">
                              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                              <span>
                                Declared {naira(declaredTotal)} but you have counted{" "}
                                {naira(countedTotal)}. That is {naira(Math.abs(gap))} they
                                said they were handing over and did not.
                              </span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5">
                              <AlertTriangle size={14} />
                              Over by {naira(Math.abs(gap))} against {naira(declaredTotal)}
                            </span>
                          )}
                        </div>

                        {/* What is actually missing against the meter, and what
                            becomes of it. This is the figure that turns into a
                            debt if it is not settled here. */}
                        {shortfall > 0.5 && (
                          <div className="mt-2 rounded-xl border-2 border-red-200 bg-red-50 p-3">
                            <p className="text-sm font-bold text-red-800">
                              Short by {naira(shortfall)} against {naira(expectedAmount)} sold
                            </p>
                            <label className="flex items-start gap-2 mt-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settleNow}
                                onChange={(e) => setSettleNow(e.target.checked)}
                                className="mt-0.5 w-4 h-4 accent-green-600 shrink-0"
                              />
                              <span className="text-xs text-red-800">
                                <span className="font-bold">Paid the difference now.</span>{" "}
                                Tick only if the attendant handed over the {naira(shortfall)} on the
                                spot. Otherwise it stays outstanding against them and adds to
                                anything they already owe.
                              </span>
                            </label>
                          </div>
                        )}

                        {shortfall > 0.5 && !settleNow && (
                          <p className="mt-2 text-[11px] text-gray-500">
                            {nameOf(row.attendant)} will be asked to sign for this
                            {" "}{naira(shortfall)} on their own screen. They can accept it or
                            dispute it, and both answers stay on this record.
                          </p>
                        )}

                        {/* Asked for, never demanded. A cashier who cannot
                            confirm without typing something will type anything,
                            and the money stays uncounted while they argue with
                            the form. */}
                        {!matches && (
                          <input
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="What happened? (optional, but it is what a manager reads later)"
                            className="mt-2 w-full min-w-0 border-2 border-amber-300 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
                          />
                        )}

                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => submit(row)}
                            disabled={busy}
                            className={`flex-1 py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors ${
                              shortfall > 0.5 && !settleNow
                                ? "bg-amber-600 hover:bg-amber-700"
                                : "bg-green-600 hover:bg-green-700"
                            }`}
                          >
                            {busy
                              ? "Saving…"
                              : shortfall > 0.5
                              ? settleNow
                                ? "Confirm, difference paid"
                                : `Confirm, ${naira(shortfall)} outstanding`
                              : matches
                              ? "Confirm"
                              : "Confirm with difference"}
                          </button>
                          <button
                            onClick={() => setOpenId(null)}
                            className="px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <ConfirmedTakings />

        {repaying && (
          <RepayModal
            row={repaying}
            onClose={() => setRepaying(null)}
            onDone={(msg) => {
              setRepaying(null);
              setFeedback({ tone: "ok", text: msg });
              fetchShortfalls({ status: "outstanding" });
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
