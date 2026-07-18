"use client";
import React, { useEffect, useState } from "react";
import { BsPerson } from "react-icons/bs";
import { HiOutlineBriefcase } from "react-icons/hi2";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import useStaffStore from "@/store/useStaffStore";
import useShiftTypeStore from "@/store/useShiftTypeStore";

// Nice display fallbacks for the built-ins that ship without start/end times.
const BUILTIN_DISPLAY = {
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
  const { builtIn, custom, fetchAllTypes, toggleBuiltIn } = useShiftTypeStore();
  const [togglingName, setTogglingName] = useState(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) getAllStaff(token);
  }, [getAllStaff]);

  // Management view: include hidden built-ins so they can be re-enabled
  useEffect(() => {
    fetchAllTypes();
  }, [fetchAllTypes]);

  const handleToggle = async (name, currentlyActive) => {
    setTogglingName(name);
    const res = await toggleBuiltIn(name, !currentlyActive, { includeInactive: true });
    setTogglingName(null);
    if (res.success) {
      toast.success(currentlyActive ? "Shift type hidden from dropdowns" : "Shift type restored");
    } else {
      toast.error(res.error || "Could not update shift type");
    }
  };

  // Build the cards from the live type list (built-ins + custom), not a static map.
  const allDefs = [...builtIn, ...custom];
  const groups = allDefs.map((def) => {
    const display = BUILTIN_DISPLAY[def.name];
    const members = staff.filter((s) => s.shiftType === def.name && s.role !== "manager");
    const uniqueRoles = [...new Set(members.map((s) => s.role))];
    return {
      name: def.name,
      isBuiltIn: def.isBuiltIn,
      isActive: def.isActive !== false,
      // Prefer the def's own label/times; fall back to the built-in display map
      title: display?.label || def.name,
      subType: display?.type || def.session || "",
      time: def.startTime && def.endTime ? `${def.startTime} – ${def.endTime}` : display?.time || "",
      members,
      uniqueRoles,
    };
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
        {groups.map(({ name, isBuiltIn, isActive, title, subType, time, members, uniqueRoles }) => (
          <div
            key={name}
            className={`border grid gap-2 rounded-xl p-3 transition-opacity ${
              isActive
                ? "border-neutral-200 dark:border-gray-700"
                : "border-dashed border-neutral-300 dark:border-gray-600 opacity-60"
            }`}
          >
            {/* Shift type + hide/show toggle (built-ins only) */}
            <div className="flex items-start justify-between">
              <p className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
                {title}
                {!isActive && (
                  <span className="ml-2 text-[10px] font-medium uppercase tracking-wide text-gray-400 align-middle">
                    Hidden
                  </span>
                )}
              </p>
              {isBuiltIn && (
                <button
                  onClick={() => handleToggle(name, isActive)}
                  disabled={togglingName === name}
                  title={isActive ? "Hide from shift dropdowns" : "Show in shift dropdowns"}
                  className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50 shrink-0"
                >
                  {togglingName === name ? (
                    <span className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin inline-block" />
                  ) : isActive ? (
                    <Eye size={18} />
                  ) : (
                    <EyeOff size={18} />
                  )}
                </button>
              )}
            </div>
            <p className="flex justify-between text-sm text-neutral-600 dark:text-gray-300">
              <span className="capitalize">{subType}</span>
              <span>{time}</span>
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
