// src/app/dashboard/reports/profitLoss/overviewCardData.js
import { TbCurrencyNaira, TbTargetArrow } from "react-icons/tb";
import { FiPieChart } from "react-icons/fi";
import Image from "next/image";

export const overviewCardData = [
  {
    name: "Today Revenue",
    period: "",
    number: "₦120,000",
    icon: <TbCurrencyNaira size={25} className="text-neutral-800 text-lg" />,
  },
  {
    name: "Total Expenses",
    period: "",
    number: "₦4,234", // This will be replaced with live data
    icon: (
      <Image 
        src="/expensesImg.png"
        alt="expenses image"
        width={24}
        height={24}
        className="max-w-[1.5rem] max-h-[1.5rem]"
      />
    )
  },
  {
    name: "Net profit",
    period: "",
    number: "₦2,500",
    icon: <TbTargetArrow size={25} />
  },
  {
    name: "Profit Margin",
    period: "",
    number: "38%",
    icon: <FiPieChart size={26} />
  },
];