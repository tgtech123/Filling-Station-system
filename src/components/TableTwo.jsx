// components/Table.js
import React from "react";

const Table = ({ columns, data }) => {
  return (
    <div className="overflow-x-auto rounded-tl-xl mt-3">
      <table className="min-w-full border  border-neutral-200 rounded-xl">
        <thead className="bg-neutral-100 text-left">
          <tr>
            {columns.map((col) => (
              <th
                key={col.accessor}
                className="px-4 py-4 text-sm font-semibold text-neutral-700 border-b"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="">
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-neutral-50">
              {columns.map((col) => (
                <td
                  key={col.accessor}
                  className="px-4 py-4 text-sm text-neutral-600 border-b-[1px]"
                >
                  {row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
