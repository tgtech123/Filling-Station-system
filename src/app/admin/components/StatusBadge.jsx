// ===== StatusBadge.jsx =====
// Reusable status badge component

import React from 'react';

const StatusBadge = ({ status, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200'
  };

  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${colorClasses[color] || colorClasses.gray}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
