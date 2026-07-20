import { X } from "lucide-react";

export default function DurationModal({ onClose }) {
    return (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center sm:items-center sm:justify-end px-4 pt-20 sm:pt-0 sm:pr-20 sm:pb-0"
          onClick={onClose}
        >
          <div
            className="bg-white border-2 rounded-lg w-full max-w-xs p-3 lg:mt-72"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end mb-1">
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <X size={18} className="text-gray-400" />
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="date"
                placeholder="From"
                className="flex-1 min-w-0 px-2 py-2 rounded-md border border-neutral-300 outline-none"
              />
              <input
                type="date"
                placeholder="To"
                className="flex-1 min-w-0 px-2 py-2 rounded-md border border-neutral-300 outline-none"
              />
            </div>
            <hr className='border-[1px] mt-2' />

            <div className='flex flex-col gap-2 mt-3'>
              <button className='flex place-items-start border-2 border-neutral-200 hover:bg-blue-600 hover:text-white font-semibold p-2 rounded-lg hover:shadow-md'>Today</button>
              <button className='flex place-items-start border-2 border-neutral-200 hover:bg-blue-600 hover:text-white font-semibold p-2 rounded-lg hover:shadow-md'>This week</button>
              <button className='flex place-items-start border-2 border-neutral-200 hover:bg-blue-600 hover:text-white font-semibold p-2 rounded-lg hover:shadow-md'>This month</button>
              <button className='flex place-items-start border-2 border-neutral-200 hover:bg-blue-600 hover:text-white font-semibold p-2 rounded-lg hover:shadow-md'>This quarter</button>
            </div>
            <hr className='border-[1px] mt-2' />

            <span onClick={onClose} className='flex hover:bg-blue-400 justify-center cursor-pointer p-2 mt-2 bg-blue-600 text-white font-semibold rounded-md'>
              <button className='flex place-items-center'>Save</button>
            </span>

          </div>
        </div>
    )
}
