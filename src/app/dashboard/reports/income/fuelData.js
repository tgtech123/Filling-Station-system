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
    return [["—", "No fuel type configured", "—", "₦0", "0%"]];
  }

  return incomeReport.fuelIncomeReport.map(item => [
    item.fuelType || "N/A",
    item.litresSold > 0 ? `${formatCurrency(item.litresSold)} L` : "—",
    item.pricePerLtr > 0 ? `₦${formatCurrency(item.pricePerLtr)}` : "—",
    `₦${formatCurrency(item.totalRevenue)}`,
    `${item.percentageOfTotalSales}%`,
  ]);
};