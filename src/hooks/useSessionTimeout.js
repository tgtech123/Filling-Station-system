"use client";
import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

const IDLE_TIMEOUT = 20 * 60 * 1000; // 20 minutes

export function useSessionTimeout() {
  const router = useRouter();
  const pathname = usePathname();
  const timerRef = useRef(null);
  const hiddenAtRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem("token")) return;

    const logout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("notifPrefs");
      sessionStorage.clear();
      router.replace("/login?reason=idle");
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
        if (hiddenAtRef.current !== null && Date.now() - hiddenAtRef.current >= IDLE_TIMEOUT) {
          logout();
        }
        hiddenAtRef.current = null;
        resetTimer();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearTimeout(timerRef.current);
      EVENTS.forEach((ev) => window.removeEventListener(ev, resetTimer));
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [pathname, router]);
}
