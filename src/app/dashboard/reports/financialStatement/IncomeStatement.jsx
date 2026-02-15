import { useState, useEffect } from "react";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import Table from "./Table";
import { ArrowDownUp, X } from "lucide-react";
import useAccountantStore from "@/store/useAccountantStore";

export default function IncomeStatement({ showFilter, onCloseFilter }) {
  const {
    incomeStatement,
    loading,
    errors,
    fetchIncomeStatement,
  } = useAccountantStore();

  // Date state for filters
  const [currentPeriod, setCurrentPeriod] = useState({
    startDate: "",
    endDate: "",
  });
  const [previousPeriod, setPreviousPeriod] = useState({
    startDate: "",
    endDate: "",
  });

  // Fetch initial data (current month)
  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const startDate = firstDay.toISOString().split('T')[0];
    const endDate = lastDay.toISOString().split('T')[0];

    setCurrentPeriod({ startDate, endDate });
    fetchIncomeStatement(startDate, endDate);
  }, [fetchIncomeStatement]);

  // Handle filter save
  const handleFilterSave = () => {
    if (currentPeriod.startDate && currentPeriod.endDate) {
      if (previousPeriod.startDate && previousPeriod.endDate) {
        // Fetch with comparison
        fetchIncomeStatement(
          currentPeriod.startDate,
          currentPeriod.endDate,
          previousPeriod.startDate,
          previousPeriod.endDate
        );
      } else {
        // Fetch without comparison
        fetchIncomeStatement(currentPeriod.startDate, currentPeriod.endDate);
      }
      onCloseFilter?.();
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    if (!value && value !== 0) return "0.00";
    return Number(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Format date for display
  const formatDateDisplay = (startDate, endDate) => {
    if (!startDate || !endDate) return "";
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", 
                        "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    
    return `${monthNames[start.getMonth()]} ${start.getFullYear()}`;
  };

  // Calculate percentage change
  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return "N/A";
    const change = ((current - previous) / previous) * 100;
    return `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
  };

  // Prepare Revenue data (as arrays for Table component)
  const getRevenueData = () => {
    if (!incomeStatement?.revenue) return { rows: [], columns: [] };

    const data = incomeStatement.revenue;
    const hasComparison = incomeStatement.comparison?.revenue;

    // Always show all 4 columns
    const columns = ["Description", "Current Period", "Previous Period", "Variance"];

    const rows = [
      [
        "PMS Sales", 
        `₦${formatCurrency(data.pmsSales)}`, 
        hasComparison ? `₦${formatCurrency(incomeStatement.comparison.revenue.pmsSales)}` : "₦0.00",
        hasComparison ? calculateChange(data.pmsSales, incomeStatement.comparison.revenue.pmsSales) : "N/A"
      ],
      [
        "AGO Sales", 
        `₦${formatCurrency(data.agoSales)}`, 
        hasComparison ? `₦${formatCurrency(incomeStatement.comparison.revenue.agoSales)}` : "₦0.00",
        hasComparison ? calculateChange(data.agoSales, incomeStatement.comparison.revenue.agoSales) : "N/A"
      ],
      [
        "DPK Sales", 
        `₦${formatCurrency(data.dpkSales)}`, 
        hasComparison ? `₦${formatCurrency(incomeStatement.comparison.revenue.dpkSales)}` : "₦0.00",
        hasComparison ? calculateChange(data.dpkSales, incomeStatement.comparison.revenue.dpkSales) : "N/A"
      ],
      [
        "Total Revenue", 
        `₦${formatCurrency(data.totalRevenue)}`, 
        hasComparison ? `₦${formatCurrency(incomeStatement.comparison.revenue.totalRevenue)}` : "₦0.00",
        hasComparison ? calculateChange(data.totalRevenue, incomeStatement.comparison.revenue.totalRevenue) : "N/A"
      ],
    ];

    return { rows, columns };
  };

  // Prepare COGS data
  const getCOGSData = () => {
    if (!incomeStatement?.costOfGoodsSold) return { rows: [], columns: [] };

    const data = incomeStatement.costOfGoodsSold;
    const hasComparison = incomeStatement.comparison?.costOfGoodsSold;

    // Always show all 4 columns
    const columns = ["Description", "Current Period", "Total COG", "Gross Profit"];

    const rows = [
      [
        "Opening Stock", 
        `₦${formatCurrency(data.openingStock)}`, 
        hasComparison ? `₦${formatCurrency(incomeStatement.comparison.costOfGoodsSold.openingStock)}` : "₦0.00",
        hasComparison ? calculateChange(data.openingStock, incomeStatement.comparison.costOfGoodsSold.openingStock) : "N/A"
      ],
      [
        "Purchases", 
        `₦${formatCurrency(data.purchases)}`, 
        hasComparison ? `₦${formatCurrency(incomeStatement.comparison.costOfGoodsSold.purchases)}` : "₦0.00",
        hasComparison ? calculateChange(data.purchases, incomeStatement.comparison.costOfGoodsSold.purchases) : "N/A"
      ],
      [
        "Closing Stock", 
        `₦${formatCurrency(data.closingStock)}`, 
        hasComparison ? `₦${formatCurrency(incomeStatement.comparison.costOfGoodsSold.closingStock)}` : "₦0.00",
        hasComparison ? calculateChange(data.closingStock, incomeStatement.comparison.costOfGoodsSold.closingStock) : "N/A"
      ],
      [
        "Total COGS", 
        `₦${formatCurrency(data.totalCOGS)}`, 
        hasComparison ? `₦${formatCurrency(incomeStatement.comparison.costOfGoodsSold.totalCOGS)}` : "₦0.00",
        hasComparison ? calculateChange(data.totalCOGS, incomeStatement.comparison.costOfGoodsSold.totalCOGS) : "N/A"
      ],
    ];

    return { rows, columns };
  };

  // Prepare Operating Expenses data
  const getOperatingExpensesData = () => {
    if (!incomeStatement?.operatingExpenses) return { rows: [], columns: [] };

    const data = incomeStatement.operatingExpenses;
    const hasComparison = incomeStatement.comparison?.operatingExpenses;

    // Always show all 4 columns
    const columns = ["Description", "Current Period", "Previous Period", "Variance"];

    const rows = [
      [
        "Salaries & Wages", 
        `₦${formatCurrency(data.salariesAndWages)}`, 
        hasComparison ? `₦${formatCurrency(incomeStatement.comparison.operatingExpenses.salariesAndWages)}` : "₦0.00",
        hasComparison ? calculateChange(data.salariesAndWages, incomeStatement.comparison.operatingExpenses.salariesAndWages) : "N/A"
      ],
      [
        "Utilities", 
        `₦${formatCurrency(data.utilities)}`, 
        hasComparison ? `₦${formatCurrency(incomeStatement.comparison.operatingExpenses.utilities)}` : "₦0.00",
        hasComparison ? calculateChange(data.utilities, incomeStatement.comparison.operatingExpenses.utilities) : "N/A"
      ],
      [
        "Maintenance", 
        `₦${formatCurrency(data.maintenance)}`, 
        hasComparison ? `₦${formatCurrency(incomeStatement.comparison.operatingExpenses.maintenance)}` : "₦0.00",
        hasComparison ? calculateChange(data.maintenance, incomeStatement.comparison.operatingExpenses.maintenance) : "N/A"
      ],
      [
        "Total Operating Expenses", 
        `₦${formatCurrency(data.totalOperatingExpenses)}`, 
        hasComparison ? `₦${formatCurrency(incomeStatement.comparison.operatingExpenses.totalOperatingExpenses)}` : "₦0.00",
        hasComparison ? calculateChange(data.totalOperatingExpenses, incomeStatement.comparison.operatingExpenses.totalOperatingExpenses) : "N/A"
      ],
      [
        "Gross Profit", 
        `₦${formatCurrency(incomeStatement.grossProfit)}`, 
        hasComparison ? `₦${formatCurrency(incomeStatement.comparison.grossProfit)}` : "₦0.00",
        hasComparison ? calculateChange(incomeStatement.grossProfit, incomeStatement.comparison.grossProfit) : "N/A"
      ],
      [
        "Net Profit", 
        `₦${formatCurrency(incomeStatement.netProfit)}`, 
        hasComparison ? `₦${formatCurrency(incomeStatement.comparison.netProfit)}` : "₦0.00",
        hasComparison ? calculateChange(incomeStatement.netProfit, incomeStatement.comparison.netProfit) : "N/A"
      ],
    ];

    return { rows, columns };
  };

  const revenueData = getRevenueData();
  const cogsData = getCOGSData();
  const opExpensesData = getOperatingExpensesData();

  // Loading state
  if (loading.incomeStatement && !incomeStatement) {
    return (
      <DisplayCard>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-sm text-gray-600">Loading income statement...</p>
          </div>
        </div>
      </DisplayCard>
    );
  }

  // Error state
  if (errors.incomeStatement) {
    return (
      <DisplayCard>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {errors.incomeStatement}</p>
          <button
            onClick={() => {
              if (currentPeriod.startDate && currentPeriod.endDate) {
                fetchIncomeStatement(currentPeriod.startDate, currentPeriod.endDate);
              }
            }}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </DisplayCard>
    );
  }

  // Empty state
  if (!incomeStatement) {
    return (
      <DisplayCard>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">No income statement data available</p>
        </div>
      </DisplayCard>
    );
  }

  return (
    <DisplayCard>
      <h4 className="text-gray-600 text-xl font-semibold">
        {formatDateDisplay(currentPeriod.startDate, currentPeriod.endDate)}
      </h4>

      <div className="border-1 border-[#e7e7e7] rounded-[10px] p-4">
        <h4 className="font-semibold mb-4 text-gray-600">REVENUE</h4>
        <Table
          data={revenueData.rows}
          columns={revenueData.columns}
          highlightedRowIndices={[3]}
        />
      </div>

      <div className="border-1 border-[#e7e7e7] rounded-[10px] p-4">
        <h4 className="font-semibold mb-4 text-gray-600">COST OF GOODS SOLD</h4>
        <Table
          data={cogsData.rows}
          columns={cogsData.columns}
          highlightedRowIndices={[2, 3]}
        />
      </div>

      <div className="border-1 border-[#e7e7e7] rounded-[10px] p-4">
        <h4 className="font-semibold mb-4 text-gray-600">OPERATING EXPENSES</h4>
        <Table
          data={opExpensesData.rows}
          columns={opExpensesData.columns}
          highlightedRowIndices={[3, 4, 5]}
        />
      </div>

      {showFilter && (
        <div className="fixed inset-0 flex items-center justify-center p-6 z-50 bg-black/30">
          <div className="bg-white flex flex-col rounded-xl p-6 w-full sm:overflow-y-auto max-w-[400px] shadow-xl text-gray-600">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Select Period</h3>
              <button onClick={onCloseFilter} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="font-semibold text-md mb-2">Current Period</p>
                <div className="flex gap-2">
                  <input
                    type="date"
                    className="p-2 border-2 border-[#e7e7e7] rounded-[8px] w-full"
                    value={currentPeriod.startDate}
                    onChange={(e) =>
                      setCurrentPeriod({ ...currentPeriod, startDate: e.target.value })
                    }
                    placeholder="Start Date"
                  />
                  <input
                    type="date"
                    className="p-2 border-2 border-[#e7e7e7] rounded-[8px] w-full"
                    value={currentPeriod.endDate}
                    onChange={(e) =>
                      setCurrentPeriod({ ...currentPeriod, endDate: e.target.value })
                    }
                    placeholder="End Date"
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowDownUp className="text-gray-400" />
              </div>

              <div>
                <p className="font-semibold text-md mb-2">Previous Period (Optional)</p>
                <div className="flex gap-2">
                  <input
                    type="date"
                    className="p-2 border-2 border-[#e7e7e7] rounded-[8px] w-full"
                    value={previousPeriod.startDate}
                    onChange={(e) =>
                      setPreviousPeriod({ ...previousPeriod, startDate: e.target.value })
                    }
                    placeholder="Start Date"
                  />
                  <input
                    type="date"
                    className="p-2 border-2 border-[#e7e7e7] rounded-[8px] w-full"
                    value={previousPeriod.endDate}
                    onChange={(e) =>
                      setPreviousPeriod({ ...previousPeriod, endDate: e.target.value })
                    }
                    placeholder="End Date"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleFilterSave}
              disabled={!currentPeriod.startDate || !currentPeriod.endDate || loading.incomeStatement}
              className="mt-6 cursor-pointer p-2 bg-[#0080ff] text-white rounded-[8px] disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading.incomeStatement ? "Loading..." : "Apply Filter"}
            </button>
          </div>
        </div>
      )}
    </DisplayCard>
  );
}



// import DisplayCard from "@/components/Dashboard/DisplayCard";
// import {
//   IncomeStatementDataColumns,
//   IncomeStatementDataRows,
//   COGDataColumns,
//   COGDataRows,
//   OperatingExpensesDataColumns,
//   OperatingExpensesDataRows
// } from "./financeData";
// // import Table from "@/components/Table";
// import Table from "./Table";
// import { ArrowDownUp } from "lucide-react";


// export default function IncomeStatement({showFilter, setShowFilter}) {
    
//   return (
//     <DisplayCard>
//       <h4 className="text-gray-600 text-xl font-semibold">JUNE 2025</h4>

//       <div className="border-1 border-[#e7e7e7] rounded-[10px] p-4">
//         <h4 className="font-semibold mb-4 text-gray-600">REVENUE</h4>
//         <Table
//           data={IncomeStatementDataRows}
//           columns={IncomeStatementDataColumns}
//           highlightedRowIndices={[3]}
//         />
//       </div>

//       <div className="border-1 border-[#e7e7e7] rounded-[10px] p-4">
//         <h4 className="font-semibold mb-4 text-gray-600">COST OF GOODS SOLD</h4>
//         <Table data={COGDataRows} columns={COGDataColumns} highlightedRowIndices={[2,3]} />
//       </div>

//       <div className="border-1 border-[#e7e7e7] rounded-[10px] p-4">
//         <h4 className="font-semibold mb-4 text-gray-600">OPERATING EXPENSES</h4>
//         <Table data={OperatingExpensesDataRows} columns={OperatingExpensesDataColumns} highlightedRowIndices={[3, 4, 5]} />
//       </div>

//       {showFilter && (
//         <div className="fixed inset-0 flex items-center justify-center p-6 z-50 bg-black/30">
//             <div className="bg-white flex flex-col rounded-xl p-6 w-full sm:overflow-y-auto max-w-[400px] shadow-xl text-gray-600">
//                 <div>
//                     <p className="font-semibold text-md">Current Period</p>
//                     <input 
//                         type="date" 
//                         className="p-2 border-2 border-[#e7e7e7] rounded-[8px] w-full"
//                         placeholder="Select Period"
//                     />
//                 </div>
//                 <div className="my-2 flex justify-center">
//                     <ArrowDownUp />
//                 </div>
//                 <div>
//                     <p className="font-semibold text-md">Previous Period</p>
//                     <input 
//                         type="date" 
//                         className="p-2 border-2 border-[#e7e7e7] rounded-[8px] w-full"
//                         placeholder="Select Period"
//                     />
//                 </div>
//                 <button onClick={()=> setShowFilter(false)} className="mt-4 cursor-pointer p-2 bg-[#0080ff] hover:bg-blue-800 hover:text-[1rem] text-white rounded-[8px]">Save</button>
//             </div>
//         </div>
//       )}
//     </DisplayCard>
//   );
// }
