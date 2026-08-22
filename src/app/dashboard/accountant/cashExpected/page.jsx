"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { api } from "@/lib/config";
import { useSocket } from "@/hooks/useSocket";
import Link from "next/link";
import { Loader2, Eye, Banknote, CreditCard, Landmark, AlertTriangle, Fuel, ShoppingBasket, Flame, TrendingDown } from "lucide-react";

/**
 * How much the cashier should be holding, and in what form.
 *
 * Every channel takes money three ways. This is the one screen that answers the
 * end-of-shift question directly: this much CASH must be in the drawer, this
 * much must show on the terminal, this much must appear on a statement.
 *
 * Read-only. The endpoint behind it offers no verb but GET.
 */

const naira = (n) => `₦${Number(n || 0).toLocaleString()}`;
const iso = (d) => d.toISOString().slice(0, 10);

const TENDERS = [
  { key: "cash",     label: "Cash",     icon: Banknote, tone: "text-green-600",  bg: "bg-green-50",  note: "must be in the drawer" },
  { key: "POS",      label: "POS",      icon: CreditCard, tone: "text-blue-600",  bg: "bg-blue-50",   note: "check the terminal" },
  { key: "transfer", label: "Transfer", icon: Landmark, tone: "text-purple-600", bg: "bg-purple-50", note: "check the statement" },
];

const CHANNELS = [
  { key: "fuel",    label: "Fuel",    icon: Fuel },
  { key: "counter", label: "Counter", icon: ShoppingBasket },
  { key: "gas",     label: "Gas",     icon: Flame },
];

/**
 * A pump is plumbed to one tank and a tank holds one product, so every fuel
 * shift already knows what came out of the hose. That makes the per-product
 * reconciliation possible without anybody tagging a sale by hand.
 */
const PRODUCT_TONE = {
  "PMS (Petrol)": "bg-orange-500",
  "AGO (Diesel)": "bg-emerald-600",
  "Kerosene": "bg-sky-500",
  "Unspecified": "bg-gray-400",
};

/** The presets people actually ask for, plus a free range behind them. */
const PRESETS = [
  { key: "today", label: "Today" },
  { key: "week",  label: "This week" },
  { key: "month", label: "This month" },
  { key: "year",  label: "This year" },
  { key: "custom", label: "Pick dates" },
];

const rangeFor = (preset) => {
  const now = new Date();
  const today = iso(now);
  if (preset === "today") return { from: today, to: today };
  if (preset === "week") {
    const s = new Date(now);
    s.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Monday
    return { from: iso(s), to: today };
  }
  if (preset === "month") return { from: iso(new Date(now.getFullYear(), now.getMonth(), 1)), to: today };
  if (preset === "year") return { from: iso(new Date(now.getFullYear(), 0, 1)), to: today };
  return { from: today, to: today };
};

