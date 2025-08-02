import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const exportToExcel = (data, columns, fileName = "data") => {
  if (!Array.isArray(data) || data.length === 0) {
    console.error("No data to export");
    return;
  }

  // Handle array-of-arrays format
  const worksheetData = [
    columns, // Header
    ...data  // Data rows
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array"
  });

  const blob = new Blob([excelBuffer], {
    type: "application/octet-stream"
  });

  saveAs(blob, `${fileName}.xlsx`);
};

export default exportToExcel;
