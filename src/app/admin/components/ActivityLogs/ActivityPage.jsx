"use client";
import React, { useState, useMemo, useEffect } from 'react'
import StatGrid from '../StatGrid'
import { Search, Download, TrendingUp, CircleCheck, TriangleAlert } from "lucide-react";
import { TbAlertHexagon } from "react-icons/tb";
import DataTable from '../DataTable';
import { auditLogHeaders } from './AuditLogData';
import Pagination from '../PaymentAndBilling/Pagination';
import useAdminStore from '@/store/useAdminStore';

const ITEMS_PER_PAGE = 10;

const ActivityPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [durationFilter, setDurationFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { activityLogs, loading, fetchActivityLogs } = useAdminStore();

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  // Map raw API log to table row shape
  const mappedLogs = useMemo(() => {
    const logs = Array.isArray(activityLogs)
      ? activityLogs
      : activityLogs?.logs || activityLogs?.data || [];
    if (!logs || logs.length === 0) return [];
    return logs.map((log, i) => {
      const rawDate = log.createdAt || log.timestamp || log.dateTime || null;
      return {
        id: log._id || log.id || i,
        eventType: log.eventType || log.type || log.action || "—",
        description: log.description || log.message || log.details || "—",
        stationUser: log.stationName || log.station || log.user || log.performedBy || "—",
        status: log.status || log.severity || "Info",
        dateTime: rawDate
          ? new Date(rawDate).toLocaleString("en-GB", {
              year: "numeric", month: "2-digit", day: "2-digit",
              hour: "2-digit", minute: "2-digit",
            }).replace(",", "")
          : "—",
        _rawDate: rawDate,
      };
    });
  }, [activityLogs]);

  const filterByDuration = (row) => {
    if (!durationFilter) return true;
    const rowDate = new Date(row._rawDate || row.dateTime);
    const now = new Date();

    if (durationFilter === "Weekly") {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return rowDate >= weekAgo && rowDate <= now;
    }
    if (durationFilter === "Monthly") {
      const monthAgo = new Date();
      monthAgo.setMonth(now.getMonth() - 1);
      return rowDate >= monthAgo && rowDate <= now;
    }
    if (durationFilter === "Yearly") {
      const yearAgo = new Date();
      yearAgo.setFullYear(now.getFullYear() - 1);
      return rowDate >= yearAgo && rowDate <= now;
    }
    return true;
  };

  const filteredData = useMemo(() => {
    setCurrentPage(1);
    return mappedLogs.filter((row) => {
      const matchesSearch =
        !searchQuery ||
        row.stationUser.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.eventType.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !statusFilter || row.status === statusFilter;
      const matchesDuration = filterByDuration(row);

      return matchesSearch && matchesStatus && matchesDuration;
    });
  }, [searchQuery, statusFilter, durationFilter, mappedLogs]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const activityCardData = useMemo(() => {
    const total = mappedLogs.length;
    const successful = mappedLogs.filter(l => l.status === "Success").length;
    const warnings = mappedLogs.filter(l => l.status === "Warning").length;
    const critical = mappedLogs.filter(l => l.status === "Critical").length;
    return [
      { id: 1, label: "Total Activities", value: total, icon: TrendingUp },
      { id: 2, label: "Successful", value: successful, icon: CircleCheck },
      { id: 3, label: "Warnings", value: warnings, iconBg: "bg-[#FFF5C5]", iconColor: "text-[#E27D00]", icon: TriangleAlert },
      { id: 4, label: "Critical", value: critical, iconBg: "bg-red-50", iconColor: "text-red-600", icon: TbAlertHexagon },
    ];
  }, [mappedLogs]);

  const handleExport = () => {
    const csvHeaders = auditLogHeaders.map((h) => h.label).join(",");
    const csvRows = filteredData.map((row) =>
      auditLogHeaders
        .map((h) => `"${String(row[h.key] ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );
    const csvContent = [csvHeaders, ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "activity_log_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className='flex flex-col gap-4'>
        <h1 className='text-[1.75rem] font-semibold leading-[100%]'>Activity Log</h1>
        <p className='lg:text-[1.125rem] text-[1rem] text-neutral-500 leading-[100%]'>
          Monitor all platform activities and system events across your filling stations
        </p>
      </div>

      {/* cards section */}
      <div className='mt-[1.375rem]'>
        <StatGrid data={activityCardData} />
      </div>

      <div className='bg-white dark:bg-gray-800 p-5 mt-[1.375rem] rounded-2xl'>
        <div className="flex lg:flex-row flex-col gap-4 items-center justify-end mt-[1rem]">

          {/* Search */}
          <div className="flex relative items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by station/user or event type"
              className="lg:w-[21.875rem] w-fit h-[2.75rem] pl-8 rounded-lg border-[2px] border-gray-300 focus:border-[2px] focus:border-blue-600 outline-none font-semibold"
            />
            <Search size={24} className="text-neutral-500 absolute ml-1" />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-[7.686rem] h-[2.75rem] border-[2px] border-gray-300 focus:border-[2px] focus:border-blue-600 outline-none rounded-lg font-semibold"
            >
              <option value="">All status</option>
              <option value="Info">Info</option>
              <option value="Success">Success</option>
              <option value="Warning">Warning</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          {/* Duration Filter */}
          <div>
            <select
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value)}
              className="w-[7.686rem] h-[2.75rem] border-[2px] border-gray-300 focus:border-[2px] focus:border-blue-600 outline-none rounded-lg font-semibold"
            >
              <option value="">Duration</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>

          {/* Export */} 
          <button
            onClick={handleExport}
            className="flex gap-2 cursor-pointer hover:bg-blue-700 bg-[#0080FF] text-white rounded-lg px-5 py-2.5 font-semibold"
          >
            <Download size={24} />
            Export
          </button>
        </div>

        {/* activity table section */}
        <div className='mt-[1.375rem]'>
          {loading ? (
            <p className="text-center text-gray-400 py-10 font-medium">Loading activity logs...</p>
          ) : paginatedData.length > 0 ? (
            <DataTable headers={auditLogHeaders} rows={paginatedData} />
          ) : (
            <p className="text-center text-gray-400 py-10 font-medium">No results found.</p>
          )}
        </div>

        {/* Pagination */}
        {filteredData.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredData.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        )}

        
      </div>
    </div>
  )
}

export default ActivityPage