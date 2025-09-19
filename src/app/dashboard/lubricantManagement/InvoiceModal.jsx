import Image from "next/image";
import React from "react";
// import logo from "../../../../public/station-logo.png"


export default function InvoiceModal({ open = true, onClose, invoice = null }) {
  const sample = {
    invoiceNumber: "#2324534",
    date: "27-12-2025",
    cashier: "John Obi Danci",
    supplier: "AJ Sons Oil and Lubricant",
    paymentType: "Transfer",
    items: [
      { barcode: "13443", name: "Engine Oil (1L)", qty: 5, unitCost: 4000 },
      { barcode: "43435", name: "Engine Oil (1L)", qty: 5, unitCost: 4000 },
      { barcode: "32453", name: "Engine Oil (1L)", qty: 5, unitCost: 4000 },
      { barcode: "43553", name: "Engine Oil (1L)", qty: 5, unitCost: 4000 },
    ],
  };

  const inv = invoice || sample;

  const rows = inv.items || [];

  const rowAmount = (r) => r.qty * r.unitCost;
  const total = rows.reduce((s, r) => s + rowAmount(r), 0);

  const formatNgn = (n) => {
    if (typeof n !== "number") return n;
    return new Intl.NumberFormat("en-NG").format(n);
  };

  const handleDownload = () => {
    // Option A: just print the window (better if the modal occupies full page in print CSS)
    // We'll open a new window with the invoice markup and call print to keep it simple.
    const content = document.getElementById("invoice-print-area");
    if (!content) return;

    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) return;

    // basic styling for print copy
    const style = `
      <style>
        body { font-family: Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; padding: 24px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { padding: 12px 10px; text-align: left; border-bottom: 1px solid #eee; }
        .total-box { background: #ebf5ff; padding: 18px; border-radius: 8px; }
      </style>
    `;

    w.document.write(`<html><head><title>Invoice ${inv.invoiceNumber}</title>${style}</head><body>`);
    w.document.write(content.innerHTML);
    w.document.write(`</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 250);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-[700px] scrollbar-hide rounded-2xl shadow-2xl border p-6 max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true">
        <div className="flex justify-end">
          <button onClick={onClose} aria-label="Close" className="p-1 rounded-full hover:bg-gray-100">
            {/* simple X icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div id="invoice-print-area">
          {/* Header */}
          <div className="flex items-center justify-center flex-col mb-6">
            {/* <div className="text-center">
              <div className="font-extrabold text-2xl tracking-tight">FLOURISH</div>
              <div className="text-xl text-yellow-500 font-semibold flex items-center justify-center gap-2">
                Station
                <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 rounded-full w-6 h-6 text-xs">⛽</span>
              </div>
            </div> */}
            <Image src="/station-logo.png" height={100} width={100} alt="logo img" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start mb-6">
            <div>
              <p className="text-sm text-gray-500">Invoice receipt for</p>
              <h3 className="text-2xl text-gray-600 font-bold mt-1">{inv.invoiceNumber}</h3>
            </div>

            <div className="md:col-span-2 flex justify-end flex-col text-right">
              <p className="text-sm text-gray-500">{inv.date}</p>
            </div>

            <div className="col-span-1">
              <p className="text-sm text-gray-500">Cashier</p>
              <p className="font-medium">{inv.cashier}</p>
            </div>
            <div className="col-span-1">
              <p className="text-sm text-gray-500">Supplier</p>
              <p className="font-medium">{inv.supplier}</p>
            </div>
            <div className="col-span-1">
              <p className="text-sm text-gray-500">Payment type</p>
              <p className="font-medium">{inv.paymentType}</p>
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
                    <td className="px-4 py-4 text-sm font-medium">{r.name}</td>
                    <td className="px-4 py-4 text-sm">{formatNgn(rowAmount(r))}</td>
                    <td className="px-4 py-4 text-sm">{r.qty}</td>
                    <td className="px-4 py-4 text-sm">{formatNgn(r.unitCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="mt-6">
            <div className="total-box rounded-lg p-4">
              <p className="text-sm text-blue-700">Total Amount</p>
              <div className="text-2xl font-extrabold text-blue-700 mt-2">₦{formatNgn(total)}</div>
            </div>
          </div>
        </div>

        {/* Download button */}
        <div className="mt-6">
          <button onClick={handleDownload} className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-blue-600 text-white font-medium hover:opacity-95">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 11l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 21H3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Download Invoice
n          </button>
        </div>
      </div>
    </div>
  );
}
