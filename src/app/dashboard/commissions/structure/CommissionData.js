// data.js
export const commissionData = [
  { role: "Attendant", baseRate: "2%", tier1: "-", tier2: "-" },
  { role: "Cashier", baseRate: "2%", tier1: "2.5%", tier2: "3%" },
  { role: "Accountant", baseRate: "2.5%", tier1: "3%", tier2: "3.5%" },
  { role: "Supervisor", baseRate: "3%", tier1: "3.5%", tier2: "4%" },
];

export const commissionColumns = [
  { header: "Role", accessor: "role" },
  { header: "Base rate %", accessor: "baseRate" },
  { header: "Tier 1", accessor: "tier1" },
  { header: "Tier 2", accessor: "tier2" },
];
