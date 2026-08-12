'use client';
import React, { useState, useEffect, useRef, useMemo } from "react";
import { IoCloseOutline } from "react-icons/io5";
import Table from "@/components/Table";
import ActionButtons from "./ActionButtons";
import FilterModal from "../FilterModal";
import { BsFilter } from "react-icons/bs";
import { HiChevronDown, HiChevronUp } from "react-icons/hi2";
import { GrSearch } from "react-icons/gr";
import ExportButton from "@/components/ExportButton";
import { useLubricantStore } from "@/store/lubricantStore";

const formatPayment = (txn) => {
  if (txn.paymentMethod !== "mixed" || !txn.paymentBreakdown) return txn.paymentMethod || "N/A";
  const bd = txn.paymentBreakdown;
  const parts = [];
  if (bd.cash     > 0) parts.push(`Cash ₦${Number(bd.cash).toLocaleString()}`);
  if (bd.transfer > 0) parts.push(`Transfer ₦${Number(bd.transfer).toLocaleString()}`);
  if (bd.POS      > 0) parts.push(`POS ₦${Number(bd.POS).toLocaleString()}`);
  return parts.length > 0 ? parts.join(" + ") : "mixed";
};

const Modal = ({ isOpen, onClose }) => {
  const { transactions, transactionsLoading, fetchAllTransactions } = useLubricantStore();

  const [isFilterOpen, setIsFilterOpen]   = useState(false);
  const [filteredData, setFilteredData]   = useState([]);
  const [searchTerm, setSearchTerm]       = useState("");
  const [toggleChevron, setToggleChevron] = useState(false);

  const txnIdToMongoId = useRef({});

  const handleChevron = () => setToggleChevron(!toggleChevron);

  // Fetch fresh data every time the modal opens
  useEffect(() => {
    if (isOpen) fetchAllTransactions();
  }, [isOpen]);

  // Derive formatted rows + id map from store whenever transactions change
  const salesData = useMemo(() => {
    const idMap = {};
    const rows = transactions.map((txn, index) => {
      const productNames = txn.items?.map(i => i.productName).join(", ") || "N/A";
      // Counted the way it was sold — "2 Packs + 3 pieces", not a bare 27 that
      // matches neither the receipt nor what the customer walked out with.
      const totalQty = txn.items?.length
        ? txn.items
            .map((i) => {
              const qty = (i.unitFactor ?? 1) > 1 ? i.qtyInUnits : i.qtySold;
              const unit = (i.unitFactor ?? 1) > 1 ? i.unitName : "";
              return unit ? `${qty} ${unit}${qty > 1 ? "s" : ""}` : `${qty}`;
            })
            .join(" + ")
        : 0;
      const txnId        = txn.txnId || "N/A";
      const key          = `${txnId}__${index}`;
      idMap[key]         = txn.transactionId;
      return [
        index + 1,
        txnId,
        productNames,
        totalQty,
        formatPayment(txn),
        txn.totalAmount || 0,
        new Date(txn.date).toLocaleString() || "N/A",
        key,
        txn.paymentMethod || "",       // row[8] — raw method for filtering
        txn.paymentBreakdown || null,  // row[9] — raw breakdown for filtering
      ];
    });
    txnIdToMongoId.current = idMap;
    return rows;
  }, [transactions]);

  // Keep filteredData in sync whenever salesData changes (new sale arrived)
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(salesData);
    } else {
      setFilteredData(
        salesData.filter(row => String(row[1]).toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
  }, [salesData, searchTerm]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredData(salesData);
    } else {
      setFilteredData(
        salesData.filter(row => String(row[1]).toLowerCase().includes(term.toLowerCase()))
      );
    }
  };

  const handleApplyFilter = (filters) => {
    let newData = salesData;
    if (!filters.products.includes("All")) {
      newData = newData.filter(row =>
        filters.products.some(prod =>
          row[2].toLowerCase().includes(prod.toLowerCase())
        )
      );
    }
    if (!filters.payments.includes("All")) {
      newData = newData.filter(row => {
        const method    = row[8];
        const breakdown = row[9];
        return filters.payments.some(filterPay => {
          const f = filterPay.toLowerCase();
          if (method === "mixed" && breakdown) {
            // For mixed payments, check if the selected method had a non-zero amount
            if (f === "cash")     return Number(breakdown.cash     || 0) > 0;
            if (f === "transfer") return Number(breakdown.transfer || 0) > 0;
            if (f === "pos")      return Number(breakdown.POS      || 0) > 0;
          }
          return method?.toLowerCase() === f;
        });
      });
    }
    setFilteredData(newData);
  };

  // Slice off the hidden key column for export
  const exportData = filteredData.map(row => row.slice(0, 7));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-30" onClick={onClose}></div>

      <div className="relative bg-white rounded shadow-lg p-6 w-[90%] max-w-5xl max-h-[85%] overflow-auto z-50">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 hover:bg-neutral-100 p-1 rounded-full"
        >
          <IoCloseOutline size={24} />
        </button>

        <div className="flex-1 mb-4">
          <p className="text-lg font-semibold">Reprint receipt</p>
          <p className="text-sm text-gray-500">Print and export all sales receipts</p>

          <div className="flex justify-between py-3 flex-col sm:flex-row gap-2">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Search by Transaction ID"
                className="border-[1.5px] py-2 outline-none w-full sm:w-[400px] text-neutral-700 pl-3 pr-10 rounded-lg"
              />
              <GrSearch size={22} className="absolute top-3 text-neutral-400 right-3" />
            </div>

            <div className="relative flex gap-3">
              <button
                onClick={handleChevron}
                className="flex items-center justify-center px-4 py-2 gap-3 border-[1.5px] border-neutral-300 rounded-xl"
              >
                Duration {toggleChevron ? <HiChevronDown size={24} /> : <HiChevronUp size={24} />}
              </button>

              {toggleChevron && (
                <div className="absolute z-50 top-14 bg-white border-2 rounded-lg w-fit p-3">
                  <input type="date" className="border rounded p-2 mr-2" />
                  <input type="date" className="border rounded p-2" />
                </div>
              )}

              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex gap-2 font-semibold items-center border-[1.5px] border-neutral-300 px-4 py-2 rounded-lg"
              >
                Filter <BsFilter size={24} />
              </button>

              <ExportButton
                data={exportData}
                columns={["S/N", "Transaction ID", "Product", "Qty", "Payment", "Price", "Date"]}
                fileName="Sales_Reports"
                format="excel"
              />
            </div>
          </div>
        </div>

        {transactionsLoading ? (
          <p className="text-center py-10 text-gray-500">Loading sales...</p>
        ) : (
          <Table
            columns={["S/N", "Transaction ID", "Product", "Qty", "Payment", "Price", "Date"]}
            data={filteredData.map(row => row.slice(0, 7))}
            renderActions={(_, rowIndex) => {
              const key = filteredData[rowIndex]?.[7];
              const transactionId = txnIdToMongoId.current[key];
              return <ActionButtons transactionId={transactionId} />;
            }}
          />
        )}

        {isFilterOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
              <FilterModal
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                products={["Engine oil (1L)", "Motor Grease", "Gametol Oil", "Shell Oil", "Ali Lub."]}
                paymentTypes={["POS", "Transfer", "Cash"]}
                onApply={filters => {
                  handleApplyFilter(filters);
                  setIsFilterOpen(false);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
