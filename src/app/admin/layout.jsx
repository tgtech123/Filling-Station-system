"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Auth gate for the platform admin panel.
 *
 * Same gap as /dashboard: nothing stopped a signed-out visitor — or a signed-in
 * station user — opening /admin and seeing the platform console. The API
 * rejects every admin call (checkAdmin, verified by the backend integration
 * tests), so no data was exposed, but the panel rendered regardless.
 *
 * This additionally checks the ROLE: owning a station does not make someone a
 * FuelDesk administrator, so a station user is sent back to their own
 * dashboard rather than to the login page they have already passed.
 */
export default function AdminSegmentLayout({ children }) {
  const router = useRouter();
  const [authorised, setAuthorised] = useState(false);

  useEffect(() => {
    let token, raw;
    try {
      token = localStorage.getItem("token");
      raw = localStorage.getItem("user");
    } catch {
      /* storage blocked — treat as signed out */
    }

    if (!token || !raw) {
      router.replace("/login");
      return;
    }

    let role;
    try {
      role = JSON.parse(raw)?.role;
    } catch {
      router.replace("/login");
      return;
    }

    if (role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    setAuthorised(true);
  }, [router]);

  if (!authorised) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-gray-950">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return children;
}
