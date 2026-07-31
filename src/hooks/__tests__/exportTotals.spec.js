import { describe, it, expect, vi, beforeEach } from "vitest";

// Capture what lands in the worksheet instead of writing a real .xlsx.
const rows = [];
const columns = [];

vi.mock("exceljs", () => {
  class Workbook {
    constructor() {
      this.xlsx = { writeBuffer: async () => new ArrayBuffer(8) };
    }
    addWorksheet() {
      return {
        addRow: (r) => {
          rows.push(r);
          return { font: {}, eachCell: () => {} };
        },
        get columns() {
          return columns;
        },
      };
    }
  }
  return { default: { Workbook } };
});

vi.mock("file-saver", () => ({ saveAs: vi.fn() }));

import exportToExcel from "../ExportToExcel";

beforeEach(() => {
  rows.length = 0;
  columns.length = 0;
});

const totalRow = () => rows.find((r) => Array.isArray(r) && r[0] === "TOTAL");

describe("exportToExcel totals", () => {
  it("totals only the columns that are genuinely numeric", async () => {
    await exportToExcel(
      [
        ["Ada Obi", "PMS", "50.03 L", "₦60,036.00", "Matched"],
        ["Musa Bello", "AGO", "89 L", "₦124,600.00", "Matched"],
      ],
      ["Attendant", "Product", "Litres", "Amount", "Status"]
    );

    const total = totalRow();
    expect(total).toBeTruthy();

    // Names, products and statuses are not quantities — summing them would be
    // noise, so those cells stay blank.
    expect(total[1]).toBe("");
    expect(total[4]).toBe("");

    // Litres and money are summed, keeping the column's own formatting.
    expect(String(total[2])).toContain("139.03");
    expect(String(total[3])).toContain("₦");
    expect(String(total[3])).toContain("184,636");
  });

  it("handles plain numeric cells", async () => {
    await exportToExcel([["A", 10], ["B", 5]], ["Name", "Qty"]);
    expect(totalRow()[1]).toBe(15);
  });

  it("writes no total row when nothing is summable", async () => {
    await exportToExcel([["Ada", "PMS"], ["Musa", "AGO"]], ["Name", "Product"]);
    expect(totalRow()).toBeUndefined();
  });

  it("does not sum a column that mixes numbers with text", async () => {
    // One "N/A" makes the column a description, not a quantity.
    await exportToExcel([["A", "10"], ["B", "N/A"]], ["Name", "Qty"]);
    expect(totalRow()).toBeUndefined();
  });

  it("refuses to build a sheet from no data", async () => {
    await exportToExcel([], ["Name"]);
    expect(rows.length).toBe(0);
  });

  it("treats an em-dash placeholder as empty rather than as text", async () => {
    // "—" marks "no value" in several reports. If it disqualified the column,
    // the report would silently lose its total. The formatting of the column is
    // preserved, so a string column totals to a string.
    await exportToExcel([["A", "5"], ["B", "—"]], ["Name", "Qty"]);
    expect(String(totalRow()[1])).toBe("5");
  });
});
