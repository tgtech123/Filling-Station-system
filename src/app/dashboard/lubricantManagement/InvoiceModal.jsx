import { Download } from "lucide-react";
import Image from "next/image";
import React from "react";

export default function InvoiceModal({ open = true, onClose, invoice = null }) {
  if (!open) return null;

  // fallback if no invoice passed
  const inv = invoice || {
    invoiceNo: "#0000",
    purchaseDate: "00-00-0000",
    cashier: "N/A",
    supplier: "N/A",
    paymentMethod: "N/A",
    items: [],
    totalAmount: 0,
  };

  const rows = inv.items || [];

  const rowAmount = (r) => r.amount || r.quantity * r.unitCost;

  const total = rows.reduce((s, r) => s + rowAmount(r), 0);

  const formatNgn = (n) => {
    if (typeof n !== "number") return n;
    return new Intl.NumberFormat("en-NG").format(n);
  };

  const handleDownload = () => {
    const content = document.getElementById("invoice-print-area");
    if (!content) return;

    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) return;

    const style = `
      <style>
        body { font-family: Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; padding: 24px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { padding: 12px 10px; text-align: left; border-bottom: 1px solid #eee; }
        .total-box { background: #ebf5ff; padding: 18px; border-radius: 8px; }
      </style>
    `;

    w.document.write(`<html><head><title>Invoice ${inv.invoiceNo}</title>${style}</head><body>`);
    w.document.write(content.innerHTML);
    w.document.write(`</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-[700px] scrollbar-hide rounded-2xl shadow-2xl border p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-end">
          <button onClick={onClose} aria-label="Close" className="p-1 rounded-full hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div id="invoice-print-area">
          {/* Header */}
          <div className="flex items-center justify-center flex-col mb-6">
            <Image src="/station-logo.png" height={100} width={100} alt="logo img" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start mb-6">
            <div>
              <p className="text-sm text-gray-500">Invoice receipt for</p>
              <h3 className="text-2xl text-gray-600 font-bold mt-1">{inv.invoiceNo}</h3>
            </div>
            <div className="md:col-span-2 flex justify-end flex-col text-right">
              <p className="text-sm text-gray-500">{inv.purchaseDate}</p>
            </div>
          </div>

          <div className="flex justify-between mb-6 items-center">
            <div>
              <p className="text-sm text-gray-500">Cashier</p>
              <p className="text-sm text-gray-500">Supplier</p>
              <p className="text-sm text-gray-500">Payment type</p>
            </div>
            <div className="flex flex-col items-end">
              <p className="font-medium text-sm">{inv.createdBy || "N/A"}</p>
              <p className="font-medium text-sm">{inv.supplier}</p>
              <p className="font-medium text-sm">{inv.paymentMethod}</p>
            </div>
          </div>

          {/* Table */}
          <div className="border border-gray-100 rounded-md overflow-hidden">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-xs text-left px-4 py-3 text-gray-600">Barcode</th>
                  <th className="text-xs text-left px-4 py-3 text-gray-600">Product name</th>
                  <th className="text-xs text-left px-4 py-3 text-gray-600">Amount</th>
                  <th className="text-xs text-left px-4 py-3 text-gray-600">Qty</th>
                  <th className="text-xs text-left px-4 py-3 text-gray-600">Unit Cost</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="hover:bg-white">
                    <td className="px-4 py-4 text-sm text-gray-600">{r.barcode}</td>
                    <td className="px-4 py-4 text-sm font-medium">{r.productName}</td>
                    <td className="px-4 py-4 text-sm">{formatNgn(rowAmount(r))}</td>
                    <td className="px-4 py-4 text-sm">{r.quantity}</td>
                    <td className="px-4 py-4 text-md">{formatNgn(r.unitCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="mt-6 bg-[#d9edff] rounded-[14px]">
            <div className="total-box rounded-lg p-4">
              <p className="text-sm text-blue-700">Total Amount</p>
              <div className="text-2xl font-semibold text-blue-700 mt-2">
                ₦{formatNgn(total)}
              </div>
            </div>
          </div>
        </div>

        {/* Download button */}
        <div className="mt-6">
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-blue-600 text-white font-medium hover:opacity-95"
          >
            Download Invoice
            <Download />
          </button>
        </div>
      </div>
    </div>
  );
}
