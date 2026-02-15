"use client"
import React, { useState } from 'react';
import { Home, Radio, CreditCard, DollarSign, Activity, Settings, LogOut } from 'lucide-react';
import Image from 'next/image';

const SidebarTwo = ({activeItem, setActiveItem}) => {
//   const [activeItem, setActiveItem] = useState('Dashboard');

  const menuItems = [
    { name: 'Dashboard', icon: Home, badge: null },
    { name: 'Stations', icon: Radio, badge: null },
    { name: 'Subscriptions', icon: CreditCard, badge: null },
    { name: 'Payments & Billing', icon: DollarSign, badge: null },
    { name: 'Activity Log', icon: Activity, badge: null },
    { name: 'Settings', icon: Settings, badge: null },
  ];

  return (
    <div className="w-[280px] h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 text-center">
       
       <Image
        src="/station-logo.png"
        height={100}
        width={100}
        alt='logo'
       />
      
      </div>

      {/* Menu Section */}
      <div className="px-3 flex-1">
        <div className="text-xs font-semibold text-gray-400 mb-3 px-3">GENERAL</div>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.name;
            
            return (
              <button
                key={item.name}
                onClick={() => setActiveItem(item.name)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#FF9D29] text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <Image src="/sammi.jpeg" width={40} height={43} alt='profile pic' className='rounded-md'/>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-gray-900">Oboh Thankgod</div>
            <div className="text-xs text-neutral-300 truncate">General Admin</div>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <Image src="/log-out-1.png" height={22} width={22} alt='logout logo' />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SidebarTwo;