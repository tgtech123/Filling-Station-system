  'use client'
import React, { useState } from 'react';
import PerformanceByShiftChart from './PerformanceByShiftChart';
import ProductSalesChart from './ProductSalesChart';

const TeamPerformanceAnalysis = ({ performanceData, productData, title = "Team Performance Analysis" }) => {
  const [performanceTimeFilter, setPerformanceTimeFilter] = useState('This month');
  const [productTimeFilter, setProductTimeFilter] = useState('This month');

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceByShiftChart
          data={performanceData}
          timeFilter={performanceTimeFilter}
          onTimeFilterChange={setPerformanceTimeFilter}
        />
        <ProductSalesChart
          data={productData}
          timeFilter={productTimeFilter}
          onTimeFilterChange={setProductTimeFilter}
        />
      </div>
    </div>
  );
};

export default TeamPerformanceAnalysis;
