import React from 'react';

const Table = ({ columns, data }) => {
  return (
    <div className="overflow-x-auto w-full mt-4 rounded-lg border border-gray-200">
      <table className="min-w-full text-sm text-left text-gray-700">
        <thead className="bg-gray-100 text-md font-semibold text-gray-600">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className="px-4 py-3 whitespace-nowrap">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {/* {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3 whitespace-nowrap">
                  {cell}
                </td>
              ))}
            </tr>
          ))} */}

          {data.length === 0 ? (
  <tr>
    <td colSpan={columns.length} className="text-center py-4 text-gray-400">
      No matching records found.
    </td>
  </tr>
) : (
  data.map((row, rowIndex) => (
    <tr key={rowIndex} className="hover:bg-gray-50">
      {row.map((cell, cellIndex) => (
        <td key={cellIndex} className="px-4 py-3 whitespace-nowrap">
          {cell}
        </td>
      ))}
    </tr>
  ))
)}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
