"use client";
import { useEffect, useState } from "react";
import useShiftTenderStore from "@/store/useShiftTenderStore";
import { useSocket } from "@/hooks/useSocket";
import { Loader2, CheckCircle2, TrendingDown, TrendingUp, Wrench } from "lucide-react";

/**
 * The cashier's own record of what they have signed for.
 *
 * The queue above answers "what is waiting". This answers "what did I do about
 * it", which is the question asked when a manager comes back a week later about
 * one particular shift. Split by outcome rather than listed flat, because
 * "went through clean" and "came up short" are different things to look for and
 * a single list makes you hunt for the second among the first.
 *
 * The outcome on each row is decided by the server using the same rules the
 * confirmation itself applied, so a shift cannot read one way here and another
 * way in the record it came from.
 */

const naira = (n) => `₦${Number(n || 0).toLocaleString()}`;
const nameOf = (p) => [p?.firstName, p?.lastName].filter(Boolean).join(" ").trim() || "Former staff";

const when = (d) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleString("en-GB", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
    });
  } catch { return ""; }
};

const TABS = [
  { key: "all",     label: "All",     icon: null,         tone: "text-gray-600" },
  { key: "matched", label: "Correct", icon: CheckCircle2, tone: "text-green-700" },
  { key: "short",   label: "Short",   icon: TrendingDown, tone: "text-red-700" },
  { key: "over",    label: "Over",    icon: TrendingUp,   tone: "text-amber-700" },
];

const RANGES = [
  { value: "today", label: "Today" },
  { value: "week",  label: "Last 7 days" },
  { value: "month", label: "This month" },
];

const rangeToParams = (r) => {
  const now = new Date();
  const iso = (d) => d.toISOString().slice(0, 10);
  if (r === "today") return { from: iso(now), to: iso(now) };
  if (r === "week") {
    const s = new Date(now); s.setDate(now.getDate() - 6);
    return { from: iso(s), to: iso(now) };
  }
  const s = new Date(now.getFullYear(), now.getMonth(), 1);
  return { from: iso(s), to: iso(now) };
};

/** How each outcome reads at a glance. */
const OUTCOME = {
  matched:   { label: "Correct",   cls: "bg-green-100 text-green-800", icon: CheckCircle2 },
  corrected: { label: "Corrected", cls: "bg-blue-100 text-blue-800",   icon: Wrench },
  short:     { label: "Short",     cls: "bg-red-100 text-red-800",     icon: TrendingDown },
  over:      { label: "Over",      cls: "bg-amber-100 text-amber-800", icon: TrendingUp },
  awaiting:  { label: "Awaiting",  cls: "bg-gray-100 text-gray-600",   icon: null },
};

