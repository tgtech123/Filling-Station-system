"use client";

import Sidebar from "@/components/Dashboard/Sidebar";
import Header from "@/components/Dashboard/Header";
import { useState } from "react";

export default function DashboardLayout({ children }) {
  const [showSidebar, setShowSidebar] = useState(false);

  function toggleSidebar() {
    setShowSidebar(!showSidebar);
  }
  return (
    <div className="bg-gray-100 min-h-[100vh] h-auto">
      <Sidebar isVisible={showSidebar} toggleSidebar={toggleSidebar} />
      <Header toggleSidebar={toggleSidebar} showSidebar={showSidebar} />
      <main className="ml-0 lg:ml-[280px] pt-[100px] py-4 px-4">
        {children}
      </main>
    </div>
  );
}
