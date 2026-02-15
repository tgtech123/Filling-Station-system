// src/data/fuelData.js

// Format currency
const formatCurrency = (value) => {
  if (!value && value !== 0) return "0";
  return Number(value).toLocaleString('en-US');
};

export const fuelDataColumns = [
  "Fuel type",
  "Litres sold",
  "Price/litre",
  "Total revenue",
  "% of total sales",
];

export const getFuelDataRows = (incomeReport) => {
  if (!incomeReport?.fuelIncomeReport || incomeReport.fuelIncomeReport.length === 0) {
    return [
      ["PMS", "0 Litres", "₦0", "₦0", "0%"],
      ["Diesel", "0 Litres", "₦0", "₦0", "0%"],
      ["Fuel 99", "0 Litres", "₦0", "₦0", "0%"],
    ];
  }

  return incomeReport.fuelIncomeReport.map(item => [
    item.fuelType || "N/A",
    `${formatCurrency(item.litresSold)} Litres`,
    `₦${formatCurrency(item.pricePerLtr)}`,
    `₦${formatCurrency(item.totalRevenue)}`,
    `${item.percentageOfTotalSales}%`,
  ]);
};