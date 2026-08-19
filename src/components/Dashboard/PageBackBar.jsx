"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/currentUser";

/**
 * One way back, on every page that has somewhere to go back to.
 *
 * This lives in the layout rather than in each page for the reason the
 * inconsistency existed in the first place: forty-nine screens had no back
 * control and about twenty had their own, each written slightly differently.
 * A per-page control is a rule nobody can enforce; a layout control is one
 * nobody has to remember.
 *
 * Where "back" goes:
 *  - the previous screen, if this session has one. That is the honest answer to
 *    "take me back", and it returns to the tab, filter and scroll the person
 *    left behind.
 *  - otherwise the role's own home. Someone who opened a deep link, or landed
 *    here from a notification, has no previous screen inside the app, and
 *    router.back() would throw them out of it entirely.
 *
 * It hides on the role landing pages, because "back" from your own dashboard
 * means leaving, and a control that does nothing useful teaches people to
 * ignore controls.
 */

/** Where each role's dashboard starts. The floor of the back stack. */
const HOME_BY_ROLE = {
  manager:    "/dashboard/manager",
  supervisor: "/dashboard/supervisor",
  cashier:    "/dashboard/cashier",
  attendant:  "/dashboard/attendant",
  accountant: "/dashboard/accountant",
};

const LANDING_PATHS = new Set([
  "/dashboard",
  ...Object.values(HOME_BY_ROLE),
  // Full-screen surfaces with their own exit, where a floating back bar would
  // sit on top of the content it is meant to help with.
  "/dashboard/customer-display",
]);

export default function PageBackBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [home, setHome] = useState("/dashboard");

  /**
   * How many in-app navigations this session has made.
   *
   * `window.history.length` counts the whole tab, including pages before the
   * app was opened, so it cannot answer "is the previous entry ours".
   *
   * Held in sessionStorage rather than a ref because not every screen renders
   * inside DashboardLayout: nine pages carry their own copy of this control, so
   * the count has to survive a component unmounting and a fresh one mounting on
   * the next screen. A ref would reset to zero on each of those and offer "Back
   * to dashboard" when there was a real previous page to return to.
   */
  const DEPTH_KEY = "navDepth";
  const readDepth = () => {
    if (typeof window === "undefined") return 0;
    return Number(sessionStorage.getItem(DEPTH_KEY) || 0);
  };
  const writeDepth = (n) => {
    if (typeof window !== "undefined") sessionStorage.setItem(DEPTH_KEY, String(Math.max(0, n)));
  };

  const [canGoBack, setCanGoBack] = useState(false);
  const firstPathRef = useRef(null);

  useEffect(() => {
    const role = getCurrentUser()?.role;
    if (role && HOME_BY_ROLE[role]) setHome(HOME_BY_ROLE[role]);
  }, []);

  useEffect(() => {
    if (firstPathRef.current === null) {
      // First render of THIS instance. It may still be deep in the session, so
      // read the running count rather than assuming a fresh start.
      firstPathRef.current = pathname;
      setCanGoBack(readDepth() > 0);
      return;
    }
    if (pathname !== firstPathRef.current) {
      firstPathRef.current = pathname;
      writeDepth(readDepth() + 1);
    }
    setCanGoBack(readDepth() > 0);
  }, [pathname]);

  if (!pathname || LANDING_PATHS.has(pathname)) return null;

  const goBack = () => {
    const depth = readDepth();
    if (depth > 0) {
      writeDepth(depth - 1);
      router.back();
    } else {
      router.push(home);
    }
  };

  return (
    <button
      onClick={goBack}
      className="inline-flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:border-blue-300 dark:hover:text-blue-400 shadow-sm transition-colors"
    >
      <ArrowLeft size={16} />
      {canGoBack ? "Back" : "Back to dashboard"}
    </button>
  );
}
