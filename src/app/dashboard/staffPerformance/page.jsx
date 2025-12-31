// "use client";

// import { useState } from "react";
// import DashboardLayout from "@/components/Dashboard/DashboardLayout";
// import DisplayCard from "@/components/Dashboard/DisplayCard";
// import FlashCard from "@/components/Dashboard/FlashCard";
// import { Download, ListFilter, TrendingUp, Users } from "lucide-react";
// import { TbTargetArrow } from "react-icons/tb";
// import StaffPerformanceCard from "./StaffPerfomanceCard";
// import exportToExcel from "@/hooks/ExportToExcel";
// import Filter from "@/components/Filter";

// export default function staffPerformance() {
//     const staffData = [
//       {
//         id: 1,
//         staffImg: "/john-melo-1.png",
//         staffName: "John Melo",
//         role: "Attendant",
//         completedShifts: "50/96",
//         salesTargetTrend: "1.5%",
//         shiftType: "One Day/Evening",
//         LtrsSold: 4536,
//         totalSales: "₦2,500,000",
//         discrepancy: 3,
//         customerRating: "4.6/5/0",
//         errorCount: 2,
//         efficiencyScore: "93%",
//       },
//       {
//         id: 2,
//         staffImg: "/john-melo-2.png",
//         staffName: "John Meelo",
//         role: "Attendant",
//         completedShifts: "50/96",
//         salesTargetTrend: "1.5%",
//         shiftType: "One Day/Evening",
//         LtrsSold: 4536,
//         totalSales: "₦2,500,000",
//         discrepancy: 4,
//         customerRating: "4.4/5/0",
//         errorCount: 2,
//         efficiencyScore: "95%",
//       },
//     ];
//   const [showFilter, setShowFilter] = useState(false);
//   const [filteredStaff, setFilteredStaff] = useState(staffData);


//   const filterConfig = [
//     {
//       key: "attendant",
//       label: "Attendant",
//       options: [
//         "John Melo",
//         "Adamu Ukasha", 
//         "Jona Kuma",
//         "Demeyongu Adoo",
//         "Oboh ThankGod",
//         "Chukwu Prosper",
//       ],
//     },
//     {
//       key: "period",
//       label: "Period",
//       options: ["This month", "This quarter", "Last quarter", "This year"],
//     },
//   ];

//   const handleApplyFilter = (filters) => {
//   console.log("Filters applied:", filters);

//   const selectedAttendants = Object.entries(filters.attendant || {})
//     .filter(([key, value]) => key !== "all" && value) // only selected
//     .map(([key]) => key);

//   const selectedPeriods = Object.entries(filters.period || {})
//     .filter(([key, value]) => key !== "all" && value)
//     .map(([key]) => key);

//   const filtered = staffData.filter((staff) => {
//     let match = true;

//     // ✅ Attendant filter
//     if (selectedAttendants.length > 0) {
//       match = match && selectedAttendants.includes(staff.staffName);
//     }

//     // ✅ Period filter (you’ll need to add `period` to your staffData first)
//     if (selectedPeriods.length > 0) {
//       match = match && selectedPeriods.includes(staff.period);
//     }

//     return match;
//   });

//   setFilteredStaff(filtered);
// };



//   const columns = [
//     { header: "Staff Name", accessor: "staffName" },
//     { header: "Role", accessor: "role" },
//     { header: "Completed Shifts", accessor: "completedShifts" },
//     { header: "Sales Target Trend", accessor: "salesTargetTrend" },
//     { header: "Shift Type", accessor: "shiftType" },
//     { header: "Litres Sold", accessor: "LtrsSold" },
//     { header: "Total Sales", accessor: "totalSales" },
//     { header: "Discrepancy", accessor: "discrepancy" },
//     { header: "Customer Rating", accessor: "customerRating" },
//     { header: "Error Count", accessor: "errorCount" },
//     { header: "Efficiency Score", accessor: "efficiencyScore" },
//   ];

//   return (
//     <DashboardLayout>
//       <DisplayCard>
//         <h2 className="text-2xl font-semibold text-gray-600">
//           Staff Performance Reports
//         </h2>
//         <p className="text-gray-600 font-semibold">
//           Comprehensive analytics for staff members
//         </p>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//           <FlashCard
//             name="Active Staff"
//             period="Today"
//             icon={<Users />}
//             variable="7/8"
//           />

