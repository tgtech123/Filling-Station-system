import TableWithoutBorder from '@/components/TableWithoutBorder'
import React from 'react'
import { header, rows } from './profitMarginData'

const ProfitMargins = () => {
  return (
    <div className='bg-white rounded-2xl p-6'>
        <div className='mb-[1.5rem]'>
            <h1 className='text-[1.375rem] font-semibold'>Profit Margin Analysis</h1>
            <h4 className='text-[1rem] leading-[150%]'>Profit margins by product cost and revenue</h4>
        </div>

        <span>
            <TableWithoutBorder columns={header} data={rows} />
        </span>

    </div>
  )
}

export default ProfitMargins