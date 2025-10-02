"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user?.role) {
      router.push("/login");
      return;
    }

    switch (user.role.toLowerCase()) {
      case "manager":
        router.push("/dashboard/manager");
        break;
      case "accountant":
        router.push("/dashboard/accountant");
        break;
      case "cashier":
        router.push("/dashboard/cashier");
        break;
      case "supervisor":
        router.push("/dashboard/supervisor");
        break;
      case "attendant":
        router.push("/dashboard/attendant");
        break;
      default:
        router.push("/login");
    }
  }, [router]);

  return (
    <div className="p-6">
      <h1>Redirecting...</h1>
    </div>
  );
}
