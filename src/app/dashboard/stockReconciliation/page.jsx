"use client";

import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import StockReconciliationClient from "./StockReconciliationClient";

export default function StockReconciliationPage() {
  return (
    <DashboardLayout>
      <StockReconciliationClient />
    </DashboardLayout>
  );
}
