// src/app/dashboard/cashier/cashierData.js
import { TbCurrencyNaira } from "react-icons/tb";
import Image from "next/image";
import { TrendingUp } from "lucide-react";
const cashierCards = [
  {
    title: "Reconciled Cash",
    date: "This week",
    amount: "₦80,050",
    change: "",
    changeText: "From last week",
    trend: "+0.5%",
    icon: <TbCurrencyNaira size={25} className="text-neutral-800 text-lg" />,
    
  },
  {
    title: "Discrepancies",
    date: "From this week",
     icon: (
                <Image 
                    src="/work-flow.png"
                    alt="work-flow image"
                    width={24}
                    height={24}
                     className="max-w-[1.5rem] max-h-[1.5rem]"
                />
            ),
    amount: "₦950",
},
{
    title: "Lubricant unit sold",
    date: "This week",
    amount: "126 Btls",
    trend: "+1.5%",
    icon: <TrendingUp size={25} className="text-neutral-800 text-lg" />,
    changeText: "From last week",
  },
  {
    title: "Sales Target",
    amount: {
      labelLeft: "In Progress",
      labelRight: "Sales Target",
      current: 41560345,
      target: 50000000,
      barColor: "bg-blue-500",
    },
  },
];

// ✅ Make sure this is an array export
export default cashierCards;
