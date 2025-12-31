// "use client";

// import DashboardLayout from "@/components/Dashboard/DashboardLayout";
// import DisplayCard from "@/components/Dashboard/DisplayCard";
// import FlashCard from "@/components/Dashboard/FlashCard";
// import { cardData } from "./cardData";
// import { House, Search } from "lucide-react";
// import { useState } from "react";
// import ScheduleCard from "./ScheduleCard";
// import ScheduleShiftCard from "./ScheduleShiftCard";
// import ScheduledAttendants from "./ScheduledAttendants";

// export default function ScheduleShift() {
//   const [active, setActive] = useState("linkOne");
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");

//   const infoData = [
//     {
//       id: 1,
//       name: "John Melo",
//       img: "/john-melo-1.png",
//       shiftSchedule: "One-Day (Morning)-6am - 2pm",
//       role: "Attendant",
//       onDuty: true,
//       phone: "09030203425",
//       email: "sammelo@gmail.com",
//       responsibilities: "Fuel and diesel sales, pump operations",
//     },
//     {
//       id: 2,
//       name: "Sam Melo",
//       img: "/john-melo-1.png",
//       shiftSchedule: "Fulltime-6am - 10pm",
//       role: "Attendant",
//       onDuty: false,
//       phone: "09030203425",
//       email: "sammelo@gmail.com",
//       responsibilities: "Reconcile cash from attendants record lubricant sales",
//     },
//     {
//       id: 3,
//       name: "John Melo",
//       img: "/john-melo-1.png",
//       shiftSchedule: "Day-Off (Evening)-2pm - 10pm",
//       role: "Attendant",
//       onDuty: true,
//       phone: "09030203425",
//       email: "sammelo@gmail.com",
//       responsibilities: "Fuel and diesel sales, pump operations",
//     },
//     {
//       id: 4,
//       name: "Sam Melo",
//       img: "/john-melo-1.png",
//       shiftSchedule: "Fulltime-6am - 10pm",
//       role: "Attendant",
//       onDuty: true,
//       phone: "09030203425",
//       email: "sammelo@gmail.com",
//       responsibilities: "Fuel and diesel sales, pump operations",
//     },
//     {
//       id: 5,
//       name: "John Melo",
//       img: "/john-melo-1.png",
//       shiftSchedule: "Day-Off (Evening)-2pm - 10pm",
//       role: "Attendant",
//       onDuty: false,
//       phone: "09030203425",
//       email: "sammelo@gmail.com",
//       responsibilities: "Reconcile cash from attendants record lubricant sales",
//     },
//     {
//       id: 6,
//       name: "John Melo",
//       img: "/john-melo-1.png",
//       shiftSchedule: "One-Day (Morning)-6am - 2pm",
//       role: "Attendant",
//       onDuty: true,
//       phone: "09030203425",
//       email: "sammelo@gmail.com",
//       responsibilities: "Fuel and diesel sales, pump operations",
//     },
//   ];

//   const scheduledAttendants = [
//     {
//       id: 1,
//       title: "One-Day",
//       period: "Morning",
//       time: "6AM - 2PM",
//       assignedAttendants: ["Sam Melo", "John Dave", "Aquilla Luke"],
//     },
//     {
//       id: 2,
//       title: "One-Day",
//       period: "Evening",
//       time: "2PM - 10PM",
//       assignedAttendants: ["Sam Melo", "John Dave", "Aquilla Luke"],
//     },
//     {
//       id: 3,
//       title: "Day-Off",
//       period: "Full-time",
//       time: "6AM - 10PM",
//       assignedAttendants: ["Sam Melo", "John Dave", "Aquilla Luke"],
//     },
//   ];

//   const handleOpen = (user) => {
//     setSelectedUser(user); // set clicked user
//   };

//   const handleClose = () => {
//     setSelectedUser(null); // close modal
//   };

//   const filteredInfoData = infoData.filter((item) =>
//     [item.name, item.shiftSchedule, item.role] // choose which props to filter
//       .some((field) => field?.toLowerCase().includes(searchTerm.toLowerCase()))
//   );

