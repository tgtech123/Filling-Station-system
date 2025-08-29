'use client'
import React, { useState, useMemo } from 'react'
import TableWithoutBorder from '@/components/TableWithoutBorder'
import SearchBar from '@/hooks/SearchBar'
import DurationButton from './DurationButton'
import { columnsData, rowsData } from './expensesData'

const ExpensePage = () => {
  const [appliedFilters, setAppliedFilters] = useState({})
  const [searchQuery, setSearchQuery] = useState("")

  // ✅ Use useMemo to ensure filtering happens on every search change
  const filteredData = useMemo(() => {
    let result = [...rowsData] // Create a copy to avoid mutating original data

    // 🔍 Live search by Expense ID (index 1) and Category (index 2)
    if (searchQuery.trim()) {
      const lowerSearch = searchQuery.trim().toLowerCase()
      
      result = result.filter((row) => {
        const expenseId = (row[1] || "").toString().toLowerCase()
        const category = (row[2] || "").toString().toLowerCase()
        
        return expenseId.includes(lowerSearch) || category.includes(lowerSearch)
      })
    }

    // ✅ Category filter (index 2)
    if (appliedFilters.category?.length) {
      result = result.filter((row) => {
        const category = (row[2] || "").toString().toLowerCase()
        return appliedFilters.category.map(x => x.toLowerCase()).includes(category)
      })
    }

    // ✅ Expense ID filter (index 1)
    if (appliedFilters.expenseId?.length) {
      result = result.filter((row) => {
        const expenseId = (row[1] || "").toString().toLowerCase()
        return appliedFilters.expenseId.map(x => x.toLowerCase()).includes(expenseId)
      })
    }

    return result
  }, [searchQuery, appliedFilters, rowsData]) // ✅ Include all dependencies

  // ✅ Handle search change - this should trigger immediately
  const handleSearchChange = (newValue) => {
    setSearchQuery(newValue)
  }

  return (
    <div className="bg-white rounded-xl p-4 mt-4">
      {/* 🔍 Search & Actions */}
      <div className="flex justify-between flex-col md:flex-row gap-3">
        <span className="w-full md:w-1/2">
          <SearchBar
            value={searchQuery}
            placeholder="Search by Expense ID or Category"
            onChange={handleSearchChange}
          />
        </span>

        {/* Duration + Filter */}
        <span>
          <DurationButton onApplyFilter={setAppliedFilters} />
        </span>
      </div>

      {/* 📊 Table */}
      <div className="mt-5">
        {filteredData.length > 0 ? (
          <TableWithoutBorder columns={columnsData} data={filteredData} />
        ) : (
          <div className="text-center text-gray-500 py-4">
            {searchQuery ? "No match found" : "No records found"}
          </div>
        )}
      </div>
    </div>
  )
}

export default ExpensePage