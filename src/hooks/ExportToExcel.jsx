import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const exportToExcel = async (data, columns, fileName = "data") => {
  if (!Array.isArray(data) || data.length === 0) {
    console.error("No data to export");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sheet1");

  worksheet.addRow(columns);
  data.forEach((row) => worksheet.addRow(row));

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, `${fileName}.xlsx`);
};

export default exportToExcel;
