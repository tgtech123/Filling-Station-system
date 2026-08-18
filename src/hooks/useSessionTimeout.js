"use client";
import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

/**
 * One idle window for every role — cashier, accountant, manager alike.
 *
 * There used to be a second, far shorter rule on top of this: any touch device
 * that lost focus for 30 seconds was logged out on return. It was meant for
 * phones, but it keys off `pointer: coarse`, which is also every touchscreen
 * POS terminal — so a cashier who answered a call, checked a price in another
 * tab, or let the screen sleep came back to a login form mid-sale. Leaving a
 * page is not a security event; only logging out and going idle are.
 */
const IDLE_TIMEOUT = 40 * 60 * 1000; // 40 minutes

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

        // Time spent away still counts: a backgrounded tab has its timers
        // throttled, so the idle window has to be re-checked by hand on return
        // rather than trusted to have fired. Anything short of the full window
        // simply resumes the session.
        if (hiddenFor >= IDLE_TIMEOUT) {
          logout("idle");
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
