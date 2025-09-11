import Table from '@/components/Table'
import React from 'react'
import TableHere from '.@/components/TableHere'
import cashData from './cashTableData'
import SearchBar from '@/hooks/SearchBar'
const CashRecord = () => {
  return (
    <div className='bg-white rounded-2xl mt-[1.5rem] flex flex-col  p-[1rem]'>
        <div className='lg:flex flex-wrap w-full lg:gap-0 gap-4 justify-between mb-[1.25rem]'>
            <p className='flex flex-col'>
                <span className='font-semibold text-[1.2rem] text-neutral-800'>Cash Reconciliation Records</span>
                <span className='text-[0.9rem]'>Monitor reconciliation activities</span>
            </p>

            {/* the search bar here */}
            <span className='lg:mt-0 mt-[1rem]'>
                <SearchBar />
            </span>
        </div>

        {/* the table here */}
        <div className=''>
            <TableHere columns={cashData.colHeader} data={cashData.body}/>
        </div>
    </div>
  )
}

export default CashRecord