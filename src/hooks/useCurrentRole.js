"use client";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/currentUser";

/**
 * Role of the signed-in user, plus a flag saying whether it has been read yet.
 *
 * The role lives in localStorage, which does not exist while the page renders
 * on the server — so the first client render always has `role === null`. Gating
 * a screen on `role` alone therefore paints every control for one frame and
 * then removes the ones the user may not use, which looks like the app changing
 * its mind. Wait for `ready` before deciding what to show, and before firing a
 * request the user's role is not allowed to make.
 *
 * Reads through `getCurrentUser()` so identity has one source, the same one the
 * sidebar and profile screens use.
 */
export function useCurrentRole() {
  const [state, setState] = useState({ role: null, ready: false });

  useEffect(() => {
    setState({ role: getCurrentUser()?.role || null, ready: true });
  }, []);

  return state;
}

export default useCurrentRole;
