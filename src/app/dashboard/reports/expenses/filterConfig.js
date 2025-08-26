// src/app/dashboard/reports/expenses/filterConfig.js

export const expenseFilterConfig = [
  {
    key: "category",
    label: "Category",
    options: [
      "Maintenance & Repair",
      "Salaries",
      "Utilities",
      "Miscellanous",
      "Administative",
      "Operational",
    ],
  },
  {
    key: "submittedBy",
    label: "Submitted by",
    options: [
      "Manager",
      "Accountant",
     
    ],
  },
  {
    key: "status",
    label: "Status",
    options: ["Approved ✓", "Pending", "Rejected"],
  },
];
