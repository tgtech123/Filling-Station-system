"use client"
import React, { useState } from 'react'
import { ArrowLeft, Plus } from "lucide-react";
import Link from 'next/link';
import StaffManagement from './StaffManagement'
import NewStaffModal from './NewStaffModal';

const Page = () => {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <>
      <div>
        <header className="px-4 lg:px-[40px] fixed w-full inset-0 z-50 bg-white shadow-sm h-[170px] lg:h-[90px] flex flex-col lg:flex-row gap-4 lg:gap-0 items-center justify-center lg:justify-between">
          <div className="mt-2 lg:mt-0 flex flex-col lg:flex-row gap-0 lg:gap-4 items-center">
            <Link
              href="/dashboard"
              className="cursor-pointer border-2 flex gap-2 lg:border-[#0080ff] py-2 px-4 rounded-[12px] text-[#0080ff] font-semibold"
            >
              <ArrowLeft />
              Back to Dashboard
            </Link>
            <h4 className="text-[1.5rem] text-[#2A2A2A] font-semibold">Staff Management</h4>
          </div>
          
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setIsOpen(true)}
              className="cursor-pointer text-sm lg:text-[0.875rem] flex gap-2 justify-center items-center border-[2px] border-[#1A71F6] text-[#1A71F6] py-2 w-[11.0625rem] h-[3rem] rounded-xl font-bold"
            >
              Add New Staff
              <Plus size={23} />
            </button>
          </div>
        </header>

        <StaffManagement/>
      </div>

      {/* Modal rendered outside main container */}
      {isOpen && (
        <NewStaffModal 
          isOpen={isOpen} 
          onClose={() => setIsOpen(false)} 
        />
      )}
    </>
  )
}

export default Page