'use client';
import React, { useState, useEffect } from "react";
import { IoCloseOutline } from "react-icons/io5";
import Table from "@/components/Table";
import ActionButtons from "./ActionButtons";
import FilterModal from "../FilterModal";
import { BsFilter } from "react-icons/bs";
import { HiChevronDown, HiChevronUp } from "react-icons/hi2";
import { GrSearch } from "react-icons/gr";
import ExportButton from "@/components/ExportButton";

const API_URL = process.env.NEXT_PUBLIC_API;

const Modal = ({ isOpen, onClose }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [salesData, setSalesData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [toggleChevron, setToggleChevron] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleChevron = () => setToggleChevron(!toggleChevron);

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/lubricant/transactions`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();

        if (res.ok && result.data) {
          console.log("Fetched transactions:", result.data);

          //  Convert each transaction to array for Table, attach _id
          const formatted = result.data.map((transaction, index) => {
            const productNames = transaction.items.map(i => i.productName).join(", ");
            const totalQty = transaction.items.reduce((sum, i) => sum + i.qtySold, 0);

            const rowArray = [
              index + 1,                 
              transaction.txnId || "N/A", 
              productNames || "N/A",      
              totalQty,                 
              transaction.paymentMethod || "N/A",
              transaction.totalAmount || 0,
              new Date(transaction.date).toLocaleString() || "N/A",
            ];

            // Attach _id for ActionButtons (won't break Table)
            rowArray._id = transaction.transactionId;

            return rowArray;
          });

          setSalesData(formatted);
          setFilteredData(formatted);
        } else {
          console.error(result.error || "Failed to load data");
        }
      } catch (err) {
        console.error("Error fetching sales data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) fetchSales();
  }, [isOpen]);

  // 🔍 Search by txnId
  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredData(salesData);
    } else {
      setFilteredData(
        salesData.filter(row =>
          row[1].toLowerCase().includes(term.toLowerCase())
        )
      );
    }
  };

  // Filter example
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
      newData = newData.filter(row => filters.payments.includes(row[4]));
    }
    setFilteredData(newData);
  };

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
                className="border-[1.5px] py-2 outline-none w-[400px] text-neutral-700 pl-3 rounded-lg"
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
                data={filteredData}
                columns={["S/N","Transaction ID","Product","Qty","Payment","Price","Date"]}
                fileName="Sales_Reports"
                format="excel"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-center py-10 text-gray-500">Loading sales...</p>
        ) : (
          <Table
            columns={["S/N","Transaction ID","Product","Qty","Payment","Price","Date"]}
            data={filteredData}
            renderActions={row => <ActionButtons transactionId={row._id} />}
          />
        )}

        {isFilterOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
              <FilterModal
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                products={["Engine oil (1L)","Motor Grease","Gametol Oil","Shell Oil","Ali Lub."]}
                paymentTypes={["POS","Transfer","Cash"]}
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
