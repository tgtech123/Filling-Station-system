"use client";
import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Mail,
  Phone,
  Video,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/config";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  cancelled: "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
};

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 p-4">
      <div className="flex items-center gap-3">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}>
          <Icon size={18} />
        </span>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function DemoBookings() {
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/demo/bookings`, { params: { status, page, limit: 20 } });
      setData(res.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not load demo bookings");
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    load();
  }, [load]);

  const changeStatus = async (id, next) => {
    setSavingId(id);
    try {
      await api.patch(`/api/demo/bookings/${id}`, { status: next });
      toast.success(
        next === "cancelled"
          ? "Cancelled — the prospect has been emailed"
          : `Marked as ${next}`
      );
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not update the booking");
    } finally {
      setSavingId(null);
    }
  };

  const counts = data?.counts ?? {};

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Demo Bookings
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Slots booked from the landing page calendar · times in {data?.timezone || "WAT (GMT+1)"}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={CalendarDays}
          label="Upcoming"
          value={counts.upcoming ?? 0}
          tone="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value={counts.pending ?? 0}
          tone="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300"
        />
        <StatCard
          icon={CheckCircle}
          label="Completed"
          value={counts.completed ?? 0}
          tone="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300"
        />
        <StatCard
          icon={XCircle}
          label="Cancelled"
          value={counts.cancelled ?? 0}
          tone="bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => {
              setStatus(f.key);
              setPage(1);
            }}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              status === f.key
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : !data?.items?.length ? (
          <div className="p-10 text-center">
            <CalendarDays size={36} className="mx-auto text-gray-300 dark:text-gray-600" />
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              No demo bookings yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 text-left text-xs uppercase text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">When</th>
                  <th className="px-4 py-3 font-semibold">Prospect</th>
                  <th className="px-4 py-3 font-semibold">Station</th>
                  <th className="px-4 py-3 font-semibold">Ref</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {data.items.map((b) => (
                  <tr key={b._id} className="align-top">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-medium text-gray-900 dark:text-white">{b.when}</p>
                      {b.meetingLink && (
                        <a
                          href={b.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        >
                          <Video size={12} /> Join link
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-white">{b.fullName}</p>
                      <a
                        href={`mailto:${b.email}`}
                        className="mt-0.5 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:underline"
                      >
                        <Mail size={12} /> {b.email}
                      </a>
                      <a
                        href={`tel:${b.phone}`}
                        className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:underline"
                      >
                        <Phone size={12} /> {b.phone}
                      </a>
                    </td>
                    <td className="px-4 py-3 max-w-[220px]">
                      <p className="text-gray-700 dark:text-gray-300">{b.company || "—"}</p>
                      {b.stationCount && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{b.stationCount}</p>
                      )}
                      {b.notes && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 whitespace-pre-wrap">
                          {b.notes}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                      {b.reference}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[b.status]}`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={b.status}
                        disabled={savingId === b._id}
                        onChange={(e) => changeStatus(b._id, e.target.value)}
                        className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-xs text-gray-700 dark:text-gray-200 outline-none focus:border-blue-500 disabled:opacity-50"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {data?.pages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
          <span>
            Page {data.page} of {data.pages} · {data.total} bookings
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={data.page <= 1}
              className="rounded-lg border border-gray-200 dark:border-gray-700 p-2 disabled:opacity-30"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={data.page >= data.pages}
              className="rounded-lg border border-gray-200 dark:border-gray-700 p-2 disabled:opacity-30"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
