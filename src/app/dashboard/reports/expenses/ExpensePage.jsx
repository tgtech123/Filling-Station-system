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
  const [searchTerm,  setSearchTerm]  = useState("");
  const itemsPerPage = 10;

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  useEffect(() => {
    const onFocus = () => fetchExpenses();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchExpenses]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const rowsData = [...expenses]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((expense) => {
      let submittedBy = "N/A";
      if (typeof expense.submittedBy === "string") {
        submittedBy = expense.submittedBy;
      } else if (expense.submittedBy && typeof expense.submittedBy === "object") {
        submittedBy = `${expense.submittedBy.firstName} ${expense.submittedBy.lastName}`;
      }
      return [
        expense.date || "N/A",
        expense.expId || "N/A",
        expense.category,
        expense.description,
        `₦${parseFloat(expense.amount).toLocaleString()}`,
        submittedBy,
        expense.status === "Approved" ? "Approved ✓"
          : expense.status === "Rejected" ? "Rejected ✗"
          : "Pending ⏳",
        expense._id,
      ];
    });

  const filteredData = rowsData.filter((item) => {
    if (!searchTerm) return true;
    const q = searchTerm.trim().toLowerCase();
    return (
      String(item[1] || "").toLowerCase().includes(q) ||
      String(item[2] || "").toLowerCase().includes(q)
    );
  });

  const displayData        = filteredData.map((r) => r.slice(0, -1));
  const totalItems         = displayData.length;
  const totalPages         = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const start              = (currentPage - 1) * itemsPerPage;
  const currentData        = displayData.slice(start, start + itemsPerPage);
  const currentDataWithIds = filteredData.slice(start, start + itemsPerPage);

  const handleApprove = async (row) => {
    try {
      await updateExpense(row[row.length - 1], { status: "Approved" });
      await fetchExpenses();
    } catch { alert("Failed to approve expense"); }
  };

  const handleReject = async (row) => {
    const reason = prompt("Enter rejection reason (optional):");
    try {
      await updateExpense(row[row.length - 1], {
        status: "Rejected",
        rejectionReason: reason || "No reason provided",
      });
      await fetchExpenses();
    } catch { alert("Failed to reject expense"); }
  };

  return (
    <div className="bg-white rounded-xl p-4 mt-4 w-full overflow-hidden">

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2 w-full mb-5">
        {/* Search takes all remaining space */}
        <div className="flex-1 min-w-0">
          <SearchBar
            value={searchTerm}
            placeholder="Search by ID or category…"
            onChange={setSearchTerm}
          />
        </div>
        {/* Buttons stay compact and never grow */}
        <DurationButton />
      </div>

      {/* ── Table / cards ── */}
      {loading.expenses ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
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
        <div className="text-center text-gray-400 py-10 text-sm">
          {searchTerm
            ? "No expenses match your search."
            : expenses.length === 0
            ? "No expenses yet — add your first one!"
            : "No results."}
        </div>
      )}

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
