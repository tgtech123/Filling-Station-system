import React from "react";
import { shiftSchedule } from "./shiftSchedule";
import { time } from "framer-motion";
import { BsPerson } from "react-icons/bs";
import { HiOutlineBriefcase } from "react-icons/hi2";

const ShiftManagement = () => {
  return (
    <div className="flex bg-white p-4 mt-4 rounded-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 w-full gap-3 ">
        {shiftSchedule.map((item, index) => (
          <div
            key={index}
            className="border-[1px] grid gap-2 border-neutral-200 rounded-xl p-3"
          >
            <p className="text-lg font-semibold text-neutral-800">
              {item.shiftType}
            </p>
            <p className="flex justify-between">
              {item.shift}
              <span>{item.time}</span>
            </p>

            <hr className="w-[150px]" />
            <div className="mt-2">
              <p className="flex gap-2 font-semibold mb-2 text-neutral-800 items-center">
                <BsPerson size={28} />
                Assigned Staff
              </p>

              <div className="text-md text-neutral-800 grid gap-2">
                {item.assignedStaff.map((staff, i) => (
                  <p key={i}>{staff.name}</p>
                ))}
              </div>
            </div>

            <p>{item.lastMaintenance}</p>

            <div
              className={`flex flex-col gap-3 mt-3`}
            >
              <span className="flex gap-1 font-semibold">
                <HiOutlineBriefcase size={26} />
                <h1>Roles</h1>
              </span>
                <p className={`flex flex-col gap-3 ${
                item.roles === "Attendant"
                  ? "text-purple-600"
                  : item.roles === "Cashier"
                  ? "text-red-600"
                  : item.roles === "Accountant"
                  ? "text-green-500"
                  : item.roles === "Supervisor"
                  ? "text-orange-400"
                  : item.roles === "Manager"
                  ? "text-blue-600"
                  : "text-neutral-800"
              }`}>
                    {item.roles}
                </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShiftManagement;
