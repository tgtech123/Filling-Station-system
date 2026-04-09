import React from 'react';
import TableHeader from './TableHeader';
import TableRow from './TableRow';
import useAdminStore from '@/store/useAdminStore';

// Map API eventType string → icon key used by TableRow/activitiesData
const eventTypeToIcon = (eventType = '') => {
  const t = eventType.toLowerCase();
  if (t.includes('registr')) return 'registration';
  if (t.includes('updat') || t.includes('subscript') && t.includes('updat')) return 'update';
  if (t.includes('alert')) return 'alert';
  if (t.includes('payment') && !t.includes('fail')) return 'payment';
  if (t.includes('expir')) return 'expired';
  if (t.includes('suspend')) return 'suspended';
  if (t.includes('fail')) return 'failed';
  if (t.includes('reactivat')) return 'reactivated';
  return 'registration';
};

// Map API status string → { status label, colorKey }
const statusMap = {
  info: { status: 'Info', statusColor: 'blue' },
  success: { status: 'Success', statusColor: 'green' },
  warning: { status: 'Warning', statusColor: 'orange' },
  critical: { status: 'Critical', statusColor: 'red' },
};

const RecentActivitiesTable = () => {
  const { activityLogs, loading } = useAdminStore();

  const columns = [
    'EVENT TYPE',
    'DESCRIPTION',
    'STATION/USER',
    'STATUS',
    'DATE & TIME',
  ];

  // Map API log shape → TableRow activity shape
  const activities = activityLogs.map((log, i) => {
    const statusKey = (log.status || 'info').toLowerCase();
    const { status, statusColor } = statusMap[statusKey] || statusMap.info;
    const description = (log.description || '');
    return {
      id: log._id || log.id || i,
      eventType: log.eventType || '',
      icon: eventTypeToIcon(log.eventType),
      description: description.length > 35 ? description.slice(0, 35) + '...' : description,
      stationUser: log.stationOrUser || log.stationUser || '',
      status,
      statusColor,
      dateTime: log.dateTime || log.createdAt || '',
    };
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activities</h2>
        <p className="text-sm text-gray-500 mt-1">
          View all recent activities on your system
        </p>
      </div>

      {/* Loading */}
      {loading && activityLogs.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <p className="mt-2 text-sm text-gray-500">Loading activities...</p>
          </div>
        </div>
      ) : activities.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-gray-500">No recent activities</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <TableHeader columns={columns} />
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
              {activities.map((activity) => (
                <TableRow key={activity.id} activity={activity} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentActivitiesTable;
