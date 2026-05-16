import React from "react";

// mobileHideCols — array of column indices to hide on screens smaller than sm
const Table = ({
  columns = [],
  data = [],
  renderActions,
  highlightedColumnIndex,
  highlightedRowIndices = [],
  mobileHideCols = [],
}) => {
  const hiddenSet = new Set(mobileHideCols);

  return (
    <div className="overflow-x-auto w-full rounded-lg border border-gray-100">
      <table className="text-sm text-left text-gray-700 w-full">
        <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <tr>
            {columns.map((col, index) => (
              <th
                key={index}
                className={[
                  "px-3 py-2.5 whitespace-nowrap",
                  index === 0
                    ? "sticky left-0 bg-gray-50 z-10 min-w-[130px] sm:min-w-[160px]"
                    : "min-w-[100px] sm:min-w-[120px]",
                  hiddenSet.has(index) ? "hidden sm:table-cell" : "",
                ].join(" ")}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-50">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-6 text-gray-400 text-sm">
                No data available.
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => {
              const isHighlighted = highlightedRowIndices.includes(rowIndex);
              return (
                <tr
                  key={rowIndex}
                  className={`hover:bg-gray-50 transition-colors ${isHighlighted ? "font-bold" : ""}`}
                >
                  {row.map((cell, cellIndex) => {
                    const cellText = String(cell ?? "").trim();
                    let colorClass = "";
                    if (cellText.startsWith("-"))      colorClass = "text-red-600";
                    else if (cellText.startsWith("+")) colorClass = "text-green-600";

                    return (
                      <td
                        key={cellIndex}
                        className={[
                          "px-3 py-2.5 whitespace-nowrap text-xs sm:text-sm",
                          cellIndex === 0
                            ? "sticky left-0 bg-white z-10 font-medium text-gray-700"
                            : "",
                          cellIndex === highlightedColumnIndex ? "text-red-500" : "",
                          colorClass,
                          hiddenSet.has(cellIndex) ? "hidden sm:table-cell" : "",
                        ].join(" ")}
                      >
                        {cell}
                      </td>
                    );
                  })}
                  {renderActions && (
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {renderActions(row)}
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
