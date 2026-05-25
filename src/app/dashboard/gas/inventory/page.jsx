"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import {
  Flame, Package, TrendingDown, TrendingUp, AlertTriangle, Loader2,
  Plus, Pencil, X, Check, Zap, Database, ChevronDown, ChevronUp, Gift,
  QrCode, Copy, Printer, ExternalLink, CheckCircle2, Settings,
  ClipboardList, Building2, Phone, AtSign, ShieldCheck, ClipboardCheck,
  Mail, Eye, RefreshCw, Calendar, User,
} from "lucide-react";
import useGasStore from "@/store/useGasStore";
import useGasProcurementStore from "@/store/useGasProcurementStore";

function fmt(n) {
  return Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function pct(current, capacity) {
  if (!capacity || capacity <= 0) return 0;
  return Math.min(100, Math.round((current / capacity) * 100));
}

function TankGauge({ tank, onEdit }) {
  const level   = pct(tank.currentStockKg, tank.capacityKg);
  const isLow   = level < 20;
  const isCrit  = level < 10;
  const isEmpty = tank.currentStockKg <= 0;

  const barColor  = isCrit ? "bg-red-500" : isLow ? "bg-amber-500" : "bg-emerald-500";
  const ringColor = isCrit ? "ring-red-200"   : isLow ? "ring-amber-200"  : "ring-emerald-100";
  const badge     = isCrit ? { label: "Critical", cls: "bg-red-100 text-red-700 border-red-200" }
                  : isLow  ? { label: "Low",      cls: "bg-amber-100 text-amber-700 border-amber-200" }
                  : isEmpty? { label: "Empty",     cls: "bg-gray-100 text-gray-500 border-gray-200" }
                  :          { label: "OK",        cls: "bg-emerald-100 text-emerald-700 border-emerald-200" };

  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border ring-2 ${ringColor} ${!tank.isActive ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-800 truncate">{tank.name}</h3>
            {!tank.isActive && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">Inactive</span>
            )}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.cls}`}>{badge.label}</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Capacity: {tank.capacityKg.toLocaleString()} kg</p>
        </div>
        {onEdit && (
          <button onClick={() => onEdit(tank)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors ml-2 shrink-0">
            <Pencil size={14} />
          </button>
        )}
      </div>

      {/* Gauge bar */}
      <div className="h-5 bg-gray-100 rounded-full overflow-hidden relative mb-3">
        <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${level}%` }} />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-600">{level}%</span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center">
          <p className="text-[10px] text-gray-400 mb-0.5">Current</p>
          <p className="font-bold text-gray-800 text-sm">{tank.currentStockKg.toFixed(1)} kg</p>
        </div>
        <div className="text-center border-x border-gray-100">
          <p className="text-[10px] text-gray-400 mb-0.5">Procured</p>
          <p className="font-bold text-blue-600 text-sm">{(tank.totalProcuredKg || 0).toFixed(1)} kg</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-400 mb-0.5">Sold</p>
          <p className="font-bold text-orange-500 text-sm">{(tank.totalSoldKg || 0).toFixed(1)} kg</p>
        </div>
      </div>

      {(isLow || isCrit) && (
        <div className={`mt-3 flex gap-2 items-start p-2.5 rounded-xl border ${badge.cls}`}>
          <AlertTriangle size={13} className="shrink-0 mt-0.5" />
          <p className="text-[11px] font-medium">
            {isCrit ? `CRITICAL: "${tank.name}" is nearly empty. Place a procurement order now.`
                    : `Low stock in "${tank.name}". Consider ordering soon.`}
          </p>
        </div>
      )}
    </div>
  );
}

