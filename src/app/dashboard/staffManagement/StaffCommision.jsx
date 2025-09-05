import React from 'react'
import TableWithoutBorder from '@/components/TableWithoutBorder'
import { commissionStructure, bonusStructure } from './commissionBonusData'
import { FiEdit } from "react-icons/fi";


const StaffCommision = () => {
  return (

    <div>
            {/* the commission structure table here */}
        <div className='mt-4 bg-white rounded-2xl p-5 '>
            <div className='flex justify-between'>
                <span className='flex flex-col sm:flex-row lg:flex-col gap-1.5'>
                    <h1 className='text-xl font-semibold text-neutral-800'>Commission Structure</h1>
                    <h3 className='font-normal text-neutral-800 mb-4'>Staff commission rate by roles</h3>
                </span>

                <FiEdit className='text-blue-600 cursor-pointer ' size={28} />

            </div>
            <TableWithoutBorder columns={commissionStructure.headers} data={commissionStructure.bodyRows}/>
        </div>

            {/* the bonus structure table here */}
        <div className='mt-4 bg-white rounded-2xl p-5 '>
            <div className='flex justify-between'>
                <span className='flex flex-col sm:flex-row lg:flex-col mb-4 '>
                    <h1 className='text-xl font-semibold text-neutral-800'>Bonus Structure</h1>

                </span>

                 <FiEdit className='text-blue-600 cursor-pointer ' size={28} />

            </div>
            <TableWithoutBorder columns={bonusStructure.headers} data={bonusStructure.rowsBody}/>
        </div>
    </div>
  )
}

export default StaffCommision