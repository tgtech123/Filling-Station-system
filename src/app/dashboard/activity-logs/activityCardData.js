// src/app/dashboard/reports/profitLoss/SalesData.js
import { GoPeople } from "react-icons/go";
import { GiSplitArrows } from "react-icons/gi";
import { TbCurrencyNaira } from "react-icons/tb";
import { MdOutlinePersonOutline } from "react-icons/md";
import { CgDanger } from "react-icons/cg";
import Image from "next/image";
import { TrendingUp } from "lucide-react";

export const activityData = [
  {
    name: "Total Activities",
    period: "",
    number: "1334",
    icon: <TrendingUp size={25} className="text-neutral-800 text-lg" />,
  },
  {
    name: "Active User",
    period: "",
    number: "7",
    icon: <MdOutlinePersonOutline size={25} className="text-lg" />
  },
  {
    name: "Failed Attempt",
    period: "   ",
    number: "N2,000, 000",
    icon: < CgDanger size={25} />
    
  },
  {
    name: "Critical Actions",
    number: "3",

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
];
