"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Auth gate for every route under /dashboard.
 *
 * The guard used to live only inside DashboardLayout, and 20 pages — Staff
 * Management, Pump Control, Activity Logs, Consolidated Payroll and others —
 * did not use that component. A signed-out visitor could open them directly
 * and get the full interface: headings, "Add New Staff", the staff directory,
 * the lot. No data leaked, because every API call is rejected server-side, but
 * the app looked broken and handed out a tour of its internals.
 *
 * A segment layout covers the whole tree, so a page added tomorrow is guarded
 * without anyone having to remember.
 *
 * Client-side by necessity: the token lives in localStorage, which Next
 * middleware cannot read. The server remains the real boundary — this stops
 * the UI rendering, it is not what protects the data.
 */
export default function DashboardSegmentLayout({ children }) {
  const router = useRouter();
  const [authorised, setAuthorised] = useState(false);

  useEffect(() => {
    let token, user;
    try {
      token = localStorage.getItem("token");
      user = localStorage.getItem("user");
    } catch {
      // Storage blocked (private mode, hardened browser) — treat as signed out.
    }

    if (!token || !user) {
      router.replace("/login");
      return;
    }
    setAuthorised(true);
  }, [router]);

  // Render nothing until the check has passed, so no dashboard chrome ever
  // flashes up for someone who is not signed in.
  if (!authorised) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-gray-950">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return children;
}
