import React from "react";
import Table from "@/components/Table";
import { fuelDataColumns, fuelDataRows } from "./fuelData";
import { lubricantDataColumns, lubricantDataRows } from "./lubricantData";

const FuelIncome = () => {
  return (
    <div className="bg-white rounded-xl p-6 mt-4 grid grid-cols-1 gap-6 ">
      <div className="flex flex-col gap-5">
        <h1 className="text-xl font-semibold text-neutral-800 ">JUNE, 2025</h1>
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
        <h1 className="text-md text-gray-900 font-bold">Report Summary </h1>
        <textarea
          placeholder="Masukkan Kata Sandi"
          className="w-full p-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </span>
    </div>
  );
};

export default FuelIncome;
