export default function DurationModal() {
    return (
         <div className="absolute z-50 top-50 right-20 lg:right-20 lg:top-72 bg-white border-2 rounded-lg w-fit p-3">
                  <div className="flex gap-2">
                    <input
                      type="date"
                      placeholder="From"
                      className="flex-1 px-2 py-2 rounded-md border border-neutral-300 outline-none"
                    />
                    <input
                      type="date"
                      placeholder="To"
                      className="flex-1 px-2 py-2 rounded-md border border-neutral-300 outline-none"
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

                    <span className='flex hover:bg-blue-400 justify-center cursor-pointer p-2 bg-blue-600 text-white font-semibold rounded-md'>
                      <button className='flex place-items-center'>Save</button>
                    </span>

                </div>
    )
}