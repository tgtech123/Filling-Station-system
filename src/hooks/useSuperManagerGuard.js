"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Client-side guard for owner-only (super manager) pages — Branch Overview and
// Consolidated Payroll. This is defense-in-depth: the server already enforces
// branch isolation (getAccessibleIds + the isSuperManager check on the
// consolidated endpoints), so a non-owner manager can never receive another
// branch's data. This guard just stops such a manager who force-navigates to the
// URL from ever seeing the page shell, and sends them back to their dashboard.
//
// Ownership is read from the stored user's isSuperManager flag — the same source
// the sidebar uses to decide whether to show these links at all.
//
// Returns one of: "checking" | "allowed" | "denied"
export function useSuperManagerGuard(redirectTo = "/dashboard/manager") {
  const router = useRouter();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      const user = raw ? JSON.parse(raw) : null;

      if (!user) {
        setStatus("denied");
        router.replace("/login");
        return;
      }

      if (user.isSuperManager === true) {
        setStatus("allowed");
      } else {
        setStatus("denied");
        router.replace(redirectTo);
      }
    } catch {
      setStatus("denied");
      router.replace("/login");
    }
  }, [router, redirectTo]);

  return status;
}

export default useSuperManagerGuard;
