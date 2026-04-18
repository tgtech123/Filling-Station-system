"use client";
import React, { useState, useMemo, useEffect } from 'react'
import StatGrid from '../StatGrid'
import {
  Search, Download, TrendingUp, CircleCheck, TriangleAlert,
  Building2, CreditCard, Zap, Clock, PauseCircle,
  AlertTriangle, CheckCircle, RefreshCw
} from "lucide-react";
import { TbAlertHexagon } from "react-icons/tb";
import DataTable from '../DataTable';
import { auditLogHeaders } from './AuditLogData';
import Pagination from '../PaymentAndBilling/Pagination';
import useAdminStore from '@/store/useAdminStore';

const ITEMS_PER_PAGE = 10;

const getEventIcon = (eventType) => {
  const icons = {
    "Station registration": Building2,
    "Updated subscription": CreditCard,
    "System alert": Zap,
    "Subscription payment": CreditCard,
    "Subscription expired": Clock,
    "Station suspended": PauseCircle,
    "Payment failed": AlertTriangle,
    "Station reactivated": CheckCircle,
  };
  const Icon = icons[eventType] || RefreshCw;
  return <Icon size={16} className="text-gray-500 mr-2 shrink-0" />;
};

const ActivityPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [durationFilter, setDurationFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { activityLogs, activityStats, activityLoading, fetchActivityLogs } = useAdminStore();

  useEffect(() => {
    fetchActivityLogs({ page: 1, limit: 50 });
  }, [fetchActivityLogs]);

  const mappedLogs = useMemo(() => {
    if (!activityLogs?.length) return [];
    return activityLogs.map((log) => ({
      eventType: log.eventType,
      description: log.description,
      stationUser: log.stationUser,
      status: log.status,
      dateTime: log.dateTime,
      _rawDate: log._rawDate,
      icon: getEventIcon(log.eventType),
    }));
  }, [activityLogs]);

  const activityCardData = [
    {
      id: 1,
      label: "Total Activities",
      value: activityStats?.totalActivities || 0,
      icon: TrendingUp,
    },
    {
      id: 2,
      label: "Successful",
      value: activityStats?.successful || 0,
      icon: CircleCheck,
    },
    {
      id: 3,
      label: "Warnings",
      value: activityStats?.warnings || 0,
      icon: TriangleAlert,
      iconBg: "bg-[#FFF5C5]",
      iconColor: "text-[#E27D00]",
    },
    {
      id: 4,
      label: "Critical",
      value: activityStats?.critical || 0,
      icon: TbAlertHexagon,
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
    },
  ];

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

      <div className='bg-white dark:bg-gray-800 p-4 sm:p-5 mt-[1.375rem] rounded-2xl'>
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 items-stretch sm:items-center justify-end mt-[1rem]">

          {/* Search */}
          <div className="flex relative items-center w-full sm:w-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by station/user or event type"
              className="w-full sm:w-[21.875rem] h-[2.75rem] pl-8 rounded-lg border-[2px] border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:border-[2px] focus:border-blue-600 outline-none font-semibold"
            />
            <Search size={24} className="text-neutral-500 absolute ml-1" />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-[7.686rem] h-[2.75rem] border-[2px] border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:border-[2px] focus:border-blue-600 outline-none rounded-lg font-semibold"
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
              className="w-[7.686rem] h-[2.75rem] border-[2px] border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:border-[2px] focus:border-blue-600 outline-none rounded-lg font-semibold"
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
            className="flex gap-2 cursor-pointer hover:bg-blue-700 bg-[#0080FF] text-white rounded-lg px-5 py-2.5 font-semibold w-full sm:w-auto justify-center sm:justify-start"
          >
            <Download size={24} />
            Export
          </button>
        </div>

        {/* activity table section */}
        <div className='mt-[1.375rem]'>
          {activityLoading ? (
            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg">
              <table className="min-w-full border-collapse">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    {auditLogHeaders.map((h) => (
                      <th
                        key={h.key}
                        className="px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                      >
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array(10).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {auditLogHeaders.map((_, j) => (
                        <td key={j} className="px-4 py-4">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : mappedLogs.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-12 font-medium">
              No activity logs found
            </p>
          ) : (
            <DataTable headers={auditLogHeaders} rows={paginatedData} />
          )}
        </div>

        {/* Pagination */}
        {!activityLoading && filteredData.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredData.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

export default ActivityPage;
