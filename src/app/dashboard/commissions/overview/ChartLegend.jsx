import React from 'react';

const ChartLegend = ({ items }) => {
  return (
    <div className="flex items-center gap-4 mb-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
          <span className="text-sm text-gray-600">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default ChartLegend;
