// src/app/dashboard/reports/profitLoss/SalesData.js
import { GoPeople } from "react-icons/go";
import { GiSplitArrows } from "react-icons/gi";
import { TbCurrencyNaira } from "react-icons/tb";
import { FaHandHoldingWater } from "react-icons/fa";
import { TbTargetArrow } from "react-icons/tb";
import { PiHouseLineBold } from "react-icons/pi";
import Image from "next/image";

export const cashData = [
  {
    title: "Expected Cash",
    date: "Today",
    amount: "N120,000,000",
    icon: <TbCurrencyNaira size={25} className="text-neutral-800 text-lg" />,
  },
  {
    title: "Actual Cash",
    date: "Today",
    amount: "N122,000,000",
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
    amount: "N2,000,000",
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
    amount: "98.8%",

    icon: (
      <Image
        src="/target.png"
        alt="danger icon"
        width={24}
        height={24}
        className="max-w-[1.5rem] max-h-[1.5rem]"
      />
    ),
  },
];
