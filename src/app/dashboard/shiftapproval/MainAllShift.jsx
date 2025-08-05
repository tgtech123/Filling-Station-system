"use client";
import React, { useState } from "react";
import ShiftApprovalHeader from "./ShiftApprovalHeader";
import ShiftCard from "./ShiftCard";
import ApprovedShiftsPage from "./ApprovedShiftsPage";

const allShifts = [
  {
    id: 1,
    name: "Sam Melo",
    date: "12/12/2025",
    shift: "One-Day(Morning)- 6am - 2pm",
    pumpNo: 1,
    fuelType: "Diesel",
    pricePerLitre: "N120",
    litresSold: "120 Litres",
    transactions: 222,
    amount: "N14,400",
    reconciledCash: "N14,000",
    status: "Flagged",
  },
  {
    id: 2,
    name: "Sam Melo",
    date: "12/12/2025",
    shift: "Day-Off (6am - 10pm)",
    pumpNo: 1,
    fuelType: "Diesel",
    pricePerLitre: "N120",
    litresSold: "120 Litres",
    transactions: 222,
    amount: "N14,400",
    reconciledCash: "N14,000",
    status: "Flagged",
  },
  {
    id: 3,
    name: "Sam Melo",
    date: "12/12/2025",
    shift: "One-Day(Morning)- 6am - 2pm",
    pumpNo: 1,
    fuelType: "Diesel",
    pricePerLitre: "N120",
    litresSold: "120 Litres",
    transactions: 222,
    amount: "N14,400",
    reconciledCash: "N14,000",
    status: "Matched",
  },
];

export default function ShiftApprovalPage() {
  const [activeTab, setActiveTab] = useState("pending");

  let shiftsToDisplay = [];
  if (activeTab === "pending") {
    // Show ALL shifts when "Pending" is active
    shiftsToDisplay = allShifts;
  } else if (activeTab === "approved") {
    // Show nothing when "Approved" is active
    shiftsToDisplay = [];
  }

  return (
    <div>
        <ShiftApprovalHeader activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="mx-auto p-4 bg-white rounded-xl">
        {shiftsToDisplay.length === 0 ? (
          <div className="text-gray-500">
            <ApprovedShiftsPage/>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shiftsToDisplay.map((shift) => (
              <ShiftCard key={shift.id} data={shift} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
