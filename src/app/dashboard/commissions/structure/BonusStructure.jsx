import React from 'react'
import { bonusColumns, bonusData } from './BonusData'
import TableTwo from '@/components/TableTwo'


const BonusStructure = () => {
  return (
    <div className='rounded-2xl bg-white p-6 mt-5 text-neutral-800 '>
        <div>
            <h1 className='text-2xl font-bold'>Bonus structure</h1>
            <TableTwo columns={bonusColumns} data={bonusData}/>
        </div>
    </div>
  )
}

export default BonusStructure