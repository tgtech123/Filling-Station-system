"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import useShiftTenderStore from "@/store/useShiftTenderStore";
import TakingsHistory from "./TakingsHistory";
import { Banknote, CreditCard, Landmark, Loader2, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";

/**
 * What the attendant hands over, split by how it was paid.
 *
 * Reached after the closing meter reading, because the figure this form must
 * reach comes from the meter. The attendant sees that figure first, fills in
 * three boxes, and the running difference tells them where they stand before
 * they submit rather than after.
 */

const naira = (n) => `₦${Number(n || 0).toLocaleString()}`;

const TENDERS = [
  {
    key: "cash",
    label: "Cash at hand",
    hint: "Count the notes",
    icon: Banknote,
    tone: "text-green-600",
  },
  {
    key: "POS",
    label: "POS / card",
    hint: "Total on the POS printout",
    refLabel: "End-of-day POS reference (optional)",
    refHint: "The batch or Z-report number off the terminal, if you have it. One for the whole day is enough.",
    icon: CreditCard,
    tone: "text-blue-600",
  },
  {
    key: "transfer",
    label: "Transfers",
    hint: "Add up the transfer slips",
    refLabel: "End-of-day transfer reference (optional)",
    refHint: "One reference covering the day's transfers. Leave it blank if there is no time.",
    icon: Landmark,
    tone: "text-purple-600",
  },
];

export default function ShiftTenderPage() {
  const params = useSearchParams();
  const router = useRouter();
  /**
   * The screen is reached two ways: straight from closing a shift, which puts
   * the id in the URL, and from the sidebar, which cannot know it. In the
   * second case the attendant is shown what they still have to hand in and
   * picks one, or is taken straight through when there is only one.
   */
  const [picked, setPicked] = useState(null);

  const shiftId = params.get("shift") || picked;

  const { expected, loading, fetchExpected, declare, awaiting, fetchAwaiting } =
    useShiftTenderStore();


  const [amounts, setAmounts] = useState({ cash: "", POS: "", transfer: "" });
  const [posRef, setPosRef] = useState("");
  const [transferRef, setTransferRef] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (shiftId) fetchExpected(shiftId);
    else fetchAwaiting();
  }, [shiftId, fetchExpected, fetchAwaiting]);

  /**
   * Already submitted once and coming back to fix it.
   *
   * The boxes are filled with what was sent last time, because correcting a
   * mistake should mean changing the one number that was wrong rather than
   * retyping all three from memory and risking a second mistake.
   */
  useEffect(() => {
    const d = expected?.tender?.declared;
    if (d && !expected?.tender?.received) {
      setAmounts({
        cash: String(d.cash ?? 0),
        POS: String(d.POS ?? 0),
        transfer: String(d.transfer ?? 0),
      });
    }
  }, [expected?.tender?._id]);

  // Exactly one shift to hand in is not a choice worth making them make.
  useEffect(() => {
    if (!shiftId && awaiting?.length === 1) setPicked(String(awaiting[0].shiftId));
  }, [awaiting, shiftId]);

  const owed = Number(expected?.expectedAmount || 0);

  /**
   * Where the attendant stands, updated as they type.
   *
   * Shown live so a difference is noticed and corrected before submitting, but
   * it never blocks the submission. Refusing a short declaration does not
   * recover the money, it only teaches the attendant to type a figure that
   * balances, and then the shortage exists in the drawer but not in the record.
   */
  const entered = useMemo(
    () =>
      (Number(amounts.cash) || 0) +
      (Number(amounts.POS) || 0) +
      (Number(amounts.transfer) || 0),
    [amounts]
  );

  const difference = Math.round((entered - owed) * 100) / 100;
  const balanced = Math.abs(difference) <= 0.5;

  const setAmount = (key, value) => {
    setResult(null);
    setAmounts((prev) => ({ ...prev, [key]: value }));
  };

  /**
   * Back to the list rather than out of the page.
   *
   * The chosen shift lives in component state, so the browser's own Back had
   * nothing to step through and took the attendant out to the dashboard. Any
   * screen that navigates internally has to offer its own way back to where it
   * came from.
   */
  const backToList = () => {
    setPicked(null);
    setResult(null);
    setAmounts({ cash: "", POS: "", transfer: "" });
    setPosRef("");
    setTransferRef("");
    // Only meaningful when the id came from the URL rather than a pick.
    if (params.get("shift")) router.replace("/dashboard/shifts/tender");
  };

  const submit = async () => {
    setSubmitting(true);
    setResult(null);
    const res = await declare({
      shiftId,
      cash: Number(amounts.cash) || 0,
      POS: Number(amounts.POS) || 0,
      transfer: Number(amounts.transfer) || 0,
      posReference: posRef.trim() || undefined,
      transferReference: transferRef.trim() || undefined,
    });
    setSubmitting(false);
    setResult(res);
    /**
     * Re-read the record after a successful submit.
     *
     * Without this the page kept rendering off stale state and still offered
     * "Submit anyway" on takings that were already in, which reads as a failed
     * submission and invites a second one.
     */
    if (res.success) {
      await fetchExpected(shiftId);
      await fetchAwaiting();
    }
  };

  if (!shiftId) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto pb-12">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Submit your takings</h1>
          <p className="text-sm text-gray-500 mt-0.5 mb-5">
            Pick the shift you are handing in
          </p>

          {!awaiting?.length ? (
            <div className="text-center py-12">
              <CheckCircle2 size={32} className="text-green-500 mx-auto mb-3" />
              <p className="text-gray-500">
                Nothing to hand in. Close a shift with your meter reading first, then
                come back here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {awaiting.map((s) => (
                <button
                  key={s.shiftId}
                  onClick={() => setPicked(String(s.shiftId))}
                  className="w-full text-left bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-[#0080ff] rounded-2xl p-4 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {s.pumpTitle || "Pump"} · {s.product || "Fuel"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {s.shiftType || ""}{" "}
                        {/* With the time: an attendant who worked two shifts in
                            a day cannot tell them apart by the date alone. */}
                        {s.shiftDate
                          ? new Date(s.shiftDate).toLocaleString("en-GB", {
                              day: "2-digit", month: "short", year: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })
                          : ""}{" "}
                        · {Number(s.litresSold || 0).toLocaleString()} L
                      </p>
                      {s.alreadyDeclared && (
                        <p className="text-[11px] font-semibold text-amber-700 mt-0.5">
                          Already submitted {naira(s.declaredTotal)}, waiting on the cashier.
                          Open it to correct the figures.
                        </p>
                      )}
                    </div>
                    <p className="text-lg font-extrabold tabular-nums text-[#0080ff] shrink-0">
                      {naira(s.expectedAmount)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          <TakingsHistory />
        </div>
      </DashboardLayout>
    );
  }

  // Locked once the cashier has counted, because from then on there are two
  // accounts of the same money and rewriting one of them destroys the pair.
  const counted = Boolean(expected?.tender?.received);
  const resubmitting = Boolean(expected?.tender && !counted);
  const alreadyIn = counted;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto pb-12">

        <button
          onClick={backToList}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#0080ff] mb-3 transition-colors"
        >
          <ArrowLeft size={16} /> All shifts to hand in
        </button>

        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Submit your takings</h1>
        <p className="text-sm text-gray-500 mt-0.5 mb-5">
          Split what you are handing over into cash, POS and transfers.
        </p>

        {loading && !expected ? (
          <div className="flex items-center gap-2 text-gray-400 py-12 justify-center">
            <Loader2 size={18} className="animate-spin" /> Reading the shift…
          </div>
        ) : (
          <>
            {/* What the meter says. First, because it is the figure the three
                boxes below have to reach. */}
            <div className="bg-[#0080ff] text-white rounded-2xl p-5 mb-5">
              <p className="text-xs uppercase tracking-wider opacity-80">This shift sold</p>
              <p className="text-3xl font-extrabold tabular-nums mt-1">{naira(owed)}</p>
              <p className="text-xs opacity-80 mt-1">
                {Number(expected?.litresSold || 0).toLocaleString()} litres at{" "}
                {naira(expected?.pricePerLtr)} each
              </p>
            </div>

            {alreadyIn ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
                <CheckCircle2 size={28} className="text-green-600 mx-auto mb-2" />
                <p className="font-bold text-green-800">Counted by the cashier</p>
                <p className="text-sm text-green-700 mt-1">
                  You declared {naira(expected.tender.declaredTotal)}, the cashier counted{" "}
                  {naira(expected.tender.receivedTotal)}.
                </p>
                {Math.abs(
                  (expected.tender.receivedTotal || 0) - (expected.tender.declaredTotal || 0)
                ) > 0.5 && (
                  <p className="text-xs text-green-700 mt-2">
                    Cash {naira(expected.tender.received?.cash)} · POS{" "}
                    {naira(expected.tender.received?.POS)} · Transfer{" "}
                    {naira(expected.tender.received?.transfer)}
                  </p>
                )}
                {/* The way back is a person, not a form. Saying so beats letting
                    them hunt for a button that is deliberately not theirs. */}
                <p className="text-xs text-gray-500 mt-3">
                  This can no longer be edited here. If the figures are wrong, ask a
                  manager or supervisor to reopen it.
                </p>
              </div>
            ) : (
              <>
                {/* Correcting an earlier submission, before anyone counted it. */}
                {resubmitting && (
                  <div className="mb-3 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">
                    <p className="font-bold">
                      You already submitted {naira(expected.tender.declaredTotal)} for this shift.
                    </p>
                    <p className="mt-0.5">
                      The cashier has not counted it yet, so you can still fix it. Change
                      whatever was wrong and submit again; this replaces the earlier figures
                      rather than adding to them.
                    </p>
                  </div>
                )}
                <div className="space-y-3">
                  {TENDERS.map((t) => {
                    const Icon = t.icon;
                    return (
                      <div
                        key={t.key}
                        className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-4"
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={20} className={`${t.tone} shrink-0`} />
                          <div className="min-w-0 flex-1">
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-100">
                              {t.label}
                            </label>
                            <p className="text-xs text-gray-400">{t.hint}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-gray-400 text-sm">₦</span>
                            <input
                              type="number"
                              inputMode="decimal"
                              min="0"
                              value={amounts[t.key]}
                              onChange={(e) => setAmount(t.key, e.target.value)}
                              placeholder="0"
                              className="w-32 min-w-0 text-right text-lg font-bold tabular-nums border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-2 py-2 outline-none focus:border-[#0080ff]"
                            />
                          </div>
                        </div>

                        {/* One reference for the day, never one per slip.
                            Copying a number off every printout at close of shift
                            is time nobody has, and a form that demands it gets
                            filled with rubbish. One end-of-day figure is enough
                            to find the batch on a statement later. */}
                        {t.key !== "cash" && Number(amounts[t.key]) > 0 && (
                          <div className="mt-3">
                            <input
                              value={t.key === "POS" ? posRef : transferRef}
                              onChange={(e) =>
                                t.key === "POS" ? setPosRef(e.target.value) : setTransferRef(e.target.value)
                              }
                              placeholder={t.refLabel}
                              className="w-full min-w-0 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-xs"
                            />
                            <p className="text-[11px] text-gray-400 mt-1">{t.refHint}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* The running check. Green only when it is exactly right. */}
                <div
                  className={`mt-4 rounded-2xl p-4 border-2 ${
                    balanced
                      ? "bg-green-50 border-green-300"
                      : "bg-amber-50 border-amber-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500">You have entered</p>
                      <p className="text-2xl font-extrabold tabular-nums text-gray-900">{naira(entered)}</p>
                    </div>
                    <div className="text-right">
                      {balanced ? (
                        <p className="text-sm font-bold text-green-700 flex items-center gap-1.5">
                          <CheckCircle2 size={16} /> Matches the shift exactly
                        </p>
                      ) : (
                        <>
                          <p className="text-sm font-bold text-amber-700 flex items-center gap-1.5 justify-end">
                            <AlertTriangle size={16} />
                            {difference < 0 ? "Short by" : "Over by"} {naira(Math.abs(difference))}
                          </p>
                          <p className="text-xs text-amber-600 mt-0.5">
                            This shift sold {naira(owed)}. Check the figures.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {!balanced && entered > 0 && (
                  <div className="mt-3 text-xs rounded-xl p-3 border bg-amber-50 border-amber-200 text-amber-800">
                    <p className="font-bold mb-0.5">You can still submit this.</p>
                    <p>
                      {difference < 0
                        ? `It will be recorded as short by ${naira(Math.abs(difference))} and your manager will be told. ` +
                          "If the money is there, correct the figures first."
                        : `It will be recorded as over by ${naira(Math.abs(difference))} and your manager will be told.`}
                    </p>
                  </div>
                )}

                {/* Once it is in, the form gives way to the receipt for it.
                    Leaving an armed submit button under a success message is
                    how a shift gets handed in twice. */}
                {result?.success ? (
                  <div className="mt-4 rounded-2xl border-2 border-green-300 bg-green-50 p-5 text-center">
                    <CheckCircle2 size={28} className="text-green-600 mx-auto mb-2" />
                    <p className="font-bold text-green-800">{result.message}</p>
                    <p className="text-sm text-green-700 mt-1">
                      Cash {naira(amounts.cash)} · POS {naira(amounts.POS)} · Transfer{" "}
                      {naira(amounts.transfer)}
                    </p>
                    <p className="text-xs text-green-700/80 mt-2">
                      The cashier will count what you hand over and sign for it. It will
                      appear in your history below once they do.
                    </p>
                    <button
                      onClick={backToList}
                      className="mt-4 w-full py-2.5 rounded-xl bg-[#0080ff] hover:bg-blue-700 text-white text-sm font-bold transition-colors"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <>

                {result && !result.success && (
                  <p className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
                    {result.error}
                  </p>
                )}
                {result?.success && (
                  <p className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl p-3">
                    {result.message}
                  </p>
                )}

                <button
                  onClick={submit}
                  disabled={submitting || entered <= 0}
                  className={`mt-4 w-full py-3.5 rounded-2xl font-bold text-white transition-colors ${
                    submitting || entered <= 0
                      ? "bg-gray-300 cursor-not-allowed"
                      : balanced
                      ? "bg-[#0080ff] hover:bg-blue-700"
                      : "bg-amber-600 hover:bg-amber-700"
                  }`}
                >
                  {submitting
                    ? "Submitting…"
                    : balanced
                    ? "Submit to cashier"
                    : `Submit anyway (${difference < 0 ? "short" : "over"} ${naira(Math.abs(difference))})`}
                </button>

                <p className="text-xs text-gray-400 text-center mt-3">
                  The cashier will count what you hand over and confirm it against this.
                </p>
                  </>
                )}
              </>
            )}

            <TakingsHistory />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
