'use client'
import React, { useEffect, useState } from 'react'
import TableTwo from '@/components/TableTwo'
import useCommissionStore from '@/store/useCommissionStore'

const bonusColumns = [
  { header: "Achievement",  accessor: "achievement"  },
  { header: "Bonus Amount", accessor: "bonusAmount"  },
  { header: "Frequency",    accessor: "frequency"    },
]

const BonusStructure = () => {
  const [bonusTableData, setBonusTableData] = useState([])

  const { bonusStructure, loading, errors, fetchBonusStructure } = useCommissionStore()

  useEffect(() => {
    fetchBonusStructure()
  }, [fetchBonusStructure])

  useEffect(() => {
    if (bonusStructure?.length > 0) {
      setBonusTableData(
        bonusStructure.map(b => ({
          achievement: b.achievement ?? 'N/A',
          bonusAmount: b.bonusAmount != null
            ? `₦${Number(b.bonusAmount).toLocaleString('en-US')}`
            : '₦0',
          frequency: b.frequency ?? 'N/A',
        }))
      )
    } else {
      setBonusTableData([])
    }
  }, [bonusStructure])

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 mt-5">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-neutral-800 dark:text-gray-100">
          Bonus Structure
        </h1>
        <p className="text-[17px] text-neutral-500 dark:text-gray-400">
          Bonus amounts per achievement — set by the manager
        </p>
      </div>

      {loading.bonusStructure ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3" />
          <span className="text-gray-500 dark:text-gray-400">Loading bonus structure…</span>
        </div>
      ) : errors.bonusStructure ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4 mt-4">
          <p className="text-red-700 dark:text-red-400 text-sm">{errors.bonusStructure}</p>
          <button
            onClick={fetchBonusStructure}
            className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg"
          >
            Retry
          </button>
        </div>
      ) : bonusTableData.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-500 text-sm">
          No bonus structure configured yet
        </div>
      ) : (
        <TableTwo columns={bonusColumns} data={bonusTableData} />
      )}
    </div>
  )
}

export default BonusStructure
