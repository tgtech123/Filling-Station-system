import React, { useEffect } from 'react';
import DashboardCard from './DashboardCard';
import NetworkGrowthChart from './NetworkGrowthChart';
import RecentActivitiesTable from './RecentActivitiesTable';
import useAdminStore from '@/store/useAdminStore';
import {
  BuildingOfficeIcon,
  CreditCardIcon,
  XCircleIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

const Dashboard = () => {
  const { overview, loading, fetchOverview, fetchNetworkGrowth, fetchActivityLogs } = useAdminStore();

  useEffect(() => {
    fetchOverview();
    fetchNetworkGrowth();
    fetchActivityLogs();
  }, []);

  const fmt = (n) => (n != null ? `${n > 0 ? '+' : ''}${n}% From last month` : '+0% From last month');

  const stats = [
    {
      id: 1,
      label: "Total Registered Stations",
      value: overview?.totalRegisteredStations?.toLocaleString() ?? "—",
      change: fmt(overview?.totalRegisteredStationsGrowth),
      icon: BuildingOfficeIcon,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      id: 2,
      label: "Active Subscriptions",
      value: overview?.activeSubscriptions?.toLocaleString() ?? "—",
      change: fmt(overview?.activeSubscriptionsGrowth),
      icon: CreditCardIcon,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      id: 3,
      label: "Expired Subscriptions",
      value: overview?.expiredSubscriptions ?? "—",
      change: fmt(overview?.expiredSubscriptionsGrowth),
      icon: XCircleIcon,
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
    },
    {
      id: 4,
      label: "Monthly Revenue",
      value: overview?.monthlyRevenue != null
        ? `₦${overview.monthlyRevenue.toLocaleString()}`
        : "—",
      change: fmt(overview?.monthlyRevenueGrowth),
      icon: CurrencyDollarIcon,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
  ];

  return (
    <div className='p-8'>
      <h1 className='text-[28px] font-semibold leading-[100%] mb-[0.8rem]'>
        General Admin Dashboard
      </h1>
      <p className='text-[1.125rem] text-neutral-500 leading-[100%]'>
        Welcome back, here's your system overview and key metrics
      </p>

      <DashboardCard stats={stats} loading={loading} />

      <div className='mt-[1.5rem]'>
        <NetworkGrowthChart />
      </div>

      <div className='mt-[1.5rem]'>
        <RecentActivitiesTable />
      </div>
    </div>
  );
};

export default Dashboard;
