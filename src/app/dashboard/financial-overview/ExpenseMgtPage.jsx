import TableWithoutBorder from '@/components/TableWithoutBorder'
import React from 'react'
import { tableHeaders, tableRows } from './expenseMgtData'

const ExpenseMgtPage = () => {
  return (
    <div className='bg-white p-5  rounded-2xl'>
        <div className='mb-[1.5rem]'>
            <h1 className='text-[1.375rem] font-semibold leading-[134%] text-neutral-800'>Expense Management</h1>
            <p className='text-[1rem] text-neutral-800 leading-[150%]'>Track, add and export expense reports</p>
        </div>

        <TableWithoutBorder columns={tableHeaders} data={tableRows} />
    </div>
  )
}

export default ExpenseMgtPage