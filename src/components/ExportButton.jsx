// components/ExportButton.jsx
"use client";

import React from "react";
import { HiOutlineDownload } from "react-icons/hi";


const ExportButton = ({ data, columns, fileName = "export", format = "csv" }) => {
  if (!data || data.length === 0) return null;

  const handleExport = () => {
    if (format === "csv") {
      exportToCSV();
    } else if (format === "excel") {
      exportToExcel();
    }
  };

  const exportToCSV = () => {
    const headers = columns.map((col) => col.header).join(",");
    const rows = data.map((row) =>
      row
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(",")
    );

    const csvContent = [headers, ...rows].join("\n");
    downloadFile(csvContent, `${fileName}.csv`, "text/csv");
  };

  const exportToExcel = () => {
    const headers = columns.map((col) => col.header).join("\t");
    const rows = data.map((row) => row.join("\t"));
    const excelContent = [headers, ...rows].join("\n");
    downloadFile(excelContent, `${fileName}.xls`, "application/vnd.ms-excel");
  };

  const downloadFile = (content, name, type) => {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    window.URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="bg-[#0080FF] flex gap-2 items-center font-semibold  text-white px-6 py-2 rounded-xl shadow hover:bg-blue-700 transition"
    >
      Export <HiOutlineDownload size={24} />
    </button>
  );
};

export default ExportButton;
