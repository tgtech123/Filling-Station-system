'use client'
import React, { useState } from 'react'
import TableWithoutBorder from '@/components/TableWithoutBorder'
import SearchBar from '@/hooks/SearchBar'
import DurationButton from './DurationButton'
import { columnsData, rowsData } from './expensesData'

const ExpensePage = () => {
  const [appliedFilters, setAppliedFilters] = useState({})
  const [searchQuery, setSearchQuery] = useState("")

  const filteredData = rowsData.filter((row) => {
    const expenseId = row[1].toString().toLowerCase()   // Expense ID
    const category = row[2].toLowerCase()               // Category
                                // Status

    // ✅ Search by Expense ID or Category
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!expenseId.includes(query) && !category.includes(query)) {
        return false
      }
    }

    // ✅ Category filter
    if (appliedFilters.category?.length && !appliedFilters.category.includes(row[2])) {
      return false
    }

    // ✅ Submitted By filter
    if (appliedFilters.submittedBy?.length) {
      const role = submittedBy.split("-").pop().trim()
      if (!appliedFilters.submittedBy.includes(role)) {
        return false
      }
    }

    // ✅ Status filter
    if (appliedFilters.status?.length && !appliedFilters.status.includes(status)) {
      return false
    }

    return true
  })

  return (
    <div className='bg-white rounded-xl p-4 mt-4'>
      {/* search and buttons here */}
      <div className='flex justify-between'>
        <span className='mt-1'>
          <SearchBar
            placeholder="Search by Expense ID/Category"
            onChange={ setSearchQuery }
          />
        </span>

        {/* Duration + Filter + Export */}
        <span>
          <DurationButton onApplyFilter={setAppliedFilters} />
        </span>
      </div>

      {/* Table */}
      <div className='mt-5'>
        <TableWithoutBorder columns={columnsData} data={filteredData} />
      </div>
    </div>
  )
}

export default ExpensePage
