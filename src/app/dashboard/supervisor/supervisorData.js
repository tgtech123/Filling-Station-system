// src/app/dashboard/reports/profitLoss/SalesData.js
import { FaGasPump } from "react-icons/fa";
import { Users, TrendingUp } from "lucide-react"
import { TbCurrencyNaira, TbTargetArrow, TbChartBarPopular   } from "react-icons/tb";
import { LuAlarmClock } from "react-icons/lu";
import Image from "next/image";

export const supervisorData = [
     {
        title: "Shifts Open",
        date: "Today",
        amount: "3/8",
        changeText: "2 Not yet submitted",
        icon: (
            <Image 
                src="/work-flow.png"
                alt="work-flow image"
                width={24}
                height={24}
                 className="max-w-[1.5rem] max-h-[1.5rem]"
            />
        )
      },
  {
    title: "Pending Approvals",
    date: "This month",
    amount: "3",
    change: "",
    changeText: "2 Staffs inactive",
    // trend:  <TrendingUp size={20}/>,
    icon: <LuAlarmClock size={25} className="text-neutral-800 text-lg" />,
  },
  {
    title: "Active Pumps",
    date: "Today",
    amount: "8/9",
    change: "",
    changeText: "1 Under maintenance",
    // trend: <TrendingUp size={20}/>,
    icon: <FaGasPump size={25} className="text-neutral-800 text-lg" />,
  },
  {
    title: "Available Stocks",
    date: "Fuel 4567Litrs  |  Lubricant 345",
    amount: "N12,000,00",
    change: "",
    changeText: "Stock value",
    // trend:  <TrendingUp size={20}/>,
    icon: <TrendingUp size={25} className="text-neutral-800 text-lg"/> ,
  },
//   {
//     title: "Average Transaction",
//     date: "This month",
//     amount: "N1,500",
//     change: "1.5%",
//     changeText: "From last month",
//     trend: <TrendingUp size={20}/>,
//     icon: <TrendingUp  size={25} className="text-neutral-800 text-lg" />,
//   },
  
];
