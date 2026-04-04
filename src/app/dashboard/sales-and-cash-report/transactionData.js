// transactionData.js
// dataRows has been removed — transaction rows are now mapped live from
// salesOverview.recentTransactions returned by GET /api/manager/reports/sales-overview

export const columnsHeader = [
  "Timestamp",
  "TXNID",
  "Pump No",
  "Product type",
  "Quantity",
  "Amount",
  "Role",
];