"use client";

import { Mail, Phone, Clock, Trash2, Edit2 } from "lucide-react";
import { TbCurrencyNaira } from "react-icons/tb";

import SalesTargetCard from "./SalesTargetCard"; // import the separate component

export default function EmployeeCard({
  name,
  role,
  dutyStatus,
  shift,
  phone,
  email,
  earnings,
  salesTarget,
  responsibilities,
  onEdit,
  onDelete,
  onToggleDuty,
}) {
  return (
    <div className=" bg-white rounded-2xl p-4 w-auto max-w-sm border">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-3">
           <span className="bg-[#D9D9D9] h-12 w-12 rounded-full">
            </span> 
            <div>
              <h2 className="font-semibold text-lg">{name}</h2>
              <p className="text-gray-500 text-sm">{role}</p>
            </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              dutyStatus ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-600"
            }`}
          >
            {dutyStatus ? "On Duty" : "Off Duty"}
          </span>
          {/* Simple toggle button */}
          <button
            onClick={onToggleDuty}
            className={`w-10 h-5 flex items-center rounded-full p-1 transition ${
              dutyStatus ? "bg-green-500" : "bg-gray-400"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md  transform transition ${
                dutyStatus ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      
      </div>

      {/* Info */}
      <div className="text-sm space-y-2">
        <p className="flex items-center gap-2 text-gray-600">
          <Clock className="w-4 h-4" /> {shift}
        </p>
        <p className="flex items-center gap-2 text-gray-600">
          <Phone className="w-4 h-4" /> {phone}
        </p>
        <p className="flex items-center gap-2 text-gray-600">
          <Mail className="w-4 h-4" /> {email}
        </p>
        <p className="text-gray-600 flex items-center gap">
            <span><TbCurrencyNaira size={22} /></span>
          <span className="font-medium">Monthly earnings:</span> {earnings}
        </p>
      </div>

      {/* Sales Target (reused component) */}
      {salesTarget && (
        <div className="mt-2">
          <SalesTargetCard
            current={salesTarget.current}
            target={salesTarget.total}
            currency="₦"
          />
        </div>
      )}

      {/* Responsibilities */}
      <div className="">
        <h3 className="font-medium text-gray-700 text-sm mb-1">Responsibilities</h3>
        <ul className="text-gray-600 text-sm list-disc list-inside space-y-1">
          {responsibilities.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex justify-between gap-2 mt-4">
        <button
          onClick={onEdit}
          className="flex font-semibold justify-center items-center w-full gap-1 px-3 py-1 rounded-xl bg-[#0080FF] text-white hover:bg-blue-700"
        >
           Edit
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-1 px-3 py-1 rounded-full border-[1.5px] border-neutral-700 bg-transparent text-neutral-700 hover:bg-red-600 hover:text-white hover:border-white"
        >
          <Trash2 className="w-4 h-8" /> 
        </button>
      </div>
    </div>
  );
}
