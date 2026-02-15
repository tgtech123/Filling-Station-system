import React from "react";
import StatCardTwo from "./StatCardTwo";

const StatGrid = ({ 
  data, 
  columns = { sm: 2, lg: 4 },
  gap = 6 
}) => {
  return (
    <div 
      className={`grid grid-cols-1 gap-${gap} sm:grid-cols-${columns.sm} lg:grid-cols-${columns.lg}`}
    >
      {data.map((stat) => (
        <StatCardTwo 
          key={stat.id}
          label={stat.label}
          value={stat.value}
          change={stat.change}
          icon={stat.icon}
          iconBg={stat.iconBg}
          iconColor={stat.iconColor}
          changeColor={stat.changeColor}
          showChange={stat.showChange}
          changeLabel={stat.changeLabel}
        />
      ))}
    </div>
  );
};

export default StatGrid;