//   return (
//     <DashboardLayout>
//       {/* header */}
//       <DisplayCard>
//         <div>
//           <h2 className="text-2xl font-semibold text-gray-700">
//             Schedule Shift
//           </h2>
//           <p className="text-gray-700 mt-3">Monitor and assign shifts</p>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//           {cardData.map((item) => (
//             <FlashCard
//               key={item.id}
//               name={item.name}
//               period={item?.period}
//               number={item?.number}
//               icon={item?.icon}
//             />
//           ))}
//         </div>
//       </DisplayCard>

//       {/* Mid Section */}
//       <div className="my-10 flex flex-col lg:flex-row w-full items-center lg:items-end gap-2">
//         <div className="bg-white w-full lg:w-4/6 flex flex-row gap-2 lg:gap-4 text-sm lg:text-medium py-2 px-4 rounded-[14px] shadow-xs border-2 border-[#e7e7e7]">
//           <div
//             onClick={() => setActive("linkOne")}
//             id="linkOne"
//             className={`flex items-center px-4 lg:px-24 gap-2 py-2 ${
//               active === "linkOne"
//                 ? "bg-[#d9edff] text-[#1a71f6]"
//                 : "bg-white text-gray-400"
//             } font-semibold cursor-pointer rounded-[10px]`}
//           >
//             <House />
//             Attendant Directory
//           </div>
//           <div
//             onClick={() => setActive("linkTwo")}
//             id="linkTwo" 
//             className={`flex items-center rounded-[10px] cursor-pointer px-4 lg:px-24 gap-2 ${
//               active === "linkTwo"
//                 ? "bg-[#d9edff] text-[#1a71f6]"
//                 : "bg-white text-gray-400"
//             } font-semibold py-2`}
//           >
//             <House />
//             Scheduled Attendant
//           </div>
//         </div>

//         <div className="relative w-full lg:w-2/6">
//           <input
//             type="text"
//             placeholder="Search"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="py-3 px-2 w-full rounded-[14px] border-2 border-[#cac8c8] text-gray-400"
//           />
//           <Search className="text-gray-400 absolute top-3 right-3" />
//         </div>
//       </div>

//       {active === "linkOne" && (
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 bg-white p-6 rounded-[20px]">
    
//           {filteredInfoData.length > 0 ? (
//             filteredInfoData.map((item) => (
//               <ScheduleCard
//                 key={item.id}
//                 name={item.name}
//                 img={item.img}
//                 role={item.role}
//                 onDuty={item.onDuty}
//                 shiftSchedule={item.shiftSchedule}
//                 phone={item.phone}
//                 email={item.email}
//                 responsibilities={item.responsibilities}
//                 onOpen={() => handleOpen(item)}
//               />
//             ))
//           ) : (
//             <p className="col-span-full text-gray-500 text-center">
//               No results found
//             </p>
//           )}
//         </div>
//       )}

//       {active === "linkTwo" && (
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 bg-white rounded-[20px] p-6">
//           {scheduledAttendants.map((item) => (
//             <ScheduledAttendants
//               key={item.id}
//               title={item.title}
//               time={item.time}
//               period={item.period}
//               assignedAttendants={item.assignedAttendants}
//             />
//           ))}
//         </div>
//       )}

//       {selectedUser && (
//         <ScheduleShiftCard user={selectedUser} onClose={handleClose} />
//       )}
//     </DashboardLayout>
//   );
// }



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

