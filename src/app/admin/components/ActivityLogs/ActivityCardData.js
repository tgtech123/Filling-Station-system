import { CircleCheck, Wallet, TriangleAlert, TrendingUp  } from "lucide-react";
import { TbAlertHexagon } from "react-icons/tb";



const ActivityCardData = [
  {
    id: 1,
    label: "Total Activities",
    value: 12,
    icon: TrendingUp,
  },
  {
    id: 2,
    label: "Successful",
    value: 4,
    icon: CircleCheck,
  },
  {
    id: 3,
    label: "Warnings",
    value: 2,
    iconBg: "bg-[#FFF5C5]",
    iconColor: "text-[#E27D00]",
    icon: TriangleAlert,
  },
  {
    id: 4,
    label: "Critical",
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
    value: 3,
    icon: TbAlertHexagon,
  },
];

export default ActivityCardData