"use client";
import { useEffect, useState } from "react";
import {
  FileText, Download, Printer, RefreshCw,
  BadgeCheck, TruckIcon, X, Package,
} from "lucide-react";
import useProcurementStore from "@/store/useProcurementStore";
import toast from "react-hot-toast";

// ─── status config ───────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  draft:     { label: "Draft",     cls: "bg-gray-100 text-gray-600"     },
  submitted: { label: "Submitted", cls: "bg-blue-100 text-blue-700"     },
  ordered:   { label: "Ordered",   cls: "bg-purple-100 text-purple-700" },
  received:  { label: "Received",  cls: "bg-green-100 text-green-700"   },
};

function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${c.cls}`}>
      {c.label}
    </span>
  );
}

// ─── CSV export (pure JS, no package) ───────────────────────────────────────
function exportCSV(order) {
  const rows = [
    ["PROCUREMENT ORDER"],
    ["Order #", order.procurementNumber],
    ["Date", new Date(order.createdAt).toLocaleDateString("en-NG")],
    ["Station", order.stationName],
    ["Address", order.stationAddress],
    ["Vendor", order.vendorName],
    ["Vendor Phone", order.vendorPhone],
    ["Procured By", order.procuredByName],
    ["Status", order.status],
    [],
    ["#", "Product Name", "Brand", "Type", "Current Stock", "Reorder Level", "Qty to Buy", "Unit Cost (₦)", "Total (₦)"],
    ...(order.items || []).map((item, i) => [
      i + 1,
      item.productName,
      item.brand || "",
      item.productType || "",
      item.currentStock,
      item.reOrderLevel,
      item.quantityToProcure,
      item.unitCost,
      item.quantityToProcure * item.unitCost,
    ]),
    [],
    ["", "", "", "", "", "", "", "Grand Total",
      (order.items || []).reduce((s, i) => s + i.quantityToProcure * i.unitCost, 0)],
    ...(order.notes ? [[], ["Notes", order.notes]] : []),
  ];

  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${order.procurementNumber}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Printable document (rendered in a new window) ──────────────────────────
function buildPrintHTML(order) {
  const total = (order.items || []).reduce((s, i) => s + i.quantityToProcure * i.unitCost, 0);
  const date = new Date(order.createdAt).toLocaleDateString("en-NG", {
    day: "numeric", month: "long", year: "numeric",
  });

  const rows = (order.items || [])
    .map(
      (item, i) => `
      <tr style="background:${i % 2 === 0 ? "#fff" : "#f8f9fb"}">
        <td style="padding:8px 10px;border-bottom:1px solid #f0f0f0">${i + 1}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;font-weight:600">${item.productName}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;color:#555">${item.brand || "—"}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;color:#555">${item.productType || "—"}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #f0f0f0">${item.currentStock}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #f0f0f0">${item.reOrderLevel}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;font-weight:700;color:#0080ff">${item.quantityToProcure}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #f0f0f0">₦${(item.unitCost || 0).toLocaleString()}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;font-weight:600">₦${(item.quantityToProcure * item.unitCost).toLocaleString()}</td>
      </tr>`
    )
    .join("");

  const logoHTML = order.stationLogo
    ? `<img src="${order.stationLogo}" alt="logo" style="width:60px;height:60px;object-fit:contain;border-radius:8px;border:1px solid #eee"/>`
    : "";

  const notesHTML = order.notes
    ? `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin-bottom:24px">
        <div style="font-size:10px;font-weight:700;color:#b45309;text-transform:uppercase;margin-bottom:4px">Notes</div>
        <div style="font-size:13px;color:#555">${order.notes}</div>
       </div>`
    : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>${order.procurementNumber}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif;color:#111;padding:0}
    @page{margin:15mm}
    @media print{body{padding:0;background:#fff!important}*{color:#000000!important;opacity:1!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}}
  </style>
</head>
<body>
<div style="max-width:760px;margin:0 auto;padding:28px 20px">

  <!-- Header -->
  <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:20px;padding-bottom:16px;border-bottom:2px solid #0080ff;gap:12px;flex-wrap:wrap">
    <div style="display:flex;align-items:center;gap:14px">
      ${logoHTML}
      <div>
        <div style="font-size:18px;font-weight:800">${order.stationName || ""}</div>
        <div style="font-size:12px;color:#666;margin-top:2px">${order.stationAddress || ""}${order.stationCity ? ", " + order.stationCity : ""}</div>
      </div>
    </div>
    <div style="text-align:right">
      <div style="font-size:18px;font-weight:800;color:#0080ff;letter-spacing:1px">PROCUREMENT ORDER</div>
      <div style="font-size:13px;font-weight:700;margin-top:4px">${order.procurementNumber}</div>
      <div style="font-size:12px;color:#888;margin-top:2px">${date}</div>
    </div>
  </div>

  <!-- Info grid -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px">
    ${[
      ["Vendor / Supplier", order.vendorName || "—"],
      ["Vendor Phone", order.vendorPhone || "—"],
      ["Procured By", order.procuredByName || "—"],
      ["Status", (order.status || "").toUpperCase()],
      ...(order.submittedAt ? [["Submitted", new Date(order.submittedAt).toLocaleString("en-NG")]] : []),
      ...(order.receivedAt  ? [["Received",  new Date(order.receivedAt).toLocaleString("en-NG")]]  : []),
    ].map(([label, value]) => `
      <div style="background:#f8f9fb;border-radius:8px;padding:10px 12px">
        <div style="font-size:9px;color:#888;text-transform:uppercase;font-weight:700;margin-bottom:3px">${label}</div>
        <div style="font-size:13px;font-weight:600;color:#222">${value}</div>
      </div>`).join("")}
  </div>

  <!-- Items table -->
  <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:12px">
    <thead>
      <tr style="background:#0080ff;color:white">
        ${["#","Product Name","Brand","Type","In Stock","Threshold","Qty to Buy","Unit Cost","Total"]
          .map((h) => `<th style="padding:9px 10px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;white-space:nowrap">${h}</th>`)
          .join("")}
      </tr>
    </thead>
    <tbody>${rows}</tbody>
    <tfoot>
      <tr style="background:#e8f0fe">
        <td colspan="8" style="padding:10px;text-align:right;font-weight:700;font-size:13px">Estimated Grand Total</td>
        <td style="padding:10px;font-weight:800;font-size:14px;color:#0080ff">₦${total.toLocaleString()}</td>
      </tr>
    </tfoot>
  </table>

  ${notesHTML}

  <!-- Signature row -->
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-top:36px;padding-top:16px;border-top:1px solid #eee">
    ${["Procured By", "Approved By", "Received By"].map((label, i) => `
      <div style="text-align:center">
        <div style="border-bottom:1px solid #999;margin-bottom:5px;padding-bottom:26px"></div>
        <div style="font-size:10px;color:#888;font-weight:700;text-transform:uppercase">${label}</div>
        ${i === 0 ? `<div style="font-size:11px;color:#333;margin-top:2px">${order.procuredByName || ""}</div>` : ""}
      </div>`).join("")}
  </div>

  <div style="margin-top:20px;text-align:center;font-size:10px;color:#bbb">
    Generated by FuelDesk — ${new Date().toLocaleString("en-NG")}
  </div>
</div>
</body>
</html>`;
}

