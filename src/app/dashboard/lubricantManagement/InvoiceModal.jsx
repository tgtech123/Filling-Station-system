import { Download, X } from "lucide-react";
import Image from "next/image";
import React from "react";

export default function InvoiceModal({ open = true, onClose, invoice = null }) {
  if (!open) return null;

  // Fallback if no invoice passed
  const inv = invoice || {
    invoiceNo: "#0000",
    purchaseDate: "00-00-0000",
    createdBy: "N/A",
    supplier: "N/A",
    paymentMethod: "N/A",
    items: [],
    totalAmount: 0,
  };

  const rows = inv.items || [];

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
        body { 
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; 
          padding: 24px; 
          margin: 0;
        }
        table { 
          border-collapse: collapse; 
          width: 100%; 
          margin: 20px 0;
        }
        th, td { 
          padding: 12px 10px; 
          text-align: left; 
          border-bottom: 1px solid #eee; 
        }
        th {
          background-color: #f9fafb;
          font-weight: 600;
          color: #4b5563;
        }
        .total-box { 
          background: #d9edff; 
          padding: 18px; 
          border-radius: 8px; 
          margin-top: 20px;
        }
        .invoice-header {
          text-align: center;
          margin-bottom: 30px;
        }
        .invoice-details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .logo-placeholder {
          width: 100px;
          height: 100px;
          background: #dbeafe;
          border-radius: 50%;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: #2563eb;
        }
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
        <div className="flex justify-end mb-4">
          <button 
            onClick={onClose} 
            aria-label="Close" 
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        <div id="invoice-print-area">
          {/* Header with Logo */}
          <div className="flex items-center justify-center flex-col mb-6">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-2xl font-bold text-blue-600">LOGO</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800">Filling Station</h1>
          </div>

          {/* Invoice Number and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start mb-6">
            <div>
              <p className="text-sm text-gray-500">Invoice No.</p>
              <h3 className="text-2xl text-gray-800 font-bold mt-1">{inv.invoiceNo}</h3>
            </div>
            <div className="md:text-right">
              <p className="text-sm text-gray-500">Purchase Date</p>
              <p className="text-lg font-semibold text-gray-800 mt-1">{inv.purchaseDate}</p>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Cashier</p>
                <p className="font-medium text-sm mt-1">{inv.createdBy || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Supplier</p>
                <p className="font-medium text-sm mt-1">{inv.supplier}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Payment Method</p>
                <p className="font-medium text-sm mt-1">{inv.paymentMethod}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Items Count</p>
                <p className="font-medium text-sm mt-1">{rows.length} item(s)</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-xs text-left px-4 py-3 text-gray-600 font-semibold uppercase tracking-wide">
                    Barcode
                  </th>
                  <th className="text-xs text-left px-4 py-3 text-gray-600 font-semibold uppercase tracking-wide">
                    Product Name
                  </th>
                  <th className="text-xs text-right px-4 py-3 text-gray-600 font-semibold uppercase tracking-wide">
                    Qty
                  </th>
                  <th className="text-xs text-right px-4 py-3 text-gray-600 font-semibold uppercase tracking-wide">
                    Unit Cost
                  </th>
                  <th className="text-xs text-right px-4 py-3 text-gray-600 font-semibold uppercase tracking-wide">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 text-sm text-gray-600">{item.barcode}</td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-800">{item.productName}</td>
                    <td className="px-4 py-4 text-sm text-right text-gray-600">{item.quantity}</td>
                    <td className="px-4 py-4 text-sm text-right text-gray-600">
                      ₦{formatNgn(item.unitCost)}
                    </td>
                    <td className="px-4 py-4 text-sm text-right font-semibold text-gray-800">
                      ₦{formatNgn(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Amount */}
          <div className="bg-blue-50 rounded-lg p-5 border-2 border-blue-100">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-blue-900 uppercase tracking-wide">Total Amount</p>
              <div className="text-3xl font-bold text-blue-700">
                ₦{formatNgn(inv.totalAmount)}
              </div>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <div className="mt-6">
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Download size={20} />
            Download Invoice
          </button>
        </div>
      </div>
    </div>
  );
}