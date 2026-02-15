import {
  BuildingStorefrontIcon,
  CreditCardIcon,
  XCircleIcon,
  PauseCircleIcon,
} from "@heroicons/react/24/outline";

export const stationData = [
  {
    id: 1,
    label: "Total Registered Stations",
    value: "1,284",
    change: "+5.2%",
    icon: BuildingStorefrontIcon,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    changeColor: "green",
  },
  {
    id: 2,
    label: "Active Subscriptions",
    value: "892",
    change: "+5.2%",
    icon: CreditCardIcon,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    changeColor: "green",
  },
  {
    id: 3,
    label: "Expired Subscriptions",
    value: "47",
    change: "+2.1%",
    icon: XCircleIcon,
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
    changeColor: "green",
  },
  {
    id: 4,
    label: "Suspended Stations",
    value: "3",
    change: "+2.1%",
    icon: PauseCircleIcon,
    iconBg: "bg-yellow-50",
    iconColor: "text-yellow-600",
    changeColor: "green",
  },
];
