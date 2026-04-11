"use client";
import React, { useEffect } from "react";
import { DollarSign, CircleX, Wallet } from "lucide-react";
import { FaRegCheckCircle } from "react-icons/fa";
import StatGrid from "../StatGrid";
import PaymentInfo from "./PaymentInfo";
import useAdminStore from "@/store/useAdminStore";

const GeneralPage = () => {
  const { paymentStats, fetchPaymentStats, fetchPayments } = useAdminStore();

  useEffect(() => {
    fetchPaymentStats();
    fetchPayments({ page: 1, limit: 10 });
  }, []);

  const cardData = [
    {
      id: 1,
      label: "Total Payments",
      value: paymentStats?.totalPayments || 0,
      icon: Wallet,
    },
    {
      id: 2,
      label: "Successful Payment",
      value: paymentStats?.successfulPayments || 0,
      icon: FaRegCheckCircle,
    },
    {
      id: 3,
      label: "Failed Payment",
      value: paymentStats?.failedPayments || 0,
      icon: CircleX,
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
    },
    {
      id: 4,
      label: "Total Revenue",
      value: `₦${(paymentStats?.totalRevenue || 0).toLocaleString("en-NG")}`,
      icon: DollarSign,
    },
  ];

  return (
    <div>
      {paymentStats === null ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
              </div>
              <div className="mt-6">
                <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-100 dark:bg-gray-600 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <StatGrid data={cardData} />
      )}

      <div className="mt-[1.375rem]">
        <PaymentInfo />
      </div>
    </div>
  );
};

export default GeneralPage;
