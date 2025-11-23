import { TrendingUp, TriangleAlert } from "lucide-react";
import { GiExpense } from "react-icons/gi";
import { TbCurrencyNaira } from "react-icons/tb";

// Function to generate dynamic shift sales data
export const getShiftSalesData = (thisWeekExpenses) => [
    {
        id: 1,
        name: "Revenue Generated",
        period: "Today",
        icon: <TbCurrencyNaira size={23} />,
        variable: "₦81,000",
        trend: "1.5"
    },
    {
        id: 2,
        name: "Expenses",
        period: "This week",
        icon: <GiExpense size={23} />,
        variable: `₦${thisWeekExpenses.toLocaleString()}`
    },
    {
        id: 3,
        name: "Discrepancies",
        period: "Today",
        icon: <TriangleAlert size={23} />,
        variable: "3"
    },
    {
        id: 4,
        name: "Total Stock Value",
        icon: <TrendingUp size={23} />,
        variable: "₦12,000"
    },
];

export const samplePerformanceData = [
    { month: 'Jan', oneDay: 8000, dayOff: 6000, indicator: null },
    { month: 'Feb', oneDay: 9000, dayOff: 7000, indicator: null },
    { month: 'Mar', oneDay: 8500, dayOff: 9000, indicator: null },
    { month: 'Apr', oneDay: 11000, dayOff: 8000, indicator: null },
    { month: 'May', oneDay: 12000, dayOff: 10000, indicator: null },
    { month: 'Jun', oneDay: 13000, dayOff: 9500, indicator: null },
    { month: 'Jul', oneDay: 12000, dayOff: 11000, indicator: 11000 },
    { month: 'Aug', oneDay: 14000, dayOff: 12000, indicator: null },
    { month: 'Sep', oneDay: 16000, dayOff: 13000, indicator: null },
    { month: 'Oct', oneDay: 18000, dayOff: 15000, indicator: null },
    { month: 'Nov', oneDay: 20000, dayOff: 17000, indicator: null },
    { month: 'Dec', oneDay: 22000, dayOff: 19000, indicator: null }
];