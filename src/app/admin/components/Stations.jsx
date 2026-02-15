import React, { useMemo, useState } from "react";
import StatGrid from "./StatGrid";
import { stationData } from "./stationData";
import SearchBarButtons from "./SearchBarButtons";
import DataTable from "./DataTable";
import { stationsTableData } from "./stationsTableData";
import * as XLSX from "xlsx"

const Stations = () => {
  const [search, setSearch] = useState("");

  const handleActionClick = (row) => {
    console.log("Action clicked for:", row);
  };

  /* 🔍 SEARCH LOGIC */
  const filteredRows = useMemo(() => {
    if (!search) return stationsTableData.rows;

    const term = search.toLowerCase();

    return stationsTableData.rows.filter(
      (row) =>
        row.stationName.toLowerCase().includes(term) ||
        row.owner.toLowerCase().includes(term)
    );
  }, [search]);

  /* 📤 EXPORT FUNCTION (CSV) */
 const handleExport = () => {
  // Remove action column
  const headers = stationsTableData.headers
    .filter((h) => h.key !== "action")
    .map((h) => h.label);

  const data = filteredRows.map((row) => {
    const obj = {};
    stationsTableData.headers.forEach((h) => {
      if (h.key !== "action") {
        obj[h.label] = row[h.key];
      }
    });
    return obj;
  });

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Stations");

  // Export file
  XLSX.writeFile(workbook, "stations.xlsx");
};


  return (
    <div className="p-[2rem]">
      <h1 className="text-[28px] font-semibold mb-[0.8rem]">
        Filling Stations
      </h1>

      <p className="text-neutral-500 text-[1.125rem] mb-[1.5rem]">
        Manage all registered filling stations and their subscriptions
      </p>

      <StatGrid data={stationData} />

      <div className="bg-white p-6 rounded-2xl mt-[1.5rem]">
        <SearchBarButtons
          searchValue={search}
          onSearchChange={setSearch}
          onExport={handleExport}
        />

        <div className="mt-[1.5rem]">
          <DataTable
            headers={stationsTableData.headers}
            rows={filteredRows}
            onActionClick={handleActionClick}
          />
        </div>
      </div>
    </div>
  );
};

export default Stations;




// import React from 'react'
// import StatGrid from './StatGrid'
// import { stationData } from './stationData'
// import SearchBarButtons from './SearchBarButtons'
// import DataTable from './DataTable'
// import { stationsTableData } from './stationsTableData'

// const Stations = () => {
//   const handleActionClick = (row) => {
//     console.log("Action clicked for:", row);
//   };
//   return (
//     <div className='p-[2rem]'>
//       <h1 className='text-[28px] font-semibold leading-[100%] mb-[0.8rem]'>
//         Filling Stations
//       </h1>

//       <p className='text-neutral-500 text-[1.125rem] mb-[1.5rem]'>
//         Manage all registered filling stations and their subscriptions
//       </p>
//         <div>
//             <StatGrid data={stationData} />
//         </div>

//         <div className='bg-white p-6 rounded-2xl mt-[1.5rem]'>
//             <SearchBarButtons />

//             <div className='mt-[1.5rem]'>
//               <DataTable headers={stationsTableData.headers} rows={stationsTableData.rows} onActionClick={handleActionClick} />
//             </div>
//         </div>

//         {/* <div className='bg-white'>

//         </div> */}
//     </div>
//   )
// }

// export default Stations