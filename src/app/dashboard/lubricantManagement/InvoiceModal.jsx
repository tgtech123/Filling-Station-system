import { Download, X } from "lucide-react";
import React, { useMemo } from "react";

export default function InvoiceModal({ open = true, onClose, invoice = null }) {
  if (!open) return null;

  // Read station info from localStorage user object
  const stationInfo = useMemo(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      const s = u.station || u.fillingStation || u;
      return {
        name:    s.name    || s.stationName    || "Filling Station",
        address: s.address || s.stationAddress || "",
        city:    s.city    || s.stationCity    || "",
        phone:   s.phone   || s.stationPhone   || "",
      };
    } catch {
      return { name: "Filling Station", address: "", city: "", phone: "" };
    }
  }, []);

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
  /**
   * Who entered this invoice.
   *
   * The field said "Cashier", which is wrong twice over: the person is
   * usually a manager or supervisor, and what matters is not their job title
   * but that they are the one who can be asked about this invoice. So: their
   * name, and their role beside it.
   */
  const enteredBy = (() => {
    const by = inv.createdBy;
    if (!by) return { name: "Unknown", role: "" };
    if (typeof by === "string") return { name: by, role: "" };
    const name = [by.firstName, by.lastName].filter(Boolean).join(" ").trim();
    return { name: name || "Unknown", role: by.role || "" };
  })();

  /**
   * When it was entered, to the minute.
   *
   * purchaseDate is the SUPPLIER's invoice date and carries no time, so the
   * time has to come from when the record was written. The two are different
   * facts, and an invoice entered days late shows both honestly.
   */
  const enteredAt = (() => {
    const raw = inv.createdAt;
    if (!raw) return "";
    const d = new Date(raw);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  })();

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
          border: 1px solid #999; 
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
          {/* Header with station info */}
          <div className="flex items-center justify-center flex-col mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-xl font-bold text-blue-600 uppercase">
                {stationInfo.name.slice(0, 2)}
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-800 text-center">{stationInfo.name}</h1>
            {stationInfo.address && (
              <p className="text-sm text-gray-500 text-center mt-1">{stationInfo.address}{stationInfo.city ? `, ${stationInfo.city}` : ""}</p>
            )}
            {stationInfo.phone && (
              <p className="text-xs text-gray-400 mt-0.5">{stationInfo.phone}</p>
            )}
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
              {enteredAt && (
                <p className="text-xs text-gray-500 mt-0.5">Entered {enteredAt}</p>
              )}
            </div>
          </div>

          {/* Invoice Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Entered By</p>
                <p className="font-medium text-sm mt-1">
                  {enteredBy.name}
                  {enteredBy.role && (
                    <span className="text-gray-500 font-normal capitalize"> &middot; {enteredBy.role}</span>
                  )}
                </p>
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
            <table className="w-full border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-xs text-left px-4 py-3 text-gray-700 font-semibold uppercase tracking-wide border border-gray-300">
                    Barcode
                  </th>
                  <th className="text-xs text-left px-4 py-3 text-gray-700 font-semibold uppercase tracking-wide border border-gray-300">
                    Product Name
                  </th>
                  <th className="text-xs text-right px-4 py-3 text-gray-700 font-semibold uppercase tracking-wide border border-gray-300">
                    Qty
                  </th>
                  <th className="text-xs text-right px-4 py-3 text-gray-700 font-semibold uppercase tracking-wide border border-gray-300">
                    Unit Cost
                  </th>
                  <th className="text-xs text-right px-4 py-3 text-gray-700 font-semibold uppercase tracking-wide border border-gray-300">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 text-sm text-gray-600 border border-gray-300">{item.barcode}</td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-800 border border-gray-300">{item.productName}</td>
                    <td className="px-4 py-4 text-sm text-right text-gray-600 border border-gray-300">{item.quantity}</td>
                    <td className="px-4 py-4 text-sm text-right text-gray-600 border border-gray-300">
                      ₦{formatNgn(item.unitCost)}
                    </td>
                    <td className="px-4 py-4 text-sm text-right font-semibold text-gray-800 border border-gray-300">
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