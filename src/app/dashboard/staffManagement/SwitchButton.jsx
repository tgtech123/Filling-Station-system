    'use client'
import SearchBar from '@/hooks/SearchBar';
import React, { useState } from 'react'
import { LuHouse } from "react-icons/lu";
import DirectoryCard from './DirectoryCard';
import ShiftManagement from './ShiftManagement';
import StaffCommision from './StaffCommision';


const SwitchButton = () => {
    const [isActive, setIsActive] = useState("pageOne")
      const [searchQuery, setSearchQuery] =useState("")

  return (
    <div className=''>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-[2rem] mx-4'>
            {/* Tab switcher */}
            <div className='bg-white w-full sm:w-auto min-w-0 flex items-center gap-1 sm:gap-2 p-1.5 rounded-[14px] shadow-xs border-2 border-[#e7e7e7] overflow-x-auto scrollbar-hide'>

                <div id='pageOne' onClick={() => setIsActive("pageOne")} className={`flex items-center whitespace-nowrap flex-shrink-0 px-3 py-2 gap-1.5 ${isActive === "pageOne" ? "bg-[#d9edff] text-[#1a71f6]" : "bg-white text-neutral-400"} font-semibold text-sm cursor-pointer rounded-lg transition-colors`}>
                    <LuHouse size={16}/>
                    <span>Staff Directory</span>
                </div>
                <div id='pageTwo' onClick={() => setIsActive("pageTwo")} className={`flex items-center whitespace-nowrap flex-shrink-0 px-3 py-2 gap-1.5 ${isActive === "pageTwo" ? "bg-[#d9edff] text-[#1a71f6]" : "bg-white text-neutral-400"} font-semibold text-sm cursor-pointer rounded-lg transition-colors`}>
                    <LuHouse size={16}/>
                    <span>Shift Management</span>
                </div>
                <div id='pageThree' onClick={() => setIsActive("pageThree")} className={`flex items-center whitespace-nowrap flex-shrink-0 px-3 py-2 gap-1.5 ${isActive === "pageThree" ? "bg-[#d9edff] text-[#1a71f6]" : "bg-white text-neutral-400"} font-semibold text-sm cursor-pointer rounded-lg transition-colors`}>
                    <LuHouse size={16}/>
                    <span>Staff Commission</span>
                </div>

            </div>

            {/* Search bar — only on Staff Directory tab */}
            {isActive === "pageOne" && (
                <div className='flex-shrink-0'>
                    <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder='Search by name or role'
                    />
                </div>
            )}
        </div>

        {isActive === "pageOne" && (
            <div>
               <DirectoryCard searchQuery={searchQuery}/>
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