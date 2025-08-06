import React from 'react'
import Table from '@/components/Table'
import { salesColumns, salesDataRows } from './SalesTable'

const LubSales = () => {
  return (
    <div className='bg-white p-4 flex flex-col gap-8 text-neutral-800'>
        <div className='mb-2 flex flex-col gap-3'>
            <h1 className='text-3xl font-bold'>Lubricant Sales</h1>
            <p className='text-xl font-medium'>Record , print and export all sales receipt</p>
        </div>

        <Table columns={salesColumns}   />
    </div>
  )
}

export default LubSales