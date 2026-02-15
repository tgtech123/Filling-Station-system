import {
  BuildingOfficeIcon,
  CreditCardIcon,
  XCircleIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

export const dashboardStats = [
  {
    id: 1,
    label: "Total Registered Stations",
    value: "1,284",
    change: "+5.2%",
    icon: BuildingOfficeIcon,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    id: 2,
    label: "Active Subscriptions",
    value: "892",
    change: "+5.2%",
    icon: CreditCardIcon,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    id: 3,
    label: "Expired Subscriptions",
    value: "47",
    change: "+2.1%",
    icon: XCircleIcon,
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
  },
  {
    id: 4,
    label: "Monthly Revenue",
    value: "$284,600",
    change: "+2.1%",
    icon: CurrencyDollarIcon,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
];
