// src/data/lubricantData.js

export const lubricantDataColumns = [
  "Barcode",
  "Lubricant name",
  "Unit sold",
  "Price/unit",
  "Total Revenue",
  "% of Total sales",
];

export const getLubricantDataRows = (incomeReport) => {
  if (!incomeReport?.lubricantIncomeReport || incomeReport.lubricantIncomeReport.length === 0) {
    return [
      ["N/A", "No data", "0 Bottles", "₦0", "₦0", "0%"],
    ];
  }

  return incomeReport.lubricantIncomeReport.map(item => [
    item.barcode || "N/A",
    item.lubricantName || "N/A",
    `${formatCurrency(item.unitSold)} Units`,
    `₦${formatCurrency(item.pricePerUnit)}`,
    `₦${formatCurrency(item.totalRevenue)}`,
    `${item.percentageOfTotalSales}%`,
  ]);
};