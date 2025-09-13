// src/app/dashboard/reports/profitLoss/SalesData.js
import { GoPeople } from "react-icons/go";
import { GiSplitArrows } from "react-icons/gi";
import { TbCurrencyNaira, TbTargetArrow  } from "react-icons/tb";
import { FiPieChart } from "react-icons/fi";
import Image from "next/image";

export const overviewCardData = [
  {
    name: "Today Revenue",
    perios: "",
    number: "N120,000",
    icon: <TbCurrencyNaira size={25} className="text-neutral-800 text-lg" />,
  },
  {
    name: "Total Expenses",
    perios: "",
    number: "N4,234",
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
    period: "   ",
    number: "N2,500",
    icon: < TbTargetArrow  size={25} />
    
  },
  {
    name: "Profit Margin",
    number: "38%",

    icon: < FiPieChart size={26} />
  },
];
