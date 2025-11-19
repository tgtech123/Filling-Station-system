// import React from 'react'
// import { dailyAttendantSalesColumns, dailyAttendantSalesData } from './dailyAttendantSalesData'
// import TableWithoutBorder from '@/components/TableWithoutBorder'

// const DailyAttendantSales = () => {
//   return (
//     <div className='bg-white w-full rounded-2xl p-5 mt-[1.5rem] overflow-hidden'>
//         <TableWithoutBorder columns={dailyAttendantSalesColumns} data={dailyAttendantSalesData} />
//     </div>
//   )
// }

// export default DailyAttendantSales

import React from "react";
import {
  dailyAttendantSalesColumns,
  dailyAttendantSalesData,
} from "./dailyAttendantSalesData";
import TableWithoutBorder from "@/components/TableWithoutBorder";
import SearchBar from "@/hooks/SearchBar";

const DailyAttendantSales = () => {
  return (
    <div className="bg-white w-full overflow-x-auto rounded-2xl p-5 mt-[1.5rem] ">

        <div className="flex justify-between mb-[1rem]">
            <h1 className="text-[1.125rem] font-medium">Daily Attendant Sales Summary</h1>
            <SearchBar />   
        </div>
    
        <TableWithoutBorder
          columns={dailyAttendantSalesColumns}
          data={dailyAttendantSalesData}
        />
      
    </div>
  );
};

export default DailyAttendantSales;

