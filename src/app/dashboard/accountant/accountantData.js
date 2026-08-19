import { TrendingUp, TriangleAlert, Banknote } from "lucide-react";
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

// Function to generate dynamic dashboard flash cards from API data
export const getDashboardFlashCards = (dashboard) => {
  if (!dashboard?.summary) {
    return [
      {
        id: 1,
        name: "Revenue Generated",
        period: "Today",
        icon: <TbCurrencyNaira size={23} />,
        variable: "₦0",
        trend: "0"
      },
      {
        id: 2,
        name: "Expenses",
        period: "Today",
        icon: <GiExpense size={23} />,
        variable: "₦0"
      },
      {
        id: 3,
        name: "Discrepancies",
        period: "Today",
        icon: <TriangleAlert size={23} />,
        variable: "0"
      },
      {
        id: 4,
        name: "Total Stock Value",
        period: "Today",
        icon: <TrendingUp size={23} />,
        variable: "₦0"
      },
      {
        id: 5,
        name: "Supplier Debt",
        period: "Outstanding",
        icon: <Banknote size={23} />,
        variable: "₦0",
      },
    ];
  }

  const {
    revenueGenerated, expenses, discrepancies, totalStockValue, accountsPayable,
    revenueBreakdown, salesCount,
  } = dashboard.summary;

  // Older servers do not send the split. Fall back to zeroes rather than
  // rendering "undefined" on a card an accountant is meant to trust.
  const fuelRevenue  = Number(revenueBreakdown?.fuel      || 0);
  const lubRevenue   = Number(revenueBreakdown?.lubricant || 0);
  const storeRevenue = Number(revenueBreakdown?.store     || 0);
  const lubCount     = Number(salesCount?.lubricant || 0);
  const storeCount   = Number(salesCount?.store     || 0);

  return [
    {
      id: 1,
      name: "Revenue Generated",
      period: "Today",
      icon: <TbCurrencyNaira size={23} />,
      variable: `₦${revenueGenerated.toLocaleString()}`,
      trend: "1.5"
    },
    // Oil and shop kept apart, because one combined counter figure cannot
    // answer the question everybody actually asks: which of the two is
    // earning. The sale count rides along, since frequency and value are
    // different measures and a busy shop can out-earn a slow oil rack.
    {
      id: 6,
      name: "Lubricant Sales",
      period: `Today · ${lubCount} sale${lubCount === 1 ? "" : "s"}`,
      icon: <TbCurrencyNaira size={23} />,
      variable: `₦${lubRevenue.toLocaleString()}`,
    },
    {
      id: 7,
      name: "Store Sales",
      period: `Today · ${storeCount} sale${storeCount === 1 ? "" : "s"}`,
      icon: <TbCurrencyNaira size={23} />,
      variable: `₦${storeRevenue.toLocaleString()}`,
    },
    {
      id: 8,
      name: "Fuel Sales",
      period: "Today",
      icon: <TbCurrencyNaira size={23} />,
      variable: `₦${fuelRevenue.toLocaleString()}`,
    },
    {
      id: 2,
      name: "Expenses",
      period: "Today",
      icon: <GiExpense size={23} />,
      variable: `₦${expenses.toLocaleString()}`
    },
    {
      id: 3,
      name: "Discrepancies",
      period: "Today",
      icon: <TriangleAlert size={23} />,
      variable: `${discrepancies}`
    },
    {
      id: 4,
      name: "Total Stock Value",
      period: "Today",
      icon: <TrendingUp size={23} />,
      variable: `₦${totalStockValue.toLocaleString()}`
    },
    {
      id: 5,
      name: "Supplier Debt",
      period: "Outstanding",
      icon: <Banknote size={23} />,
      variable: `₦${(accountsPayable || 0).toLocaleString()}`,
      highlight: (accountsPayable || 0) > 0,
    },
  ];
};

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