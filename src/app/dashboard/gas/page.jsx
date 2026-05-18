"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirect to the correct page based on user role
export default function GasDashboardEntry() {
  const router = useRouter();

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const role = user?.role;
      if (role === "cashier")    router.replace("/dashboard/gas/cashier");
      else if (role === "attendant") router.replace("/dashboard/gas/shifts");
      else if (role === "accountant") router.replace("/dashboard/gas/analytics");
      else router.replace("/dashboard/gas/analytics"); // manager/admin
    } catch {
      router.replace("/dashboard/gas/analytics");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 font-medium text-sm">Loading Gas Department…</p>
      </div>
    </div>
  );
}
