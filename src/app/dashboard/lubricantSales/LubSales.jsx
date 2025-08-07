import React from 'react'
import { X } from 'lucide-react'
import DynamicSalesTable from './DynamicSalesTable'

const LubSales = () => {
  return (
    <div className="bg-white p-4 sm:p-6 md:p-8 flex flex-col rounded-xl gap-8 text-neutral-800 w-full">
      {/* Header */}
      <div className="mb-2 flex flex-col text-neutral-800 gap-2 sm:gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold">Lubricant Sales</h1>
        <p className="text-lg sm:text-xl font-medium">Record, print and export all sales receipt</p>
      </div>

      {/* Responsive Table */}
      <div className="w-full overflow-x-auto rounded-lg border border-gray-100 pb-4">
        <table className="min-w-[700px] text-sm text-left text-gray-700 w-full">
          <thead className="bg-gray-100 text-md font-semibold text-gray-700">
            <tr>
              <th className="px-4 py-3">Barcode</th>
              <th className="px-4 py-3">Product name</th>
              <th className="px-4 py-3">Unit price (₦)</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr className="text-sm">
              <td className="px-5 py-2">
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl mt-2"
                />
              </td>
              <td className="px-5 py-2">
                <input
                  type="text"
                  disabled
                  className="w-full px-3 py-2 border border-neutral-300 bg-neutral-100 rounded-xl mt-2"
                />
              </td>
              <td className="px-5 py-2">
                <input
                  type="text"
                  disabled
                  className="w-full px-3 py-2 border border-neutral-300 bg-neutral-100 rounded-xl mt-2"
                />
              </td>
              <td className="px-5 py-2">
                <input
                  type="number"
                  inputMode='numeric'
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl mt-2"
                />
              </td>
              <td className="px-4 py-2">
                <input
                  type="text"
                  disabled
                  className="w-full px-3 py-2 border border-neutral-300 bg-neutral-100 rounded-xl mt-2"
                />
              </td>
              <td className="px-4 py-2">
                <div className="flex items-center gap-1 text-red-500 font-semibold cursor-pointer hover:text-red-400 mt-2">
                  Delete <X size={16} />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Dynamic Table */}
      <DynamicSalesTable />
    </div>
  )
}

export default LubSales
