// import React from 'react'
// import { bonusColumns, bonusData } from './BonusData'
// import TableTwo from '@/components/TableTwo'


// const BonusStructure = () => {
//   return (
//     <div className='rounded-2xl bg-white p-6 mt-5 text-neutral-800 '>
//         <div>
//             <h1 className='text-2xl font-bold'>Bonus structure</h1>
//             <TableTwo columns={bonusColumns} data={bonusData}/>
//         </div>
//     </div> 
//   )
// }

// export default BonusStructure

'use client'
import React, { useEffect, useState } from 'react'
import TableTwo from '@/components/TableTwo'
import useCommissionStore from '@/store/useCommissionStore'

const BonusStructure = () => {
  const [bonusTableData, setBonusTableData] = useState([]);
  
  const { 
    bonusStructure, 
    loading, 
    errors, 
    fetchBonusStructure 
  } = useCommissionStore();

  const bonusColumns = [
    { header: "Achievements", accessor: "achievements" },
    { header: "Bonus amount", accessor: "bonusAmount" },
    { header: "Frequency", accessor: "frequency" },
  ];

  useEffect(() => {
    fetchBonusStructure();
  }, [fetchBonusStructure]);

  useEffect(() => {
    if (bonusStructure && bonusStructure.length > 0) {
      const transformedData = bonusStructure.map(bonus => ({
        achievements: bonus.achievement || bonus.name || 'N/A',
        bonusAmount: bonus.amount ? `₦${bonus.amount.toLocaleString('en-US')}` : '₦0',
        frequency: bonus.frequency || 'N/A',
      }));

      setBonusTableData(transformedData);
    } else {
      setBonusTableData([]);
    }
  }, [bonusStructure]);

  return (
    <div className='rounded-2xl bg-white p-6 mt-5 text-neutral-800'>
      <div>
        <h1 className='text-2xl font-bold'>Bonus structure</h1>
        
        {loading.bonusStructure ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-gray-500">Loading bonus structure...</div>
          </div>
        ) : errors.bonusStructure ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
            <p className="text-red-800">Error: {errors.bonusStructure}</p>
            <button
              onClick={() => fetchBonusStructure()}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : bonusTableData.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-gray-500">No bonus structure data available</div>
          </div>
        ) : (
          <TableTwo columns={bonusColumns} data={bonusTableData} />
        )}
      </div>
    </div>
  )
}

export default BonusStructure