function PumpCard({ pump, onEdit }) {
  const tank = pump.tank;
  const level = tank ? pct(tank.currentStockKg, tank.capacityKg) : 0;
  const barColor = level < 10 ? "bg-red-400" : level < 20 ? "bg-amber-400" : "bg-emerald-400";

  return (
    <div className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 ${!pump.isActive ? "opacity-50" : ""}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm">{pump.name}</p>
            <p className="text-[10px] text-gray-400">
              {!pump.isActive ? "Inactive" : "Active"}
            </p>
          </div>
        </div>
        {onEdit && (
          <button onClick={() => onEdit(pump)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
            <Pencil size={13} />
          </button>
        )}
      </div>

      {tank ? (
        <div className="bg-gray-50 rounded-xl p-2.5 mt-2">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[11px] font-semibold text-gray-600">{tank.name}</p>
            <span className="text-[11px] font-bold text-gray-500">{level}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${level}%` }} />
          </div>
          <p className="text-[10px] text-gray-400 mt-1">{tank.currentStockKg?.toFixed(1)} / {tank.capacityKg?.toLocaleString()} kg</p>
        </div>
      ) : (
        <p className="text-xs text-gray-400 mt-2">No tank linked</p>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"><X size={16} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

const PROC_STATUS = {
  ordered:           { label: "Order Placed",       bg: "bg-blue-100",   text: "text-blue-700",   dot: "bg-blue-500"   },
  awaiting_delivery: { label: "Awaiting Delivery",  bg: "bg-amber-100",  text: "text-amber-700",  dot: "bg-amber-500"  },
  delivered:         { label: "Delivered",          bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500" },
  validated:         { label: "Validated ✓",        bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-500"  },
  cancelled:         { label: "Cancelled",          bg: "bg-gray-100",   text: "text-gray-500",   dot: "bg-gray-400"   },
};

function ProcStatusBadge({ status }) {
  const s = PROC_STATUS[status] || PROC_STATUS.ordered;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function ProcurementDetailModal({ order, onClose }) {
  const fmtN = (n) => Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtD = (d) => d ? new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—";
  const fmtDT = (d) => d ? new Date(d).toLocaleString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
  const name = (p) => p ? `${p.firstName || ""} ${p.lastName || ""}`.trim() : "—";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <ClipboardList size={16} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">{order.orderNumber}</p>
              <p className="text-orange-100 text-xs">{fmtD(order.date)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ProcStatusBadge status={order.status} />
            <button onClick={onClose} className="w-7 h-7 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors">
              <X size={14} className="text-white" />
            </button>
          </div>
        </div>

        {/* Body — scrollable */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">

          {/* Supplier */}
          <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wide mb-2.5">Supplier</p>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                <Building2 size={15} className="text-orange-600" />
              </div>
              <p className="font-bold text-gray-800">{order.supplierName}</p>
            </div>
            <div className="space-y-1.5 pl-1">
              {order.supplierPhone && (
                <p className="flex items-center gap-2 text-xs text-gray-600">
                  <Phone size={12} className="text-gray-400" /> {order.supplierPhone}
                </p>
              )}
              {order.supplierEmail && (
                <p className="flex items-center gap-2 text-xs text-gray-600">
                  <AtSign size={12} className="text-gray-400" /> {order.supplierEmail}
                </p>
              )}
            </div>
          </div>

          {/* Order figures */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3.5">
              <p className="text-[10px] text-blue-500 font-bold uppercase mb-1">Qty Ordered</p>
              <p className="text-xl font-bold text-gray-800">{(order.orderedQuantityKg || 0).toLocaleString()} <span className="text-sm font-normal text-gray-400">kg</span></p>
            </div>
            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-3.5">
              <p className="text-[10px] text-purple-500 font-bold uppercase mb-1">Qty Delivered</p>
              <p className="text-xl font-bold text-gray-800">
                {order.deliveredQuantityKg != null
                  ? <>{order.deliveredQuantityKg.toLocaleString()} <span className="text-sm font-normal text-gray-400">kg</span></>
                  : <span className="text-sm text-gray-400">Pending</span>}
              </p>
              {order.deliveredQuantityKg != null && order.deliveredQuantityKg !== order.orderedQuantityKg && (
                <p className={`text-[10px] font-bold mt-1 ${order.deliveredQuantityKg < order.orderedQuantityKg ? "text-red-500" : "text-emerald-600"}`}>
                  {order.deliveredQuantityKg < order.orderedQuantityKg
                    ? `⚠ ${(order.orderedQuantityKg - order.deliveredQuantityKg).toLocaleString()} kg short`
                    : `+${(order.deliveredQuantityKg - order.orderedQuantityKg).toLocaleString()} kg extra`}
                </p>
              )}
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5">
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Price / kg</p>
              <p className="text-lg font-bold text-gray-700">₦{fmtN(order.pricePerKg)}</p>
            </div>
            <div className={`rounded-2xl p-3.5 border ${
              order.deliveredQuantityKg != null && order.deliveredQuantityKg !== order.orderedQuantityKg
                ? "bg-amber-50 border-amber-200"
                : "bg-orange-50 border-orange-200"
            }`}>
              <p className="text-[10px] text-orange-500 font-bold uppercase mb-1">Actual Cost</p>
              <p className="text-lg font-bold text-orange-600">₦{fmtN(order.totalCost)}</p>
              {order.orderedCost && order.orderedCost !== order.totalCost && (
                <p className="text-[10px] text-gray-400 mt-0.5 line-through">
                  Quoted: ₦{fmtN(order.orderedCost)}
                </p>
              )}
            </div>
          </div>

          {/* People & timeline */}
          <div className="bg-white border border-gray-100 rounded-2xl divide-y divide-gray-50">
            {[
              { icon: <User size={13} className="text-blue-400" />,       label: "Placed by",           value: name(order.recordedBy),       sub: fmtDT(order.createdAt) },
              { icon: <ShieldCheck size={13} className="text-amber-400" />, label: "Delivery confirmed by", value: name(order.confirmedBySuper), sub: order.superConfirmedAt ? fmtDT(order.superConfirmedAt) : null },
              { icon: <ClipboardCheck size={13} className="text-green-400" />, label: "Validated by",      value: name(order.validatedBy),       sub: order.validatedAt ? fmtDT(order.validatedAt) : null },
            ].map((row, i) => (
              (row.label !== "Delivery confirmed by" && row.label !== "Validated by") || row.value !== "—" ? (
                <div key={i} className="flex items-start gap-3 px-4 py-3">
                  <div className="w-6 h-6 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">{row.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">{row.label}</p>
                    <p className="text-sm font-semibold text-gray-700">{row.value}</p>
                    {row.sub && <p className="text-[10px] text-gray-400 mt-0.5">{row.sub}</p>}
                  </div>
                </div>
              ) : null
            ))}
          </div>

          {/* Tank & extras */}
          <div className="space-y-2">
            {order.targetTank && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3.5 py-2.5">
                <Database size={13} className="text-emerald-500 shrink-0" />
                <span className="text-xs font-semibold text-gray-700">Tank: {order.targetTank.name || order.targetTank}</span>
              </div>
            )}
            {order.invoiceNumber && (
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5">
                <ClipboardList size={13} className="text-gray-400 shrink-0" />
                <span className="text-xs text-gray-600">Invoice: <span className="font-semibold">{order.invoiceNumber}</span></span>
              </div>
            )}
            {order.emailSentAt && (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3.5 py-2.5">
                <Mail size={13} className="text-blue-500 shrink-0" />
                <span className="text-xs text-blue-700">Email sent to {order.emailSentTo} · {fmtDT(order.emailSentAt)}</span>
              </div>
            )}
            {order.notes && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-2.5">
                <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">Notes</p>
                <p className="text-xs text-gray-700">{order.notes}</p>
              </div>
            )}
            {order.superNotes && (
              <div className="bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5">
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Supervisor Notes</p>
                <p className="text-xs text-gray-700">{order.superNotes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 shrink-0">
          <button onClick={onClose} className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GasInventoryPage() {
  const {
    inventory, tanks, pumps, settings,
    pricing, loyaltyConfig, loading,
    fetchInventory, fetchGasSettings, updateGasSettings,
    fetchPricing, setPrice,
    fetchLoyaltyConfig, updateLoyaltyConfig,
    addTank, updateTank, addPump, updatePump,
  } = useGasStore();

  const { procurements, loading: procLoading, fetchProcurements } = useGasProcurementStore();

  const [userRole,     setUserRole]     = useState("attendant");
  const [activeTab,    setActiveTab]    = useState("tanks");
  const [viewOrder,    setViewOrder]    = useState(null);
  const [historyFilter, setHistoryFilter] = useState("");
  const [tankModal,    setTankModal]    = useState(null);   // null | "add" | tank object
  const [pumpModal,    setPumpModal]    = useState(null);
  const [tankForm,     setTankForm]     = useState({ name: "", capacityKg: "", notes: "", isActive: true });
  const [pumpForm,     setPumpForm]     = useState({ name: "", tankId: "", notes: "", isActive: true });
  const [saving,       setSaving]       = useState(false);
  const [formError,    setFormError]    = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  // Price editing
  const [priceEditing, setPriceEditing] = useState(false);
  const [priceInput,   setPriceInput]   = useState("");
  const [priceSaving,  setPriceSaving]  = useState(false);
  const [priceError,   setPriceError]   = useState(null);
  const [priceOK,      setPriceOK]      = useState(false);
  // Loyalty config editing
  const [loyaltyForm,  setLoyaltyForm]  = useState({ pointsPerK: 10, minRedeem: 500, nairaPerPoint: 1 });
  const [loyaltySaving,setLoyaltySaving]= useState(false);
  const [loyaltyError, setLoyaltyError] = useState(null);
  const [loyaltyOK,    setLoyaltyOK]    = useState(false);
  // QR / Settings tab
  const [settingsForm,   setSettingsForm]   = useState({ gasStationCode: "", gasQREnabled: true, gasBankName: "", gasBankAccount: "", gasBankAccountName: "" });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsError,  setSettingsError]  = useState(null);
  const [settingsOK,     setSettingsOK]     = useState(false);
  const [copied,         setCopied]         = useState(false);
  const [appOrigin,      setAppOrigin]      = useState("");

  useEffect(() => {
    try { setUserRole(JSON.parse(localStorage.getItem("user") || "{}").role || "attendant"); } catch {}
    setAppOrigin(window.location.origin);
    fetchInventory();
    fetchPricing();
    fetchLoyaltyConfig();
    fetchGasSettings();
    fetchProcurements();
  }, []);

  // Sync settings form when data loads
  useEffect(() => {
    if (settings) {
      setSettingsForm({
        gasStationCode:      settings.gasStationCode      || "",
        gasQREnabled:        settings.gasQREnabled        ?? true,
        gasBankName:         settings.gasBankName         || "",
        gasBankAccount:      settings.gasBankAccount      || "",
        gasBankAccountName:  settings.gasBankAccountName  || "",
      });
    }
  }, [settings]);

  // Sync form when config loads
  useEffect(() => {
    if (loyaltyConfig) {
      setLoyaltyForm({
        pointsPerK:    loyaltyConfig.pointsPerK    ?? 10,
        minRedeem:     loyaltyConfig.minRedeem     ?? 500,
        nairaPerPoint: loyaltyConfig.nairaPerPoint ?? 1,
      });
    }
  }, [loyaltyConfig]);

  const isManager = ["manager", "admin"].includes(userRole);

  const inv          = inventory || {};
  const activeTanks  = tanks.filter(t => t.isActive);
  const displayTanks = showInactive ? tanks : activeTanks;
  const displayPumps = showInactive ? pumps : pumps.filter(p => p.isActive);
  const allCritical  = activeTanks.filter(t => t.currentStockKg < t.capacityKg * 0.1).length;

  // ─── Loyalty save ─────────────────────────────────────────────────────────

  const saveLoyaltyConfig = async () => {
    setLoyaltyError(null);
    const pK  = Number(loyaltyForm.pointsPerK);
    const mr  = Number(loyaltyForm.minRedeem);
    const npp = Number(loyaltyForm.nairaPerPoint);
    if (isNaN(pK)  || pK  < 1)    return setLoyaltyError("Points per ₦1,000 must be at least 1");
    if (isNaN(mr)  || mr  < 1)    return setLoyaltyError("Minimum redeem points must be at least 1");
    if (isNaN(npp) || npp < 0.01) return setLoyaltyError("₦ value per point must be at least 0.01");
    setLoyaltySaving(true);
    const result = await updateLoyaltyConfig({ pointsPerK: pK, minRedeem: mr, nairaPerPoint: npp });
    setLoyaltySaving(false);
    if (result.success) {
      setLoyaltyOK(true);
      setTimeout(() => setLoyaltyOK(false), 3000);
    } else {
      setLoyaltyError(result.error);
    }
  };

  // ─── Settings (QR) save ────────────────────────────────────────────────────

  const orderUrl = settingsForm.gasStationCode
    ? `${appOrigin}/gas-order/${settingsForm.gasStationCode.toUpperCase()}`
    : "";

  const qrImageUrl = orderUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(orderUrl)}&bgcolor=ffffff&color=ea580c&margin=12&format=png`
    : "";

  const copyLink = () => {
    if (!orderUrl) return;
    navigator.clipboard.writeText(orderUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const printQR = () => {
    const w = window.open("", "_blank");
    w.document.write(`
      <html><head><title>Gas Self-Order QR — ${settingsForm.gasStationCode}</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 40px; }
        h2 { color: #ea580c; margin-bottom: 6px; }
        p  { color: #666; font-size: 14px; margin: 4px 0; }
        img { margin: 20px auto; display: block; }
        .url { font-size: 12px; color: #888; word-break: break-all; margin-top: 12px; }
      </style></head>
      <body>
        <h2>🔥 Scan to Order Gas</h2>
        <p>${settings?.name || "Gas Station"}</p>
        <img src="${qrImageUrl}" width="240" height="240" />
        <p class="url">${orderUrl}</p>
        <p style="margin-top:20px;font-size:11px;color:#aaa;">Powered by FuelDesk</p>
      </body></html>`);
    w.document.close();
    w.print();
  };

  const saveSettings = async () => {
    setSettingsError(null);
    if (!settingsForm.gasStationCode.trim()) return setSettingsError("Station code is required to generate a QR code");
    setSettingsSaving(true);
    const result = await updateGasSettings({
      gasStationCode:     settingsForm.gasStationCode.trim().toUpperCase(),
      gasQREnabled:       settingsForm.gasQREnabled,
      gasBankName:        settingsForm.gasBankName,
      gasBankAccount:     settingsForm.gasBankAccount,
      gasBankAccountName: settingsForm.gasBankAccountName,
    });
    setSettingsSaving(false);
    if (result.success) {
      setSettingsOK(true);
      fetchGasSettings();
      setTimeout(() => setSettingsOK(false), 3000);
    } else {
      setSettingsError(result.error);
    }
  };

  // ─── Tank modal ────────────────────────────────────────────────────────────

  const openAddTank = () => {
    setTankForm({ name: "", capacityKg: "", notes: "", isActive: true });
    setFormError(null);
    setTankModal("add");
  };

  const openEditTank = (tank) => {
    setTankForm({ name: tank.name, capacityKg: tank.capacityKg, notes: tank.notes || "", isActive: tank.isActive });
    setFormError(null);
    setTankModal(tank);
  };

  const saveTank = async () => {
    setFormError(null);
    if (!tankForm.name.trim() || !tankForm.capacityKg || isNaN(Number(tankForm.capacityKg))) {
      return setFormError("Tank name and capacity (kg) are required");
    }
    setSaving(true);
    const payload = { name: tankForm.name.trim(), capacityKg: Number(tankForm.capacityKg), notes: tankForm.notes, isActive: tankForm.isActive };
    const result  = tankModal === "add"
      ? await addTank(payload)
      : await updateTank(tankModal._id, payload);
    setSaving(false);
    if (result.success) { setTankModal(null); fetchInventory(); }
    else setFormError(result.error);
  };

  // ─── Pump modal ────────────────────────────────────────────────────────────

  const openAddPump = () => {
    setPumpForm({ name: "", tankId: activeTanks[0]?._id || "", notes: "", isActive: true });
    setFormError(null);
    setPumpModal("add");
  };

  const openEditPump = (pump) => {
    setPumpForm({ name: pump.name, tankId: pump.tank?._id || pump.tank || "", notes: pump.notes || "", isActive: pump.isActive });
    setFormError(null);
    setPumpModal(pump);
  };

  const savePump = async () => {
    setFormError(null);
    if (!pumpForm.name.trim() || !pumpForm.tankId) {
      return setFormError("Pump name and tank selection are required");
    }
    setSaving(true);
    const payload = { name: pumpForm.name.trim(), tankId: pumpForm.tankId, notes: pumpForm.notes, isActive: pumpForm.isActive };
    const result  = pumpModal === "add"
      ? await addPump(payload)
      : await updatePump(pumpModal._id, payload);
    setSaving(false);
    if (result.success) { setPumpModal(null); fetchInventory(); }
    else setFormError(result.error);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Gas Inventory</h1>
              <p className="text-sm text-gray-500">Tanks, pumps and stock levels</p>
            </div>
          </div>
          <button onClick={fetchInventory} className="p-2 border border-gray-200 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50">
            <TrendingUp size={16} />
          </button>
        </div>

        {/* Alert strip */}
        {allCritical > 0 && (
          <div className="mb-5 bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 items-start">
            <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-700 text-sm">{allCritical} tank{allCritical > 1 ? "s" : ""} critically low!</p>
              <p className="text-xs text-red-600 mt-0.5">Immediate procurement required to avoid supply interruption.</p>
            </div>
          </div>
        )}

        {/* Overall Summary */}
        {loading.inventory ? (
          <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: "Total Stock",    value: `${(inv.totalStockKg    || 0).toFixed(1)} kg`, color: "text-orange-600", icon: <Package size={18} /> },
                { label: "Total Capacity", value: `${(inv.totalCapacityKg || 0).toLocaleString()} kg`, color: "text-gray-700",   icon: <Database size={18} /> },
                { label: "Total Procured", value: `${(inv.totalProcuredKg || 0).toFixed(1)} kg`, color: "text-blue-600",   icon: <TrendingUp size={18} /> },
                { label: "Total Sold",     value: `${(inv.totalSoldKg     || 0).toFixed(1)} kg`, color: "text-red-500",    icon: <TrendingDown size={18} /> },
              ].map(c => (
                <div key={c.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className={`mb-2 ${c.color}`}>{c.icon}</div>
                  <p className="text-xs text-gray-400">{c.label}</p>
                  <p className={`font-bold text-lg ${c.color}`}>{c.value}</p>
                </div>
              ))}
            </div>

            {/* Price card */}
            <div className="rounded-2xl mb-6 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-5 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs opacity-80 mb-1 uppercase tracking-wide font-semibold">Current Selling Price</p>
                    {inv.pricePerKg > 0 ? (
                      <>
                        <p className="text-3xl font-bold">₦{fmt(inv.pricePerKg)}<span className="text-base font-normal opacity-80 ml-1">/kg</span></p>
                        <p className="text-xs opacity-70 mt-1">
                          Stock value: {(inv.totalStockKg || 0).toFixed(1)} kg × ₦{fmt(inv.pricePerKg)} = ₦{fmt(inv.stockValue)}
                        </p>
                      </>
                    ) : (
                      <p className="text-lg font-semibold opacity-90">No price set yet</p>
                    )}
                  </div>
                  {isManager && !priceEditing && (
                    <button
                      onClick={() => { setPriceInput(inv.pricePerKg > 0 ? String(inv.pricePerKg) : ""); setPriceEditing(true); setPriceError(null); setPriceOK(false); }}
                      className="shrink-0 ml-3 bg-white/20 hover:bg-white/30 text-white rounded-xl px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Pencil size={12} /> {inv.pricePerKg > 0 ? "Edit Price" : "Set Price"}
                    </button>
                  )}
                </div>
              </div>

              {/* Inline price editor — manager only */}
              {isManager && priceEditing && (
                <div className="bg-white border border-orange-200 p-4">
                  <p className="text-xs font-bold text-gray-600 mb-3 uppercase tracking-wide">
                    {inv.pricePerKg > 0 ? "Update Selling Price" : "Set Selling Price"}
                  </p>
                  <div className="flex gap-3 items-end flex-wrap">
                    <div className="flex-1 min-w-[160px]">
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">New Price per kg (₦)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₦</span>
                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          value={priceInput}
                          onChange={e => { setPriceInput(e.target.value); setPriceError(null); setPriceOK(false); }}
                          placeholder="e.g. 850"
                          className="w-full border-2 border-orange-300 rounded-xl pl-7 pr-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-400"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pb-0.5">
                      <button
                        disabled={priceSaving}
                        onClick={async () => {
                          const val = parseFloat(priceInput);
                          if (!val || val <= 0) return setPriceError("Enter a valid price greater than 0");
                          setPriceSaving(true);
                          setPriceError(null);
                          const result = await setPrice(val);
                          setPriceSaving(false);
                          if (result.success) {
                            setPriceOK(true);
                            setPriceEditing(false);
                            fetchInventory();
                          } else {
                            setPriceError(result.error || "Failed to update price");
                          }
                        }}
                        className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold rounded-xl text-sm flex items-center gap-1.5 transition-colors"
                      >
                        {priceSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        Save
                      </button>
                      <button
                        onClick={() => { setPriceEditing(false); setPriceError(null); }}
                        className="px-4 py-2.5 border border-gray-200 rounded-xl text-gray-500 text-sm font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                  {priceError && (
                    <p className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">{priceError}</p>
                  )}
                </div>
              )}
              {priceOK && !priceEditing && (
                <div className="bg-green-50 border border-green-200 px-4 py-2 flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-green-500" />
                  <p className="text-xs text-green-700 font-medium">Price updated successfully</p>
                </div>
              )}
            </div>

            {/* Tabs: Tanks / Pumps / Loyalty / QR / History */}
            <div className="flex bg-gray-100 rounded-2xl p-1 mb-5 gap-1 overflow-x-auto">
              {[
                { id: "tanks",   label: `Tanks (${activeTanks.length})`,                icon: <Database size={13} /> },
                { id: "pumps",   label: `Pumps (${pumps.filter(p=>p.isActive).length})`, icon: <Zap size={13} />      },
                { id: "loyalty", label: "Loyalty",                                       icon: <Gift size={13} />     },
                { id: "qr",      label: "QR Code",                                       icon: <QrCode size={13} />   },
                { id: "history", label: "History",                                       icon: <ClipboardList size={13} /> },
              ].map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`flex-1 min-w-max py-2.5 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === t.id ? "bg-white shadow text-orange-600" : "text-gray-500"
                  }`}>
                  {t.icon}{t.label}
                </button>
              ))}
            </div>

            {/* Inactive toggle + add button — only for tanks/pumps tabs */}
            {activeTab !== "loyalty" && activeTab !== "qr" && activeTab !== "history" && (
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setShowInactive(v => !v)}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors">
                  {showInactive ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  {showInactive ? "Hide inactive" : "Show inactive"}
                </button>
                {isManager && (
                  <button
                    onClick={activeTab === "tanks" ? openAddTank : openAddPump}
                    className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-4 py-2 rounded-xl shadow-sm transition-colors">
                    <Plus size={15} />
                    {activeTab === "tanks" ? "Add Tank" : "Add Pump"}
                  </button>
                )}
              </div>
            )}

            {/* Tanks tab */}
            {activeTab === "tanks" && (
              <>
                {displayTanks.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
                    <Database className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium">No tanks set up yet</p>
                    {isManager && (
                      <p className="text-sm text-gray-400 mt-1">
                        Add your first gas storage tank to start tracking inventory.
                      </p>
                    )}
                    {isManager && (
                      <button onClick={openAddTank}
                        className="mt-4 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
                        <Plus size={15} /> Add First Tank
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {displayTanks.map(tank => (
                      <TankGauge key={tank._id} tank={tank} onEdit={isManager ? openEditTank : null} />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Pumps tab */}
            {activeTab === "pumps" && (
              <>
                {displayPumps.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
                    <Zap className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium">No pumps set up yet</p>
                    {isManager && activeTanks.length === 0 && (
                      <p className="text-sm text-amber-600 mt-1">Add a tank first, then add pumps connected to it.</p>
                    )}
                    {isManager && activeTanks.length > 0 && (
                      <button onClick={openAddPump}
                        className="mt-4 inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
                        <Plus size={15} /> Add First Pump
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {displayPumps.map(pump => (
                      <PumpCard key={pump._id} pump={pump} onEdit={isManager ? openEditPump : null} />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

            {/* ── History tab ─────────────────────────────────────────────── */}
            {activeTab === "history" && (() => {
              const filtered = historyFilter
                ? procurements.filter(p => p.status === historyFilter)
                : procurements;

              return (
                <div>
                  {/* Filter row */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {[
                      { id: "",                  label: "All"         },
                      { id: "ordered",           label: "Ordered"     },
                      { id: "awaiting_delivery", label: "Awaiting"    },
                      { id: "delivered",         label: "Delivered"   },
                      { id: "validated",         label: "Validated"   },
                      { id: "cancelled",         label: "Cancelled"   },
                    ].map(f => (
                      <button key={f.id} onClick={() => setHistoryFilter(f.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          historyFilter === f.id
                            ? "bg-orange-500 border-orange-500 text-white"
                            : "border-gray-200 text-gray-500 hover:border-orange-300"
                        }`}>
                        {f.label}
                      </button>
                    ))}
                    <button
                      onClick={() => fetchProcurements()}
                      className="ml-auto p-1.5 border border-gray-200 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>

                  {procLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
                      <ClipboardList className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                      <p className="text-gray-400 font-medium">No procurement records found</p>
                      <p className="text-sm text-gray-400 mt-1">Orders placed from the Procurement page will appear here.</p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop table */}
                      <div className="hidden sm:block bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
                              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Date</th>
                              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Order #</th>
                              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Supplier</th>
                              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Placed By</th>
                              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Validated By</th>
                              <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Total Cost</th>
                              <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
                              <th className="px-4 py-3" />
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {filtered.map(order => (
                              <tr key={order._id} className="hover:bg-orange-50/40 transition-colors group">
                                <td className="px-4 py-3.5">
                                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <Calendar size={11} className="text-gray-300" />
                                    {new Date(order.date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                                  </div>
                                </td>
                                <td className="px-4 py-3.5">
                                  <span className="font-mono text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                                    {order.orderNumber}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                                      <Building2 size={11} className="text-orange-500" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-semibold text-gray-800 text-xs truncate max-w-[130px]">{order.supplierName}</p>
                                      {order.supplierPhone && (
                                        <p className="text-[10px] text-gray-400 truncate max-w-[130px]">{order.supplierPhone}</p>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3.5">
                                  <div className="flex items-center gap-1.5">
                                    <User size={11} className="text-gray-300 shrink-0" />
                                    <span className="text-xs text-gray-600 truncate max-w-[100px]">
                                      {order.recordedBy
                                        ? `${order.recordedBy.firstName || ""} ${order.recordedBy.lastName || ""}`.trim()
                                        : "—"}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3.5">
                                  <div className="flex items-center gap-1.5">
                                    <ClipboardCheck size={11} className="text-gray-300 shrink-0" />
                                    <span className="text-xs text-gray-600 truncate max-w-[100px]">
                                      {order.validatedBy
                                        ? `${order.validatedBy.firstName || ""} ${order.validatedBy.lastName || ""}`.trim()
                                        : <span className="text-gray-300">—</span>}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3.5 text-right">
                                  <span className="font-bold text-gray-800 text-xs block">
                                    ₦{Number(order.totalCost || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                                  </span>
                                  {order.orderedCost && order.orderedCost !== order.totalCost && (
                                    <span className="text-[10px] text-gray-400 line-through block">
                                      ₦{Number(order.orderedCost).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3.5 text-center">
                                  <ProcStatusBadge status={order.status} />
                                </td>
                                <td className="px-4 py-3.5 text-center">
                                  <button
                                    onClick={() => setViewOrder(order)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg"
                                  >
                                    <Eye size={12} /> View
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile cards */}
                      <div className="sm:hidden space-y-3">
                        {filtered.map(order => (
                          <div key={order._id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <div>
                                <span className="font-mono text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                                  {order.orderNumber}
                                </span>
                                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                  <Calendar size={10} />
                                  {new Date(order.date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                                </p>
                              </div>
                              <ProcStatusBadge status={order.status} />
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                                <Building2 size={13} className="text-orange-500" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-gray-800 text-sm truncate">{order.supplierName}</p>
                                {order.supplierPhone && <p className="text-xs text-gray-400">{order.supplierPhone}</p>}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                              <div className="bg-gray-50 rounded-xl p-2.5">
                                <p className="text-[10px] text-gray-400 mb-0.5">Placed by</p>
                                <p className="font-semibold text-gray-700 truncate">
                                  {order.recordedBy ? `${order.recordedBy.firstName || ""} ${order.recordedBy.lastName || ""}`.trim() : "—"}
                                </p>
                              </div>
                              <div className="bg-gray-50 rounded-xl p-2.5">
                                <p className="text-[10px] text-gray-400 mb-0.5">Validated by</p>
                                <p className="font-semibold text-gray-700 truncate">
                                  {order.validatedBy ? `${order.validatedBy.firstName || ""} ${order.validatedBy.lastName || ""}`.trim() : "—"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-[10px] text-gray-400">Actual Cost</p>
                                <p className="font-bold text-orange-600">
                                  ₦{Number(order.totalCost || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                                </p>
                                {order.orderedCost && order.orderedCost !== order.totalCost && (
                                  <p className="text-[10px] text-gray-400 line-through">
                                    ₦{Number(order.orderedCost).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => setViewOrder(order)}
                                className="flex items-center gap-1.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-xl transition-colors"
                              >
                                <Eye size={13} /> View Details
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })()}

            {/* Loyalty tab */}
            {activeTab === "loyalty" && (
              <div className="space-y-5">

                {/* Read-only summary for non-managers */}
                {!isManager ? (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift size={18} className="text-purple-500" />
                      <h3 className="font-bold text-gray-700">Loyalty Programme Rules</h3>
                    </div>
                    {loading.loyalty ? (
                      <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 text-orange-400 animate-spin" /></div>
                    ) : loyaltyConfig ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                          {
                            label: "Points Earned",
                            value: `${loyaltyConfig.pointsPerK} pts`,
                            sub: "per ₦1,000 spent",
                            color: "text-blue-600",
                            bg: "bg-blue-50 border-blue-100",
                          },
                          {
                            label: "Minimum to Redeem",
                            value: `${loyaltyConfig.minRedeem.toLocaleString()} pts`,
                            sub: "balance needed to unlock",
                            color: "text-amber-600",
                            bg: "bg-amber-50 border-amber-100",
                          },
                          {
                            label: "Point Value",
                            value: `₦${loyaltyConfig.nairaPerPoint}`,
                            sub: "per point redeemed",
                            color: "text-purple-600",
                            bg: "bg-purple-50 border-purple-100",
                          },
                        ].map(c => (
                          <div key={c.label} className={`rounded-2xl p-4 border ${c.bg}`}>
                            <p className="text-xs text-gray-400 mb-1">{c.label}</p>
                            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">{c.sub}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">Could not load loyalty settings.</p>
                    )}
                  </div>
                ) : (
                  /* Manager editable form */
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Gift size={18} className="text-purple-500" />
                      <h3 className="font-bold text-gray-700">Loyalty Programme Configuration</h3>
                    </div>
                    <p className="text-xs text-gray-400 mb-5">
                      Configure how customers earn and redeem loyalty points at this station.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

                      {/* Points per ₦1000 */}
                      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center">
                            <TrendingUp size={14} className="text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-blue-700">Points Earned</p>
                            <p className="text-[10px] text-blue-500">per ₦1,000 purchase</p>
                          </div>
                        </div>
                        <input
                          type="number" min="1" step="1"
                          value={loyaltyForm.pointsPerK}
                          onChange={e => setLoyaltyForm(p => ({ ...p, pointsPerK: e.target.value }))}
                          className="w-full border border-blue-200 rounded-xl px-3 py-2.5 text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                        />
                        <p className="text-[10px] text-blue-400 mt-1.5 text-center">
                          e.g. ₦5,000 purchase = {Math.floor(5000 / 1000 * (Number(loyaltyForm.pointsPerK) || 10))} pts
                        </p>
                      </div>

                      {/* Minimum to redeem */}
                      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center">
                            <Gift size={14} className="text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-amber-700">Min. Redeem Points</p>
                            <p className="text-[10px] text-amber-500">balance to unlock redemption</p>
                          </div>
                        </div>
                        <input
                          type="number" min="1" step="100"
                          value={loyaltyForm.minRedeem}
                          onChange={e => setLoyaltyForm(p => ({ ...p, minRedeem: e.target.value }))}
                          className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                        />
                        <p className="text-[10px] text-amber-400 mt-1.5 text-center">
                          Customer needs ≥ {Number(loyaltyForm.minRedeem).toLocaleString() || "—"} pts to redeem
                        </p>
                      </div>

                      {/* ₦ value per point */}
                      <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-purple-500 rounded-xl flex items-center justify-center">
                            <Package size={14} className="text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-purple-700">₦ Value per Point</p>
                            <p className="text-[10px] text-purple-500">naira worth of each point</p>
                          </div>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-purple-400">₦</span>
                          <input
                            type="number" min="0.01" step="0.01"
                            value={loyaltyForm.nairaPerPoint}
                            onChange={e => setLoyaltyForm(p => ({ ...p, nairaPerPoint: e.target.value }))}
                            className="w-full border border-purple-200 rounded-xl pl-7 pr-3 py-2.5 text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                          />
                        </div>
                        <p className="text-[10px] text-purple-400 mt-1.5 text-center">
                          {Number(loyaltyForm.minRedeem).toLocaleString() || "—"} pts = ₦{(Number(loyaltyForm.minRedeem) * Number(loyaltyForm.nairaPerPoint)).toLocaleString("en-NG", { minimumFractionDigits: 2 }) || "—"} discount
                        </p>
                      </div>
                    </div>

                    {/* Summary preview */}
                    <div className="mt-5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl p-4 text-white">
                      <p className="text-xs font-bold opacity-80 mb-2 uppercase tracking-wide">Programme Preview</p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="opacity-70 text-xs">Customer spends ₦10,000 →</p>
                          <p className="font-bold">{Math.floor(10000 / 1000 * (Number(loyaltyForm.pointsPerK) || 10))} points earned</p>
                        </div>
                        <div>
                          <p className="opacity-70 text-xs">{Number(loyaltyForm.minRedeem).toLocaleString()} pts redeems →</p>
                          <p className="font-bold">₦{(Number(loyaltyForm.minRedeem) * Number(loyaltyForm.nairaPerPoint || 1)).toLocaleString("en-NG", { minimumFractionDigits: 2 })} discount</p>
                        </div>
                      </div>
                    </div>

                    {loyaltyError && (
                      <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2 items-start">
                        <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{loyaltyError}</p>
                      </div>
                    )}
                    {loyaltyOK && (
                      <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3 flex gap-2 items-center">
                        <Check size={14} className="text-green-500" />
                        <p className="text-sm text-green-700 font-medium">Loyalty settings saved successfully</p>
                      </div>
                    )}

                    <button
                      onClick={saveLoyaltyConfig}
                      disabled={loyaltySaving}
                      className="mt-4 w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                      {loyaltySaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                      Save Loyalty Configuration
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* QR Code tab */}
            {activeTab === "qr" && (
              <div className="space-y-5">

                {/* QR display card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-4">
                    <div className="flex items-center gap-2">
                      <QrCode size={18} className="text-white" />
                      <h3 className="font-bold text-white">Customer Self-Order QR Code</h3>
                    </div>
                    <p className="text-xs text-orange-100 mt-1">
                      Print this and display at your counter — customers scan to order gas without queuing
                    </p>
                  </div>

                  <div className="p-5">
                    {!settingsForm.gasStationCode ? (
                      <div className="flex flex-col items-center gap-3 py-8 text-center">
                        <QrCode size={48} className="text-gray-200" />
                        <p className="text-sm font-medium text-gray-500">No station code set yet</p>
                        <p className="text-xs text-gray-400">Set a station code below to generate your QR code</p>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        {/* QR image */}
                        <div className="shrink-0 bg-white border-4 border-orange-100 rounded-2xl p-2 shadow-sm">
                          <img
                            src={qrImageUrl}
                            alt="Self-order QR code"
                            width={200}
                            height={200}
                            className="rounded-xl"
                          />
                        </div>
                        {/* Info + actions */}
                        <div className="flex-1 min-w-0 text-center sm:text-left">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Self-Order URL</p>
                          <p className="text-sm font-mono text-gray-700 break-all bg-gray-50 rounded-xl px-3 py-2 border border-gray-100 mb-4">
                            {orderUrl}
                          </p>
                          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                            <button
                              onClick={copyLink}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                              {copied ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} />}
                              {copied ? "Copied!" : "Copy Link"}
                            </button>
                            <button
                              onClick={printQR}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors"
                            >
                              <Printer size={14} /> Print QR
                            </button>
                            <a
                              href={orderUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-orange-200 text-orange-600 text-sm font-semibold hover:bg-orange-50 transition-colors"
                            >
                              <ExternalLink size={14} /> Preview Page
                            </a>
                          </div>
                          <p className="text-xs text-gray-400 mt-3">
                            Customers open this link or scan the QR — no login needed
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Station code + settings form — manager only */}
                {isManager && (
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-100">
                    <div className="flex items-center gap-2 mb-4">
                      <Settings size={16} className="text-orange-500" />
                      <h3 className="font-bold text-gray-700">Gas Station Settings</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                          Station Code * <span className="text-gray-400 font-normal">(used in QR link)</span>
                        </label>
                        <input
                          type="text"
                          value={settingsForm.gasStationCode}
                          onChange={e => setSettingsForm(p => ({ ...p, gasStationCode: e.target.value.toUpperCase() }))}
                          placeholder="e.g. TOTAL01"
                          maxLength={12}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Short unique code for your station — no spaces</p>
                      </div>

                      <div className="flex items-center gap-3 self-end pb-1">
                        <label className="text-sm font-semibold text-gray-700">QR Self-Order Enabled</label>
                        <div
                          onClick={() => setSettingsForm(p => ({ ...p, gasQREnabled: !p.gasQREnabled }))}
                          className={`w-11 h-6 rounded-full flex items-center px-0.5 cursor-pointer transition-colors ${settingsForm.gasQREnabled ? "bg-orange-500" : "bg-gray-300"}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${settingsForm.gasQREnabled ? "translate-x-5" : "translate-x-0"}`} />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Bank Name</label>
                        <input
                          type="text"
                          value={settingsForm.gasBankName}
                          onChange={e => setSettingsForm(p => ({ ...p, gasBankName: e.target.value }))}
                          placeholder="e.g. First Bank"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Account Number</label>
                        <input
                          type="text"
                          value={settingsForm.gasBankAccount}
                          onChange={e => setSettingsForm(p => ({ ...p, gasBankAccount: e.target.value }))}
                          placeholder="e.g. 0123456789"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Account Name</label>
                        <input
                          type="text"
                          value={settingsForm.gasBankAccountName}
                          onChange={e => setSettingsForm(p => ({ ...p, gasBankAccountName: e.target.value }))}
                          placeholder="e.g. Total Gas Nigeria Ltd"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                      </div>
                    </div>

                    {settingsError && (
                      <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2 items-start">
                        <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{settingsError}</p>
                      </div>
                    )}
                    {settingsOK && (
                      <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3 flex gap-2 items-center">
                        <CheckCircle2 size={14} className="text-green-500" />
                        <p className="text-sm text-green-700 font-medium">Settings saved — QR code updated</p>
                      </div>
                    )}

                    <button
                      onClick={saveSettings}
                      disabled={settingsSaving}
                      className="mt-4 w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                      {settingsSaving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                      Save Settings & Update QR
                    </button>
                  </div>
                )}
              </div>
            )}

        {/* ─── Procurement Detail Modal ─── */}
        {viewOrder && (
          <ProcurementDetailModal order={viewOrder} onClose={() => setViewOrder(null)} />
        )}

        {/* ─── Add / Edit Tank Modal ─── */}
        {tankModal !== null && (
          <Modal title={tankModal === "add" ? "Add New Storage Tank" : `Edit: ${tankModal.name}`} onClose={() => setTankModal(null)}>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Tank Name *</label>
                <input
                  type="text"
                  value={tankForm.name}
                  onChange={e => setTankForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Tank A, Main Tank, Left Tank"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Total Capacity (kg) *</label>
                <input
                  type="number"
                  value={tankForm.capacityKg}
                  onChange={e => setTankForm(p => ({ ...p, capacityKg: e.target.value }))}
                  placeholder="e.g. 1000"
                  min="1"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Notes (optional)</label>
                <input
                  type="text"
                  value={tankForm.notes}
                  onChange={e => setTankForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Any notes about this tank..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              {tankModal !== "add" && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setTankForm(p => ({ ...p, isActive: !p.isActive }))}
                    className={`w-10 h-5.5 rounded-full flex items-center px-0.5 transition-colors ${tankForm.isActive ? "bg-emerald-500" : "bg-gray-300"}`}
                    style={{ height: "22px" }}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${tankForm.isActive ? "translate-x-5" : "translate-x-0"}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              )}
              {formError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{formError}</p>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={saveTank} disabled={saving}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm">
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                  {tankModal === "add" ? "Add Tank" : "Save Changes"}
                </button>
                <button onClick={() => setTankModal(null)}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm font-semibold hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ─── Add / Edit Pump Modal ─── */}
        {pumpModal !== null && (
          <Modal title={pumpModal === "add" ? "Add New Pump / Dispenser" : `Edit: ${pumpModal.name}`} onClose={() => setPumpModal(null)}>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Pump Name *</label>
                <input
                  type="text"
                  value={pumpForm.name}
                  onChange={e => setPumpForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Pump 1, Left Dispenser"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Connected Tank *</label>
                {activeTanks.length === 0 ? (
                  <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                    No active tanks available. Add a tank first.
                  </p>
                ) : (
                  <select
                    value={pumpForm.tankId}
                    onChange={e => setPumpForm(p => ({ ...p, tankId: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Select a tank…</option>
                    {activeTanks.map(t => (
                      <option key={t._id} value={t._id}>
                        {t.name} ({t.currentStockKg.toFixed(1)} / {t.capacityKg.toLocaleString()} kg)
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Notes (optional)</label>
                <input
                  type="text"
                  value={pumpForm.notes}
                  onChange={e => setPumpForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Any notes about this pump..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              {pumpModal !== "add" && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setPumpForm(p => ({ ...p, isActive: !p.isActive }))}
                    className={`w-10 rounded-full flex items-center px-0.5 transition-colors ${pumpForm.isActive ? "bg-blue-500" : "bg-gray-300"}`}
                    style={{ height: "22px" }}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${pumpForm.isActive ? "translate-x-5" : "translate-x-0"}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              )}
              {formError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{formError}</p>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={savePump} disabled={saving || activeTanks.length === 0}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm">
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                  {pumpModal === "add" ? "Add Pump" : "Save Changes"}
                </button>
                <button onClick={() => setPumpModal(null)}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm font-semibold hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}
