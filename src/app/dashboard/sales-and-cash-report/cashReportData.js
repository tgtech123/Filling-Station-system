// src/app/dashboard/reports/salesReport/cashReportData.js
import { TbCurrencyNaira } from "react-icons/tb";
import Image from "next/image";

export const getCashData = (cashOverview) => [
  {
    title: "Expected Cash",
    date: "Today",
    amount: cashOverview
      ? `₦${cashOverview.expectedCashToday.toLocaleString()}`
      : "—",
    icon: <TbCurrencyNaira size={25} className="text-neutral-800 text-lg" />,
  },
  {
    title: "Actual Cash",
    date: "Today",
    amount: cashOverview
      ? `₦${cashOverview.actualCashToday.toLocaleString()}`
      : "—",
    icon: (
      <Image
        src="/house.png"
        alt="house icon"
        width={24}
        height={24}
        className="max-w-[1.5rem] max-h-[1.5rem]"
      />
    ),
  },
  {
    title: "Total Discrepancy",
    date: "   ",
    amount: cashOverview
      ? `₦${cashOverview.totalDiscrepancy.toLocaleString()}`
      : "—",
    icon: (
      <Image
        src="/danger.png"
        alt="danger icon"
        width={24}
        height={24}
        className="max-w-[1.5rem] max-h-[1.5rem]"
      />
    ),
  },
  {
    title: "Reconciliation Rate",
    date: "   ",
    amount: cashOverview ? `${cashOverview.reconciliationRate}%` : "—",
    icon: (
      <Image
        src="/target.png"
        alt="target icon"
        width={24}
        height={24}
        className="max-w-[1.5rem] max-h-[1.5rem]"
      />
    ),
  },
];