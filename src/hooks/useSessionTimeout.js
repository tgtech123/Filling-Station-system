"use client";
import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

/**
 * When a session ends.
 *
 * Two rules, deliberately different:
 *
 *  - IDLE — the page is open and nobody has touched it for 40 minutes. Applies
 *    to every device and every role, cashier and manager alike.
 *
 *  - AWAY — the app was left and came back. On a phone that window is 30
 *    minutes; anywhere else it stays at the 40-minute idle figure.
 *
 * There used to be a third rule: any touch device that lost focus for 30
 * SECONDS was logged out on return. It was meant for phones but keyed off
 * `pointer: coarse`, which is also every touchscreen POS terminal — so a
 * cashier who answered a call or let the screen sleep came back to a login form
 * mid-sale. That is why the mobile test below sniffs for an actual phone rather
 * than for a touchscreen, and why a Windows till is treated as a desktop.
 *
 * WHY THE TIMESTAMP IS PERSISTED
 * The away time used to be held in a React ref. A phone that backgrounds a tab
 * for long enough does not merely throttle its timers — the operating system
 * discards the page outright, and on return the whole app is reloaded from
 * scratch. The ref came back null, a fresh 40-minute timer started, and the
 * token was still sitting in localStorage: which is exactly why a session could
 * survive for days. localStorage survives that discard; a ref cannot.
 */
const IDLE_TIMEOUT = 40 * 60 * 1000; // 40 minutes with the page open, untouched
const MOBILE_AWAY_TIMEOUT = 30 * 60 * 1000; // 30 minutes away, on a phone

const LAST_SEEN_KEY = "fueldesk:lastSeenAt";

/** Write at most this often — activity fires far too fast to persist every event. */
const WRITE_INTERVAL = 30 * 1000;

/**
 * A phone, not merely a touchscreen.
 *
 * Chromium answers this directly and correctly, including saying "false" for an
 * Android tablet. The user-agent test is the fallback, and it deliberately does
 * not match iPad or Windows: a tablet or a touchscreen till is a fixed device
 * in a controlled place, and the 40-minute idle rule already covers it.
 */
function isPhone() {
  if (typeof navigator === "undefined") return false;
  if (typeof navigator.userAgentData?.mobile === "boolean") {
    return navigator.userAgentData.mobile;
  }
  return /Android|iPhone|iPod/i.test(navigator.userAgent || "");
}

/**
 * When the current token was issued.
 *
 * Needed because signing out elsewhere in the app clears the token but not this
 * hook's timestamp. Without this, someone who logged out, waited two days and
 * logged back in would be thrown straight back to the login form by their own
 * stale stamp. A token issued after that stamp means the session started later,
 * so the stamp is irrelevant.
 */
function tokenIssuedAt() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return 0;
    const payload = token.split(".")[1];
    if (!payload) return 0;
    // JWT is base64url; atob wants plain base64.
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const iat = JSON.parse(json)?.iat;
    return typeof iat === "number" ? iat * 1000 : 0;
  } catch {
    return 0;
  }
}

export function useSessionTimeout() {
  const router = useRouter();
  const pathname = usePathname();
  const timerRef = useRef(null);
  const lastWriteRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem("token")) return;

    const awayLimit = isPhone() ? MOBILE_AWAY_TIMEOUT : IDLE_TIMEOUT;

    const logout = (reason = "idle") => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("notifPrefs");
      localStorage.removeItem(LAST_SEEN_KEY);
      sessionStorage.clear();
      router.replace(`/login?reason=${reason}`);
    };

    const markSeen = (force = false) => {
      const now = Date.now();
      if (!force && now - lastWriteRef.current < WRITE_INTERVAL) return;
      lastWriteRef.current = now;
      try {
        localStorage.setItem(LAST_SEEN_KEY, String(now));
      } catch {
        // A full quota must not break the session; the in-page timer still runs.
      }
    };

    /** How long since this session was last known to be in use. */
    const elapsedSinceSeen = () => {
      const stamp = Number(localStorage.getItem(LAST_SEEN_KEY)) || 0;
      // A token issued after the stamp means a newer sign-in; trust the newer.
      const reference = Math.max(stamp, tokenIssuedAt());
      if (!reference) return 0; // nothing recorded yet — treat as just-seen
      return Date.now() - reference;
    };

    const resetTimer = () => {
      if (!localStorage.getItem("token")) return;
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => logout("idle"), IDLE_TIMEOUT);
    };

    /**
     * The check that makes the whole thing work. It runs on mount — which, after
     * the operating system has discarded the page, is the first moment any of
     * our code runs again — and on every return to the foreground.
     */
    const enforceAwayLimit = () => {
      if (!localStorage.getItem("token")) return true;
      if (elapsedSinceSeen() >= awayLimit) {
        logout("idle");
        return true;
      }
      return false;
    };

    if (enforceAwayLimit()) return;
    markSeen(true);
    resetTimer();

    const onActivity = () => {
      markSeen();
      resetTimer();
    };

    const EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];
    EVENTS.forEach((ev) => window.addEventListener(ev, onActivity, { passive: true }));

    const onVisibilityChange = () => {
      if (!localStorage.getItem("token")) return;
      if (document.hidden) {
        // Stamp on the way out, so time away is measured from the moment of
        // leaving rather than from the last throttled write.
        markSeen(true);
        return;
      }
      if (enforceAwayLimit()) return;
      markSeen(true);
      resetTimer();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    // iOS Safari can fire pagehide without a visibilitychange when the app is
    // backgrounded, and pagehide is also the last event before the page is
    // discarded — so it is the most reliable place to record the leave time.
    const onPageHide = () => {
      if (localStorage.getItem("token")) markSeen(true);
    };
    window.addEventListener("pagehide", onPageHide);

    return () => {
      clearTimeout(timerRef.current);
      EVENTS.forEach((ev) => window.removeEventListener(ev, onActivity));
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [pathname, router]);
}
