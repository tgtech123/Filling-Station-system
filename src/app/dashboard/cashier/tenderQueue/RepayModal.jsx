"use client";
import { useState } from "react";
import useShiftTenderStore from "@/store/useShiftTenderStore";
import { X, Banknote, CreditCard, Landmark, Scissors } from "lucide-react";

/**
 * Taking money back against a shortage.
 *
 * The action that was missing. A shortage is settled by the attendant handing
 * cash to whoever is on the till, so the cashier records it here. Typing a
 * bigger figure into the shift's count box does something else entirely: it
 * restates what that shift took and leaves the debt exactly where it was.
 *
 * Part payments are normal, so the amount defaults to the full balance but can
 * be reduced, and each payment is kept separately with the name of whoever
 * took it.
 */

const naira = (n) => `₦${Number(n || 0).toLocaleString()}`;

const METHODS = [
  { key: "cash",      label: "Cash",      icon: Banknote,   hint: "notes handed over" },
  { key: "transfer",  label: "Transfer",  icon: Landmark,   hint: "into the station account" },
  { key: "POS",       label: "POS",       icon: CreditCard, hint: "on the terminal" },
  { key: "deduction", label: "From pay",  icon: Scissors,   hint: "to come off their salary" },
];

export default function RepayModal({ row, onClose, onDone }) {
  const { repay } = useShiftTenderStore();

  const owed = Math.max(
    0,
    Math.round(((Number(row.shortfall) || 0) - (Number(row.repaidTotal) || 0)) * 100) / 100
  );

  const [amount, setAmount] = useState(String(owed));
  const [method, setMethod] = useState("cash");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const entered = Number(amount) || 0;
  const remaining = Math.round((owed - entered) * 100) / 100;
  const tooMuch = entered - owed > 0.5;

  const name =
    [row.attendant?.firstName, row.attendant?.lastName].filter(Boolean).join(" ") || "Attendant";

  const submit = async () => {
    setBusy(true);
    setError(null);
    const res = await repay(row._id, { amount: entered, method, note: note.trim() || undefined });
    setBusy(false);
    if (res.success) onDone(res.message);
    else setError(res.error);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">

        <div className="flex items-start justify-between gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="min-w-0">
            <h2 className="font-bold text-gray-900 dark:text-white">Record repayment</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {name} · {row.shift?.pumpTitle || "Pump"} · {row.product || row.shift?.product || "Fuel"}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0">
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="bg-red-50 dark:bg-gray-900 rounded-xl p-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">Was short by</span>
              <span className="font-bold tabular-nums">{naira(row.shortfall)}</span>
            </div>
            {row.repaidTotal > 0 && (
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600 dark:text-gray-300">Already paid back</span>
                <span className="font-bold tabular-nums text-green-700">{naira(row.repaidTotal)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm mt-1 pt-1 border-t border-red-200">
              <span className="font-semibold text-red-800 dark:text-red-400">Still owing</span>
              <span className="font-extrabold tabular-nums text-red-800 dark:text-red-400">
                {naira(owed)}
              </span>
            </div>
          </div>

          <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 block mb-1">
            How much were you handed?
          </label>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">₦</span>
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError(null); }}
              className="flex-1 min-w-0 text-right text-lg font-bold tabular-nums border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-3 py-2.5 outline-none focus:border-[#0080ff]"
            />
          </div>

          {/* Part payments are the normal case, so what is left is shown as the
              amount is typed rather than discovered after saving. */}
          {entered > 0 && !tooMuch && (
            <p className={`text-xs mt-1.5 font-semibold ${remaining > 0.5 ? "text-amber-700" : "text-green-700"}`}>
              {remaining > 0.5
                ? `${naira(remaining)} will still be owing after this.`
                : "This settles the shortage in full."}
            </p>
          )}
          {tooMuch && (
            <p className="text-xs mt-1.5 font-semibold text-red-700">
              Only {naira(owed)} is owed. Extra money is not a smaller debt, so take{" "}
              {naira(owed)} here and handle the rest separately.
            </p>
          )}

          <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 block mt-4 mb-1.5">
            How did it come back?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {METHODS.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.key}
                  onClick={() => setMethod(m.key)}
                  className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-left transition-colors ${
                    method === m.key
                      ? "border-[#0080ff] bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-600"
                  }`}
                >
                  <Icon size={16} className="text-gray-500 shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {m.label}
                    </span>
                    <span className="block text-[10px] text-gray-400 truncate">{m.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note (optional)"
            className="mt-3 w-full min-w-0 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-3 py-2 text-sm"
          />

          {error && (
            <p className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
              {error}
            </p>
          )}

          <div className="flex gap-2 mt-4">
            <button
              onClick={submit}
              disabled={busy || entered <= 0 || tooMuch}
              className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors"
            >
              {busy ? "Saving…" : `Record ${naira(entered)}`}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-semibold"
            >
              Cancel
            </button>
          </div>

          <p className="text-[11px] text-gray-400 mt-3">
            This records money coming back. It does not change what the shift was
            counted at.
          </p>
        </div>
      </div>
    </div>
  );
}
