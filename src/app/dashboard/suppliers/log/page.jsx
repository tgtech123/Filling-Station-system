"use client";

import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import InvoiceLogClient from "./InvoiceLogClient";

export default function InvoiceLogPage() {
  return (
    <DashboardLayout>
      <InvoiceLogClient />
    </DashboardLayout>
  );
}
