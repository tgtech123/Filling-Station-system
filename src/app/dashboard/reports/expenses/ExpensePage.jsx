import TableWithoutBorder from '@/components/TableWithoutBorder'
import React from 'react'
import { columnsData, rowsData } from './expensesData'

const ExpensePage = () => {
  return (
    <div className='bg-white rounded-xl p-3 mt-4'>
        {/* search and buttons here */}
        <div>
            <h1>search and buttons here</h1>
        </div>

        <div>
            <TableWithoutBorder columns={columnsData} data={rowsData}/>
        </div>

    </div>
  )
}

export default ExpensePage