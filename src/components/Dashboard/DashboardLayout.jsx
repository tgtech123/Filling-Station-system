
// "use client";

// import Sidebar from "@/components/Dashboard/Sidebar";
// import Header from "@/components/Dashboard/Header";
// import { useState, useEffect } from "react";
// import { useRole } from "@/app/context/RoleContext";
// import { useRouter } from "next/navigation";

// function DashboardLayout({ children }) {
//   const [showSidebar, setShowSidebar] = useState(false);
//   const { userRole, isLoading } = useRole();
//   const router = useRouter();

//   function toggleSidebar() {
//     setShowSidebar(!showSidebar);
//   }

//   // Redirect to role selection if no role is set
//   useEffect(() => {
//     if (!isLoading && !userRole) {
//       router.push('/role-selection');
//     }
//   }, [userRole, isLoading, router]);

//   // Show loading state while checking role
//   if (isLoading) {
//     return (
//       <div className="bg-gray-100 min-h-[100vh] h-auto flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   // Don't render if no role (will redirect)
//   if (!userRole) {
//     return null;
//   }

//   return (
//     <div className="bg-gray-100 min-h-[100vh] h-auto">
//       <Sidebar isVisible={showSidebar} toggleSidebar={toggleSidebar} />
//       <Header toggleSidebar={toggleSidebar} showSidebar={showSidebar} />
//       <main className="ml-0 lg:ml-[280px] pt-[100px] py-4 px-4">
//         {children}
//       </main>
//     </div>
//   );
// }

// // Protect the entire dashboard - all roles can access but must have a role selected
// // export default withRoleProtection(DashboardLayout, ['attendant', 'accountant', 'supervisor', 'manager']);

// export default DashboardLayout


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