//           <FlashCard
//             name="Total Sales"
//             period="Today"
//             icon="₦"
//             variable="₦2,000,000"
//           />
//           <FlashCard
//             name="Average Efficiency"
//             icon={<TbTargetArrow />}
//             variable="98%"
//           />
//           <FlashCard
//             name="Top Performer"
//             period="Exceeding all targets"
//             icon={<TrendingUp />}
//             variable="John Melo"
//           />
//         </div>
//       </DisplayCard>

//       <div className="my-4">
//         <DisplayCard>
//           <header className="flex justify-end gap-4">
//             <button
//               className="cursor-pointer flex items-center gap-2 py-2 px-4 border-2 rounded-[14px] border-gray-300"
//               onClick={() => setShowFilter(true)}
//             >
//               Filter
//               <ListFilter />
//             </button>

//             <button
//               className="cursor-pointer flex items-center gap-2 py-2 px-6  rounded-[14px] bg-[#0080ff] text-white"
//               onClick={() =>
//                 exportToExcel(staffData, columns, "StaffPerformance")
//               }
//             >
//               Export
//               <Download />
//             </button>
//           </header>

//           {showFilter && (
//             <Filter
//               title="Customize Filter"
//               filterConfig={filterConfig}
//               currentFilters={{}} // if you want to preselect some
//               onApplyFilter={handleApplyFilter}
//               handleClose={() => setShowFilter(false)}
//             />
//           )}

//           <div className="mt-2 flex flex-col gap-4">
//             {filteredStaff.map((item) => (
//               <StaffPerformanceCard
//                 key={item.id}
//                 imgName={item.staffImg}
//                 name={item.staffName}
//                 role={item.role}
//                 completedShifts={item.completedShifts}
//                 targetTrend={item.salesTargetTrend}
//                 shiftType={item.shiftType}
//                 ltrsSold={item.LtrsSold}
//                 totalSales={item.totalSales}
//                 discrepancy={item.discrepancy}
//                 customerRating={item.customerRating}
//                 errorCount={item.errorCount}
//                 efficiencyScore={item.efficiencyScore}
//               />
//             ))}
//           </div>
//         </DisplayCard>
//       </div>
//     </DashboardLayout>
//   );
// }


"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import FlashCard from "@/components/Dashboard/FlashCard";
import { Download, ListFilter, TrendingUp, Users, Loader2 } from "lucide-react";
import { TbTargetArrow } from "react-icons/tb";
import StaffPerformanceCard from "./StaffPerfomanceCard";
import exportToExcel from "@/hooks/ExportToExcel";
import Filter from "@/components/Filter";
import useSupervisorStore from "@/store/useSupervisorStore";

