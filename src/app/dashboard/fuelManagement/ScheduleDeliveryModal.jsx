import { X } from "lucide-react";

export default function ScheduleDeliveryModal({ onclose }) {
  return (
    <div className="fixed px-4 lg:px-0 inset-0 z-50 flex items-center justify-center bg-black/50">
      {/* modal box */}
      <div className="bg-white border-2 rounded-lg w-full max-w-[400px] p-3">
        <div className="mt-2 mb-4 flex justify-end" onClick={onclose}>
          <X className="cursor-pointer" />
        </div>

        <div className="mb-4">
          <h4 className="font-semibold text-lg">Schedule Fuel Delivery</h4>
          <p>Schedule a new fuel Delivery for your station</p>
        </div>

        <form className="flex flex-col gap-2">
          <div>
            <p className="text-sm font-semibold">Select Tank</p>
            <select className="w-full border-2 p-2 rounded-[8px] border-gray-300">
              <option>Tank A</option>
              <option>Tank B</option>
              <option>Tank E</option>
              <option>Tank C</option>
            </select>
          </div>
          <div>
            <p className="text-sm font-semibold">Fuel Type</p>
            <select className="w-full border-2 p-2 rounded-[8px] border-gray-300">
              <option>Diesel</option>
              <option>AGO</option>
              <option>PMS</option>
            </select>
          </div>
          <div>
            <p className="text-sm font-semibold">Price / litre (naira)</p>
            <input
              type="text"
              className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
              placeholder="Enter price"
            />
          </div>
          <div>
            <p className="text-sm font-semibold">Amount</p>
            <input
              type="text"
              className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
              placeholder="Amount"
            />
          </div>
          <div>
            <p className="text-sm font-semibold">Supplier</p>
            <input
              type="text"
              className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
              placeholder="Supplier name"
            />
          </div>
          <div className="mb-6">
            <p className="text-sm font-semibold">Delivery Date</p>
            <input
              type="Date"
              className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
              placeholder="Supplier name"
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
