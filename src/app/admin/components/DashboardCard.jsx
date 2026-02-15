import { ArrowUpRightIcon } from "@heroicons/react/24/solid";
import { dashboardStats } from "./dashboardStats";

export default function DashboardCard() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-[1.5rem]">
      {dashboardStats.map(
        ({ id, label, value, change, icon: Icon, iconBg, iconColor }) => (
          <div
            key={id}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center  justify-between">
              <div
                className={`flex h-12 w-12 hover:text-white items-center justify-center rounded-xl ${iconBg}`}
              >
                <Icon className={`h-6 w-6 ${iconColor}`} />
              </div>

              <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                <ArrowUpRightIcon className="h-4 w-4" />
                {change}
              </span>
            </div>

            <div className="mt-6 ">
              <p className="text-2xl font-semibold text-gray-900">{value}</p>
              <p className="mt-1 text-sm text-gray-500">{label}</p>
              <p className="mt-2 text-xs text-gray-400">From last month</p>
            </div>
          </div>
        )
      )}
    </div>
  );
}
