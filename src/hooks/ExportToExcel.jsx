import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

/**
 * Pull a number out of a display value.
 *
 * Exported cells are already formatted for people — "₦59,000.00", "50.03 L",
 * "1,200". Summing them means stripping the currency symbol, the thousands
 * separators and any trailing unit first. Returns null when the value is not a
 * number at all (a name, a date, a status), which is how a column is judged
 * un-summable.
 */
const toNumber = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;

  const cleaned = value.replace(/[₦$€£,\s]/g, "").replace(/[A-Za-z]+$/, "");
  if (cleaned === "" || cleaned === "-" || cleaned === "—") return null;

  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
};

/** Re-apply the formatting the column already used, so the total matches it. */
const formatLike = (sample, total) => {
  const rounded = Math.round((total + Number.EPSILON) * 100) / 100;
  const pretty = rounded.toLocaleString("en-NG", {
    minimumFractionDigits: Number.isInteger(rounded) ? 0 : 2,
    maximumFractionDigits: 2,
  });

  if (typeof sample === "number") return rounded;
  if (typeof sample === "string") {
    const currency = sample.match(/^[₦$€£]/)?.[0];
    if (currency) return `${currency}${pretty}`;
    const unit = sample.match(/[A-Za-z]+$/)?.[0];
    if (unit) return `${pretty} ${unit}`;
  }
  return pretty;
};

/**
 * Export rows to .xlsx with a TOTAL row appended.
 *
 * Only columns whose every populated value is numeric are totalled — names,
 * dates and statuses are left blank rather than producing a meaningless sum.
 */
const exportToExcel = async (data, columns, fileName = "data") => {
  if (!Array.isArray(data) || data.length === 0) {
    console.error("No data to export");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sheet1");

  const headerRow = worksheet.addRow(columns);
  headerRow.font = { bold: true };

  data.forEach((row) => worksheet.addRow(row));

  // ── Totals ────────────────────────────────────────────────────────────────
  const columnCount = Math.max(
    columns.length,
    ...data.map((r) => (Array.isArray(r) ? r.length : 0))
  );

  const totals = new Array(columnCount).fill(null);

  for (let col = 0; col < columnCount; col++) {
    // "—" and "-" are placeholders for "no value", used across the reports for
    // things like a branch with no expiry date. Treated as empty rather than as
    // text: otherwise one placeholder cell disqualified the whole column and
    // the report silently lost its total.
    const isBlank = (v) =>
      v === undefined || v === null || v === "" || v === "—" || v === "-";

    const values = data
      .map((r) => (Array.isArray(r) ? r[col] : undefined))
      .filter((v) => !isBlank(v));

    if (values.length === 0) continue;

    const numbers = values.map(toNumber);
    // Every populated cell must be numeric — one name in the column and it is
    // not a quantity, so summing it would be noise.
    if (numbers.some((n) => n === null)) continue;

    totals[col] = formatLike(values[0], numbers.reduce((a, b) => a + b, 0));
  }

  if (totals.some((t) => t !== null)) {
    const label = new Array(columnCount).fill("");
    label[0] = "TOTAL";
    for (let i = 0; i < columnCount; i++) {
      if (totals[i] !== null) label[i] = totals[i];
    }

    // Blank spacer keeps the total visually separate from the data.
    worksheet.addRow([]);
    const totalRow = worksheet.addRow(label);
    totalRow.font = { bold: true };
    totalRow.eachCell((cell) => {
      cell.border = { top: { style: "thin" } };
    });
  }

  // Readable column widths rather than everything at the default.
  worksheet.columns.forEach((column) => {
    let width = 12;
    column.eachCell?.({ includeEmpty: false }, (cell) => {
      width = Math.max(width, String(cell.value ?? "").length + 2);
    });
    column.width = Math.min(width, 40);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, `${fileName}.xlsx`);
};

export default exportToExcel;
