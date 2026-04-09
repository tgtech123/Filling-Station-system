import { ArrowUpRightIcon, ArrowDownRightIcon } from "@heroicons/react/24/solid";
import { dashboardStats } from "./dashboardStats";

export default function DashboardCard({ stats, loading }) {
  const data = stats || dashboardStats;

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-[1.5rem]">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="mt-6">
              <div className="h-7 w-20 rounded bg-gray-200 dark:bg-gray-700 mb-2" />
              <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-[1.5rem]">
      {data.map(
        ({ id, label, value, change, icon: Icon, iconBg, iconColor }) => {
          const isNegative = typeof change === 'string' && change.startsWith('-');
          return (
            <div
              key={id}
              className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}
                >
                  <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>

                <span className={`flex items-center gap-1 text-xs font-medium ${isNegative ? 'text-red-500' : 'text-green-600'}`}>
                  {isNegative
                    ? <ArrowDownRightIcon className="h-4 w-4" />
                    : <ArrowUpRightIcon className="h-4 w-4" />}
                  {change}
                </span>
              </div>

              <div className="mt-6">
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{label}</p>
              </div>
            </div>
          );
        }
      )}
    </div>
  );
}