export default function StaffPerformance() {
  const { 
    staffPerformance, 
    fetchStaffPerformance, 
    loading, 
    error,
    pagination 
  } = useSupervisorStore();

  const [showFilter, setShowFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPeriod, setSelectedPeriod] = useState("thismonth");
  const [selectedAttendants, setSelectedAttendants] = useState([]);

  // Fetch staff performance on component mount
  useEffect(() => {
    fetchStaffPerformance({
      page: currentPage,
      limit: 10,
      period: selectedPeriod,
    });
  }, [currentPage, selectedPeriod]);

  const filterConfig = [
    {
      key: "attendant",
      label: "Attendant",
      options: staffPerformance?.staff?.map(s => s.name) || [],
    },
    {
      key: "period",
      label: "Period",
      options: ["today", "thisweek", "thismonth", "lastmonth", "thisquarter", "thisyear"],
    },
  ];

  const handleApplyFilter = async (filters) => {
    console.log("Filters applied:", filters);

    // Extract selected attendants
    const selectedAttendantNames = Object.entries(filters.attendant || {})
      .filter(([key, value]) => key !== "all" && value)
      .map(([key]) => key);

    // Extract selected period (assuming single selection)
    const selectedPeriods = Object.entries(filters.period || {})
      .filter(([key, value]) => key !== "all" && value)
      .map(([key]) => key);

    const period = selectedPeriods[0] || "thismonth";

    // Get attendant IDs
    const attendantIds = staffPerformance?.staff
      ?.filter(s => selectedAttendantNames.includes(s.name))
      .map(s => s._id)
      .join(',');

    setSelectedPeriod(period);
    setSelectedAttendants(selectedAttendantNames);

    // Fetch with filters
    await fetchStaffPerformance({
      page: 1,
      limit: 10,
      period,
      attendantIds: attendantIds || undefined,
    });

    setCurrentPage(1);
    setShowFilter(false);
  };

  const columns = [
    { header: "Staff Name", accessor: "name" },
    { header: "Role", accessor: "role" },
    { header: "Completed Shifts", accessor: "completedShifts" },
    { header: "Shift Type", accessor: "shiftType" },
    { header: "Litres Sold", accessor: "totalLitresSold" },
    { header: "Total Sales", accessor: "totalSales" },
    { header: "Discrepancy", accessor: "discrepancyCount" },
    { header: "Efficiency Score", accessor: "efficiency" },
    { header: "Target Progress", accessor: "targetProgress" },
    { header: "Monthly Target", accessor: "monthlyTarget" },
  ];

  const handleExport = () => {
    const exportData = staffPerformance?.staff || [];
    exportToExcel(exportData, columns, "StaffPerformance");
  };

  // Loading state
  if (loading && !staffPerformance) {
    return (
      <DashboardLayout>
        <DisplayCard>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
              <p className="text-gray-600 font-semibold">Loading staff performance...</p>
            </div>
          </div>
        </DisplayCard>
      </DashboardLayout>
    );
  }

  // Error state
  if (error && !staffPerformance) {
    return (
      <DashboardLayout>
        <DisplayCard>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center bg-red-50 p-6 rounded-lg">
              <p className="text-red-600 font-semibold">Error loading staff performance</p>
              <p className="text-red-500 mt-2">{error}</p>
              <button
                onClick={() => fetchStaffPerformance({ page: 1, limit: 10 })}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </DisplayCard>
      </DashboardLayout>
    );
  }

  const summary = staffPerformance?.summary || {};
  const staff = staffPerformance?.staff || [];

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
            variable={summary.activeStaff || "0/0"}
          />

          <FlashCard
            name="Total Sales"
            period="Today"
            icon="₦"
            variable={`₦${summary.totalSales?.toLocaleString() || 0}`}
          />
          
          <FlashCard
            name="Average Efficiency"
            icon={<TbTargetArrow />}
            variable={`${summary.averageEfficiency || 0}%`}
          />
          
          <FlashCard
            name="Top Performer"
            period={summary.topPerformer?.message || "No data"}
            icon={<TrendingUp />}
            variable={summary.topPerformer?.name || "N/A"}
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
              className="cursor-pointer flex items-center gap-2 py-2 px-6 rounded-[14px] bg-[#0080ff] text-white"
              onClick={handleExport}
            >
              Export
              <Download />
            </button>
          </header>

          {showFilter && (
            <Filter
              title="Customize Filter"
              filterConfig={filterConfig}
              currentFilters={{}}
              onApplyFilter={handleApplyFilter}
              handleClose={() => setShowFilter(false)}
            />
          )}

          {/* Staff Performance Cards */}
          <div className="mt-2 flex flex-col gap-4">
            {staff.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No staff performance data available
              </div>
            ) : (
              staff.map((item) => (
                <StaffPerformanceCard
                  key={item._id}
                  staffId={item._id}
                  imgName={item.image || "/default-avatar.png"}
                  name={item.name}
                  role={item.role}
                  completedShifts={`${item.completedShifts || 0}`}
                  targetTrend={`${item.targetProgress || 0}%`}
                  shiftType={item.shiftType}
                  ltrsSold={item.totalLitresSold?.toLocaleString() || 0}
                  totalSales={`₦${item.totalSales?.toLocaleString() || 0}`}
                  discrepancy={item.discrepancyCount || 0}
                  customerRating="N/A"
                  errorCount="N/A"
                  efficiencyScore={`${item.efficiency || 0}%`}
                  isLoading={false}
                />
              ))
            )}
            
            {/* Show skeleton cards while loading */}
            {loading && staff.length === 0 && (
              <>
                {[1, 2, 3].map((i) => (
                  <StaffPerformanceCard
                    key={`skeleton-${i}`}
                    staffId=""
                    imgName="/default-avatar.png"
                    name="Loading..."
                    role="Loading..."
                    completedShifts="0"
                    targetTrend="0%"
                    shiftType="Loading..."
                    ltrsSold="0"
                    totalSales="₦0"
                    discrepancy={0}
                    customerRating="N/A"
                    errorCount="N/A"
                    efficiencyScore="0%"
                    isLoading={true}
                  />
                ))}
              </>
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || loading}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              
              <span className="px-4 py-2">
                Page {pagination.page} of {pagination.pages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                disabled={currentPage === pagination.pages || loading}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}

          {/* Loading overlay for pagination */}
          {loading && staffPerformance && (
            <div className="mt-4 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
            </div>
          )}
        </DisplayCard>
      </div>
    </DashboardLayout>
  );
}