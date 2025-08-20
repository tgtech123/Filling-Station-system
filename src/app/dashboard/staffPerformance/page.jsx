"use client";

import { useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import FlashCard from "@/components/Dashboard/FlashCard";
import { Download, ListFilter, TrendingUp, Users } from "lucide-react";
import { TbTargetArrow } from "react-icons/tb";
import StaffPerformanceCard from "./StaffPerfomanceCard";
import exportToExcel from "@/hooks/ExportToExcel";
import Filter from "@/components/Filter";

export default function staffPerformance() {
    const staffData = [
      {
        id: 1,
        staffImg: "/john-melo-1.png",
        staffName: "John Melo",
        role: "Attendant",
        completedShifts: "50/96",
        salesTargetTrend: "1.5%",
        shiftType: "One Day/Evening",
        LtrsSold: 4536,
        totalSales: "₦2,500,000",
        discrepancy: 3,
        customerRating: "4.6/5/0",
        errorCount: 2,
        efficiencyScore: "93%",
      },
      {
        id: 2,
        staffImg: "/john-melo-2.png",
        staffName: "John Meelo",
        role: "Attendant",
        completedShifts: "50/96",
        salesTargetTrend: "1.5%",
        shiftType: "One Day/Evening",
        LtrsSold: 4536,
        totalSales: "₦2,500,000",
        discrepancy: 4,
        customerRating: "4.4/5/0",
        errorCount: 2,
        efficiencyScore: "95%",
      },
    ];
  const [showFilter, setShowFilter] = useState(false);
  const [filteredStaff, setFilteredStaff] = useState(staffData);


  const filterConfig = [
    {
      key: "attendant",
      label: "Attendant",
      options: [
        "John Melo",
        "Adamu Ukasha",
        "Jona Kuma",
        "Demeyongu Adoo",
        "Oboh ThankGod",
        "Chukwu Prosper",
      ],
    },
    {
      key: "period",
      label: "Period",
      options: ["This month", "This quarter", "Last quarter", "This year"],
    },
  ];

  const handleApplyFilter = (filters) => {
  console.log("Filters applied:", filters);

  const selectedAttendants = Object.entries(filters.attendant || {})
    .filter(([key, value]) => key !== "all" && value) // only selected
    .map(([key]) => key);

  const selectedPeriods = Object.entries(filters.period || {})
    .filter(([key, value]) => key !== "all" && value)
    .map(([key]) => key);

  const filtered = staffData.filter((staff) => {
    let match = true;

    // ✅ Attendant filter
    if (selectedAttendants.length > 0) {
      match = match && selectedAttendants.includes(staff.staffName);
    }

    // ✅ Period filter (you’ll need to add `period` to your staffData first)
    if (selectedPeriods.length > 0) {
      match = match && selectedPeriods.includes(staff.period);
    }

    return match;
  });

  setFilteredStaff(filtered);
};



  const columns = [
    { header: "Staff Name", accessor: "staffName" },
    { header: "Role", accessor: "role" },
    { header: "Completed Shifts", accessor: "completedShifts" },
    { header: "Sales Target Trend", accessor: "salesTargetTrend" },
    { header: "Shift Type", accessor: "shiftType" },
    { header: "Litres Sold", accessor: "LtrsSold" },
    { header: "Total Sales", accessor: "totalSales" },
    { header: "Discrepancy", accessor: "discrepancy" },
    { header: "Customer Rating", accessor: "customerRating" },
    { header: "Error Count", accessor: "errorCount" },
    { header: "Efficiency Score", accessor: "efficiencyScore" },
  ];

  return (
    <DashboardLayout>
      <DisplayCard>
        <h2 className="text-2xl font-semibold text-gray-600">
          Staff Performance Reports
        </h2>
        <p className="text-gray-600 font-semibold">
          Comprehensive analytics for staff members
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FlashCard
            name="Active Staff"
            period="Today"
            icon={<Users />}
            variable="7/8"
          />

          <FlashCard
            name="Total Sales"
            period="Today"
            icon="₦"
            variable="₦2,000,000"
          />
          <FlashCard
            name="Average Efficiency"
            icon={<TbTargetArrow />}
            variable="98%"
          />
          <FlashCard
            name="Top Performer"
            period="Exceeding all targets"
            icon={<TrendingUp />}
            variable="John Melo"
          />
        </div>
      </DisplayCard>

      <div className="my-4">
        <DisplayCard>
          <header className="flex justify-end gap-4">
            <button
              className="cursor-pointer flex items-center gap-2 py-2 px-4 border-2 rounded-[14px] border-gray-300"
              onClick={() => setShowFilter(true)}
            >
              Filter
              <ListFilter />
            </button>

            <button
              className="cursor-pointer flex items-center gap-2 py-2 px-6  rounded-[14px] bg-[#0080ff] text-white"
              onClick={() =>
                exportToExcel(staffData, columns, "StaffPerformance")
              }
            >
              Export
              <Download />
            </button>
          </header>

          {showFilter && (
            <Filter
              title="Customize Filter"
              filterConfig={filterConfig}
              currentFilters={{}} // if you want to preselect some
              onApplyFilter={handleApplyFilter}
              handleClose={() => setShowFilter(false)}
            />
          )}

          <div className="mt-2 flex flex-col gap-4">
            {filteredStaff.map((item) => (
              <StaffPerformanceCard
                key={item.id}
                imgName={item.staffImg}
                name={item.staffName}
                role={item.role}
                completedShifts={item.completedShifts}
                targetTrend={item.salesTargetTrend}
                shiftType={item.shiftType}
                ltrsSold={item.LtrsSold}
                totalSales={item.totalSales}
                discrepancy={item.discrepancy}
                customerRating={item.customerRating}
                errorCount={item.errorCount}
                efficiencyScore={item.efficiencyScore}
              />
            ))}
          </div>
        </DisplayCard>
      </div>
    </DashboardLayout>
  );
}
