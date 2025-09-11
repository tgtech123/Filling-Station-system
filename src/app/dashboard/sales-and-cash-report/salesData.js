// src/app/dashboard/reports/profitLoss/SalesData.js
import { GoPeople } from "react-icons/go";
import { GiSplitArrows } from "react-icons/gi";
import { TbCurrencyNaira } from "react-icons/tb";
// import { FaHandHoldingWater } from "react-icons/fa";
// import { TbTargetArrow } from "react-icons/tb";
// import { PiHouseLineBold } from "react-icons/pi";
import Image from "next/image";

export const salesData = [
  {
    title: "Today Sales",
    date: "Across all pump",
    amount: "N120,000,000",
    icon: <TbCurrencyNaira size={25} className="text-neutral-800 text-lg" />,
  },
  {
    title: "Total Transactions",
    date: "Across all pumps",
    amount: "4,234",
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
    amount: "4,000 Litres",
    icon: (
      <Image
        src="/pumpNozzle.png"
        alt="pump nozzle"
        width={24}
        height={22}
        className="max-w-[1.5rem] max-h-[1.3rem]"
      />
    ),
  }
//   {
//     title: "Total Expenses",

//     amount: "98.8%",
//     icon: <TbTargetArrow className="text-neutral-800 text-lg" />,
//   },
];
