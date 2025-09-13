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
        <div className='flex-wrap lg:flex justify-between mt-[2rem] '>
            <div className='bg-white lg:w-[30.188rem]  lg:h-[3.0625rem] w-full h-[1.2rem]  items-center justify-center flex gap-2 lg:gap-4 text-[12px] lg:text-medium  rounded-[14px] shadow-xs border-2 border-[#e7e7e7]'>

                <div id='pageOne' onClick={() => setIsActive("pageOne")} className={`flex items-center py-1.5 justify-center  lg:px-2 gap-2  ${isActive === "pageOne" ? "bg-[#d9edff]  text-[#1a71f6]" : "bg-white text-neutral-200"} font-medium cursor-pointer rounded-lg`  }>
                    <LuHouse size={26}/> 
                    <h1 className='font-semibold lg:text-[0.75rem] '>Staff Directory</h1>
                </div>
                <div id='pageTwo' onClick={() => setIsActive("pageTwo")} className={`flex items-center lg:px-2 py-1.5 gap-2 ${isActive === "pageTwo" ? "bg-[#d9edff] text-[#1a71f6]" : "bg-white text-neutral-200"} font-medium cursor-pointer rounded-lg`  }>
                    <LuHouse size={26}/>  
                    <h1 className='font-semibold'>Shift Management</h1>
                </div>
                <div id='pageThree' onClick={() => setIsActive("pageThree")} className={`flex items-center py-1.5 lg:px-2 gap-2 ${isActive === "pageThree" ? "bg-[#d9edff] text-[#1a71f6]" : "bg-white text-neutral-200"} font-medium cursor-pointer rounded-lg`  }>
                    <LuHouse size={26}/> 
                    <h1 className='font-semibold'>Staff Commission</h1>
                </div>

                {/* the search button here */}
            </div>
                <div className='lg:mt-0 mt-[2rem]'>
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