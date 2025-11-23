import { useState, useEffect } from "react";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import Table from "@/components/Table";
import Pagination from "@/components/Pagination";
import {
  ChevronDown,
  Download,
  Eye,
  ListFilter,
  Search,
  X,
} from "lucide-react";
import InvoiceModal from "./InvoiceModal";
import FilterModal from "./FilterModal";
import { useLubricantStore } from "@/store/lubricantStore"; 

export default function LubricantTracker({ onclose }) {
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null); 
  const { getAllPurchases } = useLubricantStore();

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await getAllPurchases();
        setTableData(response.data); 
      } catch (err) {
        console.error("Failed to fetch purchases:", err);
      }
    };

    fetchPurchases();
  }, [getAllPurchases]);

  const handlePreview = (purchase) => {
    setSelectedInvoice(purchase);
    setShowInvoiceModal(true);
  };

  const handleDownload = (purchase) => {
    setSelectedInvoice(purchase);
    setShowInvoiceModal(true);
  };

  const totalPages = Math.ceil(tableData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = tableData.slice(startIndex, endIndex);

  const purchaseMap = {};
  currentData.forEach((purchase, idx) => {
    purchaseMap[purchase.invoiceNo] = purchase;
  });
  return (
    <div className="fixed px-4 lg:px-0 inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[#f6f6f6] border-2 rounded-lg w-full max-w-[400px] lg:max-w-[1000px] p-3 lg:p-6 max-h-[80vh] scrollbar-hide overflow-y-auto">
        <div className="mb-4 flex justify-end cursor-pointer">
          <X onClick={onclose} />
        </div>

        <header className="mb-8">
          <h2 className="font-semibold text-2xl">Lubricant Tracker</h2>
          <p>Track lubricant purchases and records</p>
        </header>

        <DisplayCard>
          <div className="flex flex-col gap-4 lg:flex-row justify-between items-center mb-4">
            <div className="relative w-full lg:w-1/2">
              <input
                type="text"
                className="w-full border-2 border-gray-300 p-2 rounded-xl"
                placeholder="Search..."
              />
              <Search className="absolute top-2 right-3" />
            </div>

            <div className="flex gap-4">
              <button className="flex gap-2 items-center p-2 rounded-[10px] border-2 border-gray-300">
                Duration
                <ChevronDown />
              </button>
              <button
                onClick={() => setShowFilterModal(true)}
                className="flex gap-2 items-center p-2 rounded-[10px] border-2 border-gray-300"
              >
                Filter
                <ListFilter />
              </button>
              <button className="flex gap-2 items-center p-2 rounded-[10px] bg-[#0080ff] text-white">
                Export
                <Download />
              </button>
            </div>
          </div>

        
          <Table
            columns={[
              "Invoice No",
              "Supplier",
              "Payment Method",
              "Date",
              "Products",
              "Total Amount",
            ]}
            data={currentData.map((purchase) => [
              purchase.invoiceNo,
              purchase.supplier,
              purchase.paymentMethod,
              purchase.purchaseDate,
              purchase.items.map((i) => i.productName).join(", "),
              `₦${new Intl.NumberFormat("en-NG").format(purchase.totalAmount)}`,
            ])}
            renderActions={(row, rowIndex) => {
              const invoiceNo = row[0];
              const purchase = purchaseMap[invoiceNo]; 

              return (
                <div className="flex gap-6">
                  <button
                    onClick={() => handlePreview(purchase)}
                    className="text-blue-600 hover:text-blue-700 transition-colors"
                    title="Preview Invoice"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => handleDownload(purchase)}
                    className="text-green-600 hover:text-green-700 transition-colors"
                    title="Download Invoice"
                  >
                    <Download size={18} />
                  </button>
                </div>
              );
            }}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={tableData.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            className="mt-6"
          />
        </DisplayCard>
      </div>

      {showInvoiceModal && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}
      {showFilterModal && (
        <FilterModal onClose={() => setShowFilterModal(false)} />
      )}
    </div>
  );
}
