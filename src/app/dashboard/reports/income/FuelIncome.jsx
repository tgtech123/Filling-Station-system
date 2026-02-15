'use client'
import React, { useEffect } from "react";
import Table from "@/components/Table";
import { fuelDataColumns, getFuelDataRows } from "./fuelData";
import { lubricantDataColumns, getLubricantDataRows } from "./lubricantData";
import useAccountantStore from "@/store/useAccountantStore";

const FuelIncome = ({ duration = 'thismonth' }) => {
  const { incomeReport, loading, errors, fetchIncomeReport } = useAccountantStore();

  useEffect(() => {
    fetchIncomeReport(duration);
  }, [fetchIncomeReport, duration]);

  // Get current period
  const getCurrentPeriod = () => {
    if (!incomeReport) {
      const now = new Date();
      return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
    }
    const now = new Date();
    return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
  };

  // Get data rows from helper functions
  const fuelDataRows = getFuelDataRows(incomeReport);
  const lubricantDataRows = getLubricantDataRows(incomeReport);

  // Loading state
  if (loading.incomeReport && !incomeReport) {
    return (
      <div className="bg-white rounded-xl p-6 mt-4">
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-sm text-gray-600">Loading income report...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (errors.incomeReport) {
    return (
      <div className="bg-white rounded-xl p-6 mt-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {errors.incomeReport}</p>
          <button
            onClick={() => fetchIncomeReport(duration)}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 mt-4 grid grid-cols-1 gap-6">
      <div className="flex flex-col gap-5">
        <h1 className="text-xl font-semibold text-neutral-800">{getCurrentPeriod()}</h1>
        <span className="flex flex-col gap-5 border-[1px] border-neutral-100 p-2 rounded-xl">
          <p className="text-md font-medium text-neutral-600">
            Fuel Income Report
          </p>
          <Table columns={fuelDataColumns} data={fuelDataRows} />
        </span>
      </div>

      <div className="flex flex-col gap-5 border-[1px] border-neutral-100 p-2 rounded-xl">
        <h1 className="text-md text-neutral-600 font-semibold mt-2">
          Lubricant Income Report
        </h1>
        <Table columns={lubricantDataColumns} data={lubricantDataRows} />
      </div>

      <span>
        <h1 className="text-md text-gray-900 font-bold">Report Summary</h1>
        <textarea
          placeholder="Add notes or summary about the income report..."
          className="w-full p-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[100px]"
        />
      </span>
    </div>
  );
};

export default FuelIncome;

// import React from "react";
// import Table from "@/components/Table";
// import { fuelDataColumns, fuelDataRows } from "./fuelData";
// import { lubricantDataColumns, lubricantDataRows } from "./lubricantData";
 
// const FuelIncome = () => {
//   return (
//     <div className="bg-white rounded-xl p-6 mt-4 grid grid-cols-1 gap-6 ">
//       <div className="flex flex-col gap-5">
//         <h1 className="text-xl font-semibold text-neutral-800 ">JUNE, 2025</h1>
//         <span className="flex flex-col gap-5 border-[1px] border-neutral-100 p-2 rounded-xl">
//           <p className="text-md font-medium text-neutral-600">
//             Fuel Income Report
//           </p>
//           <Table columns={fuelDataColumns} data={fuelDataRows} />
//         </span>
//       </div>

//       <div className="flex flex-col gap-5 border-[1px] border-neutral-100 p-2 rounded-xl">
//         <h1 className="text-md text-neutral-600 font-semibold mt-2">
//           Lubricant Income Report
//         </h1>

//         <Table columns={lubricantDataColumns} data={lubricantDataRows} />
//       </div>

//       <span>
//         <h1 className="text-md text-gray-900 font-bold">Report Summary </h1>
//         <textarea
//           placeholder="Masukkan Kata Sandi"
//           className="w-full p-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
//         />
//       </span>
//     </div>
//   );
// };

// export default FuelIncome;
