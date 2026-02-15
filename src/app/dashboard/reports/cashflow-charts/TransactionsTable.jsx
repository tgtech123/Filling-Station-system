import { useEffect } from "react";
import useAccountantStore from "@/store/useAccountantStore";

export default function TransactionsTable({ duration = "today" }) {
  const { cashflow, loading, errors, fetchCashflow } = useAccountantStore();

  useEffect(() => {
    fetchCashflow(duration);
  }, [fetchCashflow, duration]);

  // Get transactions from cashflow.recentTransactions
  const transactions = cashflow?.recentTransactions || [];

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: '2-digit' 
    });
  };

  // Format currency
  const formatCurrency = (value) => {
    return `₦${value.toLocaleString()}`;
  };

  // Show loading state
  if (loading.cashflow && !cashflow) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (errors.cashflow) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">Error: {errors.cashflow}</p>
          <button 
            onClick={() => fetchCashflow(duration)}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-500">No recent transactions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-500 text-sm border-b">
              <th className="py-2">Date</th>
              <th>Service</th>
              <th>Amount</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, i) => (
              <tr key={i} className="border-b text-sm">
                <td className="py-3">{formatDate(t.date)}</td>
                <td>{t.service}</td>
                <td>{formatCurrency(t.amount)}</td>
                <td>
                  {t.type === "Inflow" ? (
                    <span className="px-2 py-1 rounded-md bg-[#B2FFB4] text-green-600 text-xs font-semibold">
                      Inflow ↓
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-md bg-red-100 text-red-600 text-xs font-semibold">
                      Outflow ↑
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}