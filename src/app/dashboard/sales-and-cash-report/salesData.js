// src/app/dashboard/reports/salesReport/salesData.js
import { TbCurrencyNaira } from "react-icons/tb";
import Image from "next/image";

export const getSalesData = (salesOverview, rangeLabel = "") => {
  /**
   * The cards follow the date filter when one is set, and show today when it
   * is not. The figures used to be hardcoded to today no matter what the
   * dropdown said, so changing the date moved the chart and left the numbers
   * above it describing a different day.
   */
  const range = salesOverview?.rangeSales;
  const useRange = Boolean(range) && Boolean(rangeLabel);

  const headlineAmount = useRange ? range.total : salesOverview?.todaySales;
  const headlineCount  = useRange ? range.transactions : salesOverview?.totalTransactions;
  const breakdown      = useRange ? range : salesOverview?.todayBreakdown;

  const naira = (n) => `₦${Number(n || 0).toLocaleString()}`;

  // Gas only appears in the line when the station actually sells it, so a
  // fuel-only station is not told about a department it does not run.
  const subLabel = breakdown
    ? [
        `Fuel ${naira(breakdown.fuel)}`,
        `Counter ${naira(breakdown.counter)}`,
        ...(Number(breakdown.gas || 0) > 0 ? [`Gas ${naira(breakdown.gas)}`] : []),
      ].join(" · ")
    : "All sales channels";

  return [
  {
    title: useRange ? "Sales" : "Today Sales",
    date: subLabel,
    amount: salesOverview
      ? `₦${Number(headlineAmount || 0).toLocaleString()}`
      : "—",
    icon: <TbCurrencyNaira size={25} className="text-neutral-800 text-lg" />,
  },
  {
    title: "Total Transactions",
    date: useRange ? rangeLabel : "Pumps and counter, today",
    amount: salesOverview
      ? Number(headlineCount || 0).toLocaleString()
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
    date: "Across all products",
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
};