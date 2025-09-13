import React from 'react';

const BreakdownPage = () => {
  // Revenue data
  const revenueData = [
    { label: 'Fuel', value: 85000, color: '#FF8C05', percentage: 42.5 },
    { label: 'AGO', value: 40000, color: '#00B809', percentage: 20 },
    { label: 'Diesel', value: 50000, color: '#1A71F6', percentage: 25 },
    { label: 'Lubricant', value: 35000, color: '#E27D00', percentage: 12.5 }
  ];

  // Expense data
  const expenseData = [
    { label: 'Product purchase', value: 38000, color: '#E27D00', percentage: 13 },
    { label: 'Maintenance', value: 108000, color: '#00B809', percentage: 37 },
    { label: 'Salaries', value: 20000, color: '#1A71F6', percentage: 7 },
    { label: 'Other Expenses', value: 128000, color: '#FF8C05', percentage: 43 }
  ];

  const formatCurrency = (value) => {
    return `₦${value.toLocaleString()}`;
  };

  const createPieChart = (data, isDonut = false) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    const radius = 80;
    const centerX = 100;
    const centerY = 100;
    const innerRadius = isDonut ? 45 : 0;

    return (
      <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
        {data.map((item, index) => {
          const angle = (item.value / total) * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;
          
          const startAngleRad = (startAngle * Math.PI) / 180;
          const endAngleRad = (endAngle * Math.PI) / 180;
          
          const x1 = centerX + radius * Math.cos(startAngleRad);
          const y1 = centerY + radius * Math.sin(startAngleRad);
          const x2 = centerX + radius * Math.cos(endAngleRad);
          const y2 = centerY + radius * Math.sin(endAngleRad);
          
          const largeArcFlag = angle > 180 ? 1 : 0;
          
          let pathData;
          
          if (isDonut) {
            const innerX1 = centerX + innerRadius * Math.cos(startAngleRad);
            const innerY1 = centerY + innerRadius * Math.sin(startAngleRad);
            const innerX2 = centerX + innerRadius * Math.cos(endAngleRad);
            const innerY2 = centerY + innerRadius * Math.sin(endAngleRad);
            
            pathData = [
              `M ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              `L ${innerX2} ${innerY2}`,
              `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerX1} ${innerY1}`,
              'Z'
            ].join(' ');
          } else {
            pathData = [
              `M ${centerX} ${centerY}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');
          }
          
          currentAngle = endAngle;
          
          // Add text labels for revenue chart
          if (!isDonut && item.value >= 20000) {
            const midAngle = (startAngle + endAngle) / 2;
            const midAngleRad = (midAngle * Math.PI) / 180;
            const textX = centerX + (radius * 0.6) * Math.cos(midAngleRad);
            const textY = centerY + (radius * 0.6) * Math.sin(midAngleRad);
            
            return (
              <g key={index}>
                <path d={pathData} fill={item.color}  strokeWidth="2" /> 
                {/* stroke="white" */}
                <text
                  x={textX}
                  y={textY}
                  fill="white"
                  fontSize="14"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="transform rotate-90"
                  style={{ transformOrigin: `${textX}px ${textY}px` }}
                >
                  {formatCurrency(item.value)}
                </text>
              </g>
            );
          }
          
          return <path key={index} d={pathData} fill={item.color} stroke="white" strokeWidth="2" />;
        })}
        
        {/* Add percentage labels for donut chart */}
        {isDonut && data.map((item, index) => {
          let currentAngle = 0;
          for (let i = 0; i < index; i++) {
            currentAngle += (data[i].value / data.reduce((sum, item) => sum + item.value, 0)) * 360;
          }
          const angle = (item.value / data.reduce((sum, item) => sum + item.value, 0)) * 360;
          const midAngle = currentAngle + angle / 2;
          const midAngleRad = (midAngle * Math.PI) / 180;
          const textRadius = (radius + innerRadius) / 2;
          const textX = centerX + textRadius * Math.cos(midAngleRad);
          const textY = centerY + textRadius * Math.sin(midAngleRad);
          
          return (
            <text
              key={`label-${index}`}
              x={textX}
              y={textY}
              fill="white"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
              className="transform rotate-90"
              style={{ transformOrigin: `${textX}px ${textY}px` }}
            >
              {Math.round(item.percentage)}%
            </text>
          );
        })}
      </svg>
    );
  };

  return (
        <div className="mx-auto max-w-[1394px] w-full lg:p-6 bg-white rounded-2xl p-4">
        {/* Wrapper for the two cards */}
        <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Revenue Breakdown */}
            <div className="bg-white rounded-lg shadow-md p-4 w-full lg:w-[43.0625rem]">
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Revenue Breakdown</h2>
                <p className="text-sm text-gray-500">Revenue by duration selected</p>
            </div>
            <div className="lg:flex flex-wrap items-center gap-10">
                <div className="lg:flex-shrink-0 flex-shrink">
                {createPieChart(revenueData)}
                </div>
                <div className="flex flex-col gap-3">
                {revenueData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-700">{item.label}</span>
                    </div>
                ))}
                </div>
            </div>
            </div>

            {/* Expense Breakdown */}
            <div className="bg-white rounded-lg shadow-sm p-6 w-full lg:w-[43.0625rem]">
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Expense Breakdown</h2>
                <p className="text-sm text-gray-500">Expense by duration selected</p>
            </div>
            <div className=" lg:flex items-center gap-8">
                <div className="flex-shrink-0">{createPieChart(expenseData, true)}</div>
                <div className="flex flex-col gap-3">
                {expenseData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between gap-8 min-w-[180px]">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm text-gray-700">{item.label}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(item.value)}</span>
                    </div>
                ))}
                </div>
            </div>
            </div>

        </div>
        </div>

  );
};

export default BreakdownPage;