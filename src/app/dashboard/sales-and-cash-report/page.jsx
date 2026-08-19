import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from "lucide-react";
import SalesReportMan from './SalesReportMan'
import PageBackBar from "@/components/Dashboard/PageBackBar";

const page = () => {
  return (
    <div className='bg-neutral-100 dark:bg-gray-950 min-h-screen'>
      <div className="px-4 lg:px-[40px] pt-4"><PageBackBar /></div>
      <header className="px-4 lg:px-10 py-4 mb-6 bg-white dark:bg-gray-900 shadow-sm flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center">
          <h4 className="text-lg sm:text-xl font-semibold dark:text-white">Sales and Cash Report</h4>
        </div>
      </header>
      <SalesReportMan />
    </div>
  )
}

export default page