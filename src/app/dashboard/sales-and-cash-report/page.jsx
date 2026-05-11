import React from 'react'
import Link from 'next/link'
import { X, ArrowLeft, Wrench, Plus } from "lucide-react";
import SalesReportMan from './SalesReportMan'

const page = () => {
  return (
         <div className='bg-neutral-100 dark:bg-gray-950 min-h-screen'>

            <header className="px-4 lg:px-10 py-4 mb-6 bg-white dark:bg-gray-900 shadow-sm flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center">
                <Link href="/dashboard" className="cursor-pointer flex gap-2 items-center border-2 border-[#0080ff] py-2 px-4 rounded-xl text-[#0080ff] font-semibold text-sm w-fit">
                  <ArrowLeft size={18} />
                  Back
                </Link>
                <h4 className="text-lg sm:text-xl font-semibold dark:text-white">Sales and Cash Report</h4>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <button className="text-sm cursor-pointer flex gap-2 items-center border-2 border-red-500 hover:bg-red-500 hover:text-white py-2 px-4 rounded-xl text-red-500 transition-colors">
                  Emergency Stop All
                  <X size={16} />
                </button>
                <button className="cursor-pointer text-sm flex gap-2 items-center bg-[#0080ff] hover:bg-blue-700 text-white py-2 px-4 rounded-xl font-semibold transition-colors">
                  Schedule Maintenance
                  <Wrench size={16} />
                </button>
              </div>
          </header>

            <SalesReportMan/>
        </div>

    
  )
}

export default page