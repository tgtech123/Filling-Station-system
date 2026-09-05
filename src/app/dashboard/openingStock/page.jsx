"use client";

import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import OpeningStockClient from "./OpeningStockClient";

export default function OpeningStockPage() {
  return (
    <DashboardLayout>
      <OpeningStockClient />
    </DashboardLayout>
  );
}
