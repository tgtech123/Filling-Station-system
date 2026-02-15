// ===== TableHeader.jsx =====
// Table header component

import React from 'react';
import { ChevronUp } from 'lucide-react';

const TableHeader = ({ columns }) => {
  return (
    <thead className="bg-gray-50 border-b border-gray-200 hidden md:table-header-group">
      <tr>
        {columns.map((column, index) => (
          <th
            key={index}
            className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            <div className="flex items-center gap-1">
              {column}
              <ChevronUp className="w-3 h-3 text-gray-400" />
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHeader;