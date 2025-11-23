
// // 'use client'

// // import TableWithoutBorder from '@/components/TableWithoutBorder'
// // import React, { useEffect, useState } from 'react'
// // import { header, rows } from './profitMarginData'
// // import { useFinancialStore } from '@/store/useFinancialStore'

// // const ProfitMargins = () => {
// //   const { profitMargins, fetchProfitMargins, loading, errors } = useFinancialStore();
// //   const [duration, setDuration] = useState('thismonth');

// //   useEffect(() => {
// //     // Fetch profit margins when component mounts or duration changes
// //     fetchProfitMargins(duration);
// //   }, [duration, fetchProfitMargins]);

// //   // Debug: Log the profit margins data
// //   useEffect(() => {
// //     console.log('Profit Margins Data:', profitMargins);
// //   }, [profitMargins]);

// //   // Format currency
// //   const formatCurrency = (amount) => {
// //     return `₦${amount?.toLocaleString() || '0'}`;
// //   };

// //   // Transform profit margins data into table format
// //   const getProfitMarginsTableData = () => {
// //     if (loading.profitMargins) {
// //       return {
// //         header: header,
// //         body: [["Loading...", "...", "...", "..."]]
// //       };
// //     }

// //     if (errors.profitMargins || !profitMargins || profitMargins.length === 0) {
// //       return { header, body: rows }; // Fallback to default data
// //     }

// //     // Map API data to table format
// //     const tableBody = profitMargins.map(item => [
// //       item.product || item.name || "N/A",
// //       formatCurrency(item.cost),
// //       formatCurrency(item.revenue),
// //       formatCurrency(item.profit)
// //     ]);

// //     return {
// //       header: header,
// //       body: tableBody
// //     };
// //   };

// //   const profitMarginsTableData = getProfitMarginsTableData();

// //   const handleDurationChange = (newDuration) => {
// //     setDuration(newDuration);
// //   };

// //   return (
// //     <div className='bg-white rounded-2xl p-6'>
// //       <div className='mb-[1.5rem]'>
// //         <h1 className='text-[1.375rem] font-semibold'>Profit Margin Analysis</h1>
// //         <h4 className='text-[1rem] leading-[150%]'>Profit margins by product cost and revenue</h4>
// //       </div>

// //       {/* Duration Selector */}
// //       <div className="mb-6 flex gap-2">
// //         <button
// //           onClick={() => handleDurationChange('today')}
// //           className={`px-4 py-2 rounded text-sm font-semibold ${
// //             duration === 'today' ? 'bg-[#0080ff] text-white' : 'bg-gray-200 text-gray-700'
// //           }`}
// //         >
// //           Today
// //         </button>
// //         <button
// //           onClick={() => handleDurationChange('thisweek')}
// //           className={`px-4 py-2 rounded text-sm font-semibold ${
// //             duration === 'thisweek' ? 'bg-[#0080ff] text-white' : 'bg-gray-200 text-gray-700'
// //           }`}
// //         >
// //           This Week
// //         </button>
// //         <button
// //           onClick={() => handleDurationChange('thismonth')}
// //           className={`px-4 py-2 rounded text-sm font-semibold ${
// //             duration === 'thismonth' ? 'bg-[#0080ff] text-white' : 'bg-gray-200 text-gray-700'
// //           }`}
// //         >
// //           This Month
// //         </button>
// //       </div>

// //       {/* Error message */}
// //       {errors.profitMargins && (
// //         <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
// //           Error loading profit margins: {errors.profitMargins}
// //         </div>
// //       )}

// //       <span>
// //         <TableWithoutBorder columns={profitMarginsTableData.header} data={profitMarginsTableData.body} />
// //       </span>
// //     </div>
// //   )
// // }

// // export default ProfitMargins

// 'use client'

// import TableWithoutBorder from '@/components/TableWithoutBorder'
// import React, { useEffect, useState } from 'react'
// import { header, rows } from './profitMarginData'
// import { useFinancialStore } from '@/store/useFinancialStore'

// const ProfitMargins = () => {
//   const { profitMargins, fetchProfitMargins, loading, errors } = useFinancialStore();
//   const [duration, setDuration] = useState('thismonth');
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);

//   useEffect(() => {
//     // Fetch profit margins when component mounts or duration changes
//     fetchProfitMargins(duration);
//   }, [duration, fetchProfitMargins]);

//   // Debug: Log the profit margins data
//   useEffect(() => {
//     console.log('Profit Margins Data:', profitMargins);
//   }, [profitMargins]);

//   // Format currency
//   const formatCurrency = (amount) => {
//     return `₦${amount?.toLocaleString() || '0'}`;
//   };

//   // Transform profit margins data into table format
//   const getProfitMarginsTableData = () => {
//     if (loading.profitMargins) {
//       return {
//         header: header,
//         body: [["Loading...", "...", "...", "..."]]
//       };
//     }

//     if (errors.profitMargins || !profitMargins || profitMargins.length === 0) {
//       return { header, body: rows }; // Fallback to default data
//     }

//     // Map API data to table format
//     const tableBody = profitMargins.map(item => [
//       item.product || item.name || "N/A",
//       formatCurrency(item.cost),
//       formatCurrency(item.revenue),
//       formatCurrency(item.profit)
//     ]);

