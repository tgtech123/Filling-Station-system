// ===== TableRow.jsx =====
// Individual table row component

import React from 'react';
import StatusBadge from './StatusBadge';
import { activityIcons } from './activitiesData';

const TableRow = ({ activity }) => {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors hidden md:table-row">
      {/* Event Type */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="text-gray-400">
            {activityIcons[activity.icon]}
          </div>
          <span className="text-sm text-gray-700 font-medium">
            {activity.eventType}
          </span>
        </div>
      </td>

      {/* Description */}
      <td className="px-6 py-4">
        <span className="text-sm text-gray-600">
          {activity.description}
        </span>
      </td>

      {/* Station/User */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-700">
          {activity.stationUser}
        </span>
      </td>

      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={activity.status} color={activity.statusColor} />
      </td>

      {/* Date & Time */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-600">
          {activity.dateTime}
        </span>
      </td>
    </tr>
  );
};

export default TableRow;