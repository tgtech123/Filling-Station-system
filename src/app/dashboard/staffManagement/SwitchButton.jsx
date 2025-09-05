    'use client'
import SearchBar from '@/hooks/SearchBar';
import React, { useState } from 'react'
import { LuHouse } from "react-icons/lu";
import DirectoryCard from './DirectoryCard';
import ShiftManagement from './ShiftManagement';
import StaffCommision from './StaffCommision';


const SwitchButton = () => {
    const [isActive, setIsActive] = useState("pageOne")
  return (
    <div>
        <div className='flex justify-between'>
            <div className='bg-white w-full lg:w-fit flex flex-row gap-2 lg:gap-4 text-[12px] lg:text-medium py-1 px-4 rounded-[14px] shadow-xs border-2 border-[#e7e7e7]'>

                <div id='pageOne' onClick={() => setIsActive("pageOne")} className={`flex items-center px-4 lg:px-2 gap-2 py-1 ${isActive === "pageOne" ? "bg-[#d9edff]  text-[#1a71f6]" : "bg-white text-neutral-200"} font-medium cursor-pointer rounded-lg`  }>
                    <LuHouse size={26}/> <h1 className='font-semibold'>Staff Directory</h1>
                </div>
                <div id='pageTwo' onClick={() => setIsActive("pageTwo")} className={`flex items-center px-4 lg:px-2 gap-2 py-1 ${isActive === "pageTwo" ? "bg-[#d9edff] text-[#1a71f6]" : "bg-white text-neutral-200"} font-medium cursor-pointer rounded-lg`  }>
                    <LuHouse size={26}/>  
                    <h1 className='font-semibold'>Shift Management</h1>
                </div>
                <div id='pageThree' onClick={() => setIsActive("pageThree")} className={`flex items-center px-4 lg:px-2 gap-2 py-1 ${isActive === "pageThree" ? "bg-[#d9edff] text-[#1a71f6]" : "bg-white text-neutral-200"} font-medium cursor-pointer rounded-lg`  }>
                    <LuHouse size={26}/> 
                    <h1 className='font-semibold'>Staff Commission</h1>
                </div>

                {/* the search button here */}
            </div>
                <div className='mt-1'>
                    <SearchBar/>
                </div>
        </div>

        {isActive === "pageOne" && (
            <div>
               <DirectoryCard/>
            </div>
        )}

        {isActive === 'pageTwo' && (
                <div>
                    <ShiftManagement/>
                </div>
        )}

        {/* the staff commission button toggle */}
        {isActive === "pageThree" && (
            <div>
                <StaffCommision/>
            </div>
        )}

    </div>
  )
}

export default SwitchButton