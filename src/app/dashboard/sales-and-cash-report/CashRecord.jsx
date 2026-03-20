'use client'
import Table from '@/components/Table'
import React, { useState } from 'react'
import { Search } from 'lucide-react'
import TableHere from '@/components/TableHere'
import cashData from './cashTableData'

const CashRecord = () => {
const [searchQuery, setSearchQuery] = useState("")

 const filteredQuery = cashData.body.filter((item) => {
    const attendantName = item[1]?.toLowerCase()
    const productName = item[3]?.toLowerCase()
    const query = searchQuery.toLowerCase()

    return attendantName.includes(query) || productName.includes(query)
 })

  return (
    <div className='bg-white rounded-2xl mt-[1.5rem] flex flex-col  p-[1rem]'>
        <div className='lg:flex flex-wrap w-full lg:gap-0 gap-4 justify-between mb-[1.25rem]'>
            <p className='flex flex-col'>
                <span className='font-semibold text-[1.2rem] text-neutral-800'>Cash Reconciliation Records</span>
                <span className='text-[0.9rem]'>Monitor reconciliation activities</span>
            </p>

            {/* the search bar here */}

            <div className="relative flex items-center  lg:mt-0 mt-[1rem]">
                <input
                type="text"
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder='Search by Attendant or Product '
                className="w-[20.718rem] h-[2.325rem] pl-10 text-gray-700 text-sm border-2 border-neutral-300 rounded-lg focus:border-2 focus:border-blue-500 focus:outline-none"
                />
                <Search size={26} className="absolute ml-2 mt-6 -translate-y-1/2 text-gray-400" />
            
            </div>
           
        </div>

        {/* the table here */}
        <div className=''>
            <TableHere columns={cashData.colHeader} data={filteredQuery}/>
        </div>
    </div>
  )
}

export default CashRecord