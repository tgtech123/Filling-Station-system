import { X } from "lucide-react";

export default function AddTankModal({ onclose }) {
  return (
    // overlay
    <div className="fixed px-4 lg:px-0 inset-0 z-50 flex items-center justify-center bg-black/50">
      {/* modal box */}
      <div className="bg-white border-2 rounded-lg w-full max-w-[400px] p-3 max-h-[80vh] overflow-y-auto">
        <div className="mt-2 mb-4 flex justify-end" onClick={onclose}>
          <X className="cursor-pointer" />
        </div>

        <div className="mb-4">
          <h4 className="font-semibold text-lg">Add Fuel Tank</h4>
          <p>Add new tank to your station</p>
        </div>

        <form className="flex flex-col gap-2">
          <div>
            <p className="text-sm font-semibold">Title</p>
            <input
              type="text"
              className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
              placeholder="Title"
            />
          </div>
          <div>
            <p className="text-sm font-semibold">Fuel Type</p>
            <input
              type="text"
              className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
              placeholder="E.g Diesel"
            />
          </div>
          <div>
            <p className="text-sm font-semibold">Capped Limit (in litres)</p>
            <input
              type="text"
              className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
              placeholder="E.g 10000"
            />
          </div>
          <div className="mb-6">
            <p className="text-sm font-semibold">Threshold</p>
            <input
              type="text"
              className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
              placeholder="E.g 10000"
            />
          </div>
          <button
            type="button"
            className="flex justify-center p-2 bg-blue-600 hover:bg-blue-400 text-white font-semibold rounded-md"
          >
            Add Tank
          </button>
        </form>
      </div>
    </div>
  );
}
