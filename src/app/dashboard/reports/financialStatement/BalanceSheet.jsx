import { useState, useEffect } from "react";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import Table from "./Table";
import useAccountantStore from "@/store/useAccountantStore";

export default function BalanceSheet() {
  const {
    balanceSheet,
    loading,
    errors,
    fetchBalanceSheet,
  } = useAccountantStore();

  // Date state for filters
  const [dateRange, setDateRange] = useState({
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

    setDateRange({ startDate, endDate });
    fetchBalanceSheet(startDate, endDate);
  }, [fetchBalanceSheet]);

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
    if (!startDate || !endDate) return "JUNE 2025";
    const start = new Date(startDate);
    
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", 
                        "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    
    return `${monthNames[start.getMonth()]} ${start.getFullYear()}`;
  };

  // Prepare Current Assets data - Use API data if available, else show 0
  const getCurrentAssetsData = () => {
    const data = balanceSheet?.assets?.currentAssets || {};
    const columns = ["Current Assets", ""];

    const rows = [
      ["Cash and Cash Equivalent", `₦${formatCurrency(data.cashAndCashEquivalent || 0)}`],
      ["Inventory-Fuel", `₦${formatCurrency(data.inventoryFuel || 0)}`],
      ["Inventory-Lubricant", `₦${formatCurrency(data.inventoryLubricant || 0)}`],
      ["Total Current Assets", `₦${formatCurrency(data.totalCurrentAssets || 0)}`],
    ];

    return { rows, columns };
  };

  // Prepare Fixed Assets data - Use API data if available, else show 0
  const getFixedAssetsData = () => {
    const data = balanceSheet?.assets?.fixedAssets || {};
    const columns = ["Fixed Assets", ""];

    const rows = [
      ["Land & building", `₦${formatCurrency(data.landAndBuilding || 0)}`],
      ["Fuel Dispenser", `₦${formatCurrency(data.fuelDispenser || 0)}`],
      ["Other Equipments", `₦${formatCurrency(data.otherEquipment || 0)}`],
      ["Total Fixed Assets", `₦${formatCurrency(data.totalFixedAssets || 0)}`],
    ];

    return { rows, columns };
  };

  // Prepare Current Liabilities data - Use API data if available, else show 0
  const getCurrentLiabilitiesData = () => {
    const data = balanceSheet?.liabilities?.currentLiabilities || {};
    const columns = ["Current Liabilities", ""];

    const rows = [
      ["Accounts Payable", `₦${formatCurrency(data.accountsPayable || 0)}`],
      ["Accrued Expenses", `₦${formatCurrency(data.accruedExpenses || 0)}`],
      ["Tax Payable", `₦${formatCurrency(data.taxPayable || 0)}`],
      ["Total Current Liabilities", `₦${formatCurrency(data.totalCurrentLiabilities || 0)}`],
    ];

    return { rows, columns };
  };

  // Prepare Long Term Liabilities data - Use API data if available, else show 0
  const getLongTermLiabilitiesData = () => {
    const data = balanceSheet?.liabilities?.longTermLiabilities || {};
    const columns = ["Long Term Liabilities", ""];

    const rows = [
      ["Long-term loans", `₦${formatCurrency(data.longTermLoans || 0)}`],
      ["Equipment financing", `₦${formatCurrency(data.equipmentFinancing || 0)}`],
      ["", ""],
      ["Total Long Term Liabilities", `₦${formatCurrency(data.totalLongTermLiabilities || 0)}`],
    ];

    return { rows, columns };
  };

  // Prepare Equity data - Use API data if available, else show 0
  const getEquityData = () => {
    const data = balanceSheet?.equity || {};
    const columns = ["Equity", ""];

    const rows = [
      ["Owner's Capital", `₦${formatCurrency(data.ownersCapital || 0)}`],
      ["Retained Earnings", `₦${formatCurrency(data.retainedEarnings || 0)}`],
      ["Current Year Earnings", `₦${formatCurrency(data.currentYearEarnings || 0)}`],
      ["Total Equity", `₦${formatCurrency(data.totalEquity || 0)}`],
    ];

    return { rows, columns };
  };

  // Get total liabilities
  const getTotalLiabilities = () => {
    return `₦${formatCurrency(balanceSheet?.liabilities?.totalLiabilities || 0)}`;
  };

  // Get total liabilities and equity
  const getTotalLiabilitiesAndEquity = () => {
    return `₦${formatCurrency(balanceSheet?.totalLiabilitiesAndEquity || 0)}`;
  };

  const currentAssetsData = getCurrentAssetsData();
  const fixedAssetsData = getFixedAssetsData();
  const currentLiabilitiesData = getCurrentLiabilitiesData();
  const longTermLiabilitiesData = getLongTermLiabilitiesData();
  const equityData = getEquityData();

  // Loading state
  if (loading.balanceSheet && !balanceSheet) {
    return (
      <DisplayCard>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-sm text-gray-600">Loading balance sheet...</p>
          </div>
        </div>
      </DisplayCard>
    );
  }

  // Error state
  if (errors.balanceSheet) {
    return (
      <DisplayCard>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {errors.balanceSheet}</p>
          <button
            onClick={() => {
              if (dateRange.startDate && dateRange.endDate) {
                fetchBalanceSheet(dateRange.startDate, dateRange.endDate);
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

  return (
    <DisplayCard>
      <h4 className="text-gray-600 text-xl font-semibold">
        {formatDateDisplay(dateRange.startDate, dateRange.endDate)}
      </h4>

      <div className="border-1 border-[#e7e7e7] rounded-[10px] p-4">
        <h4 className="font-semibold mb-4 text-gray-600">ASSETS</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <Table
            columns={currentAssetsData.columns}
            data={currentAssetsData.rows}
            highlightedRowIndices={[3]}
          />
          <Table
            columns={fixedAssetsData.columns}
            data={fixedAssetsData.rows}
            highlightedRowIndices={[3]}
          />
        </div>
      </div>

      <div className="border-1 border-[#e7e7e7] rounded-[10px] p-4">
        <h4 className="font-semibold mb-4 text-gray-600">LIABILITY & EQUITY</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <Table
            columns={currentLiabilitiesData.columns}
            data={currentLiabilitiesData.rows}
            highlightedRowIndices={[3]}
          />
          <Table
            columns={longTermLiabilitiesData.columns}
            data={longTermLiabilitiesData.rows}
            highlightedRowIndices={[3]}
          />
        </div>
        
        <div className="mt-2 py-3 grid grid-cols-2 px-3 bg-gray-100 w-full">
          <p className="text-gray-600 font-semibold text-sm">TOTAL LIABILITIES</p>
          <p className="text-gray-600 font-semibold text-sm">
            {getTotalLiabilities()}
          </p>
        </div>

        <Table 
          data={equityData.rows} 
          columns={equityData.columns}
          highlightedRowIndices={[3]}
        />
        
        <div className="mt-2 py-3 grid grid-cols-2 px-3 bg-gray-100 w-full">
          <p className="text-gray-600 font-semibold text-sm">TOTAL LIABILITIES & EQUITY</p>
          <p className="text-gray-600 font-semibold text-sm">
            {getTotalLiabilitiesAndEquity()}
          </p>
        </div>
      </div>
    </DisplayCard>
  );
}


// import DisplayCard from "@/components/Dashboard/DisplayCard";
// import Table from "./Table";
// import {
//   AssetDataRows,
//   AssetDataColumn,
//   FixedAssetDataColumn,
//   FixedAssetDataRows,
//   CurrentLiabilitiesDataColumn,
//   CurrentLiabilitiesDataRows,
//   LongLiabilitiesDataColumn,
//   LongLiabilitiesDataRows,
//   EquityDataColumn,
//   EquityDataRows
// } from "./financeData";

// export default function BalanceSheet() {
//   return (
//     <DisplayCard>
//       <h4 className="text-gray-600 text-xl font-semibold">JUNE 2025</h4>

//       <div className="border-1 border-[#e7e7e7] rounded-[10px] p-4">
//         <h4 className="font-semibold mb-4 text-gray-600">ASSETS</h4>
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
//           <Table
//             columns={AssetDataColumn}
//             data={AssetDataRows}
//             highlightedRowIndices={[3]}
//           />
//           <Table
//             columns={FixedAssetDataColumn}
//             data={FixedAssetDataRows}
//             highlightedRowIndices={[3]}
//           />
//         </div>
//       </div>

//       <div className="border-1 border-[#e7e7e7] rounded-[10px] p-4">
//         <h4 className="font-semibold mb-4 text-gray-600">LIABILITY & EQUITY</h4>
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
//           <Table
//             columns={CurrentLiabilitiesDataColumn}
//             data={CurrentLiabilitiesDataRows}
//             highlightedRowIndices={[3]}
//           />
//           <Table
//             columns={LongLiabilitiesDataColumn}
//             data={LongLiabilitiesDataRows}
//             highlightedRowIndices={[3]}
//           />
//         </div>
//           <div className="mt-2 py-3 grid grid-cols-2 px-3 bg-gray-100 w-full">
//             <p className="text-gray-600 font-semibold text-sm">TOTAL LIABILITIES</p>
//             <p className="text-gray-600 font-semibold text-sm">₦120,000,000</p>
//           </div>

//           <Table data={EquityDataRows} columns={EquityDataColumn} />
//           <div className="mt-2 py-3 grid grid-cols-2 px-3 bg-gray-100 w-full">
//             <p className="text-gray-600 font-semibold text-sm">TOTAL LIABILITIES & EQUITY</p>
//             <p className="text-gray-600 font-semibold text-sm">₦120,000,000</p>
//           </div>

//       </div>
//     </DisplayCard>
//   );
// }
