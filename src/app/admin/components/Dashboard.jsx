import React, { useEffect } from 'react';
import DashboardCard from './DashboardCard';
import NetworkGrowthChart from './NetworkGrowthChart';
import RecentActivitiesTable from './RecentActivitiesTable';
import useAdminStore from '@/store/useAdminStore';
import {
  BuildingOfficeIcon,
  CheckCircleIcon,
  UserGroupIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";

const Dashboard = () => {
  const { overview, loading, fetchOverview } = useAdminStore();

  useEffect(() => {
    fetchOverview();
  }, []);

  const stats = [
    {
      id: 1,
      label: "Total Stations",
      value: loading ? "—" : (overview?.totalStations ?? "—"),
      change: overview?.totalStationsChange || "+0%",
      icon: BuildingOfficeIcon,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      id: 2,
      label: "Active Stations",
      value: loading ? "—" : (overview?.activeStations ?? "—"),
      change: overview?.activeStationsChange || "+0%",
      icon: CheckCircleIcon,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      id: 3,
      label: "Total Staff",
      value: loading ? "—" : (overview?.totalStaff ?? "—"),
      change: overview?.totalStaffChange || "+0%",
      icon: UserGroupIcon,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      id: 4,
      label: "New This Month",
      value: loading ? "—" : (overview?.newStationsThisMonth ?? "—"),
      change: overview?.newStationsChange || "+0%",
      icon: PlusCircleIcon,
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

      <DashboardCard stats={stats} />

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
