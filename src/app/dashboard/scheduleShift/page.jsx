"use client";

import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import FlashCard from "@/components/Dashboard/FlashCard";
import { cardData } from "./cardData";
import { House, Search } from "lucide-react";
import { useState, useEffect } from "react";
import ScheduleCard from "./ScheduleCard";
import ScheduleShiftCard from "./ScheduleShiftCard";
import ScheduledAttendants from "./ScheduledAttendants";
import useSupervisorStore from "@/store/useSupervisorStore";
import { useSocket } from "@/hooks/useSocket";

export default function ScheduleShift() {
  const [active, setActive] = useState("linkOne");
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    attendantDirectory,
    scheduledAttendantsByType,
    loading,
    error,
    fetchAttendantDirectory,
    fetchScheduledAttendantsByType,
  } = useSupervisorStore();

  // Fetch on mount and poll every 30s so on-duty status updates when attendants log in
  useEffect(() => {
    fetchAttendantDirectory();
    fetchScheduledAttendantsByType();

    const interval = setInterval(() => {
      fetchAttendantDirectory();
      fetchScheduledAttendantsByType();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchAttendantDirectory, fetchScheduledAttendantsByType]);

  // Socket: refresh instantly when shifts are scheduled/started/ended anywhere
  // (the 30s poll above stays as a fallback).
  useSocket({
    "shift:scheduled": () => {
      fetchAttendantDirectory();
      fetchScheduledAttendantsByType();
    },
    "shift:started": () => fetchScheduledAttendantsByType(),
    "shift:ended": () => fetchScheduledAttendantsByType(),
  });

  // Transform attendant directory data
  const infoData = attendantDirectory?.attendants?.map((attendant) => ({
    id: attendant._id,
    name: attendant.name,
    // null, not a placeholder path — "/default-avatar.png" does not exist, and
    // pointing at it made every photo-less staff member 404 on every render.
    // The card falls back to initials when this is empty.
    img: attendant.image || null,
    shiftSchedule: attendant.shiftType,
    role: attendant.role,
    onDuty: attendant.status === "On Duty",
    phone: attendant.contact?.phone || "N/A",
    email: attendant.contact?.email || "N/A",
    responsibilities: Array.isArray(attendant.responsibility)
      ? attendant.responsibility.join(", ")
      : attendant.responsibility || "N/A",
    salesTarget: attendant.salesTarget,
  })) || [];

  // Scheduled cards come pre-grouped from the backend (classic types always,
  // 24/7 and custom station-defined types whenever they have scheduled shifts).
  const scheduledAttendants = (scheduledAttendantsByType?.groups || []).map((group) => ({
    id: group.key,
    title: group.title,
    period: group.subtitle,
    time: group.timeRange,
    assignedAttendants: (group.assignedStaff || []).map((staff) => ({
      name: staff.name,
      pumpNo: staff.pumpNo,
      status: staff.status,
    })),
  }));

  // Metrics for the header cards
  const metrics = attendantDirectory?.metrics || {
    totalStaff: 0,
    onDutyToday: "0/0",
    overallStaffPerformance: 0,
  };

  const updatedCardData = [
    { id: 1, name: "Total Staff", number: metrics.totalStaff, icon: cardData[0]?.icon },
    { id: 2, name: "On Duty Today", number: metrics.onDutyToday, icon: cardData[1]?.icon },
    { id: 3, name: "Staff Performance", number: `${metrics.overallStaffPerformance}%`, icon: cardData[2]?.icon },
  ];

  const handleOpen = (user) => setSelectedUser(user);
  const handleClose = () => setSelectedUser(null);

  // Filter attendant directory
  const filteredInfoData = infoData.filter((item) =>
    [item.name, item.shiftSchedule, item.role]
      .some((field) => field?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <DashboardLayout>
      {/* header */}
      <DisplayCard>
        <div>
          <h2 className="text-2xl font-semibold text-gray-700">
            Schedule Shift
          </h2>
          <p className="text-gray-700 mt-3">Monitor and assign shifts</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-3 text-center py-4 text-gray-500">
              Loading metrics...
            </div>
          ) : error ? (
            <div className="col-span-3 text-center py-4 text-red-500">
              Error: {error}
            </div>
          ) : (
            updatedCardData.map((item) => (
              <FlashCard
                key={item.id}
                name={item.name}
                period={item?.period}
                number={item?.number}
                icon={item?.icon}
              />
            ))
          )}
        </div>
      </DisplayCard>

      {/* Mid Section */}
      <div className="my-6 flex flex-col sm:flex-row w-full items-stretch gap-3">
        {/* Tab switcher */}
        <div className="bg-white flex gap-1 text-sm py-1.5 px-2 rounded-[14px] border-2 border-[#e7e7e7] w-full sm:w-auto">
          <button
            onClick={() => setActive("linkOne")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-[10px] font-semibold transition-colors ${
              active === "linkOne" ? "bg-[#d9edff] text-[#1a71f6]" : "text-gray-400 hover:bg-gray-50"
            }`}
          >
            <House size={16} />
            <span>Attendant Directory</span>
          </button>
          <button
            onClick={() => setActive("linkTwo")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-[10px] font-semibold transition-colors ${
              active === "linkTwo" ? "bg-[#d9edff] text-[#1a71f6]" : "text-gray-400 hover:bg-gray-50"
            }`}
          >
            <House size={16} />
            <span>Scheduled</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search attendants…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="py-2.5 pl-4 pr-10 w-full rounded-[14px] border-2 border-[#cac8c8] text-gray-600 text-sm focus:outline-none focus:border-blue-500"
          />
          <Search size={18} className="text-gray-400 absolute top-1/2 -translate-y-1/2 right-3" />
        </div>
      </div>

      {/* Attendant Directory Tab */}
      {active === "linkOne" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 bg-white p-6 rounded-[20px]">
          {loading ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              Loading attendants...
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-8 text-red-500">
              Error loading attendants: {error}
            </div>
          ) : filteredInfoData.length > 0 ? (
            filteredInfoData.map((item) => (
              <ScheduleCard
                key={item.id}
                name={item.name}
                img={item.img}
                role={item.role}
                onDuty={item.onDuty}
                shiftSchedule={item.shiftSchedule}
                phone={item.phone}
                email={item.email}
                responsibilities={item.responsibilities}
                salesTarget={item.salesTarget}
                onOpen={() => handleOpen(item)}
              />
            ))
          ) : (
            <p className="col-span-full text-gray-500 text-center py-8">
              No attendants found
            </p>
          )}
        </div>
      )}

      {/* Scheduled Attendants Tab */}
      {active === "linkTwo" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 bg-white rounded-[20px] p-6">
          {loading ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              Loading schedule...
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-8 text-red-500">
              Error loading schedule: {error}
            </div>
          ) : scheduledAttendants.length > 0 ? (
            scheduledAttendants.map((item) => (
              <ScheduledAttendants
                key={item.id}
                title={item.title}
                time={item.time}
                period={item.period}
                assignedAttendants={item.assignedAttendants}
              />
            ))
          ) : (
            <p className="col-span-full text-gray-500 text-center py-8">
              No scheduled attendants
            </p>
          )}
        </div>
      )}

      {/* Schedule Shift Modal */}
      {selectedUser && (
        <ScheduleShiftCard user={selectedUser} onClose={handleClose} />
      )}
    </DashboardLayout>
  );
}
