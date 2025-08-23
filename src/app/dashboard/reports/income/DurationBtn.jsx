    'use client'
import React, { useState } from 'react'
import { HiChevronDown, HiChevronUp } from "react-icons/hi2";
import { FiDownload } from "react-icons/fi";



const DurationBtn = () => {
    const [toggleIsChevron, setToggleIsChevron] = useState(false)

    const handleToggleChevron = () =>{
        setToggleIsChevron(!toggleIsChevron)
    }
  return (
    
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
           {/* Duration Dropdown */}
            <div
                   onClick={handleToggleChevron}
                    className="relative flex justify-between items-center gap-3 px-4 py-2 text-neutral-600 font-bold border-2 border-neutral-300 rounded-xl cursor-pointer"
                  >
                    Duration
                    {toggleIsChevron ? 
                      <HiChevronUp className="text-neutral-600" size={24} />
                     : 
                      <HiChevronDown className="text-neutral-600" size={24} />
                    }
        
                    {toggleIsChevron && (
                      <div className="flex flex-col w-56 sm:w-64 bg-white absolute top-12 left-0 shadow-lg rounded-xl border border-neutral-200 z-20">
                        {/* From & To */}
                        <div className="flex flex-col sm:flex-row justify-between p-2 gap-3">
                          <button className="flex-1 flex justify-between items-center px-4 py-2 border-[1.5px] rounded-lg font-medium">
                            From
                            <HiChevronDown className="text-neutral-600" size={20} />
                          </button>
                          <button className="flex-1 flex justify-between items-center px-4 py-2 border-[1.5px] rounded-lg font-medium">
                            To
                            <HiChevronDown className="text-neutral-600" size={20} />
                          </button>
                        </div>
        
                        <hr className="my-2 mx-2 border-t border-neutral-100" />
        
                        {/* Quick Select */}
                        <div className="flex flex-col gap-2 font-light px-2 mb-3">
                          {["Today", "This week", "This month", "This quarter"].map(
                            (label) => (
                              <span
                                key={label}
                                className="w-full text-left px-2 border border-neutral-200 hover:bg-blue-600 hover:text-white py-1 rounded-lg font-medium cursor-pointer"
                              >
                                {label}
                              </span>
                            )
                          )}
                        </div>
        
                        <hr className="my-2 mx-2 border-t border-neutral-100" />
        
                        <button onClick={() => setToggleIsChevron(false)} className="w-[90%] mx-auto py-2 bg-[#0080FF] hover:bg-blue-700 text-center text-white font-semibold mb-3 rounded-lg">
                          Save
                        </button>
                      </div>
                    )}
            </div>
        
                  {/* Export Button */}
            <button
                    
                    className="px-4 py-2 flex justify-center items-center gap-2 font-bold bg-[#0080FF] text-white rounded-lg hover:bg-blue-700"
                  >
                    Export <FiDownload size={20} />
            </button>
        </div>
    
  )
}

export default DurationBtn