function handlePrint(order) {
  const win = window.open("", "_blank");
  if (!win) { toast.error("Allow pop-ups to print"); return; }
  win.document.write(buildPrintHTML(order));
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 600);
}

// ─── Print preview modal ─────────────────────────────────────────────────────
function PrintModal({ order, onClose }) {
  return (
    /* Bottom sheet on mobile, centered dialog on sm+ */
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 w-full sm:rounded-2xl sm:max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl rounded-t-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle — mobile only */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        {/* Toolbar */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 px-4 sm:px-6 py-3 sm:py-4 z-10 shrink-0 rounded-t-2xl sm:rounded-t-2xl">
          <div className="flex items-center justify-between gap-2">
            <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base truncate">
              {order.procurementNumber}
            </p>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl shrink-0">
              <X size={18} className="text-gray-400" />
            </button>
          </div>

          {/* Action buttons — stacked on xs, inline on sm */}
          <div className="flex flex-col xs:flex-row gap-2 mt-3">
            <button
              onClick={() => exportCSV(order)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold flex-1 xs:flex-none transition-colors"
            >
              <Download size={14} /> Export CSV
            </button>
            <button
              onClick={() => handlePrint(order)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold flex-1 transition-colors"
            >
              <Printer size={14} /> Print / Save PDF
            </button>
          </div>
        </div>

        {/* Document summary preview (not the full print doc — just a readable summary) */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">

          {/* Station + order meta */}
          <div className="flex items-start gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
            {order.stationLogo ? (
              <img src={order.stationLogo} alt="logo" className="w-12 h-12 rounded-xl object-contain border border-gray-100 shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Package size={20} className="text-blue-500" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-bold text-gray-900 dark:text-white truncate">{order.stationName}</p>
              <p className="text-xs text-gray-500 truncate">{order.stationAddress}</p>
              <div className="flex flex-wrap gap-2 mt-1.5">
                <StatusBadge status={order.status} />
                <span className="text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              ["Vendor", order.vendorName || "—"],
              ["Phone", order.vendorPhone || "—"],
              ["Procured By", order.procuredByName],
              ["Order #", order.procurementNumber],
            ].map(([label, value]) => (
              <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">{value}</p>
              </div>
            ))}
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Items ({order.items?.length})</p>
            <div className="space-y-2">
              {(order.items || []).map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{item.productName}</p>
                    <p className="text-xs text-gray-400">{item.brand} · Stock: {item.currentStock} / {item.reOrderLevel}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-blue-600 text-sm">× {item.quantityToProcure}</p>
                    <p className="text-xs text-gray-500">₦{(item.quantityToProcure * item.unitCost).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 rounded-xl px-4 py-3">
            <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Estimated Grand Total</p>
            <p className="font-bold text-blue-700 text-lg">
              ₦{(order.items || []).reduce((s, i) => s + i.quantityToProcure * i.unitCost, 0).toLocaleString()}
            </p>
          </div>

          {order.notes && (
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-xl p-4">
              <p className="text-xs font-semibold text-amber-600 uppercase mb-1">Notes</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Procurement card ────────────────────────────────────────────────────────
function ProcurementCard({ order, onView, onMarkOrdered, onMarkReceived }) {
  const totalEst = (order.items || []).reduce((s, i) => s + i.quantityToProcure * i.unitCost, 0);
  const [actioning, setActioning] = useState(false);

  const action = async (fn, label) => {
    setActioning(true);
    const result = await fn(order._id);
    setActioning(false);
    if (result.success) toast.success(`Marked as ${label}`);
    else toast.error(result.error || "Action failed");
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {/* Card header */}
      <div className="px-4 sm:px-5 py-4 flex items-start justify-between gap-3 border-b border-gray-50 dark:border-gray-800">
        <div className="min-w-0">
          <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{order.procurementNumber}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {new Date(order.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
            {order.submittedAt && (
              <span className="text-gray-400">
                {" · "}submitted {new Date(order.submittedAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
              </span>
            )}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Card body */}
      <div className="px-4 sm:px-5 py-4 space-y-2 text-xs flex-1">
        {[
          ["Vendor",      order.vendorName || "—"],
          ["Phone",       order.vendorPhone || "—"],
          ["Items",       `${order.items?.length ?? 0} product${order.items?.length !== 1 ? "s" : ""}`],
          ["Procured by", order.procuredByName],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-2">
            <span className="text-gray-400">{label}</span>
            <span className="text-gray-700 dark:text-gray-300 font-medium text-right truncate max-w-[60%]">{value}</span>
          </div>
        ))}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-50 dark:border-gray-800">
          <span className="text-gray-400">Est. Total</span>
          <span className="font-bold text-blue-600 text-sm">₦{totalEst.toLocaleString()}</span>
        </div>
      </div>

      {/* Primary actions */}
      <div className="px-4 sm:px-5 pb-4 flex gap-2">
        <button
          onClick={() => onView(order)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-semibold hover:bg-blue-100 active:scale-[0.98] transition-all"
        >
          <FileText size={13} /> View &amp; Print
        </button>
        <button
          onClick={() => exportCSV(order)}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl text-xs font-semibold hover:bg-green-100 active:scale-[0.98] transition-all min-w-[52px]"
        >
          <Download size={13} />
          <span className="hidden sm:inline">CSV</span>
        </button>
      </div>

      {/* Status progression actions */}
      <div className="px-4 sm:px-5 pb-4 space-y-2">
        {order.status === "submitted" && (
          <button
            disabled={actioning}
            onClick={() => action(onMarkOrdered, "ordered")}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold disabled:opacity-60 active:scale-[0.98] transition-all"
          >
            <TruckIcon size={13} /> Mark as Ordered
          </button>
        )}
        {["submitted", "ordered"].includes(order.status) && (
          <button
            disabled={actioning}
            onClick={() => action(onMarkReceived, "received — stock updated")}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold disabled:opacity-60 active:scale-[0.98] transition-all"
          >
            <BadgeCheck size={13} />
            <span>Mark Received <span className="hidden sm:inline">— updates stock</span></span>
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ProcurementViewPage() {
  const { procurements, loading, fetchProcurements, markOrdered, markReceived } = useProcurementStore();
  const [statusFilter, setStatusFilter] = useState("all");
  const [printOrder, setPrintOrder]     = useState(null);

  useEffect(() => { fetchProcurements(); }, []);

  const filtered = statusFilter === "all"
    ? procurements
    : procurements.filter((p) => p.status === statusFilter);

  const counts = procurements.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});

  const filters = [
    { key: "all",       label: "All",       cls: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
    { key: "submitted", label: "Submitted", cls: "bg-blue-100 text-blue-700"     },
    { key: "ordered",   label: "Ordered",   cls: "bg-purple-100 text-purple-700" },
    { key: "received",  label: "Received",  cls: "bg-green-100 text-green-700"   },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 sm:py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Procurement Orders</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">View, print, and export procurement orders</p>
          </div>
          <button
            onClick={fetchProcurements}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors py-2 px-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-5">

        {/* ── Status filter chips — horizontally scrollable on xs ── */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap scrollbar-hide">
          {filters.map(({ key, label, cls }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border-2 transition-colors whitespace-nowrap shrink-0 ${
                statusFilter === key
                  ? `border-blue-500 ${cls}`
                  : "border-transparent bg-white dark:bg-gray-900 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              {label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${cls}`}>
                {key === "all" ? procurements.length : counts[key] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* ── Grid ─────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex justify-center py-20 sm:py-24">
            <RefreshCw size={28} className="animate-spin text-blue-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-12 sm:p-20 text-center">
            <Package size={36} className="text-gray-300 mx-auto mb-4" />
            <p className="font-bold text-gray-500 dark:text-gray-400 text-sm">No procurement orders</p>
            <p className="text-xs text-gray-400 mt-1">
              {statusFilter !== "all"
                ? `No ${statusFilter} orders found`
                : "Orders appear here when the manager submits them"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filtered.map((order) => (
              <ProcurementCard
                key={order._id}
                order={order}
                onView={setPrintOrder}
                onMarkOrdered={markOrdered}
                onMarkReceived={markReceived}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Print / detail modal ──────────────────────────────── */}
      {printOrder && (
        <PrintModal order={printOrder} onClose={() => setPrintOrder(null)} />
      )}
    </div>
  );
}
