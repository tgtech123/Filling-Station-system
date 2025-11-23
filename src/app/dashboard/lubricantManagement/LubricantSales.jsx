"use client";

import React, { useEffect, useMemo, useState } from "react";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import { Search } from "lucide-react";
import Pagination from "@/components/Pagination";
import CustomTable from "@/components/Table"; // your existing table

const API_URL = process.env.NEXT_PUBLIC_API || "";

export default function LubricantSales() {
  const [loading, setLoading] = useState(false);
  const [transactionsRaw, setTransactionsRaw] = useState([]);
  const [flatRows, setFlatRows] = useState([]); // now array of arrays
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const formatDate = (iso) => {
    try {
      const d = new Date(iso);
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    } catch {
      return iso;
    }
  };

  useEffect(() => {
    let mounted = true;
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const res = await fetch(`${API_URL}/api/lubricant/transactions`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText || "Failed to fetch transactions");
        }

        const json = await res.json();
        const dataArray = Array.isArray(json?.data) ? json.data : [];
        if (mounted) setTransactionsRaw(dataArray);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        if (mounted) setTransactionsRaw([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchTransactions();
    return () => { mounted = false; };
  }, []);

  // Flatten transactions -> array of arrays for your CustomTable
  useEffect(() => {
    const rows = [];
    (transactionsRaw || []).forEach((txn) => {
      const date = txn?.date ? formatDate(txn.date) : "";
      const cashier = txn?.staffName ?? "Unknown";
      const txnId = txn?.txnId ?? "";
      const payment = txn?.paymentMethod ?? "";

      const items = Array.isArray(txn.items) ? txn.items : [];

      if (items.length === 0) {
        rows.push([date, cashier, txnId, "", "", 0, 0, payment]);
      } else {
        items.forEach((it) => {
          rows.push([
            date,
            cashier,
            txnId,
            it?.barcode ?? "",
            it?.productName ?? "",
            it?.qtySold ?? 0,
            it?.amount ?? 0,
            payment
          ]);
        });
      }
    });

    setFlatRows(rows);
  }, [transactionsRaw]);

  // Filter
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return flatRows;

    const lower = searchTerm.toLowerCase();
    return flatRows.filter((row) =>
      row.some((cell) => String(cell ?? "").toLowerCase().includes(lower))
    );
  }, [flatRows, searchTerm]);

  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  useEffect(() => setCurrentPage(1), [searchTerm]);

  const columns = ["Date", "Cashier", "Txn Id", "Barcode", "Product Name", "Quantity Sold", "Amount", "Payment"];

  return (
    <DisplayCard>
      <header className="flex flex-col lg:flex-row gap-2 lg:gap-0 justify-between items-start lg:items-end">
        <div>
          <h3 className="text-xl font-semibold">Recent Transactions</h3>
          <p>Latest sales activities</p>
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 min-w-[300px] lg:min-w-[400px] rounded-[8px] w-full border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
            placeholder="Search transactions..."
          />
          <Search className="text-gray-400 absolute top-2 right-3" />
        </div>
      </header>

      {searchTerm && (
        <div className="text-sm text-gray-600 my-2">
          {totalItems > 0
            ? `Showing ${totalItems} result${totalItems !== 1 ? "s" : ""} for "${searchTerm}"`
            : `No results found for "${searchTerm}"`}
        </div>
      )}

      {loading ? (
        <div className="text-center py-6 text-gray-500">Loading transactions...</div>
      ) : (
        <>
          <CustomTable columns={columns} data={currentData} />
          {totalItems > 0 && totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                onPageChange={(p) => setCurrentPage(p)}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
          {!loading && flatRows.length === 0 && (
            <div className="text-center py-8 text-gray-500">No transactions recorded yet.</div>
          )}
        </>
      )}
    </DisplayCard>
  );
}
