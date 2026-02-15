// commissionsData.js

// Format currency
const formatCurrency = (value) => {
  if (!value && value !== 0) return "N0";
  return `N${Number(value).toLocaleString()}`;
};

// Get payment data from API response
export const getPaymentData = (paymentHistory) => {
  // Return placeholder data if no data from backend
  if (!paymentHistory || paymentHistory.length === 0) {
    return [
      {
        _id: "1",
        staffName: "-",
        role: "-",
        sales: "N0",
        commissionPercent: "0%",
        commissionAmount: "N0",
        bonus: "N0",
        totalEarnings: "N0",
        isPaid: false,
      }
    ];
  }

  return paymentHistory.map(item => ({
    _id: item._id,
    staffName: item.staffName,
    role: item.role,
    sales: formatCurrency(item.sales),
    commissionPercent: item.commissionPercent,
    commissionAmount: formatCurrency(item.commissionAmount),
    bonus: formatCurrency(item.bonus),
    totalEarnings: formatCurrency(item.totalEarnings),
    isPaid: item.status === "Paid",
  }));
};

export const paymentColumns = [
  { header: "Staff name", accessor: "staffName" },
  { header: "Role", accessor: "role" },
  { header: "Sales", accessor: "sales" },
  { header: "Commission %", accessor: "commissionPercent" },
  { header: "Commission amount", accessor: "commissionAmount" },
  { header: "Bonus", accessor: "bonus" },
  { header: "Total earnings", accessor: "totalEarnings" },
  { header: "Action", accessor: "isPaid" },
];




// // commissionsData.js

// export const paymentData = [
//   {
//     staffName: "John Dave",
//     role: "Attendant",
//     sales: "123,000,000",
//     commissionPercent: "2%",
//     commissionAmount: "N5,000",
//     bonus: "N3,000",
//     totalEarnings: "N8,000",
//     isPaid: true,   // ✅ true means Paid, false means Pay
//   },
//   {
//     staffName: "John Dave",
//     role: "Attendant",
//     sales: "123,000,000",
//     commissionPercent: "2%",
//     commissionAmount: "N5,000",
//     bonus: "N3,000",
//     totalEarnings: "N8,000",
//     isPaid: true,
//   },
//   {
//     staffName: "John Dave",
//     role: "Attendant",
//     sales: "123,000,000",
//     commissionPercent: "2%",
//     commissionAmount: "N5,000",
//     bonus: "N3,000",
//     totalEarnings: "N8,000",
//     isPaid: true,
//   },
//   {
//     staffName: "John Dave",
//     role: "Attendant",
//     sales: "123,000,000",
//     commissionPercent: "2%",
//     commissionAmount: "N5,000",
//     bonus: "N3,000",
//     totalEarnings: "N8,000",
//     isPaid: true,
//   },
//   {
//     staffName: "John Dave",
//     role: "Attendant",
//     sales: "123,000,000",
//     commissionPercent: "2%",
//     commissionAmount: "N5,000",
//     bonus: "N3,000",
//     totalEarnings: "N8,000",
//     isPaid: false,   // not yet paid
//   },
//   {
//     staffName: "John Dave",
//     role: "Attendant",
//     sales: "123,000,000",
//     commissionPercent: "2%",
//     commissionAmount: "N5,000",
//     bonus: "N3,000",
//     totalEarnings: "N8,000",
//     isPaid: true,
//   },
//   {
//     staffName: "John Dave",
//     role: "Attendant",
//     sales: "123,000,000",
//     commissionPercent: "2%",
//     commissionAmount: "N5,000",
//     bonus: "N3,000",
//     totalEarnings: "N8,000",
//     isPaid: false,
//   },
//   {
//     staffName: "John Dave",
//     role: "Attendant",
//     sales: "123,000,000",
//     commissionPercent: "2%",
//     commissionAmount: "N5,000",
//     bonus: "N3,000",
//     totalEarnings: "N8,000",
//     isPaid: false,
//   },
//   {
//     staffName: "Odey Grace",
//     role: "Cashier",
//     sales: "123,000,000",
//     commissionPercent: "3%",
//     commissionAmount: "N5,000",
//     bonus: "N3,000",
//     totalEarnings: "N8,000",
//     isPaid: false,
//   },
//   {
//     staffName: "John Doe",
//     role: "Accountant",
//     sales: "123,000,000",
//     commissionPercent: "2%",
//     commissionAmount: "N5,000",
//     bonus: "N3,000",
//     totalEarnings: "N8,000",
//     isPaid: false,
//   },
//   {
//     staffName: "Maxwell Dave",
//     role: "Supervisor",
//     sales: "123,000,000",
//     commissionPercent: "4%",
//     commissionAmount: "N5,000",
//     bonus: "N3,000",
//     totalEarnings: "N8,000",
//     isPaid: false,
//   },
// ];

// export const paymentColumns = [
//   { header: "Staff name", accessor: "staffName" },
//   { header: "Role", accessor: "role" },
//   { header: "Sales", accessor: "sales" },
//   { header: "Commission %", accessor: "commissionPercent" },
//   { header: "Commission amount", accessor: "commissionAmount" },
//   { header: "Bonus", accessor: "bonus" },
//   { header: "Total earnings", accessor: "totalEarnings" },
//   { header: "Action", accessor: "isPaid" }, // ✅ now tied to boolean
// ];