//     return {
//       header: header,
//       body: tableBody
//     };
//   };

//   const profitMarginsTableData = getProfitMarginsTableData();

//   const handleDurationChange = (newDuration) => {
//     setDuration(newDuration);
//   };

//   return (
//     <div className='bg-white rounded-2xl p-6'>
//       <div className='mb-[1.5rem]'>
//         <h1 className='text-[1.375rem] font-semibold'>Profit Margin Analysis</h1>
//         <h4 className='text-[1rem] leading-[150%]'>Profit margins by product cost and revenue</h4>
//       </div>

//       {/* Duration Selector */}
//       <div className="mb-6 flex gap-2">
//         <button
//           onClick={() => handleDurationChange('today')}
//           className={`px-4 py-2 rounded text-sm font-semibold ${
//             duration === 'today' ? 'bg-[#0080ff] text-white' : 'bg-gray-200 text-gray-700'
//           }`}
//         >
//           Today
//         </button>
//         <button
//           onClick={() => handleDurationChange('thisweek')}
//           className={`px-4 py-2 rounded text-sm font-semibold ${
//             duration === 'thisweek' ? 'bg-[#0080ff] text-white' : 'bg-gray-200 text-gray-700'
//           }`}
//         >
//           This Week
//         </button>
//         <button
//           onClick={() => handleDurationChange('thismonth')}
//           className={`px-4 py-2 rounded text-sm font-semibold ${
//             duration === 'thismonth' ? 'bg-[#0080ff] text-white' : 'bg-gray-200 text-gray-700'
//           }`}
//         >
//           This Month
//         </button>
//       </div>

//       {/* Error message */}
//       {errors.profitMargins && (
//         <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//           Error loading profit margins: {errors.profitMargins}
//         </div>
//       )}

//       <span>
//         <TableWithoutBorder columns={profitMarginsTableData.header} data={profitMarginsTableData.body} />
//       </span>
//     </div>
//   )
// }

// export default ProfitMargins

'use client'

import TableWithoutBorder from '@/components/TableWithoutBorder'
import React, { useEffect, useState } from 'react'
import { header, rows } from './profitMarginData'
import { useFinancialStore } from '@/store/useFinancialStore'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/solid'
import { Fragment } from 'react'

const ProfitMargins = () => {
  const { profitMargins, fetchProfitMargins, loading, errors } = useFinancialStore();
  const [duration, setDuration] = useState('thismonth');

  const durationOptions = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'thisweek' },
    { label: 'This Month', value: 'thismonth' },
    { label: 'This Year', value: 'thisyear' },
  ];

  useEffect(() => {
    fetchProfitMargins(duration);
  }, [duration, fetchProfitMargins]);

  useEffect(() => {
    console.log('Profit Margins Data:', profitMargins);
  }, [profitMargins]);

  const formatCurrency = (amount) => {
    return `₦${amount?.toLocaleString() || '0'}`;
  };

  const getProfitMarginsTableData = () => {
    if (loading.profitMargins) {
      return { header, body: [["Loading...", "...", "...", "..."]] };
    }

    if (errors.profitMargins || !profitMargins || profitMargins.length === 0) {
      return { header, body: rows };
    }

    const tableBody = profitMargins.map(item => [
      item.product || item.name || "N/A",
      formatCurrency(item.cost),
      formatCurrency(item.revenue),
      formatCurrency(item.profit)
    ]);

    return { header, body: tableBody };
  };

  const profitMarginsTableData = getProfitMarginsTableData();

  return (
    <div className='bg-white rounded-2xl p-6'>
      <div className='mb-[1.5rem]'>
        <h1 className='text-[1.375rem] font-semibold'>Profit Margin Analysis</h1>
        <h4 className='text-[1rem] leading-[150%]'>Profit margins by product cost and revenue</h4>
      </div>

      {/* Modern Dropdown Selector */}
      <div className="mb-6">
        <Menu as="div" className="relative inline-block text-left">
          <Menu.Button className="inline-flex items-center justify-between px-4 py-2 w-44 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
            {durationOptions.find(opt => opt.value === duration).label}
            <ChevronDownIcon className="w-4 h-4 ml-2" />
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-150"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Menu.Items className="absolute mt-2 w-44 origin-top-right bg-white border border-gray-200 rounded-lg shadow-lg focus:outline-none z-50">
              <div className="py-1">
                {durationOptions.map((option) => (
                  <Menu.Item key={option.value}>
                    {({ active }) => (
                      <button
                        onClick={() => setDuration(option.value)}
                        className={`w-full text-left px-4 py-2 text-sm rounded ${
                          active ? 'bg-blue-50 text-blue-600' : 'text-gray-800'
                        }`}
                      >
                        {option.label}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>

      {/* Error message */}
      {errors.profitMargins && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error loading profit margins: {errors.profitMargins}
        </div>
      )}

      <span>
        <TableWithoutBorder
          columns={profitMarginsTableData.header}
          data={profitMarginsTableData.body}
        />
      </span>
    </div>
  )
}

export default ProfitMargins
