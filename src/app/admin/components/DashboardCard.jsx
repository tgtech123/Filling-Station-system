import { ArrowUpRightIcon, ArrowDownRightIcon } from "@heroicons/react/24/solid";

export default function DashboardCard({ stats, loading }) {
  // No hardcoded fallback. This used to fall back to a demo array — 1,284
  // stations and $284,600 of revenue — which would have rendered as real
  // figures on a real admin's screen the moment the prop went missing.
  const data = stats ?? [];

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-[1.5rem]">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-sm animate-pulse"
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
          return (
            <div
              key={id}
              className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}
                >
                  <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>

                {/* Rendered only when there is a comparison to make. Flat gets
                    no arrow at all: an arrow is a direction, and "unchanged"
                    does not have one. */}
                {change && (
                  <span
                    className={`flex items-center gap-1 text-right text-xs font-medium leading-tight ${
                      change.direction === 'up'
                        ? 'text-green-600'
                        : change.direction === 'down'
                        ? 'text-red-500'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {change.direction === 'up' && <ArrowUpRightIcon className="h-4 w-4 shrink-0" />}
                    {change.direction === 'down' && <ArrowDownRightIcon className="h-4 w-4 shrink-0" />}
                    {change.text}
                  </span>
                )}
              </div>

              <div className="mt-6">
                <p className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white">{value}</p>
                <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">{label}</p>
              </div>
            </div>
          );
        }
      )}
    </div>
  );
}
