import React from 'react'
import Link from 'next/link'
import { X, ArrowLeft, Wrench, Plus } from "lucide-react";
import SalesReportMan from './SalesReportMan'

const page = () => {
  return (
         <div className='bg-neutral-100'>

            <header className="px-4 lg:px-[40px] mb-10 bg-white shadow-sm h-[170px] lg:h-[90px] flex flex-col lg:flex-row gap-4 lg:gap-0 items-center justify-center lg:justify-between">
              <div className=" mt-2 lg:mt-0 flex flex-col lg:flex-row gap-0 lg:gap-4 items-center">
                <Link href="/dashboard" className="cursor-pointer border-2 flex  gap-2  lg:border-[#0080ff]  py-2 px-4 rounded-[12px] text-[#0080ff] font-semibold">
                  <ArrowLeft />
                  Back to Dashboard
                </Link>
                <h4 className="text-xl font-semibold">Sales and Cash report</h4>
              </div>
              <div className="flex gap-2 items-center">
                <button 
              //   onClick={() => setShowEmergencyModal(true)} 
                className="text-sm lg:text-md cursor-pointer border-3 flex gap-2 items-center border-[#f00] hover:bg-[#f00] hover:text-white py-2 px-6 rounded-[12px] text-[#f00]">
                  Emergency Stop All
                  <div className="border-2 text-sm border-[#f00] rounded=[14px]"><X size={16} className="text-[#f00]" /></div>
                </button>
                <button
                  // onClick={() => setShowMaintenanceModal(true)}
                  className="cursor-pointer text-sm lg:text-md flex gap-2 bg-[#0080ff] text-white py-3 px-6 rounded-[12px] font-semibold"
                >
                  Schedule Maintenance
                  <Wrench size={18} />
                </button>
              </div>
          </header>

            <SalesReportMan/>
        </div>

    
  )
}

export default page