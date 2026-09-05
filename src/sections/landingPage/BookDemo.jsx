"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Pencil,
  Video,
} from "lucide-react";
import toast from "react-hot-toast";
import { api, extractApiError } from "@/lib/config";
import { Button } from "@/components/ui/button";
import NumericInput from "@/components/inputs/NumericInput";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const STATION_COUNTS = ["1 station", "2 – 5 stations", "6 – 20 stations", "20+ stations"];

/** "2026-09" → "September 2026" */
function monthLabel(monthKey) {
  const [y, m] = monthKey.split("-").map(Number);
  return `${MONTH_LABELS[m - 1]} ${y}`;
}

function shiftMonth(monthKey, delta) {
  const [y, m] = monthKey.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * "1 hour 30 minutes", not "90 minutes".
 *
 * Nobody books ninety minutes of their Saturday; they book an hour and a half.
 * Minutes past sixty are for the config file, not for the person deciding
 * whether they can spare the time.
 */
function formatDuration(minutes) {
  const mins = Number(minutes) || 0;
  const hours = Math.floor(mins / 60);
  const rest = mins % 60;
  if (!hours) return `${rest} minutes`;
  const hourPart = `${hours} hour${hours > 1 ? "s" : ""}`;
  return rest ? `${hourPart} ${rest} minutes` : hourPart;
}

/** "2026-09-03" → "Thu 3 Sep" — the chip above the form. */
function shortDate(dateKey) {
  const d = new Date(`${dateKey}T00:00:00Z`);
  return `${WEEKDAY_LABELS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTH_LABELS[d.getUTCMonth()].slice(0, 3)}`;
}

/**
 * "Add to Google Calendar" for the confirmation card. The confirmation email
 * also carries a .ics, but a visitor who books at their desk should not have to
 * go and find the email to get the appointment into their calendar.
 */
function googleCalendarUrl({ startsAt, durationMinutes, meetingLink, reference }) {
  const stamp = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const start = new Date(startsAt);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: "FuelDesk demo",
    dates: `${stamp(start)}/${stamp(end)}`,
    details: `A ${formatDuration(durationMinutes)} walkthrough of FuelDesk. Reference ${reference}.${
      meetingLink ? ` Join: ${meetingLink}` : ""
    }`,
    location: meetingLink || "Google Meet",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

const EMPTY_FORM = {
  fullName: "",
  email: "",
  phone: "",
  company: "",
  stationCount: "",
  notes: "",
};

export default function BookDemo() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const [monthKey, setMonthKey] = useState(currentMonthKey);
  const [month, setMonth] = useState(null);
  const [monthLoading, setMonthLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState("");
  const [day, setDay] = useState(null);
  const [dayLoading, setDayLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(null);

  const loadMonth = async (key) => {
    setMonthLoading(true);
    try {
      const { data } = await api.get(`/api/demo/availability/month`, { params: { month: key } });
      setMonth(data);
    } catch {
      setMonth(null);
      toast.error("Could not load the calendar. Please try again.");
    } finally {
      setMonthLoading(false);
    }
  };

  useEffect(() => {
    loadMonth(monthKey);
  }, [monthKey]);

  const loadDay = async (date) => {
    setDayLoading(true);
    try {
      const { data } = await api.get(`/api/demo/availability`, { params: { date } });
      setDay(data);
    } catch {
      setDay(null);
      toast.error("Could not load times for that day.");
    } finally {
      setDayLoading(false);
    }
  };

  const pickDate = (date) => {
    setSelectedDate(date);
    setSelectedTime("");
    setDay(null);
    loadDay(date);
  };

  const minMonth = month?.minDate?.slice(0, 7) ?? currentMonthKey();
  const maxMonth = month?.maxDate?.slice(0, 7) ?? currentMonthKey();
  const canGoBack = monthKey > minMonth;
  const canGoForward = monthKey < maxMonth;

  // Blank cells before the 1st so the grid lines up under the right weekday.
  const leadingBlanks = useMemo(
    () => (month?.days?.length ? month.days[0].weekday : 0),
    [month]
  );

  /**
   * "60" or "60 or 90" — read off the month the server sent rather than written
   * into the copy, because weekdays and Saturdays run to different lengths and
   * either can be changed from the server environment without a deploy. Copy
   * that names a number it did not look up is copy that goes stale.
   */
  const durationText = useMemo(() => {
    const open = (month?.days ?? []).filter((d) => d.isWorkDay && d.durationMinutes);
    const distinct = [...new Set(open.map((d) => d.durationMinutes))].sort((a, b) => a - b);
    if (!distinct.length) return null;
    const readable = distinct.map(formatDuration);
    if (readable.length === 1) return readable[0];
    return `${readable.slice(0, -1).join(", ")} or ${readable[readable.length - 1]}`;
  }, [month]);

  const handleField = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/api/demo/book`, {
        ...form,
        date: selectedDate,
        time: selectedTime,
      });
      setConfirmed(data.booking);
      if (data.emailSent === false) {
        toast("Booked — but the confirmation email failed. Please save these details.", {
          icon: "⚠️",
          duration: 8000,
        });
      } else {
        toast.success("Demo booked — check your email for the details.");
      }
      setForm(EMPTY_FORM);
      loadMonth(monthKey);
    } catch (err) {
      const status = err?.response?.status;
      const message =
        extractApiError(err) ||
        err?.response?.data?.errors?.[0]?.msg ||
        "Something went wrong. Please try again.";
      toast.error(message);
      // 409 means the slot went while the form was being filled in — reload the
      // day so the taken time greys out instead of failing again on retry.
      if (status === 409) {
        setSelectedTime("");
        loadDay(selectedDate);
        loadMonth(monthKey);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const startOver = () => {
    setConfirmed(null);
    setSelectedDate("");
    setSelectedTime("");
    setDay(null);
  };

  return (
    <section
      id="book-demo"
      ref={ref}
      className="scroll-mt-24 px-4 sm:px-8 lg:px-40 py-14 sm:py-20 bg-white dark:bg-gray-900"
    >
      <motion.div
        className="text-center max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: 0.6 }}
      >
        <span className="inline-flex items-center gap-2 rounded-full border-2 border-[#0080FF] bg-[#cee1ff]/50 dark:bg-[#0080FF]/10 px-4 py-1 text-xs sm:text-sm font-semibold text-[#0080FF]">
          <Video size={16} aria-hidden="true" />
          Live demo on Google Meet
        </span>
        <h2 className="mt-4 text-2xl sm:text-3xl lg:text-[40px] font-semibold leading-tight text-black dark:text-white">
          See FuelDesk running your station
        </h2>
        <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-300">
          New to FuelDesk? This session is for you — see exactly how the system
          runs a station before you pay for anything. We will walk you through
          live pump monitoring, shift reconciliation and the reports your
          managers get every morning.
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          No account needed, and nothing to install — just a link and a time that
          suits you.
        </p>
      </motion.div>

      <motion.div
        className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        {/* ── Calendar ─────────────────────────────────────────────── */}
        <div className="rounded-[20px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold text-black dark:text-white">
              <CalendarDays size={18} className="text-[#0080FF]" aria-hidden="true" />
              {monthLabel(monthKey)}
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => canGoBack && setMonthKey(shiftMonth(monthKey, -1))}
                disabled={!canGoBack}
                aria-label="Previous month"
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => canGoForward && setMonthKey(shiftMonth(monthKey, 1))}
                disabled={!canGoForward}
                aria-label="Next month"
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
            {WEEKDAY_LABELS.map((d) => (
              <div key={d} className="py-1">
                {d.charAt(0)}
              </div>
            ))}
          </div>

          {monthLoading ? (
            <div className="mt-2 grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="mt-2 grid grid-cols-7 gap-1">
              {Array.from({ length: leadingBlanks }).map((_, i) => (
                <div key={`blank-${i}`} aria-hidden="true" />
              ))}
              {(month?.days ?? []).map((d) => {
                const isSelected = d.date === selectedDate;
                return (
                  <button
                    key={d.date}
                    type="button"
                    disabled={!d.selectable}
                    onClick={() => pickDate(d.date)}
                    aria-pressed={isSelected}
                    aria-label={`${shortDate(d.date)} — ${
                      d.selectable ? `${d.openSlots} slots open` : "unavailable"
                    }`}
                    className={[
                      "relative aspect-square rounded-lg text-sm font-medium transition-colors",
                      isSelected
                        ? "bg-[#0080FF] text-white"
                        : d.selectable
                        ? "bg-[#cee1ff]/40 dark:bg-[#0080FF]/10 text-gray-800 dark:text-gray-100 hover:bg-[#cee1ff] dark:hover:bg-[#0080FF]/25"
                        : "text-gray-300 dark:text-gray-600 cursor-not-allowed",
                    ].join(" ")}
                  >
                    {Number(d.date.slice(-2))}
                    {/* A dot marks a day that still has room — the whole point
                        of loading the month up front rather than per day. */}
                    {d.selectable && !isSelected && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[#0080FF]" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <p className="mt-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Clock size={14} aria-hidden="true" />
            All times shown in {month?.timezone || "WAT (GMT+1)"}
          </p>
        </div>

        {/* ── Slots → form → confirmation ───────────────────────────── */}
        <div className="rounded-[20px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 sm:p-6 shadow-sm">
          {confirmed ? (
            <div className="h-full flex flex-col justify-center text-center py-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
                <Check size={28} className="text-green-600 dark:text-green-400" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-black dark:text-white">
                You are booked in
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{confirmed.when}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Reference {confirmed.reference} · {formatDuration(confirmed.durationMinutes)} on{" "}
                {confirmed.meetingProvider}
              </p>

              {confirmed.meetingLink ? (
                <a
                  href={confirmed.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-[#0080FF] px-5 py-3 font-semibold text-white hover:bg-[#0066cc] transition-colors"
                >
                  <Video size={18} aria-hidden="true" />
                  Join link
                </a>
              ) : (
                <p className="mt-5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 px-4 py-3 text-left text-sm text-amber-800 dark:text-amber-200">
                  We will email your {confirmed.meetingProvider} link before the session.
                </p>
              )}

              <a
                href={googleCalendarUrl(confirmed)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 text-sm font-medium text-[#0080FF] hover:underline"
              >
                Add to Google Calendar
              </a>

              <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                A confirmation with a calendar invite is on its way to your inbox.
              </p>

              <button
                type="button"
                onClick={startOver}
                className="mt-6 text-sm text-gray-500 dark:text-gray-400 hover:underline"
              >
                Book another demo
              </button>
            </div>
          ) : !selectedDate ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-14">
              <CalendarDays size={40} className="text-gray-300 dark:text-gray-600" aria-hidden="true" />
              <p className="mt-4 font-medium text-gray-700 dark:text-gray-200">
                Pick a day to see available times
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {durationText ? `${durationText} on Google Meet.` : "On Google Meet."}
              </p>
            </div>
          ) : !selectedTime ? (
            <>
              <h3 className="font-semibold text-black dark:text-white">
                {shortDate(selectedDate)}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {/* This day's length, not the generic one — a Saturday visitor
                    needs to know the appointment is longer before they pick a
                    start time, not after they have booked it. */}
                Choose a start time
                {day?.durationMinutes ? ` · ${formatDuration(day.durationMinutes)}` : ""} (
                {day?.timezone || month?.timezone || "WAT (GMT+1)"})
              </p>

              {dayLoading ? (
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-12 rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {(day?.slots ?? []).map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => setSelectedTime(slot.time)}
                        className={[
                          "rounded-lg border-2 py-3 text-sm font-semibold transition-colors",
                          slot.available
                            ? "border-[#0080FF]/40 text-[#0080FF] hover:bg-[#0080FF] hover:text-white"
                            : "border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 line-through cursor-not-allowed",
                        ].join(" ")}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                  {day && !day.slots.some((s) => s.available) && (
                    <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                      Nothing left on this day — try another date.
                    </p>
                  )}
                </>
              )}
            </>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              {/* The chosen slot stays visible and editable, so nobody has to
                  scroll back to the calendar to check what they picked. */}
              <button
                type="button"
                onClick={() => setSelectedTime("")}
                className="flex w-full items-center justify-between rounded-lg bg-[#cee1ff]/40 dark:bg-[#0080FF]/10 px-4 py-3 text-left"
              >
                <span className="text-sm font-semibold text-[#0244A9] dark:text-[#8ec2ff]">
                  {shortDate(selectedDate)} ·{" "}
                  {day?.slots?.find((s) => s.time === selectedTime)?.label || selectedTime}
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-[#0080FF]">
                  <Pencil size={13} aria-hidden="true" />
                  Change
                </span>
              </button>

              <div>
                <label htmlFor="demo-name" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Full name <span className="text-red-500">*</span>
                </label>
                <input
                  id="demo-name"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleField}
                  required
                  autoComplete="name"
                  className="mt-1 w-full rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 p-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[#0080FF]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="demo-email" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="demo-email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleField}
                    required
                    autoComplete="email"
                    className="mt-1 w-full rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 p-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[#0080FF]"
                  />
                </div>
                <div>
                  <label htmlFor="demo-phone" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <NumericInput
                    id="demo-phone"
                    variant="tel"
                    maxLength={15}
                    name="phone"
                    value={form.phone}
                    onChange={handleField}
                    required
                    className="mt-1 w-full rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 p-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[#0080FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="demo-company" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Station / company
                  </label>
                  <input
                    id="demo-company"
                    name="company"
                    value={form.company}
                    onChange={handleField}
                    autoComplete="organization"
                    className="mt-1 w-full rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 p-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[#0080FF]"
                  />
                </div>
                <div>
                  <label htmlFor="demo-count" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    How many stations?
                  </label>
                  <select
                    id="demo-count"
                    name="stationCount"
                    value={form.stationCount}
                    onChange={handleField}
                    className="mt-1 w-full rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 p-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[#0080FF]"
                  >
                    <option value="">Select</option>
                    {STATION_COUNTS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="demo-notes" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Anything you want us to cover?
                </label>
                <textarea
                  id="demo-notes"
                  name="notes"
                  rows={3}
                  maxLength={1000}
                  value={form.notes}
                  onChange={handleField}
                  placeholder="e.g. we lose litres between dip and pump readings"
                  className="mt-1 w-full resize-none rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 p-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[#0080FF]"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                size="lg"
                className="w-full cursor-pointer bg-gradient-to-r from-[#0080FF] via-[#0244A9] to-[#0244A9] py-6 font-semibold"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                    Booking…
                  </>
                ) : (
                  "Confirm my demo"
                )}
              </Button>

              <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                You will get a Google Meet link and a calendar invite by email.
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </section>
  );
}
