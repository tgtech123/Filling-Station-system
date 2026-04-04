// src/app/dashboard/reports/salesReport/salesData.js
import { TbCurrencyNaira } from "react-icons/tb";
import Image from "next/image";

export const getSalesData = (salesOverview) => [
  {
    title: "Today Sales",
    date: "Across all pump",
    amount: salesOverview
      ? `₦${salesOverview.todaySales.toLocaleString()}`
      : "—",
    icon: <TbCurrencyNaira size={25} className="text-neutral-800 text-lg" />,
  },
  {
    title: "Total Transactions",
    date: "Across all pumps",
    amount: salesOverview
      ? salesOverview.totalTransactions.toLocaleString()
      : "—",
    icon: (
      <Image
        src="/trend.png"
        alt="trend icon"
        width={24}
        height={24}
        className="max-w-[1.5rem] max-h-[1.5rem]"
      />
    ),
  },
  {
    title: "Fuel Sold",
    date: "Across all fuel type",
    amount: salesOverview
      ? `${salesOverview.fuelSold.toLocaleString()} Litres`
      : "—",
    icon: (
      <Image
        src="/pumpNozzle.png"
        alt="pump nozzle"
        width={24}
        height={22}
        className="max-w-[1.5rem] max-h-[1.3rem]"
      />
    ),
  },
];