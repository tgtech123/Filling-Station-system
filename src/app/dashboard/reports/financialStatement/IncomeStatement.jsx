import DisplayCard from "@/components/Dashboard/DisplayCard";
import {
  IncomeStatementDataColumns,
  IncomeStatementDataRows,
  COGDataColumns,
  COGDataRows,
  OperatingExpensesDataColumns,
  OperatingExpensesDataRows
} from "./financeData";
import Table from "@/components/Table";
import { ArrowDownUp } from "lucide-react";


export default function IncomeStatement({showFilter}) {
    
  return (
    <DisplayCard>
      <h4 className="text-gray-600 text-xl font-semibold">JUNE 2025</h4>

      <div className="border-1 border-[#e7e7e7] rounded-[10px] p-4">
        <h4 className="font-semibold mb-4 text-gray-600">REVENUE</h4>
        <Table
          data={IncomeStatementDataRows}
          columns={IncomeStatementDataColumns}
        />
      </div>

      <div className="border-1 border-[#e7e7e7] rounded-[10px] p-4">
        <h4 className="font-semibold mb-4 text-gray-600">COST OF GOODS SOLD</h4>
        <Table data={COGDataRows} columns={COGDataColumns} />
      </div>

      <div className="border-1 border-[#e7e7e7] rounded-[10px] p-4">
        <h4 className="font-semibold mb-4 text-gray-600">OPERATING EXPENSES</h4>
        <Table data={OperatingExpensesDataRows} columns={OperatingExpensesDataColumns} />
      </div>

      {showFilter && (
        <div className="fixed inset-0 flex items-center justify-center p-6 z-50 bg-black/30">
            <div className="bg-white flex flex-col rounded-xl p-6 w-full sm:overflow-y-auto max-w-[400px] shadow-xl text-gray-600">
                <div>
                    <p className="font-semibold text-md">Current Period</p>
                    <input 
                        type="date" 
                        className="p-2 border-2 border-[#e7e7e7] rounded-[8px] w-full"
                        placeholder="Select Period"
                    />
                </div>
                <div className="my-2 flex justify-center">
                    <ArrowDownUp />
                </div>
                <div>
                    <p className="font-semibold text-md">Previous Period</p>
                    <input 
                        type="date" 
                        className="p-2 border-2 border-[#e7e7e7] rounded-[8px] w-full"
                        placeholder="Select Period"
                    />
                </div>
                <button className="mt-4 cursor-pointer p-2 bg-[#0080ff] text-white rounded-[8px]">Save</button>
            </div>
        </div>
      )}
    </DisplayCard>
  );
}
