// ===== RecentActivitiesTable.jsx =====
// Main table component

import React from 'react';
import TableHeader from './TableHeader';
import TableRow from './TableRow';
// import { recentActivities } from './activitiesData';
import { activitiesData } from './activitiesData';

const RecentActivitiesTable = () => {
  const columns = [
    'EVENT TYPE',
    'DESCRIPTION',
    'STATION/USER',
    'STATUS',
    'DATE & TIME'
  ];

  return (
    <div className="bg-white rounded-2xl   overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Recent Activities</h2>
        <p className="text-sm text-gray-500 mt-1">
          View all recent activities on your system
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <TableHeader columns={columns} />
          <tbody className="bg-white divide-y divide-gray-100">
            {activitiesData.map((activity) => (
              <TableRow key={activity.id} activity={activity} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentActivitiesTable;