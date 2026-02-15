'use client'
import React, { useEffect, useState } from 'react'
import TableTwo from '@/components/TableTwo'
import BonusStructure from './BonusStructure'
import useCommissionStore from '@/store/useCommissionStore'

const CommStructure = () => {
  const [commissionTableData, setCommissionTableData] = useState([]);
  
  const { 
    commissionStructure, 
    loading, 
    errors, 
    fetchCommissionStructure 
  } = useCommissionStore();

  const commissionColumns = [
    { header: "Role", accessor: "role" },
    { header: "Base rate %", accessor: "baseRate" },
    { header: "Tier 1", accessor: "tier1" },
    { header: "Tier 2", accessor: "tier2" },
  ];

  useEffect(() => {
    fetchCommissionStructure();
  }, [fetchCommissionStructure]);

  useEffect(() => {
    if (commissionStructure && commissionStructure.length > 0) {
      const transformedData = commissionStructure.map(structure => ({
        role: structure.role || 'N/A',
        baseRate: structure.baseRate ? `${structure.baseRate}%` : '-',
        tier1: structure.tier1Rate ? `${structure.tier1Rate}%` : '-',
        tier2: structure.tier2Rate ? `${structure.tier2Rate}%` : '-',
      }));

      setCommissionTableData(transformedData);
    } else {
      setCommissionTableData([]);
    }
  }, [commissionStructure]);

  return (
    <div>
      <div className='p-6 bg-white rounded-2xl'>
        <div>
          <h1 className='text-2xl text-neutral-800 font-bold'>Commission Structure</h1>
          <p className='text-[19px] text-neutral-800'>Staff commission rate by roles</p>
        </div>

        {loading.commissionStructure ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-gray-500">Loading commission structure...</div>
          </div>
        ) : errors.commissionStructure ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
            <p className="text-red-800">Error: {errors.commissionStructure}</p>
            <button
              onClick={() => fetchCommissionStructure()}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : commissionTableData.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-gray-500">No commission structure data available</div>
          </div>
        ) : (
          <TableTwo columns={commissionColumns} data={commissionTableData} />
        )}
      </div>

      <BonusStructure />
    </div>
  )
}

export default CommStructure

// import React from 'react'
// import Table from '@/components/TableTwo'
// import {commissionColumns, commissionData} from './CommissionData'
// import  TableTwo  from '@/components/TableTwo'
// import BonusStructure from './BonusStructure'


// const CommStructure = () => {
//   return (
//     <div>
//         <div className='p-6 bg-white rounded-2xl  '>
//             <div>
//                 <h1 className='text-2xl text-neutral-800 font-bold'>Commission Structure</h1>
//                 <p className='text-[19px] text-neutral-800'>Staff commission rate by roles</p>
//             </div>
//             <TableTwo columns={commissionColumns} data={commissionData}/>
            
//         </div>

//         <BonusStructure/>

//     </div>
//   )
// }

// export default CommStructure