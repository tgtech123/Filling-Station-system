"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Flame, CheckCircle2, Clock, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API || "https://fueldesk-station-server.onrender.com";

const STATUS_STEPS = [
  { key: "submitted",         label: "Order Submitted",        desc: "Your order is waiting for the cashier"        },
  { key: "viewed",            label: "Cashier Reviewing",      desc: "The cashier has seen your order"               },
  { key: "payment_confirmed", label: "Payment Confirmed",      desc: "Cashier has verified your payment"             },
  { key: "receipt_issued",    label: "Receipt Issued",         desc: "Take receipt to the attendant"                 },
  { key: "dispensed",         label: "Gas Dispensed ✓",        desc: "Gas has been dispensed. Enjoy!"                },
];

function fmt(n) {
  return Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function OrderStatusPage() {
  const { stationCode, orderNumber } = useParams();
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/gas-public/order/${orderNumber}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Order not found");
      setOrder(data.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrder(); }, [orderNumber]);

  // Auto-refresh every 30s if not dispensed/cancelled
  useEffect(() => {
    if (!order || order.status === "dispensed" || order.status === "cancelled") return;
    const interval = setInterval(fetchOrder, 30000);
    return () => clearInterval(interval);
  }, [order]);

  const currentIdx = STATUS_STEPS.findIndex(s => s.key === order?.status);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-lg">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-gray-700 font-semibold">{error}</p>
        <Link href={`/gas-order/${stationCode}`} className="mt-4 block text-sm text-orange-500 hover:underline">
          Place a new order
        </Link>
      </div>
    </div>
  );

  const isCancelled = order.status === "cancelled";
  const isDispensed = order.status === "dispensed";

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <div className="bg-white border-b border-orange-100 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg flex items-center justify-center">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-800 text-sm">Order Tracker</h1>
            <p className="text-xs text-orange-500 font-semibold">{orderNumber}</p>
          </div>
          <button onClick={fetchOrder} className="ml-auto p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* Order Summary */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs text-gray-400">Customer</p>
              <p className="font-bold text-gray-800">{order.customerName}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
              isDispensed ? "bg-green-100 text-green-700" :
              isCancelled ? "bg-red-100 text-red-600" :
              "bg-orange-100 text-orange-600"
            }`}>
              {isDispensed ? "✓ Complete" : isCancelled ? "Cancelled" : "In Progress"}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-0.5">Volume</p>
              <p className="font-bold text-gray-800 text-sm">{order.quantityKg?.toFixed(2)} kg</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-0.5">Amount</p>
              <p className="font-bold text-gray-800 text-sm">₦{fmt(order.amountToPay)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-0.5">Payment</p>
              <p className="font-bold text-gray-800 text-sm capitalize">{order.paymentMethod}</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        {!isCancelled && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-700 text-sm mb-4">Order Progress</h2>
            <div className="space-y-3">
              {STATUS_STEPS.map((step, idx) => {
                const done    = idx < currentIdx + 1;
                const current = idx === currentIdx;
                return (
                  <div key={step.key} className="flex gap-3 items-start">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      done    ? "bg-green-500"  :
                      current ? "bg-orange-500" : "bg-gray-200"
                    }`}>
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      ) : current ? (
                        <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${done || current ? "text-gray-800" : "text-gray-400"}`}>
                        {step.label}
                      </p>
                      {(done || current) && (
                        <p className="text-xs text-gray-500">{step.desc}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="bg-red-50 rounded-2xl p-5 border border-red-100 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
            <p className="font-bold text-red-700">Order Cancelled</p>
            <p className="text-xs text-red-500 mt-1">Please contact the cashier for assistance.</p>
          </div>
        )}

        {isDispensed && (
          <div className="bg-green-50 rounded-2xl p-5 border border-green-100 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="font-bold text-green-700 text-lg">Gas Dispensed!</p>
            <p className="text-xs text-green-600 mt-1">Thank you for your purchase. See you next time!</p>
          </div>
        )}

        <p className="text-center text-xs text-gray-400">
          Auto-refreshes every 30 seconds · <button onClick={fetchOrder} className="text-orange-500 hover:underline">Refresh now</button>
        </p>

        <Link
          href={`/gas-order/${stationCode}`}
          className="block w-full text-center bg-white border-2 border-orange-200 text-orange-600 font-semibold py-3 rounded-2xl hover:bg-orange-50 transition-colors text-sm"
        >
          Place Another Order
        </Link>
      </div>
    </div>
  );
}
