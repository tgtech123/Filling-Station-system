"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { X, Loader2, Calculator, Send, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import useStockReconciliationStore from "@/store/useStockReconciliationStore";

const fmtL = (n) => `${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} L`;
const fmtN = (n) => `₦${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export default function NewReconciliationModal({ tanks = [], defaultFactor, onClose, onCreated }) {
  const { previewReconciliation, createReconciliation, saving } = useStockReconciliationStore();

  const [tankId, setTankId] = useState("");
  const [dip, setDip] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [openingStock, setOpeningStock] = useState("");
  const [cycleStart, setCycleStart] = useState("");
  const [pricePerLtr, setPricePerLtr] = useState("");
  const [notes, setNotes] = useState("");

  const [preview, setPreview] = useState(null);
  const [previewing, setPreviewing] = useState(false);

  const selectedTank = tanks.find((t) => t._id === tankId);
  const effectiveFactor = selectedTank?.effectiveFactor ?? defaultFactor ?? null;
  const factorMissing = tankId && effectiveFactor == null;

  function buildPayload() {
    const payload = { tankId, actualClosingStock: Number(dip) };
    if (openingStock !== "") payload.openingStock = Number(openingStock);
    if (cycleStart !== "") payload.cycleStart = cycleStart;
    if (pricePerLtr !== "") payload.pricePerLtr = Number(pricePerLtr);
    return payload;
  }

  function validate() {
    if (!tankId) {
      toast.error("Select a tank.");
      return false;
    }
    if (dip === "" || isNaN(Number(dip)) || Number(dip) < 0) {
      toast.error("Enter the closing dip (a non-negative number).");
      return false;
    }
    return true;
  }

  async function handlePreview() {
    if (!validate()) return;
    setPreviewing(true);
    setPreview(null);
    try {
      const data = await previewReconciliation(buildPayload());
      setPreview(data);
    } catch (e) {
      toast.error(e?.response?.data?.error || "Could not compute preview.");
    } finally {
      setPreviewing(false);
    }
  }

  async function handleSubmit() {
    if (!validate()) return;
    try {
      await createReconciliation({ ...buildPayload(), notes: notes || undefined });
      toast.success("Recorded. Awaiting manager approval to update tank stock.");
      onCreated?.();
      onClose();
    } catch (e) {
      toast.error(e?.response?.data?.error || "Could not submit reconciliation.");
    }
  }

  const resultColor =
    preview?.result === "Shortage"
      ? "text-red-600"
      : preview?.result === "Excess"
      ? "text-emerald-600"
      : "text-gray-700 dark:text-gray-200";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-gray-700 shrink-0">
          <h3 className="text-base font-semibold dark:text-gray-100">New Stock Reconciliation</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          {/* Tank */}
          <label className="text-sm font-semibold text-gray-800 dark:text-gray-100">Tank</label>
          <select
            value={tankId}
            onChange={(e) => {
              setTankId(e.target.value);
              setPreview(null);
            }}
            className="w-full mt-1 mb-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2 rounded-lg text-sm"
          >
            <option value="">Select a tank…</option>
            {tanks.map((t) => (
              <option key={t._id} value={t._id}>
                {t.title} ({t.fuelType}){t.effectiveFactor != null ? ` — factor ${t.effectiveFactor}` : " — no factor set"}
              </option>
            ))}
          </select>

          {factorMissing && (
            <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2.5 mb-3">
              <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                No yield factor is set for this tank. Set it in System Settings → Fuel Yield Factor before reconciling.
              </p>
            </div>
          )}

          {/* Closing dip */}
          <label className="text-sm font-semibold text-gray-800 dark:text-gray-100">Closing dip (physical litres)</label>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            value={dip}
            onChange={(e) => {
              setDip(e.target.value);
              setPreview(null);
            }}
            placeholder="What the dip-stick / gauge reads now"
            className="w-full mt-1 mb-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2 rounded-lg text-sm"
          />

          {/* Advanced */}
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="flex items-center gap-1 text-xs font-semibold text-[#1a71f6] mb-2"
          >
            {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            Advanced (opening stock, cycle start, price)
          </button>
          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="text-xs text-neutral-500">Opening stock (L)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={openingStock}
                  onChange={(e) => { setOpeningStock(e.target.value); setPreview(null); }}
                  placeholder="auto"
                  className="w-full mt-1 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-1.5 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-500">Cycle start</label>
                <input
                  type="date"
                  value={cycleStart}
                  onChange={(e) => { setCycleStart(e.target.value); setPreview(null); }}
                  className="w-full mt-1 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-1.5 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-500">Price ₦/L</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={pricePerLtr}
                  onChange={(e) => { setPricePerLtr(e.target.value); setPreview(null); }}
                  placeholder="auto"
                  className="w-full mt-1 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-1.5 rounded-lg text-sm"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <label className="text-sm font-semibold text-gray-800 dark:text-gray-100">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full mt-1 mb-4 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2 rounded-lg text-sm resize-none"
          />

          {/* Preview panel */}
          {preview && (
            <div className="rounded-xl border border-neutral-200 dark:border-gray-700 overflow-hidden mb-4">
              <div className="bg-gray-50 dark:bg-gray-700/40 px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-neutral-500">Preview</span>
                <span className={`text-sm font-bold ${resultColor}`}>{preview.result}</span>
              </div>
              <div className="divide-y divide-neutral-100 dark:divide-gray-700 text-sm">
                <Row label="Opening stock" value={fmtL(preview.openingStock)} />
                <Row label="Deliveries (cycle)" value={fmtL(preview.deliveredLitres)} />
                <Row label="Metered sales (cycle)" value={fmtL(preview.meteredSales)} />
                <Row label={`Expected used (× ${preview.factorUsed})`} value={fmtL(preview.expectedConsumption)} />
                <Row label="Expected closing" value={fmtL(preview.expectedClosingStock)} />
                <Row label="Actual dip" value={fmtL(preview.actualClosingStock)} strong />
                <Row
                  label="Variance"
                  value={`${preview.variance >= 0 ? "+" : ""}${fmtL(preview.variance)} (${preview.variancePercent}%)`}
                  valueClass={resultColor}
                  strong
                />
                <Row label="Variance value" value={`${preview.varianceValueNaira >= 0 ? "+" : ""}${fmtN(preview.varianceValueNaira)}`} valueClass={resultColor} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-gray-700 flex gap-2 shrink-0">
          <button
            onClick={handlePreview}
            disabled={previewing || factorMissing}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-neutral-200 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {previewing ? <Loader2 size={15} className="animate-spin" /> : <Calculator size={15} />}
            Preview
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || factorMissing}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1a71f6] text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            Submit for Approval
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, strong, valueClass }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-neutral-500 dark:text-gray-400">{label}</span>
      <span className={`${strong ? "font-bold" : "font-medium"} ${valueClass || "text-gray-800 dark:text-gray-100"}`}>{value}</span>
    </div>
  );
}
