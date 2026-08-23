"use client";
import { useEffect, useState } from "react";
import useShiftTenderStore from "@/store/useShiftTenderStore";
import { useSocket } from "@/hooks/useSocket";
import { History, ChevronDown, CheckCircle2, Gauge } from "lucide-react";

/**
 * The attendant's own record of what they have handed in.
 *
 * Settled shifts only, which is the point: this is the list you can stand on.
 * Every row carries the meter readings it was worked out from and the name of
 * the cashier who signed for it, so a figure queried three weeks later can be
 * answered by the person it belongs to rather than by asking the office.
 *
 * Anything still short sits on the shortage card instead, so the two questions
 * stay apart: what have I handed in, and what do I still owe.
 */

const naira = (n) => `₦${Number(n || 0).toLocaleString()}`;
const litres = (n) => `${Number(n || 0).toLocaleString()} L`;
const meter = (n) => (n === null || n === undefined ? "—" : Number(n).toLocaleString());

const when = (d) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return ""; }
};

const day = (d) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return ""; }
};

export default function TakingsHistory() {
  const { history, historyTotals, fetchMyHistory } = useShiftTenderStore();
  const [open, setOpen] = useState(null);

  useEffect(() => { fetchMyHistory(30); }, [fetchMyHistory]);

  // A cashier signing for the shift just handed in should land here directly.
  useSocket({ "tender:confirmed": () => fetchMyHistory(30) });

  if (!history?.length) return null;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
            <History size={17} /> Takings history
          </h2>
          <p className="text-xs text-gray-500">
            Shifts you have handed in and a cashier has signed for
          </p>
        </div>
        {historyTotals && (
          <div className="text-right">
            <p className="text-lg font-extrabold tabular-nums text-gray-900 dark:text-white">
              {naira(historyTotals.total)}
            </p>
            <p className="text-[11px] text-gray-400">
              {historyTotals.shifts} shift{historyTotals.shifts === 1 ? "" : "s"} ·{" "}
              {litres(historyTotals.litres)}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {history.map((h) => {
          const isOpen = open === h.id;
          return (
            <div
              key={h.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpen(isOpen ? null : h.id)}
                className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {h.pumpTitle || "Pump"} · {h.product || "Fuel"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {h.shiftType ? `${h.shiftType} · ` : ""}{day(h.shiftDate)} · {litres(h.litresSold)}
                    </p>
                  </div>
                  <div className="text-right shrink-0 flex items-start gap-2">
                    <div>
                      <p className="text-lg font-extrabold tabular-nums text-gray-900 dark:text-white">
                        {naira(h.total)}
                      </p>
                      <p className="text-[11px] text-green-700 font-semibold flex items-center gap-1 justify-end">
                        <CheckCircle2 size={11} /> Signed for
                      </p>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 mt-1.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </div>
                </div>

                {/* The split stays visible closed: it is the thing most often
                    asked about, and hiding it behind a tap helps nobody. */}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="text-center bg-green-50 dark:bg-gray-900 rounded-lg py-1.5">
                    <p className="text-[10px] font-semibold uppercase text-green-700">Cash</p>
                    <p className="text-sm font-bold tabular-nums text-gray-800 dark:text-gray-100">
                      {naira(h.cash)}
                    </p>
                  </div>
                  <div className="text-center bg-blue-50 dark:bg-gray-900 rounded-lg py-1.5">
                    <p className="text-[10px] font-semibold uppercase text-blue-700">POS</p>
                    <p className="text-sm font-bold tabular-nums text-gray-800 dark:text-gray-100">
                      {naira(h.POS)}
                    </p>
                  </div>
                  <div className="text-center bg-purple-50 dark:bg-gray-900 rounded-lg py-1.5">
                    <p className="text-[10px] font-semibold uppercase text-purple-700">Transfer</p>
                    <p className="text-sm font-bold tabular-nums text-gray-800 dark:text-gray-100">
                      {naira(h.transfer)}
                    </p>
                  </div>
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3">
                  {/* The readings the amount was worked out from. Without these
                      the total is a number to be trusted rather than checked. */}
                  <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-2 flex items-center gap-1">
                    <Gauge size={12} /> Meter
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                    <div>
                      <p className="text-[11px] text-gray-400">Opening</p>
                      <p className="text-sm font-bold tabular-nums">{meter(h.openingMeterReading)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400">Closing</p>
                      <p className="text-sm font-bold tabular-nums">{meter(h.closingMeterReading)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400">Litres sold</p>
                      <p className="text-sm font-bold tabular-nums">{litres(h.litresSold)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400">Price per litre</p>
                      <p className="text-sm font-bold tabular-nums">{naira(h.pricePerLtr)}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-gray-100 dark:border-gray-700 pt-3">
                    <div>
                      <p className="text-[11px] text-gray-400">Amount sold for</p>
                      <p className="text-sm font-bold tabular-nums">{naira(h.expectedAmount)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400">Confirmed by</p>
                      <p className="text-sm font-bold">{h.confirmedBy}</p>
                      <p className="text-[11px] text-gray-400">{when(h.confirmedAt)}</p>
                    </div>
                  </div>

                  {/* Their own evidence that a mistake was caught and fixed
                      rather than held against them. */}
                  {h.correctedByCashier && (
                    <p className="mt-3 text-[11px] text-blue-800 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1.5">
                      You submitted {naira(h.declaredTotal)} and the cashier counted{" "}
                      {naira(h.total)}. The count was used, and it met the meter.
                    </p>
                  )}

                  {(h.posReference || h.transferReference) && (
                    <p className="mt-2 text-[11px] text-gray-400">
                      {h.posReference && `POS ref: ${h.posReference}`}
                      {h.posReference && h.transferReference && " · "}
                      {h.transferReference && `Transfer ref: ${h.transferReference}`}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
