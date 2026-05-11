"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function useSessionTimeout() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem("token")) return;

    let idleTimer;
    let hiddenAt = null;

    const logout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      router.push("/login");
    };

    const resetIdle = () => {
      if (!localStorage.getItem("token")) return;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(logout, IDLE_TIMEOUT);
    };

    resetIdle();

    const events = ["click", "keydown", "touchstart", "mousemove"];
    events.forEach((ev) => window.addEventListener(ev, resetIdle, { passive: true }));

    const onVisibilityChange = () => {
      if (!localStorage.getItem("token")) return;
      if (document.hidden) {
        hiddenAt = Date.now();
      } else if (hiddenAt !== null) {
        if (Date.now() - hiddenAt > IDLE_TIMEOUT) logout();
        hiddenAt = null;
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearTimeout(idleTimer);
      events.forEach((ev) => window.removeEventListener(ev, resetIdle));
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [pathname, router]);
}
