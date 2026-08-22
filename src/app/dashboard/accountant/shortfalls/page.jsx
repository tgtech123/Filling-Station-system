"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import useShiftTenderStore from "@/store/useShiftTenderStore";
import { useSocket } from "@/hooks/useSocket";
import { Loader2, TrendingDown, CheckCircle2, Undo2, Ban, User } from "lucide-react";

/**
 * Who owes the station money, and what became of each shortage.
 *
 * A single short shift is an incident. The same person short four times is a
 * pattern, and nobody sees a pattern by scrolling through shifts one at a time.
 * So the top of this page is per person, and the shifts underneath are the
 * evidence for each line.
 *
 * Reading it is open to anyone answerable for the money. Closing one belongs to
 * the ACCOUNTANT: recording that a debt was repaid, or writing it off, moves
 * money between accounts and lands in the books, so it sits with the person who
 * keeps them. A manager supervises the people involved, which is the reason to
 * keep them away from the entry that forgives what one of them owes.
 */

const naira = (n) => `₦${Number(n || 0).toLocaleString()}`;
const nameOf = (p) => [p?.firstName, p?.lastName].filter(Boolean).join(" ").trim() || "Former staff";

const when = (d) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleString("en-GB", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
    });
  } catch { return ""; }
};

const STATUSES = [
  { value: "outstanding", label: "Still owing" },
  { value: "paid", label: "Repaid" },
  { value: "waived", label: "Written off" },
  { value: "all", label: "Everything" },
];

