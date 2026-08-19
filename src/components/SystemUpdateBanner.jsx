"use client";
import { useEffect, useState } from "react";
import { Megaphone, X, Loader2 } from "lucide-react";
import { api } from "@/lib/config";

/**
 * What the system owner shipped, shown to the station until somebody reads it.
 *
 * Two rules shape this, and both come from the same idea: an announcement is
 * only worth publishing if it is actually read.
 *
 * 1. Opening it is what dismisses it. There is no close button on the collapsed
 *    banner, because a banner you can wave away without reading is one that
 *    gets waved away without reading. The X only appears once the text is open
 *    in front of you, and pressing it marks the update read.
 *
 * 2. It stops after three days whether or not it was opened. The server decides
 *    that; this component simply stops being given one. An unread banner that
 *    never expires becomes furniture, and the next one behind it is the one
 *    that mattered.
 *
 * After that it lives in history, which is why dismissing loses nothing.
 */
export default function SystemUpdateBanner() {
  const [announcement, setAnnouncement] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    api
      .get("/api/announcements/banner")
      .then((res) => {
        if (!cancelled) setAnnouncement(res.data?.data || null);
      })
      // Silent: a dashboard must still load when the notice board is down.
      .catch(() => {});

    return () => { cancelled = true; };
  }, []);

  if (!announcement) return null;

  const markRead = async () => {
    setDismissing(true);
    try {
      await api.patch(`/api/announcements/${announcement._id}/read`);
    } catch {
      // Even if the write fails, hide it: re-showing an update the reader has
      // plainly just read is worse than losing the read receipt.
    }
    setAnnouncement(null);
  };

  return (
    <div className="mb-4 rounded-lg border-l-4 border-l-indigo-500 bg-indigo-50 dark:bg-indigo-900/20">
      {/* Collapsed row: one line, and the only action is to open it. */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex flex-row items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-left"
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Megaphone size={18} className="text-indigo-500 shrink-0" />
          <p className="text-xs sm:text-sm font-medium leading-snug truncate text-indigo-900 dark:text-indigo-200">
            {announcement.version && (
              <span className="font-bold">{announcement.version} · </span>
            )}
            {announcement.title}
          </p>
        </div>
        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-300 whitespace-nowrap shrink-0">
          {expanded ? "Hide" : "Read"}
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-3 pt-0">
          <p className="text-xs sm:text-sm text-indigo-900/90 dark:text-indigo-100/90 whitespace-pre-line leading-relaxed">
            {announcement.body}
          </p>

          <div className="flex items-center justify-between gap-3 mt-3">
            <p className="text-[11px] text-indigo-500 dark:text-indigo-300">
              {announcement.targetRole && announcement.targetRole !== "all"
                ? `Affects the ${announcement.targetRole} role`
                : "Affects everyone"}
            </p>
            <button
              onClick={markRead}
              disabled={dismissing}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white transition-colors"
            >
              {dismissing ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
