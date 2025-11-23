"use client";
import React, { useState, useEffect } from "react";
import TableWithoutBorder from "@/components/TableWithoutBorder";
import SearchBar from "@/hooks/SearchBar";
import DurationButton from "./DurationButton";
import { columnsData } from "./expensesData";
import Pagination from "@/components/Pagination";
import { useExpenseStore } from "@/store/expenseStore";

const ExpensePage = () => {
  const { expenses, fetchExpenses, updateExpense, loading } = useExpenseStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  // Fetch expenses on mount
  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Refetch when window gains focus (after modal closes)
  useEffect(() => {
    const handleFocus = () => {
      fetchExpenses();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchExpenses]);

  // Sort expenses by date (newest first - top to bottom)
  const sortedExpenses = [...expenses].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return dateB - dateA; // Descending order (newest first)
  });

  // Transform expenses to table rows format
  const rowsData = sortedExpenses.map((expense) => {
    // Handle submittedBy - can be string or object
    let submittedBy = 'N/A';
    if (typeof expense.submittedBy === 'string') {
      submittedBy = expense.submittedBy;
    } else if (expense.submittedBy && typeof expense.submittedBy === 'object') {
      submittedBy = `${expense.submittedBy.firstName} ${expense.submittedBy.lastName} - ${expense.submittedBy.role || "Staff"}`;
    }

    return [
      expense.date || 'N/A',
      expense.expId || 'N/A',
      expense.category,
      expense.description,
      `₦${parseFloat(expense.amount).toLocaleString()}`,
      submittedBy,
      expense.status === 'Approved' ? 'Approved ✓' : 
      expense.status === 'Rejected' ? 'Rejected ✗' : 
      'Pending ⏳',
      expense._id // Add expense ID to the row for updating
    ];
  });

  // Handle approve/reject from table
  const handleApprove = async (row) => {
    const expenseId = row[row.length - 1]; // Last item is the _id
    try {
      await updateExpense(expenseId, { status: 'Approved' });
      await fetchExpenses(); // Refetch to show updated data
    } catch (error) {
      console.error('Error approving expense:', error);
      alert('Failed to approve expense');
    }
  };

  const handleReject = async (row) => {
    const expenseId = row[row.length - 1]; // Last item is the _id
    const reason = prompt('Enter rejection reason (optional):');
    try {
      await updateExpense(expenseId, { 
        status: 'Rejected',
        rejectionReason: reason || 'No reason provided'
      });
      await fetchExpenses(); // Refetch to show updated data
    } catch (error) {
      console.error('Error rejecting expense:', error);
      alert('Failed to reject expense');
    }
  };

  // ✅ filter only EXP_ID & Category (using index-based access)
  const filteredData = rowsData.filter((item) => {
    if (!searchTerm) return true;

    const lowerSearch = searchTerm.trim().toLowerCase();
    const EXP_ID = String(item[1] || "").toLowerCase(); // index 1 = EXP_ID
    const Category = String(item[2] || "").toLowerCase(); // index 2 = Category

    return EXP_ID.includes(lowerSearch) || Category.includes(lowerSearch);
  });

  // Remove the _id from rows before displaying (it's only for updating)
  const displayData = filteredData.map(row => row.slice(0, -1));

  // ✅ reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalItems = displayData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = displayData.slice(startIndex, endIndex);
  const currentDataWithIds = filteredData.slice(startIndex, endIndex); // Keep IDs for modal

  return (
    <div className="bg-white rounded-xl p-4 mt-4">
      {/* 🔍 Search & Actions */}
      <div className="flex justify-between flex-row gap-2">
        <span className="w-full">
          <SearchBar
            value={searchTerm}
            placeholder="Search by Expense ID/Category"
            onChange={setSearchTerm}
          />
        </span>

        {/* Duration + Filter */}
        <span>
          <DurationButton />
        </span>
      </div>

      {/* 📊 Table */}
      <div className="mt-5">
        {loading.expenses ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : currentData.length > 0 ? (
          <TableWithoutBorder
            key={currentPage + searchTerm}
            columns={columnsData}
            data={currentData}
            dataWithIds={currentDataWithIds}
            enableStatus={true}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ) : (
          <div className="text-center text-gray-500 py-4">
            {searchTerm ? "No match found" : expenses.length === 0 ? "No expenses yet. Add your first expense!" : "No match found"}
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
};

export default ExpensePage;