"use client";
import React, { useEffect } from "react";
import { BsPerson } from "react-icons/bs";
import { HiOutlineBriefcase } from "react-icons/hi2";
import useStaffStore from "@/store/useStaffStore";

// Static time-range config per shiftType value stored on staff
const SHIFT_CONFIG = {
  "One-Day-Morning": { label: "One-Day",   type: "Morning",         time: "6AM – 2PM"   },
  "One-Day-Evening": { label: "One-Day",   type: "Evening",         time: "2PM – 10PM"  },
  "Day-Off":         { label: "Day-Off",   type: "Fulltime",        time: "6AM – 10PM"  },
  "24/7":            { label: "24/7",      type: "Round the Clock", time: "12AM – 12AM" },
  "Full-Time":       { label: "Full-Time", type: "Full Day",        time: "8AM – 6PM"   },
};

const ROLE_COLORS = {
  attendant:  "text-purple-500 dark:text-purple-400",
  cashier:    "text-red-500   dark:text-red-400",
  accountant: "text-green-600 dark:text-green-400",
  supervisor: "text-orange-500 dark:text-orange-400",
  manager:    "text-blue-600  dark:text-blue-400",
};

const ShiftManagement = () => {
  const { staff, getAllStaff, loading } = useStaffStore();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) getAllStaff(token);
  }, [getAllStaff]);

  // Group staff by shiftType (exclude managers from cards)
  const groups = Object.entries(SHIFT_CONFIG).map(([shiftKey, config]) => {
    const members     = staff.filter((s) => s.shiftType === shiftKey && s.role !== "manager");
    const uniqueRoles = [...new Set(members.map((s) => s.role))];
    return { shiftKey, config, members, uniqueRoles };
  });

  if (loading.fetching) {
    return (
      <div className="mt-4 p-6 bg-white dark:bg-gray-800 rounded-2xl text-gray-500 dark:text-gray-400">
        Loading shifts…
      </div>
    );
  }

  return (
    <div className="flex bg-white dark:bg-gray-800 p-4 mt-4 rounded-2xl">
      <div className="grid grid-cols-2 lg:grid-cols-3 w-full gap-3">
        {groups.map(({ shiftKey, config, members, uniqueRoles }) => (
          <div
            key={shiftKey}
            className="border border-neutral-200 dark:border-gray-700 grid gap-2 rounded-xl p-3"
          >
            {/* Shift type + time */}
            <p className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
              {config.label}
            </p>
            <p className="flex justify-between text-sm text-neutral-600 dark:text-gray-300">
              <span>{config.type}</span>
              <span>{config.time}</span>
            </p>

            <hr className="dark:border-gray-600" />

            {/* Assigned staff */}
            <div className="mt-1">
              <p className="flex gap-2 font-semibold mb-2 text-neutral-800 dark:text-neutral-100 items-center">
                <BsPerson size={22} />
                Assigned Staff
              </p>
              <div className="grid gap-1 text-sm text-neutral-700 dark:text-gray-300">
                {members.length > 0 ? (
                  members.map((s) => (
                    <p key={s._id}>{s.firstName} {s.lastName}</p>
                  ))
                ) : (
                  <p className="text-gray-400 dark:text-gray-500 italic">No staff assigned</p>
                )}
              </div>
            </div>

            {/* Roles */}
            <div className="flex flex-col gap-2 mt-2">
              <span className="flex gap-1 items-center font-semibold text-neutral-800 dark:text-neutral-100">
                <HiOutlineBriefcase size={22} />
                <span>Roles</span>
              </span>
              <div className="flex flex-col gap-1 text-sm font-medium">
                {uniqueRoles.length > 0 ? (
                  uniqueRoles.map((role) => (
                    <span
                      key={role}
                      className={`capitalize ${ROLE_COLORS[role] ?? "text-neutral-700 dark:text-gray-300"}`}
                    >
                      {role}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 dark:text-gray-500 italic">—</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShiftManagement;