export default function CashExpectedPage() {
  const [preset, setPreset] = useState("today");
  const [range, setRange] = useState(rangeFor("today"));
  const [groupBy, setGroupBy] = useState("shift");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async (r = range, g = groupBy) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/accountant/cash-expected", {
        params: { from: r.from, to: r.to, groupBy: g },
      });
      setData(res.data?.data || null);
    } catch (err) {
      setError(err?.response?.data?.error || "Could not load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [range, groupBy]);

  // A shift confirmed or a sale rung up changes these figures.
  useSocket({
    "tender:confirmed": () => load(),
    "dashboard:refresh": () => load(),
  });

  const choosePreset = (key) => {
    setPreset(key);
    if (key !== "custom") setRange(rangeFor(key));
  };

  const totals = data?.totals;

  return (
    <DashboardLayout>
      <div className="pb-12">

        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Cash to Expect</h1>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 border border-gray-200 dark:border-gray-700 rounded-full px-2 py-0.5">
            <Eye size={11} /> Read only
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-0.5 mb-4">
          Every channel, split by how it was paid, grouped by shift
        </p>

        {/* Period */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex gap-1 p-1 bg-neutral-100 dark:bg-gray-800 rounded-xl">
            {PRESETS.map((p) => (
              <button
                key={p.key}
                onClick={() => choosePreset(p.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  preset === p.key
                    ? "bg-white dark:bg-gray-700 text-[#0080ff] shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700 dark:text-gray-400"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {preset === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={range.from}
                onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
                className="min-w-0 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-2 py-1.5 text-sm"
              />
              <span className="text-gray-400 text-sm">to</span>
              <input
                type="date"
                value={range.to}
                onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
                className="min-w-0 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-2 py-1.5 text-sm"
              />
            </div>
          )}

          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-3 py-2 text-sm ml-auto"
          >
            <option value="shift">Group by shift</option>
            <option value="day">Group by day</option>
          </select>
        </div>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3 mb-4">{error}</p>
        )}

        {/* The answer, before the detail. */}
        {totals && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            {TENDERS.map((t) => {
              const Icon = t.icon;
              return (
                <div key={t.key} className={`${t.bg} dark:bg-gray-800 border-2 border-transparent dark:border-gray-700 rounded-2xl p-4`}>
                  <p className={`text-xs font-bold uppercase tracking-wide ${t.tone} flex items-center gap-1.5`}>
                    <Icon size={14} /> {t.label}
                  </p>
                  <p className="text-2xl font-extrabold tabular-nums text-gray-900 dark:text-white mt-1">
                    {naira(totals[t.key])}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{t.note}</p>
                </div>
              );
            })}
          </div>
        )}

        {totals && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 mb-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Total taken</p>
                <p className="text-2xl font-extrabold tabular-nums text-gray-900 dark:text-white">
                  {naira(totals.total)}
                </p>
              </div>
              <div className="flex gap-5">
                {CHANNELS.filter((c) => c.key !== "gas" || data?.gasEnabled).map((c) => {
                  const Icon = c.icon;
                  return (
                    <div key={c.key}>
                      <p className="text-[11px] font-semibold uppercase text-gray-400 flex items-center gap-1">
                        <Icon size={12} /> {c.label}
                      </p>
                      <p className="text-sm font-bold tabular-nums">{naira(totals.byChannel?.[c.key])}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Never folded into the totals: the accountant has to know the
                drawer figure is incomplete rather than trust a smaller one. */}
            {data?.awaitingConfirmation > 0 && (
              <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-1.5">
                <AlertTriangle size={13} />
                {data.awaitingConfirmation} fuel shift{data.awaitingConfirmation === 1 ? "" : "s"} not yet
                confirmed by a cashier. Those takings are NOT in the figures above.
              </p>
            )}
          </div>
        )}

        {/* Fuel by product. The reconciliation a station actually runs:
            PMS left these tanks, this much came back as cash, this much on the
            terminal, this much by transfer. */}
        {data?.byProduct?.length > 0 && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden mb-5">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <p className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                <Fuel size={15} /> Fuel takings by product
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Each pump runs off one tank, so every litre is already attributed
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm min-w-[560px]">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr className="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-300">
                    <th className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 text-left">Product</th>
                    <th className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 text-right">Cash</th>
                    <th className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 text-right">POS</th>
                    <th className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 text-right">Transfer</th>
                    <th className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byProduct.map((p) => (
                    <tr key={p.product}>
                      <td className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 font-semibold">
                        <span className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${PRODUCT_TONE[p.product] || "bg-gray-400"}`} />
                          {p.product}
                          <span className="text-[11px] font-normal text-gray-400">
                            {p.count} shift{p.count === 1 ? "" : "s"}
                          </span>
                        </span>
                      </td>
                      <td className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 text-right tabular-nums text-green-700 dark:text-green-400">
                        {naira(p.cash)}
                      </td>
                      <td className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 text-right tabular-nums text-blue-700 dark:text-blue-400">
                        {naira(p.POS)}
                      </td>
                      <td className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 text-right tabular-nums text-purple-700 dark:text-purple-400">
                        {naira(p.transfer)}
                      </td>
                      <td className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 text-right tabular-nums font-bold">
                        {naira(p.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-900 font-bold">
                  <tr>
                    <td className="px-3 py-2.5 border border-gray-200 dark:border-gray-700">All fuel</td>
                    <td className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 text-right tabular-nums">
                      {naira(data.byProduct.reduce((s, p) => s + p.cash, 0))}
                    </td>
                    <td className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 text-right tabular-nums">
                      {naira(data.byProduct.reduce((s, p) => s + p.POS, 0))}
                    </td>
                    <td className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 text-right tabular-nums">
                      {naira(data.byProduct.reduce((s, p) => s + p.transfer, 0))}
                    </td>
                    <td className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 text-right tabular-nums">
                      {naira(totals?.byChannel?.fuel)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* What was expected but never arrived. Beside the takings, never
            inside them: the figures above are what IS there, this is what is
            owed, and adding the two would match neither the cash nor the meter. */}
        {data?.shortfalls?.total > 0 && (
          <div className="bg-white dark:bg-gray-800 border-2 border-red-200 rounded-2xl p-4 mb-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold text-sm text-red-800 dark:text-red-300 flex items-center gap-1.5">
                  <TrendingDown size={15} /> Short in this period
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {data.shortfalls.shifts} shift{data.shortfalls.shifts === 1 ? "" : "s"} handed
                  over less than the meter said. Not included in the takings above.
                </p>
              </div>
              <div className="flex gap-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase text-red-600">Outstanding</p>
                  <p className="text-lg font-extrabold tabular-nums text-red-700 dark:text-red-400">
                    {naira(data.shortfalls.outstanding)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase text-gray-400">Repaid</p>
                  <p className="text-sm font-bold tabular-nums">{naira(data.shortfalls.repaid)}</p>
                </div>
                {data.shortfalls.waived > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase text-gray-400">Written off</p>
                    <p className="text-sm font-bold tabular-nums">{naira(data.shortfalls.waived)}</p>
                  </div>
                )}
              </div>
            </div>
            <Link
              href="/dashboard/accountant/shortfalls"
              className="inline-block mt-3 text-xs font-bold text-[#0080ff] hover:underline"
            >
              See who owes what
            </Link>
          </div>
        )}

        {loading && !data ? (
          <div className="flex items-center gap-2 text-gray-400 py-12 justify-center">
            <Loader2 size={18} className="animate-spin" /> Loading…
          </div>
        ) : !data?.rows?.length ? (
          <p className="text-sm text-gray-400 text-center py-16">No takings in this period.</p>
        ) : (
          <div className="space-y-3">
            {data.rows.map((row) => (
              <div key={row.key} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white capitalize">{row.label}</p>
                    <p className="text-xs text-gray-400">{row.date}</p>
                  </div>
                  <p className="text-lg font-extrabold tabular-nums text-[#0080ff]">
                    {naira(row.combined.total)}
                  </p>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {TENDERS.map((t) => (
                      <div key={t.key} className="text-center">
                        <p className={`text-[11px] font-semibold uppercase ${t.tone}`}>{t.label}</p>
                        <p className="text-sm font-bold tabular-nums text-gray-800 dark:text-gray-100">
                          {naira(row.combined[t.key])}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Where it came from, so a figure can be traced rather than
                      merely trusted. */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-2">
                    {CHANNELS.filter((c) => row[c.key]?.total > 0).map((c) => (
                      <span key={c.key}>
                        {c.label} {naira(row[c.key].total)} ({row[c.key].count})
                      </span>
                    ))}
                  </div>

                  {Object.keys(row.byProduct || {}).length > 0 && (
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500 mt-1">
                      {Object.entries(row.byProduct).map(([name, p]) => (
                        <span key={name} className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${PRODUCT_TONE[name] || "bg-gray-400"}`} />
                          {name} {naira(p.total)}
                        </span>
                      ))}
                    </div>
                  )}

                  {row.references?.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-[11px] font-semibold text-gray-500 mb-1">References</p>
                      {row.references.map((r, i) => (
                        <p key={i} className="text-[11px] text-gray-400">
                          {r.type} · <span className="font-mono">{r.reference}</span> · {naira(r.amount)}
                          {r.who && ` · ${r.who}`}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
