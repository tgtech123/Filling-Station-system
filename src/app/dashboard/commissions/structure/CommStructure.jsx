import React from 'react'
import Table from '@/components/TableTwo'
import {commissionColumns, commissionData} from './CommissionData'
import  TableTwo  from '@/components/TableTwo'
import BonusStructure from './BonusStructure'


const CommStructure = () => {
  return (
    <div>
        <div className='p-6 bg-white rounded-2xl  '>
            <div>
                <h1 className='text-2xl text-neutral-800 font-bold'>Commission Structure</h1>
                <p className='text-[19px] text-neutral-800'>Staff commission rate by roles</p>
            </div>
            <TableTwo columns={commissionColumns} data={commissionData}/>
            
        </div>

        <BonusStructure/>

    </div>
  )
}

export default CommStructure