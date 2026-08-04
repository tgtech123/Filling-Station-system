"use client";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AlertTriangle, Loader2, Link2, RefreshCw } from "lucide-react";

const API =
  process.env.NEXT_PUBLIC_API || "https://fueldesk-station-server.onrender.com";

/**
 * Customers who paid but never finished registering.
 *
 * Their money is captured and their plan is not active. Until this existed the
 * only way such a customer surfaced was by complaining — there was no list, so
 * nobody could know how many there were.
 *
 * Most of these now resolve themselves: registering with the email the payment
 * was made from claims it automatically. This panel is for the rest — usually
 * someone who paid with one address and registered with another.
 */
export default function UnclaimedPayments() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [stationIdFor, setStationIdFor] = useState({});

  const token = () => {
    try { return localStorage.getItem("token") || ""; } catch { return ""; }
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/payments/unclaimed`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to load");
      setRows(json.data || []);
    } catch (e) {
      toast.error(e.message || "Could not load unclaimed payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const apply = async (row) => {
    const stationId = (stationIdFor[row._id] || "").trim();
    if (!stationId) return toast.error("Enter the station ID to apply this payment to");

    setApplyingId(row._id);
    try {
      const res = await fetch(`${API}/api/admin/payments/${row._id}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ stationId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to apply");
      toast.success(json.message || "Payment applied");
      load();
    } catch (e) {
      toast.error(e.message || "Could not apply the payment");
    } finally {
      setApplyingId(null);
    }
  };

  const naira = (n) => `₦${Number(n || 0).toLocaleString()}`;
  const when = (d) => (d ? new Date(d).toLocaleDateString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
  }) : "—");

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-neutral-200 dark:border-gray-700 mb-6 overflow-hidden">
      <div className="flex items-start justify-between gap-3 p-5 border-b border-neutral-200 dark:border-gray-700">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <AlertTriangle size={18} className="text-amber-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold dark:text-gray-100">Unclaimed Payments</h2>
            <p className="text-sm text-neutral-500 mt-0.5">
              Paid, but no station was ever created. Most resolve when the customer
              registers using the same email — these are the ones that did not.
            </p>
          </div>
        </div>
        <button
          onClick={load}
          className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="p-8 flex justify-center">
          <Loader2 size={20} className="animate-spin text-gray-400" />
        </div>
      ) : rows.length === 0 ? (
        <p className="p-6 text-sm text-neutral-500">
          Nothing unclaimed. Every successful payment has a station.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[840px]">
            <thead>
              <tr className="text-left text-xs text-neutral-500 border-b border-neutral-200 dark:border-gray-700">
                <th className="px-5 py-3 font-medium">Paid</th>
                <th className="px-3 py-3 font-medium">Customer</th>
                <th className="px-3 py-3 font-medium">Plan</th>
                <th className="px-3 py-3 font-medium text-right">Amount</th>
                <th className="px-3 py-3 font-medium">Reference</th>
                <th className="px-3 py-3 font-medium">Apply to station</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id} className="border-b border-neutral-100 dark:border-gray-700/60">
                  <td className="px-5 py-3 whitespace-nowrap text-xs">{when(r.paidAt)}</td>
                  <td className="px-3 py-3">
                    <div className="font-medium dark:text-gray-100">{r.name || "—"}</div>
                    <div className="text-xs text-neutral-500">
                      {r.email || (
                        <span className="text-amber-600">
                          no email on record — predates email binding
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {r.planName}
                    <span className="text-xs text-neutral-400"> / {r.billingCycle}</span>
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-xs whitespace-nowrap">
                    {naira(r.amount)}
                  </td>
                  <td className="px-3 py-3 font-mono text-[11px] text-neutral-500 break-all">
                    {r.transactionRef}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        value={stationIdFor[r._id] || ""}
                        onChange={(e) =>
                          setStationIdFor((p) => ({ ...p, [r._id]: e.target.value }))
                        }
                        placeholder="Station ID"
                        className="w-40 px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-gray-600 dark:bg-gray-700 outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => apply(r)}
                        disabled={applyingId === r._id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
                      >
                        {applyingId === r._id
                          ? <Loader2 size={13} className="animate-spin" />
                          : <Link2 size={13} />}
                        Apply
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
