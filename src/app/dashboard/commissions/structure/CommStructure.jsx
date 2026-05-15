'use client'
import React, { useEffect, useState } from 'react'
import TableTwo from '@/components/TableTwo'
import BonusStructure from './BonusStructure'
import useCommissionStore from '@/store/useCommissionStore'

const commissionColumns = [
  { header: "Role",        accessor: "role"     },
  { header: "Base Rate %", accessor: "baseRate" },
  { header: "Tier 1",      accessor: "tier1"    },
  { header: "Tier 2",      accessor: "tier2"    },
]

const CommStructure = () => {
  const [commissionTableData, setCommissionTableData] = useState([])

  const { commissionStructure, loading, errors, fetchCommissionStructure } = useCommissionStore()

  useEffect(() => {
    fetchCommissionStructure()
  }, [fetchCommissionStructure])

  useEffect(() => {
    if (commissionStructure?.length > 0) {
      setCommissionTableData(
        commissionStructure.map(s => ({
          role:     s.role     ?? 'N/A',
          baseRate: s.baseRate != null ? `${s.baseRate}%` : '-',
          tier1:    s.tier1    != null ? `${s.tier1}%`    : '-',
          tier2:    s.tier2    != null ? `${s.tier2}%`    : '-',
        }))
      )
    } else {
      setCommissionTableData([])
    }
  }, [commissionStructure])

  return (
    <div>
      <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-neutral-800 dark:text-gray-100">
            Commission Structure
          </h1>
          <p className="text-[17px] text-neutral-500 dark:text-gray-400">
            Staff commission rate by roles — set by the manager
          </p>
        </div>

        {loading.commissionStructure ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3" />
            <span className="text-gray-500 dark:text-gray-400">Loading commission structure…</span>
          </div>
        ) : errors.commissionStructure ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4 mt-4">
            <p className="text-red-700 dark:text-red-400 text-sm">{errors.commissionStructure}</p>
            <button
              onClick={fetchCommissionStructure}
              className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg"
            >
              Retry
            </button>
          </div>
        ) : commissionTableData.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-500 text-sm">
            No commission structure configured yet
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
