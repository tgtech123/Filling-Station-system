import { X } from "lucide-react";

export default function AddLubricantModal({ onclose }) {
  return (
    // overlay
    <div className="fixed px-4 lg:px-0 inset-0  z-50 flex items-center justify-center bg-black/50">
      {/* modal box */}
      <div className="bg-white border-2 rounded-lg w-full max-w-[400px]  lg:max-w-[700px] p-3 max-h-[80vh] scrollbar-hide overflow-y-auto">
        <div className="mt-2 mb-4 flex justify-end" onClick={onclose}>
          <X className="cursor-pointer" />
        </div>

        <div className="mb-4">
          <h4 className="font-semibold text-lg">Add Lubricant</h4>
          <p>Add more lubricant to your inventory</p>
        </div>

        <form className="flex flex-col gap-2 w-full">
          <div className="flex gap-2 flex-col lg:flex-row w-full">
            <div className="flex-1">
              <p className="text-sm font-semibold">
                Product Name <span className="text-red-600">*</span>
              </p>
              <input
                type="text"
                className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
                placeholder="Title"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Generic Name</p>
              <input
                type="text"
                className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
                placeholder="E.g Dave"
              />
            </div>
          </div>

          <div className="flex gap-2 flex-col lg:flex-row w-full">
            <div className="flex-1">
              <p className="text-sm font-semibold">Company</p>
              <input
                type="text"
                className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
                placeholder="E.g Dave Company"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">
                Category <span className="text-red-600">*</span>
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
              <p className="text-sm font-semibold">Bar code</p>
              <input
                type="text"
                className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
                placeholder="E.g 233458"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">
                Unit Qty in Stock <span className="text-red-600">*</span>
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
                Re-order level<span className="text-red-600">*</span>
              </p>
              <input
                type="text"
                className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
                placeholder="E.g 233458"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">
                Unit Quantity <span className="text-red-600">*</span>
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
              <p className="text-sm font-semibold">Unit cost <span className="text-red-600">*</span></p>
              <input
                type="text"
                className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
                placeholder="E.g 233458"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">
                Unit price <span className="text-red-600">*</span>
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
            className="mt-6 flex justify-center p-2 bg-blue-600 hover:bg-blue-400 text-white font-semibold rounded-md"
          >
            Add Lubricant
          </button>
        </form>
      </div>
    </div>
  );
}
