"use client"
import { useState } from "react";

export default function ScheduledAttendants() {
  const [activeTab, setActiveTab] = useState("one-day");

  const attendants = {
    morning: [
      { name: "John Dave", pumpNo: 1, status: "active" },
      { name: "Oboh ThankGod", pumpNo: "-", status: "inactive" },
      { name: "Oboh ThankGod", pumpNo: "-", status: "inactive" },
      { name: "Closed", pumpNo: 1, status: "closed" },
      { name: "Oboh ThankGod", pumpNo: "-", status: "inactive" },
      { name: "Oboh ThankGod", pumpNo: "-", status: "inactive" }
    ],
    evening: [
      { name: "Elem Dennis", pumpNo: 1, status: "active" },
      { name: "Lemuel Samson", pumpNo: 3, status: "closed" },
      { name: "Lemuel Samson", pumpNo: 9, status: "closed" },
      { name: "David Brainherd", pumpNo: "-", status: "inactive" },
      { name: "Lemuel Samson", pumpNo: 4, status: "closed" },
      { name: "Lemuel Samson", pumpNo: 6, status: "closed" }
    ]
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Scheduled Attendants
          </h1>
          <p className="text-gray-600 mb-4">
            View attendants meant to be on duty
          </p>
          
          {/* Status Legend */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-gray-700">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-300"></span>
              <span className="text-gray-700">Inactive</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span className="text-gray-700">Closed</span>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-2 border-blue-600 rounded-lg overflow-hidden">
          <button
            onClick={() => setActiveTab("one-day")}
            className={`px-6 py-2 font-medium transition-colors ${
              activeTab === "one-day"
                ? "bg-white text-blue-600"
                : "bg-blue-600 text-white"
            }`}
          >
            One-Day
          </button>
          <button
            onClick={() => setActiveTab("day-off")}
            className={`px-6 py-2 font-medium transition-colors ${
              activeTab === "day-off"
                ? "bg-white text-blue-600"
                : "bg-blue-600 text-white"
            }`}
          >
            Day-Off
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-50 rounded-xl p-4">
        {/* Table Header */}
        <div className="grid grid-cols-4 gap-4 mb-4 pb-3 border-b border-gray-200">
          <div className="text-gray-700 font-medium">Morning</div>
          <div className="text-gray-700 font-medium text-center">Pump no</div>
          <div className="text-gray-700 font-medium">Evening</div>
          <div className="text-gray-700 font-medium text-center">Pump no</div>
        </div>

        {/* Table Rows */}
        <div className="space-y-3">
          {attendants.morning.map((morning, index) => {
            const evening = attendants.evening[index];
            return (
              <div key={index} className="grid grid-cols-4 gap-4 items-center py-2">
                {/* Morning Attendant */}
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      morning.status === "active"
                        ? "bg-green-500"
                        : morning.status === "closed"
                        ? "bg-red-500"
                        : "bg-gray-300"
                    }`}
                  ></span>
                  <span className={`text-sm ${
                    morning.status === "inactive" ? "text-gray-400" : "text-gray-900"
                  }`}>
                    {morning.name}
                  </span>
                </div>

                {/* Morning Pump No */}
                <div className="text-center text-sm text-gray-900">
                  {morning.pumpNo}
                </div>

                {/* Evening Attendant */}
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      evening.status === "active"
                        ? "bg-green-500"
                        : evening.status === "closed"
                        ? "bg-red-500"
                        : "bg-gray-300"
                    }`}
                  ></span>
                  <span className={`text-sm ${
                    evening.status === "inactive" ? "text-gray-400" : "text-gray-900"
                  }`}>
                    {evening.name}
                  </span>
                </div>

                {/* Evening Pump No */}
                <div className="text-center text-sm text-gray-900">
                  {evening.pumpNo}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}