export default function ConfirmedTakings() {
  const { audit, loading, fetchAudit } = useShiftTenderStore();
  const [tab, setTab] = useState("all");
  const [range, setRange] = useState("today");
  const [mine, setMine] = useState(true);

  const load = () =>
    fetchAudit({
      ...rangeToParams(range),
      outcome: tab,
      // Scoped to the session on the server, so it cannot be pointed at
      // somebody else's name by editing a request.
      ...(mine ? { mine: "true" } : {}),
    });

  useEffect(() => { load(); }, [tab, range, mine]);
  useSocket({ "tender:confirmed": () => load() });

  const { rows, outcomes, totals } = audit;

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Takings you have confirmed
          </h2>
          <p className="text-xs text-gray-500">
            What went through clean, and what did not
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-3 py-2 text-sm"
          >
            {RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <select
            value={mine ? "mine" : "all"}
            onChange={(e) => setMine(e.target.value === "mine")}
            className="border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-3 py-2 text-sm"
          >
            <option value="mine">Signed by me</option>
            <option value="all">Everyone</option>
          </select>
        </div>
      </div>

      {/* Counts sit on the tabs, so the shape of the day is visible before
          anything is clicked. */}
      <div className="flex gap-1 p-1 bg-neutral-100 dark:bg-gray-800 rounded-xl mb-3 overflow-x-auto">
        {TABS.map((t) => {
          const Icon = t.icon;
          const count =
            t.key === "all"
              ? (outcomes?.matched || 0) + (outcomes?.corrected || 0) +
                (outcomes?.short || 0) + (outcomes?.over || 0)
              : t.key === "matched"
              ? (outcomes?.matched || 0) + (outcomes?.corrected || 0)
              : outcomes?.[t.key] || 0;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                tab === t.key
                  ? "bg-white dark:bg-gray-700 shadow-sm " + t.tone
                  : "text-neutral-500 hover:text-neutral-700 dark:text-gray-400"
              }`}
            >
              {Icon && <Icon size={13} />} {t.label}
              {outcomes && (
                <span className="text-[11px] font-bold opacity-70">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* What the drawer should hold for this selection. */}
      {totals && rows.length > 0 && (
        <div className="flex flex-wrap gap-x-5 gap-y-1 mb-3 px-1">
          <span className="text-xs text-gray-500">
            Total <span className="font-bold tabular-nums text-gray-900 dark:text-white">{naira(totals.total)}</span>
          </span>
          <span className="text-xs text-gray-500">
            Cash <span className="font-bold tabular-nums text-green-700">{naira(totals.cash)}</span>
          </span>
          <span className="text-xs text-gray-500">
            POS <span className="font-bold tabular-nums text-blue-700">{naira(totals.POS)}</span>
          </span>
          <span className="text-xs text-gray-500">
            Transfer <span className="font-bold tabular-nums text-purple-700">{naira(totals.transfer)}</span>
          </span>
          {totals.shortfall > 0 && (
            <span className="text-xs text-gray-500">
              Short <span className="font-bold tabular-nums text-red-700">{naira(totals.shortfall)}</span>
            </span>
          )}
          {outcomes?.overageTotal > 0 && (
            <span className="text-xs text-gray-500">
              Over <span className="font-bold tabular-nums text-amber-700">{naira(outcomes.overageTotal)}</span>
            </span>
          )}
        </div>
      )}

      {loading && rows.length === 0 ? (
        <div className="flex items-center gap-2 text-gray-400 py-10 justify-center">
          <Loader2 size={18} className="animate-spin" /> Loading…
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-10">
          {tab === "short"
            ? "Nothing short in this period."
            : tab === "over"
            ? "Nothing over in this period."
            : "Nothing confirmed in this period."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full border-collapse text-sm min-w-[760px]">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr className="text-left text-xs uppercase tracking-wide text-gray-600 dark:text-gray-300">
                <th className="px-3 py-2.5 border border-gray-200 dark:border-gray-700">Attendant</th>
                <th className="px-3 py-2.5 border border-gray-200 dark:border-gray-700">Shift</th>
                <th className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 text-right">Expected</th>
                <th className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 text-right">Cash</th>
                <th className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 text-right">POS</th>
                <th className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 text-right">Transfer</th>
                <th className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 text-right">Counted</th>
                <th className="px-3 py-2.5 border border-gray-200 dark:border-gray-700">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const s = r.received || r.declared || {};
                const o = OUTCOME[r.outcome] || OUTCOME.awaiting;
                const Icon = o.icon;
                return (
                  <tr
                    key={r._id}
                    className={
                      r.outcome === "short"
                        ? "bg-red-50/60 dark:bg-red-900/10"
                        : r.outcome === "over"
                        ? "bg-amber-50/60 dark:bg-amber-900/10"
                        : ""
                    }
                  >
                    <td className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 font-medium">
                      {nameOf(r.attendant)}
                      <span className="block text-[11px] text-gray-400 font-normal">
                        {when(r.confirmedAt)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 text-xs text-gray-500">
                      {r.shift?.pumpTitle || "—"}
                      <span className="block">
                        {r.product || r.shift?.product || ""}{" "}
                        {Number(r.shift?.litresSold || 0).toLocaleString()} L
                      </span>
                    </td>
                    <td className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 text-right tabular-nums">
                      {naira(r.expectedAmount)}
                    </td>
                    <td className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 text-right tabular-nums">{naira(s.cash)}</td>
                    <td className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 text-right tabular-nums">{naira(s.POS)}</td>
                    <td className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 text-right tabular-nums">{naira(s.transfer)}</td>
                    <td className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 text-right tabular-nums font-bold">
                      {naira(r.receivedTotal ?? r.declaredTotal)}
                    </td>
                    <td className="px-3 py-2.5 border border-gray-200 dark:border-gray-700">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${o.cls}`}>
                        {Icon && <Icon size={10} />} {o.label}
                      </span>
                      {/* The size of the gap, which is the reason the row is
                          being looked at in the first place. */}
                      {r.outcome === "short" && (
                        <span className="block text-[11px] font-bold text-red-700 mt-0.5">
                          {naira(r.shortfall)} short
                          {r.shortfallStatus === "paid" && " · repaid"}
                          {r.shortfallStatus === "outstanding" && " · owing"}
                        </span>
                      )}
                      {r.outcome === "over" && (
                        <span className="block text-[11px] font-bold text-amber-700 mt-0.5">
                          {naira(r.overage)} over
                        </span>
                      )}
                      {r.outcome === "corrected" && (
                        <span className="block text-[11px] text-blue-700 mt-0.5">
                          declared {naira(r.declaredTotal)}
                        </span>
                      )}
                      {!mine && r.confirmedBy && (
                        <span className="block text-[11px] text-gray-400 mt-0.5">
                          by {nameOf(r.confirmedBy)}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
