"use client";
import { useEffect, useRef } from "react";
import { getSocket, disconnectSocket } from "@/lib/socket";

/**
 * Connect to the socket server and wire event listeners.
 *
 * @param {Record<string, (data: any) => void>} handlers  - { eventName: callback }
 * @param {boolean} [active=true]  - set false to skip connecting (e.g. when not yet authed)
 *
 * Usage:
 *   useSocket({
 *     "dashboard:refresh": () => store.invalidate(),
 *     "shift:ended":       (d) => console.log(d),
 *   });
 */
export function useSocket(handlers = {}, active = true) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers; // always up to date without re-running effect

  useEffect(() => {
    if (!active) return;

    const socket = getSocket();
    if (!socket) return;

    // Register all handlers
    const entries = Object.entries(handlersRef.current);
    entries.forEach(([event, fn]) => socket.on(event, fn));

    return () => {
      // Remove only our own handlers on unmount
      entries.forEach(([event, fn]) => socket.off(event, fn));
    };
  }, [active]);
}

/**
 * Connect socket once for the lifetime of a layout / root component.
 * Disconnects automatically when the component unmounts (e.g. logout).
 */
export function useSocketConnect(active = true) {
  useEffect(() => {
    if (!active) return;
    const socket = getSocket();
    return () => {
      // Only disconnect when the outermost layout unmounts (full page leave / logout)
      // Individual pages should NOT call this — they just add/remove handlers.
      if (socket) disconnectSocket();
    };
  }, [active]);
}
