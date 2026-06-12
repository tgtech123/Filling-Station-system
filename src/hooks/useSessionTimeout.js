"use client";
import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

const IDLE_TIMEOUT = 40 * 60 * 1000; // 40 minutes

// On mobile, leaving the app (switching to another program) for longer than
// this forces a re-login on return. Kept at 30s so quick OS interruptions the
// app itself triggers — camera, file picker, a notification peek — don't kill
// an active session mid-task.
const MOBILE_RELOCK_MS = 30 * 1000;

const isMobileDevice = () =>
  typeof window !== "undefined" &&
  (window.matchMedia?.("(pointer: coarse)")?.matches || "ontouchstart" in window);

export function useSessionTimeout() {
  const router = useRouter();
  const pathname = usePathname();
  const timerRef = useRef(null);
  const hiddenAtRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem("token")) return;

    const logout = (reason = "idle") => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("notifPrefs");
      sessionStorage.clear();
      router.replace(`/login?reason=${reason}`);
    };

    const resetTimer = () => {
      if (!localStorage.getItem("token")) return;
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(logout, IDLE_TIMEOUT);
    };

    // Start the timer immediately
    resetTimer();

    const EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];
    EVENTS.forEach((ev) => window.addEventListener(ev, resetTimer, { passive: true }));

    const onVisibilityChange = () => {
      if (!localStorage.getItem("token")) return;
      if (document.hidden) {
        hiddenAtRef.current = Date.now();
      } else {
        const hiddenFor = hiddenAtRef.current !== null ? Date.now() - hiddenAtRef.current : 0;
        hiddenAtRef.current = null;

        if (hiddenFor >= IDLE_TIMEOUT) {
          logout("idle");
          return;
        }
        // Mobile relock: the user left this page for another app — on return
        // they must log in again. Desktop tab-switching is unaffected.
        if (isMobileDevice() && hiddenFor >= MOBILE_RELOCK_MS) {
          logout("relock");
          return;
        }
        resetTimer();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    // iOS Safari can fire pagehide without a visibilitychange when the app is
    // backgrounded — record the leave time from there too.
    const onPageHide = () => {
      if (localStorage.getItem("token")) hiddenAtRef.current = Date.now();
    };
    window.addEventListener("pagehide", onPageHide);

    return () => {
      clearTimeout(timerRef.current);
      EVENTS.forEach((ev) => window.removeEventListener(ev, resetTimer));
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [pathname, router]);
}
