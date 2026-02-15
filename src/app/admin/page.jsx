// 'use client'
// import Sidebar from '@/components/Dashboard/Sidebar'
// import React, { useState } from 'react'
// import SidebarTwo from './SidebarTwo'
// import HeaderTwo from './HeaderTwo'

// const page = () => {
//   const [activeItem, setActiveItem] =useState("Dashboard")
//   return (
    
//       <div className='h-screen bg-neutral-50 flex'>
      
//         <SidebarTwo activeItem={activeItem} setActiveItem={setActiveItem}/>

//         <HeaderTwo />
//       </div>
    
//   )
// }

// export default page

"use client";
import { useState } from 'react';
import SidebarTwo from './SidebarTwo';
import HeaderTwo from './HeaderTwo';
import DashboardPage from './components/Dashboard';
import StationsPage from './components/Stations';
import SubscriptionsPage from './components/Subscriptions';
import PaymentAndBilling from './components/PaymentAndBilling';
import ActivityLogs from './components/ActivityLogs';
import Settings from './components/Settings';
// Import other page components as you create them

const Page = () => {
  const [activePage, setActivePage] = useState('Dashboard');

  // Render the correct page based on state
  const renderPage = () => {
    switch (activePage) {
      case 'Dashboard':
        return <DashboardPage />;
      case 'Stations':
        return <StationsPage />;
      case 'Subscriptions':
        return <SubscriptionsPage />;
      case 'Payments & Billing':
        return <PaymentAndBilling/>
      case 'Activity Log':
        return <ActivityLogs/>
      case 'Settings':
        return <Settings/>
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className='h-screen bg-neutral-100 flex'>
      {/* Pass state and setter to sidebar */}
      <SidebarTwo activeItem={activePage} setActiveItem={setActivePage} />
      
      {/* Main content area */}
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