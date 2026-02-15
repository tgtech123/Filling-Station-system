"use client"
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import useTrendsStore from '@/store/useTrendsStore';

const PaymentCommissionPage = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const data = ["Monthly", "Daily", "Quarterly", "Yearly"];
  const [isUp, setIsUp] = useState(false);
  const [selected, setSelected] = useState("Monthly");
  const [paymentMethodsData, setPaymentMethodsData] = useState([]);
  const [commissionData, setCommissionData] = useState([]);

  const { 
    paymentMethods, 
    commissionPayouts, 
    loading 
  } = useTrendsStore();

  useEffect(() => {
    if (paymentMethods && paymentMethods.length > 0) {
      setPaymentMethodsData(paymentMethods);
    } else {
      setPaymentMethodsData([
        { method: 'Cash', percentage: 0, transactions: 0, amount: 0 },
        { method: 'POS', percentage: 0, transactions: 0, amount: 0 },
        { method: 'Transfer', percentage: 0, transactions: 0, amount: 0 },
      ]);
    }
  }, [paymentMethods]);

  useEffect(() => {
    if (commissionPayouts && commissionPayouts.length > 0) {
      setCommissionData(commissionPayouts);
    } else {
      const emptyData = months.map(month => ({
        month,
        commission: 0,
        rate: 0,
        volume: 0,
      }));
      setCommissionData(emptyData);
    }
  }, [commissionPayouts]);

  const handleSelect = (item) => {
    setSelected(item);
    setIsUp(false);
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return "₦0";
    return `₦${value.toLocaleString('en-US')}`;
  };

  const formatVolume = (value) => {
    if (!value && value !== 0) return "0L";
    return `${value.toLocaleString('en-US')}L`;
  };

  // Calculate bar heights based on percentages
  const getBarHeight = (percentage) => {
    const maxHeight = 180;
    return (percentage / 100) * maxHeight;
  };

  // Get payment method data
  const getCashData = () => paymentMethodsData.find(p => p.method === 'Cash') || { percentage: 0, transactions: 0, amount: 0 };
  const getPOSData = () => paymentMethodsData.find(p => p.method === 'POS') || { percentage: 0, transactions: 0, amount: 0 };
  const getTransferData = () => paymentMethodsData.find(p => p.method === 'Transfer') || { percentage: 0, transactions: 0, amount: 0 };

  const cashData = getCashData();
  const posData = getPOSData();
  const transferData = getTransferData();

  // Calculate scatter plot positions for commission chart
  const createScatterPoints = () => {
    const maxCommission = Math.max(...commissionData.map(d => d.commission || 0), 200000);
    const chartHeight = 180;
    const chartWidth = 435;

    return commissionData.map((item, index) => {
      const x = 60 + (index / (commissionData.length - 1)) * (chartWidth - 60);
      const y = 20 + chartHeight - ((item.commission || 0) / maxCommission) * chartHeight;
      return { x, y, item };
    });
  };

  const scatterPoints = createScatterPoints();

  // Get latest commission data for annotation
  const latestCommission = commissionData.length > 0 ? commissionData[commissionData.length - 1] : { commission: 0, rate: 0, volume: 0 };

  return (
    <div className="lg:flex flex-wrap gap-6 mt-[0.75rem] ">
      {/* Payment Methods */}
      <div className="bg-white rounded-lg shadow-sm p-6 flex-1">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-gray-900">Payment Methods</h2>
          <div className="relative w-30">
            <div onClick={() => setIsUp(!isUp)} className="appearance-none text-neutral-600 flex bg-white border border-gray-300 rounded-lg justify-between items-center px-4 py-2 pr- text-sm focus:outline-none cursor-pointer">
              <span className='font-bold text-[1rem]'>
                {selected}
              </span>
              {isUp ? <ChevronUp size={25} /> : <ChevronDown size={25} />}
            </div>
            {isUp && (
              <div className="absolute left-0 right-0 bg-white border px-1 border-gray-300 mt-1 rounded-lg shadow-lg z-10">
                {data.map((item, index) => (
                  <p key={index} onClick={() => handleSelect(item)} className='list-disc hover:bg-blue-600 hover:rounded-md p-1 hover:text-white cursor-pointer'>
                    {item}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bar Chart */}
        {loading.dashboard ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading chart...</div>
          </div>
        ) : (
          <>
            <div className="flex items-end justify-center gap-8 mb-8 h-64">
              {/* Cash Bar */}
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div 
                    className="w-24"
                    style={{
                      height: `${getBarHeight(cashData.percentage)}px`,
                      background: 'linear-gradient(180deg, #EA580C 0%, #FB923C 50%, #FDBA74 100%)'
                    }}
                  ></div>
                </div>
              </div>

              {/* POS Bar */}
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div 
                    className="w-24"
                    style={{
                      height: `${getBarHeight(posData.percentage)}px`,
                      background: 'linear-gradient(180deg, #F59E0B 0%, #FBBF24 50%, #FCD34D 100%)'
                    }}
                  ></div>
                </div>
              </div>

              {/* Transfer Bar */}
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div 
                    className="w-24"
                    style={{
                      height: `${getBarHeight(transferData.percentage)}px`,
                      background: 'linear-gradient(180deg, #FDE68A 0%, #FEF3C7 50%, #FFFBEB 100%)'
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Legend and Stats */}
            <div className="flex justify-center gap-12">
              {/* Cash */}
              <div className="text-center">
                <div className="flex items-center gap-2 mb-2 justify-center">
                  <div className="w-4 h-4 bg-[#EA580C]"></div>
                  <span className="text-sm font-medium text-gray-700">Cash</span>
                  <span className="text-lg font-bold text-gray-900">{cashData.percentage.toFixed(0)}%</span>
                </div>
                <div className="text-sm text-gray-500 mb-1">Transactions</div>
                <div className="text-sm font-semibold text-gray-700 mb-2">{cashData.transactions}</div>
                <div className="text-sm text-gray-500 mb-1">Amount</div>
                <div className="text-sm font-semibold text-gray-700">{formatCurrency(cashData.amount)}</div>
              </div>

              {/* POS */}
              <div className="text-center">
                <div className="flex items-center gap-2 mb-2 justify-center">
                  <div className="w-4 h-4 bg-[#F59E0B]"></div>
                  <span className="text-sm font-medium text-gray-700">POS</span>
                  <span className="text-lg font-bold text-gray-900">{posData.percentage.toFixed(0)}%</span>
                </div>
                <div className="text-sm text-gray-500 mb-1">Transactions</div>
                <div className="text-sm font-semibold text-gray-700 mb-2">{posData.transactions}</div>
                <div className="text-sm text-gray-500 mb-1">Amount</div>
                <div className="text-sm font-semibold text-gray-700">{formatCurrency(posData.amount)}</div>
              </div>

              {/* Transfer */}
              <div className="text-center">
                <div className="flex items-center gap-2 mb-2 justify-center">
                  <div className="w-4 h-4 bg-[#FDE68A]"></div>
                  <span className="text-sm font-medium text-gray-700">Transfer</span>
                  <span className="text-lg font-bold text-gray-900">{transferData.percentage.toFixed(0)}%</span>
                </div>
                <div className="text-sm text-gray-500 mb-1">Transactions</div>
                <div className="text-sm font-semibold text-gray-700 mb-2">{transferData.transactions}</div>
                <div className="text-sm text-gray-500 mb-1">Amount</div>
                <div className="text-sm font-semibold text-gray-700">{formatCurrency(transferData.amount)}</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Commission Payouts */}
      <div className="bg-white rounded-lg shadow-sm p-6 flex-1">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-gray-900">Commission Payouts</h2>
          <div className="relative">
            <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none">
              <option>Daily</option>
              <option>Monthly</option>
              <option>Quarterly</option>
              <option>Yearly</option>
            </select>
            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Chart Area */}
        {loading.dashboard ? (
          <div className="flex items-center justify-center h-72">
            <div className="text-gray-500">Loading chart...</div>
          </div>
        ) : (
          <div className="relative h-72">
            <svg width="100%" height="100%" viewBox="0 0 500 280" className="overflow-visible">
              {/* Y-axis labels */}
              <text x="15" y="25" fontSize="12" fill="#9ca3af" textAnchor="end">200K</text>
              <text x="15" y="70" fontSize="12" fill="#9ca3af" textAnchor="end">150K</text>
              <text x="15" y="115" fontSize="12" fill="#9ca3af" textAnchor="end">100K</text>
              <text x="15" y="160" fontSize="12" fill="#9ca3af" textAnchor="end">50K</text>
              <text x="15" y="205" fontSize="12" fill="#9ca3af" textAnchor="end">0K</text>

              {/* Grid lines */}
              <line x1="25" y1="20" x2="470" y2="20" stroke="#f1f5f9" strokeWidth="1"/>
              <line x1="25" y1="65" x2="470" y2="65" stroke="#f1f5f9" strokeWidth="1"/>
              <line x1="25" y1="110" x2="470" y2="110" stroke="#f1f5f9" strokeWidth="1"/>
              <line x1="25" y1="155" x2="470" y2="155" stroke="#f1f5f9" strokeWidth="1"/>
              <line x1="25" y1="200" x2="470" y2="200" stroke="#f1f5f9" strokeWidth="1"/>

              {/* Scatter plot dots */}
              {scatterPoints.map((point, index) => (
                <circle 
                  key={index} 
                  cx={point.x} 
                  cy={point.y} 
                  r="5" 
                  fill="#2563eb"
                />
              ))}
            </svg>

            <div className='bg-blue-600 absolute top-16 p-2 right-30 h-[8.5rem] w-[5.75rem] rounded-lg text-white'>
              <div className='flex flex-col'>
                <div className='text-[0.625rem] mb-[0.75rem]'>
                  <h1>Commission</h1>
                  <h1 className='font-semibold'>{formatCurrency(latestCommission.commission)}</h1>
                </div>

                <div className='text-[0.625rem] mb-[0.75rem]'>
                  <h1>Rate</h1>
                  <h1 className='font-semibold'>{latestCommission.rate}%</h1>
                </div>

                <div className='text-[0.625rem]'>
                  <h1>Volume</h1>
                  <h1 className='font-semibold'>{formatVolume(latestCommission.volume)}</h1>
                </div>
              </div>  
            </div>

            {/* X-axis months */}
            <div className="absolute -bottom-6 left-0 right-0 flex justify-between px-12 text-xs text-gray-500">
              {months.map((month, index) => (
                <span key={index}>{month}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentCommissionPage;


// "use client"
// import React, { useState } from 'react';
// import { ChevronDown, ChevronUp } from 'lucide-react';

// const PaymentCommissionPage = () => {
//   const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Des'];
//   const data = ["Monthly", "Daily", "Quarterly", "Yearly" ]
//   const [isUp, setIsUp] = useState(false)
//   const [selected, setSelected] =useState("")

//   const handleSelect = (item) =>{
//     setSelected(item)
//     setIsUp(false)
//   }

//   return (
//     <div className="lg:flex flex-wrap gap-6 mt-[0.75rem] ">
//       {/* Payment Methods */}
//       <div className="bg-white rounded-lg shadow-sm p-6 flex-1">
//         <div className="flex items-center justify-between mb-8">
//           <h2 className="text-xl font-semibold text-gray-900">Payment Methods</h2>
//           <div className="relative w-30">
//             <div onClick={()=> setIsUp(!isUp)} className="appearance-none  text-neutral-600 flex bg-white border border-gray-300 rounded-lg justify-between items-center px-4 py-2 pr- text-sm focus:outline-none">
        
//                 <span className='font-bold text-[1rem]'>
//                     {selected || "Monthly "}
//                 </span>
//                 {isUp ? <ChevronUp size={25} /> : <ChevronDown size={25} />}
//             </div>
//             {isUp && (
//                 <div  className="absolute left-0 right-0 bg-white border px-1 border-gray-300 mt-1 rounded-lg shadow-lg z-10">
//                     {data.map((item, index) =>(
//                         <p key={index} onClick={()=> handleSelect(item)} className=' list-disc hover:bg-blue-600  hover:rounded-md p-1 hover:text-white'>
//                             {item}
//                          </p>
//                     ))}
//                 </div>
//             )}
//           </div>
//         </div>

//         {/* Bar Chart */}
//         <div className="flex items-end justify-center gap-8 mb-8 h-64">
//           {/* Cash Bar */}
//           <div className="flex flex-col items-center">
//             <div className="relative mb-4">
//               <div 
//                 className="w-24"
//                 style={{
//                   height: '180px',
//                   background: 'linear-gradient(180deg, #EA580C 0%, #FB923C 50%, #FDBA74 100%)'
//                 }}
//               ></div>
//             </div>
//           </div>

//           {/* POS Bar */}
//           <div className="flex flex-col items-center">
//             <div className="relative mb-4">
//               <div 
//                 className="w-24"
//                 style={{
//                   height: '150px',
//                   background: 'linear-gradient(180deg, #F59E0B 0%, #FBBF24 50%, #FCD34D 100%)'
//                 }}
//               ></div>
//             </div>
//           </div>

//           {/* Transfer Bar */}
//           <div className="flex flex-col items-center">
//             <div className="relative mb-4">
//               <div 
//                 className="w-24 "
//                 style={{
//                   height: '90px',
//                   background: 'linear-gradient(180deg, #FDE68A 0%, #FEF3C7 50%, #FFFBEB 100%)'
//                 }}
//               ></div>
//             </div>
//           </div>
//         </div>

//         {/* Legend and Stats */}
//         <div className="flex justify-center gap-12">
//           {/* Cash */}
//           <div className="text-center">
//             <div className="flex items-center gap-2 mb-2 justify-center">
//               <div className="w-4 h-4 bg-[#EA580C]"></div>
//               <span className="text-sm font-medium text-gray-700">Cash</span>
//               <span className="text-lg font-bold text-gray-900">45%</span>
//             </div>
//             <div className="text-sm text-gray-500 mb-1">Transactions</div>
//             <div className="text-sm font-semibold text-gray-700 mb-2">334</div>
//             <div className="text-sm text-gray-500 mb-1">Amount</div>
//             <div className="text-sm font-semibold text-gray-700">₦250,000</div>
//           </div>

//           {/* POS */}
//           <div className="text-center">
//             <div className="flex items-center gap-2 mb-2 justify-center">
//               <div className="w-4 h-4 bg-[#F59E0B] "></div>
//               <span className="text-sm font-medium text-gray-700">POS</span>
//               <span className="text-lg font-bold text-gray-900">40%</span>
//             </div>
//             <div className="text-sm text-gray-500 mb-1">Transactions</div>
//             <div className="text-sm font-semibold text-gray-700 mb-2">334</div>
//             <div className="text-sm text-gray-500 mb-1">Amount</div>
//             <div className="text-sm font-semibold text-gray-700">₦250,000</div>
//           </div>

//           {/* Transfer */}
//           <div className="text-center">
//             <div className="flex items-center gap-2 mb-2 justify-center">
//               <div className="w-4 h-4 bg-[#FDE68A] "></div>
//               <span className="text-sm font-medium text-gray-700">Transfer</span>
//               <span className="text-lg font-bold text-gray-900">15%</span>
//             </div>
//             <div className="text-sm text-gray-500 mb-1">Transactions</div>
//             <div className="text-sm font-semibold text-gray-700 mb-2">334</div>
//             <div className="text-sm text-gray-500 mb-1">Amount</div>
//             <div className="text-sm font-semibold text-gray-700">₦250,000</div>
//           </div>
//         </div>
//       </div>

//       {/* Commission Payouts */}
//       <div className="bg-white rounded-lg shadow-sm p-6 flex-1">
//         <div className="flex items-center justify-between mb-8">
//           <h2 className="text-xl font-semibold text-gray-900">Commission Payouts</h2>
//           <div className="relative">
//             <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none">
//               <option className='hover:bg-blue-600'>Daily</option>
//               <option>Monthly</option>
//               <option>Quarterly</option>
//               <option>Yearly</option>
//             </select>
//             <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//             </svg>
//           </div>
//         </div>

//         {/* Chart Area */}
//         <div className="relative h-72">
//           <svg width="100%" height="100%" viewBox="0 0 500 280" className="overflow-visible">
//             {/* Y-axis labels */}
//             <text x="15" y="25" fontSize="12" fill="#9ca3af" textAnchor="end">200K</text>
//             <text x="15" y="70" fontSize="12" fill="#9ca3af" textAnchor="end">150K</text>
//             <text x="15" y="115" fontSize="12" fill="#9ca3af" textAnchor="end">100K</text>
//             <text x="15" y="160" fontSize="12" fill="#9ca3af" textAnchor="end">50K</text>
//             <text x="15" y="205" fontSize="12" fill="#9ca3af" textAnchor="end">0K</text>

//             {/* Grid lines */}
//             <line x1="25" y1="20" x2="470" y2="20" stroke="#f1f5f9" strokeWidth="1"/>
//             <line x1="25" y1="65" x2="470" y2="65" stroke="#f1f5f9" strokeWidth="1"/>
//             <line x1="25" y1="110" x2="470" y2="110" stroke="#f1f5f9" strokeWidth="1"/>
//             <line x1="25" y1="155" x2="470" y2="155" stroke="#f1f5f9" strokeWidth="1"/>
//             <line x1="25" y1="200" x2="470" y2="200" stroke="#f1f5f9" strokeWidth="1"/>

//             {/* Scatter plot dots - positioned to match screenshot */}
//             {/* Jan */}
//             <circle cx="60" cy="130" r="5" fill="#2563eb"/>
            
//             {/* Feb */}
//             <circle cx="100" cy="110" r="5" fill="#2563eb"/>
            
//             {/* Mar */}
//             <circle cx="140" cy="120" r="5" fill="#2563eb"/>
            
//             {/* Apr */}
//             <circle cx="180" cy="95" r="5" fill="#2563eb"/>
            
//             {/* May */}
//             <circle cx="220" cy="85" r="5" fill="#2563eb"/>
            
//             {/* Jun */}
//             <circle cx="260" cy="92" r="5" fill="#2563eb"/>
            
//             {/* Jul */}
//             <circle cx="300" cy="88" r="5" fill="#2563eb"/>
            
//             {/* Aug */}
//             <circle cx="340" cy="105" r="5" fill="#2563eb"/>
            
//             {/* Sep */}
//             <circle cx="380" cy="100" r="5" fill="#2563eb"/>
            
//             {/* Oct */}
//             <circle cx="420" cy="125" r="5" fill="#2563eb"/>
            
//             {/* Nov */}
//             <circle cx="460" cy="115" r="5" fill="#2563eb"/>

           
//               <rect x="8" y="48" width="104" height="16" fill="rgba(255,255,255,0.2)" rx="4"/>
//               <text x="15" y="58" fontSize="10" fill="white">Volume</text>
//               <text x="100" y="58" fontSize="11" fill="white" textAnchor="end" fontWeight="bold">45,000L</text>
//             {/* </g> */} 

//           </svg>
//             <div className='bg-blue-600 absolute top-16 p-2 right-30 h-[8.5rem] w-[5.75rem] rounded-lg text-white'>
//                 <div className='flex flex-col' >
//                     <div className='text-[0.625rem] mb-[0.75rem]'>
//                         <h1 >Commission</h1>
//                         <h1 className='font-semibold'>N115,000</h1>
//                     </div>

//                     <div className='text-[0.625rem] mb-[0.75rem]'>
//                         <h1 >Rate</h1>
//                         <h1 className='font-semibold'>1.8%</h1>
//                     </div>

//                     <div className='text-[0.625rem]'>
//                         <h1 >Volume</h1>
//                         <h1 className='font-semibold'>45, 000L</h1>
//                     </div>
                    
//                 </div>  
//             </div>

//           {/* X-axis months */}
//           <div className="absolute -bottom-6 left-0 right-0 flex justify-between px-12 text-xs text-gray-500">
//             {months.map((month, index) => (
//               <span key={index}>{month}</span>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PaymentCommissionPage;