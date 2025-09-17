import { X } from "lucide-react";

export default function AddLubricantModal({ onclose }) {
  return (
    // overlay
    <div className="fixed px-4 lg:px-0 inset-0  z-50 flex items-center justify-center bg-black/50">
      {/* modal box */}
      <div className="bg-white border-2 rounded-lg w-full max-w-[400px]  lg:max-w-[500px] p-3 lg:p-6 max-h-[80vh] scrollbar-hide overflow-y-auto">
        <div className="mt-2 mb-4 flex justify-end" onClick={onclose}>
          <X className="cursor-pointer" />
        </div>

        <div className="mb-4">
          <h4 className="font-semibold text-lg">Add Lubricant</h4>
          <p>Add new lubricant to stock</p>
        </div>

        <form className="flex flex-col gap-2 w-full">
          <div className="flex gap-2 flex-col lg:flex-row w-full">
            <div className="flex-1">
              <p className="text-sm font-semibold">
                Barcode
              </p>
              <input
                type="text"
                className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
                placeholder="code"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Product name</p>
              <input
                type="text"
                className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
                placeholder="e.g AGO"
              />
            </div>
          </div>

          <div className="flex gap-2 flex-col lg:flex-row w-full">
            <div className="flex-1">
              <p className="text-sm font-semibold">Category</p>
              <input
                type="text"
                className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
                placeholder="category"
              />
            </div>
           <div className="flex-1">
              <p className="text-sm font-semibold">
                Unit Qty in Stock
              </p>
              <input
                type="text"
                className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
                placeholder="E.g 10000"
              />
            </div>
          </div>


          <div className="flex gap-2 flex-col lg:flex-row w-full">
            <div className="flex-1">
              <p className="text-sm font-semibold">
                Re-order level
              </p>
              <input
                type="text"
                className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
                placeholder="E.g 233458"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">
                Unit Cost
              </p>
              <input
                type="text"
                className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
                placeholder="E.g 10000"
              />
            </div>
          </div>

          <div className="flex gap-2 flex-col lg:flex-row w-full">
            <div className="flex-1">
              <p className="text-sm font-semibold">% Selling Price </p>
              <input
                type="text"
                className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
                placeholder="E.g 233458"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">
                Unit price
              </p>
              <input
                type="text"
                className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
                placeholder="E.g 10000"
              />
            </div>
          </div>

          <button
            type="button"
            className="mt-6 text-sm flex justify-center p-3 cursor-pointer bg-[#0080ff] hover:bg-blue-400 text-white font-semibold rounded-md"
          >
            Add Lubricant
          </button>
        </form>
      </div>
    </div>
  );
}
