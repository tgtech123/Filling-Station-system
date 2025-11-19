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
    <div className="bg-gray-100 max-h-[100vh] overflow-y-hidden h-auto flex">
      {/* Sidebar */}
      <Sidebar isVisible={showSidebar} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header toggleSidebar={toggleSidebar} showSidebar={showSidebar} />
        <main className="overflow pt-[50px] py-4 px-4 h-full overflow-y-auto overflow-x-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;