export default function ShortfallsPage() {
  const { shortfalls, loading, fetchShortfalls, settleShortfall } = useShiftTenderStore();
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("outstanding");
  const [busyId, setBusyId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [waiving, setWaiving] = useState(null);
  const [waiveNote, setWaiveNote] = useState("");

  // Settling is the accountant's entry, so the buttons only exist for them.
  // The server enforces it regardless; this just avoids showing a dead control.
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      setRole(String(u?.role || "").toLowerCase().trim());
    } catch { /* no session, no buttons */ }
  }, []);
  const canSettle = ["accountant", "admin"].includes(role);

  const load = () => fetchShortfalls({ status });
  useEffect(() => { load(); }, [status]);
  useSocket({ "tender:confirmed": () => load() });

  const act = async (id, action, note) => {
    setBusyId(id);
    const res = await settleShortfall(id, action, note);
    setBusyId(null);
    setWaiving(null);
    setWaiveNote("");
    setFeedback({ ok: res.success, text: res.message || res.error });
    if (res.success) load();
  };

  const { rows, attendants, totals } = shortfalls;

  return (
    <DashboardLayout>
      <div className="pb-12">

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingDown size={20} className="text-red-600" /> Shortages
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              What was expected against the meter but never handed over
            </p>
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-3 py-2 text-sm"
          >
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {feedback && (
          <p className={`mb-4 text-sm rounded-xl p-3 border ${
            feedback.ok
              ? "text-green-700 bg-green-50 border-green-200"
              : "text-red-700 bg-red-50 border-red-200"
          }`}>
            {feedback.text}
          </p>
        )}

        {totals && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <div className="bg-red-50 dark:bg-gray-800 rounded-2xl p-4 border-2 border-red-200">
              <p className="text-xs font-bold uppercase tracking-wide text-red-600">Still owing</p>
              <p className="text-2xl font-extrabold tabular-nums text-red-700 dark:text-red-400 mt-1">
                {naira(totals.outstanding)}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-gray-800 rounded-2xl p-4 border-2 border-transparent dark:border-gray-700">
              <p className="text-xs font-bold uppercase tracking-wide text-green-600">Repaid</p>
              <p className="text-2xl font-extrabold tabular-nums text-gray-900 dark:text-white mt-1">
                {naira(totals.paid)}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border-2 border-transparent dark:border-gray-700">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Written off</p>
              <p className="text-2xl font-extrabold tabular-nums text-gray-900 dark:text-white mt-1">
                {naira(totals.waived)}
              </p>
            </div>
          </div>
        )}

        {/* Per person first. This is the question a manager actually asks. */}
        {attendants.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">By attendant</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {attendants.map((a) => (
                <div
                  key={a.attendantId}
                  className={`rounded-2xl p-4 border-2 ${
                    a.outstanding > 0
                      ? "bg-white dark:bg-gray-800 border-red-200"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <p className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <User size={14} className="text-gray-400 shrink-0" /> {a.name}
                  </p>
                  <p className="text-2xl font-extrabold tabular-nums mt-1 text-red-700 dark:text-red-400">
                    {naira(a.outstanding)}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    still owing across {a.shifts} short shift{a.shifts === 1 ? "" : "s"}
                    {a.paid > 0 && ` · ${naira(a.paid)} repaid`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && rows.length === 0 ? (
          <div className="flex items-center gap-2 text-gray-400 py-12 justify-center">
            <Loader2 size={18} className="animate-spin" /> Loading…
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle2 size={32} className="text-green-500 mx-auto mb-3" />
            <p className="text-gray-500">Nothing owing. Every shift handed over what the meter said.</p>
          </div>
        ) : (
          <>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Shift by shift</p>
            <div className="space-y-2">
              {rows.map((r) => (
                <div
                  key={r._id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white">{nameOf(r.attendant)}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {r.shift?.pumpTitle || "Pump"} · {r.product || r.shift?.product || "Fuel"} ·{" "}
                        {r.shift?.shiftType || ""} · {when(r.declaredAt)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {naira(r.expectedAmount)} sold, {naira(r.receivedTotal ?? r.declaredTotal)} handed over
                      </p>
                      {r.note && <p className="text-xs text-gray-500 mt-1 italic">{r.note}</p>}

                      {/* What the attendant said about it. A debt one party
                          recorded about the other is worth very little; this is
                          the half that makes it stand up. */}
                      {r.attendantAck && r.attendantAck !== "not_required" && (
                        <p className={`text-[11px] font-semibold mt-1 ${
                          r.attendantAck === "accepted"
                            ? "text-green-700"
                            : r.attendantAck === "disputed"
                            ? "text-amber-700"
                            : "text-gray-400"
                        }`}>
                          {r.attendantAck === "accepted"
                            ? "Accepted by the attendant"
                            : r.attendantAck === "disputed"
                            ? `Disputed by the attendant: ${r.attendantAckNote || ""}`
                            : "Not yet signed by the attendant"}
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xl font-extrabold tabular-nums text-red-700 dark:text-red-400">
                        {naira(r.shortfall)}
                      </p>
                      <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        r.shortfallStatus === "outstanding"
                          ? "bg-red-100 text-red-700"
                          : r.shortfallStatus === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {r.shortfallStatus === "outstanding" ? "Owing" : r.shortfallStatus === "paid" ? "Repaid" : "Written off"}
                      </span>
                      {r.shortfallPaidBy && (
                        <p className="text-[10px] text-gray-400 mt-1">
                          {nameOf(r.shortfallPaidBy)} · {when(r.shortfallPaidAt)}
                        </p>
                      )}
                    </div>
                  </div>

                  {canSettle && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      {waiving === r._id ? (
                        /* Writing one off is a decision with a name on it, so it
                           does not happen on a single click. */
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            value={waiveNote}
                            onChange={(e) => setWaiveNote(e.target.value)}
                            placeholder="Why is this being written off? (required)"
                            className="flex-1 min-w-0 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => act(r._id, "waived", waiveNote)}
                              disabled={busyId === r._id || !waiveNote.trim()}
                              className="px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-800 disabled:opacity-50 text-white text-xs font-bold"
                            >
                              Write off
                            </button>
                            <button
                              onClick={() => { setWaiving(null); setWaiveNote(""); }}
                              className="px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs font-semibold"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {r.attendantAck === "disputed" && (
                            <p className="w-full text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 mb-1">
                              The attendant disputes this. A manager should weigh both
                              accounts before it is closed either way.
                            </p>
                          )}
                          {r.shortfallStatus !== "paid" && (
                            <button
                              onClick={() => act(r._id, "paid")}
                              disabled={busyId === r._id}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-bold"
                            >
                              <CheckCircle2 size={13} /> Mark repaid
                            </button>
                          )}
                          {r.shortfallStatus === "outstanding" && (
                            <button
                              onClick={() => setWaiving(r._id)}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs font-semibold"
                            >
                              <Ban size={13} /> Write off
                            </button>
                          )}
                          {r.shortfallStatus !== "outstanding" && (
                            <button
                              onClick={() => act(r._id, "outstanding")}
                              disabled={busyId === r._id}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs font-semibold"
                            >
                              <Undo2 size={13} /> Put back as owing
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
