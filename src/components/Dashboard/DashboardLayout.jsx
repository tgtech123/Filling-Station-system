

"use client";

import Sidebar from "@/components/Dashboard/Sidebar";
import Header from "@/components/Dashboard/Header";
import { useState } from "react";

function DashboardLayout({ children }) {
  const [showSidebar, setShowSidebar] = useState(false);

  function toggleSidebar() {
    setShowSidebar(!showSidebar);
  }

  return (
    <div className="bg-gray-100 min-h-[100vh] h-auto flex">
      {/* Sidebar */}
      <Sidebar isVisible={showSidebar} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header toggleSidebar={toggleSidebar} showSidebar={showSidebar} />
        <main className="ml-0 lg:ml-[280px] pt-[100px] py-4 px-4">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
