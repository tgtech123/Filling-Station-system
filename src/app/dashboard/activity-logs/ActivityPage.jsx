"use client";
import TableHere from "@/components/TableHere";
import SearchBar from "@/hooks/SearchBar";
import React, { useState, useEffect, useMemo } from "react";
import { IoFilter } from "react-icons/io5";
import { Download, Search } from "lucide-react";
import Pagination from "@/components/Pagination";
import useManagerReportsStore from "@/store/useManagerReportsStore";

// ── Column headers 
const TABLE_HEADERS = [
  "Date",
  "User",
  "Role",
  "Action",
  "Description",
  "IP Address",
  "Status",
];

// ── Helpers 
const formatDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "2-digit",
      day:   "2-digit",
      year:  "2-digit",
      hour:  "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return iso;
  }
};

const formatRole = (role) => {
  if (!role) return "—";
  return role.charAt(0).toUpperCase() + role.slice(1);
};

// Map a single log entry → flat row array
// API shape: { date, user, role, action, description, ipAddress, status }
const mapLogRow = (log) => [
  formatDate(log.date),
  log.user        ?? "—",
  formatRole(log.role),
  log.action      ?? "—",
  log.description ?? "—",
  log.ipAddress   ?? "—",
  log.status      ?? "—",
];

// ── Component ─────────────────────────────────────────────────────────────────
const ActivityPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm,  setSearchTerm]  = useState("");
  // Duration and status were rendered as buttons with no onClick — decoration
  // over an API that already accepted startDate/endDate/role/status. Now wired.
  const [duration,    setDuration]    = useState("all");
  const [statusFilter, setStatusFilter] = useState("");
  const itemsPerPage = 8;

  const activityLogs          = useManagerReportsStore((state) => state.activityLogs);
  const filteredActivityLogs  = useManagerReportsStore((state) => state.filteredActivityLogs);
  const loading               = useManagerReportsStore((state) => state.loading.activityLogs);
  const error                 = useManagerReportsStore((state) => state.errors.activityLogs);
  const fetchActivityLogs     = useManagerReportsStore((state) => state.fetchActivityLogs);
  const setActivityLogsFilters = useManagerReportsStore((state) => state.setActivityLogsFilters);

  // Turn a duration choice into the date range the API expects. "all" sends no
  // dates at all, which the server reads as unbounded.
  const dateRangeFor = (value) => {
    if (value === "all") return { startDate: undefined, endDate: undefined };

    const end = new Date();
    const start = new Date();
    if (value === "today") start.setHours(0, 0, 0, 0);
    else if (value === "7d") start.setDate(start.getDate() - 7);
    else if (value === "30d") start.setDate(start.getDate() - 30);
    else if (value === "month") start.setDate(1), start.setHours(0, 0, 0, 0);

    return { startDate: start.toISOString(), endDate: end.toISOString() };
  };

  // ── Initial fetch + re-fetch when page or filters change ──────────────────
  useEffect(() => {
    fetchActivityLogs({
      page: currentPage,
      limit: itemsPerPage,
      ...dateRangeFor(duration),
      status: statusFilter || undefined,
    });
  }, [currentPage, duration, statusFilter]);

  // ── Search: store handles in-memory filtering via setActivityLogsFilters ──
  // No new network request — the store applies the filter on the already-
  // fetched page and exposes the result via filteredActivityLogs.
  useEffect(() => {
    setActivityLogsFilters({ search: searchTerm });
    setCurrentPage(1);
  }, [searchTerm]);

  // Use filteredActivityLogs (search applied) when a search term is active,
  // otherwise use the raw fetched page logs.
  const logsToDisplay = searchTerm.trim()
    ? filteredActivityLogs
    : (activityLogs?.logs ?? []);

  const tableRows = logsToDisplay.map(mapLogRow);

  // Pagination — use server-side totals when not searching; fall back to
  // local count while search is active (filtered in-memory on current page).
  const pagination = activityLogs?.pagination ?? {};
  const totalItems = searchTerm.trim()
    ? tableRows.length
    : (pagination.total ?? 0);
  const totalPages = searchTerm.trim()
    ? Math.ceil(tableRows.length / itemsPerPage)
    : (pagination.pages ?? 1);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handlePageChange   = (page) => {
    setCurrentPage(page);
    // Clear in-memory search filter when navigating pages so the new
    // server page isn't filtered against the previous page's data.
    if (searchTerm.trim()) {
      setActivityLogsFilters({ search: "" });
      setSearchTerm("");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 mt-[1.5rem] max-w-full mx-8 mb-[1rem]">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-[1.375rem] font-semibold">Recent Transactions</h1>
          <p className="text-[1rem] text-gray-500 dark:text-gray-400">Latest activity logs</p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end flex-shrink-0">
          {/* Search */}
          <div className="relative flex items-center w-full sm:w-auto">
            <Search size={16} className="absolute left-3 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by user or action"
              className="border-2 pl-9 pr-3 py-2 border-neutral-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400 rounded-2xl text-sm focus:outline-none focus:border-blue-500 w-full sm:w-[18rem]"
            />
          </div>

          {/* Duration · Filter · Export */}
          <div className="flex gap-2 flex-wrap">
            {/* Native selects rather than custom popovers: they work on every
                device, are keyboard and screen-reader accessible for free, and
                the API behind them already supported these parameters. */}
            <label className="sr-only" htmlFor="activity-duration">Duration</label>
            <select
              id="activity-duration"
              value={duration}
              onChange={(e) => { setDuration(e.target.value); setCurrentPage(1); }}
              className="border-2 border-neutral-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 px-4 py-2 rounded-2xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            >
              <option value="all">All time</option>
              <option value="today">Today</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="month">This month</option>
            </select>

            <label className="sr-only" htmlFor="activity-status">Filter by status</label>
            <select
              id="activity-status"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="border-2 border-neutral-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 px-4 py-2 rounded-2xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            >
              <option value="">All statuses</option>
              <option value="Success">Success</option>
              <option value="Failed">Failed</option>
              <option value="Critical">Critical</option>
            </select>
            <button className="bg-blue-500 text-white px-4 py-2 flex gap-2 items-center rounded-2xl hover:bg-blue-700 font-bold text-sm transition-colors">
              Export
              <Download size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <span className="mt-[1rem]">
        {loading ? (
          <div className="space-y-3 mt-4">
            {[...Array(itemsPerPage)].map((_, i) => (
              <div key={i} className="h-12 rounded-xl bg-neutral-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <TableHere
            columns={TABLE_HEADERS}
            data={tableRows}
          />
        )}
      </span>

      {/* Pagination */}
      <span>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
        />
      </span>
    </div>
  );
};

export default ActivityPage;


// "use client";

// import TableHere from "@/components/TableHere";
// import SearchBar from "@/components/SearchBar";
// import React, { useState, useEffect, useMemo } from "react";
// import { IoFilter } from "react-icons/io5";
// import Pagination from "@/components/Pagination";
// import useSupervisorStore from "@/store/useSupervisorStore";

// const ActivityPage = () => {
//   const [currentPage, setCurrentPage] = useState(1);
//   const [searchTerm, setSearchTerm] = useState("");
//   const itemsPerPage = 8;

//   const { activityLogs, loading, error, fetchActivityLogs } = useSupervisorStore();

//   useEffect(() => {
//     fetchActivityLogs({ page: 1, limit: 100 });
//   }, [fetchActivityLogs]);

//   // Table columns
//   const tableColumns = [
//     "Date & Time",
//     "User",
//     "Role",
//     "Action",
//     "Description",
//     "IP Address",
//     "Status"
//   ];

//   // Transform API data to table rows
//   const tableRows = useMemo(() => {
//     if (!activityLogs?.logs) return [];
    
//     return activityLogs.logs.map((log) => [
//       new Date(log.date).toLocaleString(),
//       log.user,
//       log.role,
//       log.action,
//       log.description,
//       log.ipAddress,
//       <span 
//         key={log._id}
//         className={`px-2 py-1 rounded text-xs font-semibold ${
//           log.status === "Success" 
//             ? "bg-green-100 text-green-700" 
//             : log.status === "Failed"
//             ? "bg-red-100 text-red-700"
//             : "bg-yellow-100 text-yellow-700"
//         }`}
//       >
//         {log.status}
//       </span>
//     ]);
//   }, [activityLogs]);

//   // Filter data based on search term
//   const filteredData = useMemo(() => {
//     if (!searchTerm.trim()) {
//       return tableRows;
//     }
//     return tableRows.filter((row) => {
//       return row.some((cell) => {
//         const cellValue = React.isValidElement(cell) ? cell.props.children : cell;
//         if (cellValue === null || cellValue === undefined) return false;
//         return cellValue.toString().toLowerCase().includes(searchTerm.toLowerCase());
//       });
//     });
//   }, [searchTerm, tableRows]);

//  // Calculate pagination values
// const totalItems = filteredData.length;
// const totalPages = Math.ceil(totalItems / itemsPerPage);
// const startIndex = (currentPage - 1) * itemsPerPage;
// const endIndex = startIndex + itemsPerPage; // ← ADD THIS LINE
// const currentData = filteredData.slice(startIndex, endIndex);

//   // Reset to page 1 when search term changes
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [searchTerm]);

//   // Loading state
//   if (loading && !activityLogs) {
//     return (
//       <div className="bg-white rounded-2xl p-4 mt-[1.5rem] max-x-full mx-8 mb-[1rem]">
//         <div className="text-center py-12">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-500">Loading activity logs...</p>
//         </div>
//       </div>
//     );
//   }

//   // Error state
//   if (error) {
//     return (
//       <div className="bg-white rounded-2xl p-4 mt-[1.5rem] max-x-full mx-8 mb-[1rem]">
//         <div className="text-center py-12">
//           <p className="text-red-600">Error: {error}</p>
//           <button 
//             onClick={() => fetchActivityLogs({ page: 1, limit: 100 })}
//             className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Empty state
//   if (!activityLogs?.logs || activityLogs.logs.length === 0) {
//     return (
//       <div className="bg-white rounded-2xl p-4 mt-[1.5rem] max-x-full mx-8 mb-[1rem]">
//         <div className="text-center py-12">
//           <p className="text-gray-500">No activity logs found</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white rounded-2xl p-4 mt-[1.5rem] max-x-full mx-8 mb-[1rem]">
//       <div className="lg:flex flex-wrap gap-3 justify-between">
//         <div className="flex-wrap gap-3">
//           <h1 className="text-[1.375rem] font-semibold">Recent Activities</h1>
//           <p className="text-[1rem] font-[400px]">Latest activity logs</p>
//         </div>

//         <div className="lg:flex lg:gap-3 gap-3 max-w-full">
//           <SearchBar
//             searchTerm={searchTerm}
//             onSearch={setSearchTerm}
//           />
//           <div className="flex lg:mt-0 mt-[0.75rem] gap-2">
//             <button className="border-2 border-neutral-300 px-4 py-2 rounded-2xl font-semibold">
//               Duration
//             </button>
//             <button className="border-2 border-neutral-300 px-4 py-2 rounded-2xl font-semibold flex gap-2 items-center">
//               Filter <IoFilter size={20} />
//             </button>
//             <button className="border-2 border-neutral-300 bg-blue-600 text-white px-4 py-2 rounded-2xl font-semibold">
//               Export
//             </button>
//           </div>
//         </div>
//       </div>

//       <span className="mt-[1rem]">
//         <TableHere
//           columns={tableColumns}
//           data={currentData}
//         />
//       </span>

//       <span>
//         <Pagination
//           currentPage={currentPage}
//           totalPages={totalPages}
//           totalItems={totalItems}
//           onPageChange={setCurrentPage}
//           itemsPerPage={itemsPerPage}
//         />
//       </span>
//     </div>
//   );
// };

// export default ActivityPage;