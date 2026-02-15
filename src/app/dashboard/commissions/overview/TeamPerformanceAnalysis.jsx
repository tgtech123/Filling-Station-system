'use client'
import React, { useState, useEffect } from 'react';
import PerformanceByShiftChart from './PerformanceByShiftChart';
import ProductSalesChart from './ProductSalesChart';
import useCommissionStore from '@/store/useCommissionStore';

const TeamPerformanceAnalysis = ({ 
  performanceData = [], 
  productData = [], 
  title = "Team Performance Analysis" 
}) => {
  const [performanceTimeFilter, setPerformanceTimeFilter] = useState('This month');
  const [productTimeFilter, setProductTimeFilter] = useState('This month');
  const [filteredPerformanceData, setFilteredPerformanceData] = useState([]);
  const [filteredProductData, setFilteredProductData] = useState([]);

  const { fetchStaffTracking } = useCommissionStore();

  useEffect(() => {
    applyPerformanceFilter(performanceTimeFilter);
  }, [performanceData, performanceTimeFilter]);

  useEffect(() => {
    applyProductFilter(productTimeFilter);
  }, [productData, productTimeFilter]);

  const applyPerformanceFilter = (filter) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    
    let filtered = [];
    
    switch(filter) {
      case 'This month':
        const currentMonthName = now.toLocaleString('default', { month: 'short' });
        filtered = performanceData.filter(d => d.month === currentMonthName);
        break;
        
      case 'Last 3 months':
        const last3Months = [];
        for (let i = 2; i >= 0; i--) {
          const date = new Date(now.getFullYear(), currentMonth - i, 1);
          last3Months.push(date.toLocaleString('default', { month: 'short' }));
        }
        filtered = performanceData.filter(d => last3Months.includes(d.month));
        break;
        
      case 'Last 6 months':
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), currentMonth - i, 1);
          last6Months.push(date.toLocaleString('default', { month: 'short' }));
        }
        filtered = performanceData.filter(d => last6Months.includes(d.month));
        break;
        
      case 'This year':
      default:
        filtered = performanceData;
        break;
    }
    
    setFilteredPerformanceData(filtered);
  };

  const applyProductFilter = (filter) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    
    let filtered = [];
    
    switch(filter) {
      case 'This month':
        const currentMonthName = now.toLocaleString('default', { month: 'short' });
        filtered = productData.filter(d => d.month === currentMonthName);
        break;
        
      case 'Last 3 months':
        const last3Months = [];
        for (let i = 2; i >= 0; i--) {
          const date = new Date(now.getFullYear(), currentMonth - i, 1);
          last3Months.push(date.toLocaleString('default', { month: 'short' }));
        }
        filtered = productData.filter(d => last3Months.includes(d.month));
        break;
        
      case 'Last 6 months':
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), currentMonth - i, 1);
          last6Months.push(date.toLocaleString('default', { month: 'short' }));
        }
        filtered = productData.filter(d => last6Months.includes(d.month));
        break;
        
      case 'This year':
      default:
        filtered = productData;
        break;
    }
    
    setFilteredProductData(filtered);
  };

  const handlePerformanceFilterChange = async (newFilter) => {
    setPerformanceTimeFilter(newFilter);
    
    const now = new Date();
    let month = null;
    let year = now.getFullYear();
    
    if (newFilter === 'This month') {
      month = now.getMonth() + 1;
      await fetchStaffTracking(month, year);
    } else if (newFilter === 'Last 3 months' || newFilter === 'Last 6 months') {
      await fetchStaffTracking(null, year);
    }
  };

  const handleProductFilterChange = async (newFilter) => {
    setProductTimeFilter(newFilter);
    
    const now = new Date();
    let month = null;
    let year = now.getFullYear();
    
    if (newFilter === 'This month') {
      month = now.getMonth() + 1;
      await fetchStaffTracking(month, year);
    } else if (newFilter === 'Last 3 months' || newFilter === 'Last 6 months') {
      await fetchStaffTracking(null, year);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceByShiftChart
          data={filteredPerformanceData}
          timeFilter={performanceTimeFilter}
          onTimeFilterChange={handlePerformanceFilterChange}
        />
        <ProductSalesChart
          data={filteredProductData}
          timeFilter={productTimeFilter}
          onTimeFilterChange={handleProductFilterChange}
        />
      </div>
    </div> 
  );
};

export default TeamPerformanceAnalysis;



//   'use client'
// import React, { useState } from 'react';
// import PerformanceByShiftChart from './PerformanceByShiftChart';
// import ProductSalesChart from './ProductSalesChart';

// const TeamPerformanceAnalysis = ({ performanceData, productData, title = "Team Performance Analysis" }) => {
//   const [performanceTimeFilter, setPerformanceTimeFilter] = useState('This month');
//   const [productTimeFilter, setProductTimeFilter] = useState('This month');

//   return (
//     <div className="space-y-6">
//       <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <PerformanceByShiftChart
//           data={performanceData}
//           timeFilter={performanceTimeFilter}
//           onTimeFilterChange={setPerformanceTimeFilter}
//         />
//         <ProductSalesChart
//           data={productData}
//           timeFilter={productTimeFilter}
//           onTimeFilterChange={setProductTimeFilter}
//         />
//       </div>
//     </div> 
//   );
// };

// export default TeamPerformanceAnalysis;
