import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from "lucide-react";
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
      </header>
      <SalesReportMan />
    </div>
  )
}

export default page