export default function ScheduleShift() {
  const [active, setActive] = useState("linkOne");
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Get data from Zustand store
  const {
    attendantDirectory,
    scheduledAttendantsByType,
    loading,
    error,
    fetchAttendantDirectory,
    fetchScheduledAttendantsByType,
  } = useSupervisorStore();

  // Fetch data on component mount
  useEffect(() => {
    fetchAttendantDirectory();
    fetchScheduledAttendantsByType();
  }, [fetchAttendantDirectory, fetchScheduledAttendantsByType]);

  // Transform attendant directory data
  const infoData = attendantDirectory?.attendants?.map((attendant) => ({
    id: attendant._id,
    name: attendant.name,
    img: attendant.image || "/default-avatar.png",
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

  // Transform scheduled attendants by type
  const scheduledAttendants = scheduledAttendantsByType ? [
    {
      id: 1,
      title: scheduledAttendantsByType.oneDayMorning?.title || "One-Day",
      period: scheduledAttendantsByType.oneDayMorning?.subtitle || "Morning",
      time: scheduledAttendantsByType.oneDayMorning?.timeRange || "6AM - 2PM",
      assignedAttendants: scheduledAttendantsByType.oneDayMorning?.assignedStaff?.map(
        (staff) => ({
          name: staff.name,
          pumpNo: staff.pumpNo,
          status: staff.status,
        })
      ) || [],
    },
    {
      id: 2,
      title: scheduledAttendantsByType.oneDayEvening?.title || "One-Day",
      period: scheduledAttendantsByType.oneDayEvening?.subtitle || "Evening",
      time: scheduledAttendantsByType.oneDayEvening?.timeRange || "2PM - 10PM",
      assignedAttendants: scheduledAttendantsByType.oneDayEvening?.assignedStaff?.map(
        (staff) => ({
          name: staff.name,
          pumpNo: staff.pumpNo,
          status: staff.status,
        })
      ) || [],
    },
    {
      id: 3,
      title: scheduledAttendantsByType.dayOffFullTime?.title || "Day-Off",
      period: scheduledAttendantsByType.dayOffFullTime?.subtitle || "Full-time",
      time: scheduledAttendantsByType.dayOffFullTime?.timeRange || "6AM - 10PM",
      assignedAttendants: scheduledAttendantsByType.dayOffFullTime?.assignedStaff?.map(
        (staff) => ({
          name: staff.name,
          pumpNo: staff.pumpNo,
          status: staff.status,
        })
      ) || [],
    },
  ] : [];

  // Get metrics for cards
  const metrics = attendantDirectory?.metrics || {
    totalStaff: 0,
    onDutyToday: "0/0",
    overallStaffPerformance: 0,
  };

  // Update cardData with real metrics
  const updatedCardData = [
    {
      id: 1,
      name: "Total Staff",
      number: metrics.totalStaff,
      icon: cardData[0]?.icon,
    },
    {
      id: 2,
      name: "On Duty Today",
      number: metrics.onDutyToday,
      icon: cardData[1]?.icon,
    },
    {
      id: 3,
      name: "Staff Performance",
      number: `${metrics.overallStaffPerformance}%`,
      icon: cardData[2]?.icon,
    },
  ];

  const handleOpen = (user) => {
    setSelectedUser(user);
  };

  const handleClose = () => {
    setSelectedUser(null);
  };

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
      <div className="my-10 flex flex-col lg:flex-row w-full items-center lg:items-end gap-2">
        <div className="bg-white w-full lg:w-4/6 flex flex-row gap-2 lg:gap-4 text-sm lg:text-medium py-2 px-4 rounded-[14px] shadow-xs border-2 border-[#e7e7e7]">
          <div
            onClick={() => setActive("linkOne")}
            id="linkOne"
            className={`flex items-center px-4 lg:px-24 gap-2 py-2 ${
              active === "linkOne"
                ? "bg-[#d9edff] text-[#1a71f6]"
                : "bg-white text-gray-400"
            } font-semibold cursor-pointer rounded-[10px]`}
          >
            <House />
            Attendant Directory
          </div>
          <div
            onClick={() => setActive("linkTwo")}
            id="linkTwo"
            className={`flex items-center rounded-[10px] cursor-pointer px-4 lg:px-24 gap-2 ${
              active === "linkTwo"
                ? "bg-[#d9edff] text-[#1a71f6]"
                : "bg-white text-gray-400"
            } font-semibold py-2`}
          >
            <House />
            Scheduled Attendant
          </div>
        </div>

        <div className="relative w-full lg:w-2/6">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="py-3 px-2 w-full rounded-[14px] border-2 border-[#cac8c8] text-gray-400"
          />
          <Search className="text-gray-400 absolute top-3 right-3" />
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