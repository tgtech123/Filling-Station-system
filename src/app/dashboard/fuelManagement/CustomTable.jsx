
import React from "react";
import { X, Check } from "lucide-react";

const CustomTable = ({
  columns = [],
  data = [],
  renderActions,
  highlightedColumnIndex,
  lastColumnType = "text", // "text", "profitloss", "actions", "status"
  renderLastColumn, // custom render function for last column
  onStatusAction, // callback for status actions: (action, row, rowIndex) => void
}) => {
  const renderStatusCell = (status, row, rowIndex) => {
    const statusLower = status.toString().toLowerCase();
    
    switch (statusLower) {
      case "pending":
        return (
          <div className="flex items-center">
             <button 
              onClick={() => onStatusAction && onStatusAction('view', row, rowIndex)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="View"
            >
              <input type="checkbox" />
            </button>
            <button 
              onClick={() => onStatusAction && onStatusAction('edit', row, rowIndex)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Edit"
            >
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button 
              onClick={() => onStatusAction && onStatusAction('delete', row, rowIndex)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Delete"
            >
              <X size={18} color="red" />
            </button>
          </div>
        );
      
      case "completed":
        return (
          <span className="inline-flex gap-1 items-center p-2 rounded-[8px] text-xs font-medium bg-green-100 text-green-800">
            Completed <Check size={17} />
          </span>
        );
      
      case "canceled":
        return (
          <span className="inline-flex items-center p-2 rounded-[8px] text-xs font-medium bg-red-100 text-red-800">
            Canceled <X size={17} />
          </span>
        );
      
      default:
        return status;
    }
  };

  const renderLastColumnCell = (cell, row, cellIndex, rowIndex) => {
    // If custom render function is provided, use it
    if (renderLastColumn) {
      return renderLastColumn(cell, row, rowIndex);
    }

    // Handle different last column types
    switch (lastColumnType) {
      case "profitloss":
        const isNegative = cell.toString().trim().startsWith("-");
        return (
          <span
            className={`font-semibold ${
              cellIndex === highlightedColumnIndex ? "text-red-500" : ""
            } ${isNegative ? "text-red-600" : "text-green-600"}`}
          >
            {cell}
          </span>
        );

      case "status":
        return renderStatusCell(cell, row, rowIndex);

      case "actions":
        // If cell is a React element (icon/button), render it directly
        if (React.isValidElement(cell)) {
          return cell;
        }
        // If cell is a function, call it with row data
        if (typeof cell === "function") {
          return cell(row, rowIndex);
        }
        // Otherwise render as text
        return cell;

      case "text":
      default:
        return cell;
    }
  };

  return (
    <div className="overflow-x-auto w-full rounded-lg border border-gray-200">
      <table className="min-w-full text-sm text-left text-gray-700">
        <thead className="bg-gray-100 text-md font-semibold text-gray-600">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className="px-4 py-3 whitespace-nowrap">
                {col}
              </th>
            ))}
            {renderActions && (
              <th className="px-4 py-3 whitespace-nowrap">Actions</th>
            )}
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-100">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (renderActions ? 1 : 0)}
                className="text-center py-4 text-gray-400"
              >
                No matching records found.
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {row.map((cell, cellIndex) => {
                  // Handle last column specially
                  if (cellIndex === row.length - 1) {
                    return (
                      <td
                        key={cellIndex}
                        className={`px-4 py-5 whitespace-nowrap ${
                          lastColumnType === "status" ? "" : ""
                        }`}
                      >
                        {renderLastColumnCell(cell, row, cellIndex, rowIndex)}
                      </td>
                    );
                  }

                  return (
                    <td key={cellIndex} className="px-4 py-5 whitespace-nowrap">
                      {cell}
                    </td>
                  );
                })}
                {renderActions && (
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    {renderActions(row, rowIndex)}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CustomTable;