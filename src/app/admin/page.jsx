"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SidebarTwo from './SidebarTwo';
import HeaderTwo from './HeaderTwo';
import DashboardPage from './components/Dashboard';
import StationsPage from './components/Stations';
import SubscriptionsPage from './components/Subscriptions';
import PaymentAndBilling from './components/PaymentAndBilling';
import ActivityLogs from './components/ActivityLogs';
import Settings from './components/Settings';
import StationDetail from './components/StationDetail';

const Page = () => {
  const [activePage, setActivePage] = useState('Dashboard');
  const [selectedStationId, setSelectedStationId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.role !== "admin") {
        router.push("/login");
      }
    } catch {
      router.push("/login");
    }
  }, []);

  const handleViewStation = (stationId) => {
    setSelectedStationId(stationId);
    setActivePage('StationDetail');
  };

  const handleBackToStations = () => {
    setSelectedStationId(null);
    setActivePage('Stations');
  };

  const renderPage = () => {
    switch (activePage) {
      case 'Dashboard':
        return <DashboardPage />;
      case 'Stations':
        return <StationsPage onViewStation={handleViewStation} />;
      case 'Subscriptions':
        return <SubscriptionsPage />;
      case 'Payments & Billing':
        return <PaymentAndBilling />;
      case 'Activity Log':
        return <ActivityLogs />;
      case 'Settings':
        return <Settings />;
      case 'StationDetail':
        return (
          <StationDetail
            stationId={selectedStationId}
            onBack={handleBackToStations}
          />
        );
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className='h-screen bg-neutral-100 dark:bg-gray-950 flex'>
      <SidebarTwo activeItem={activePage} setActiveItem={setActivePage} />
      <div className='flex-1 flex flex-col'>
        <HeaderTwo />
        <main className='flex-1 overflow-y-auto'>
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default Page;
