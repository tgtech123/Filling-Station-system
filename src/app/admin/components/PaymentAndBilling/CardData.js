import { DollarSign, CircleX, Wallet  } from "lucide-react";
import { FaRegCheckCircle } from "react-icons/fa";


const CardData = [
  {
    id: 1,
    label: "Total Payments",
    value: 12,
    icon: Wallet,
  },
  {
    id: 2,
    label: "Successful Payment",
    value: 8,
    icon: FaRegCheckCircle
,
  },
  {
    id: 3,
    label: "Failed Payment",
    value: 2,
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
    icon: CircleX,
  },
  {
    id: 4,
    label: "Total Revenue",
    value: "₦ 284600",
    icon: DollarSign,
  },
];

export default CardData