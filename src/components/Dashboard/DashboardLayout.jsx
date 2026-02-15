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



// "use client";

// import Sidebar from "@/components/Dashboard/Sidebar";
// import Header from "@/components/Dashboard/Header";
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";

// function DashboardLayout({ children }) {
//   const [showSidebar, setShowSidebar] = useState(false);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const router = useRouter();

//   useEffect(() => {
//     // Check if user is logged in
//     const user = JSON.parse(localStorage.getItem("user") || "null");
    
//     if (!user || !user.role) {
//       // No user found, redirect to login
//       router.push("/login");
//       return;
//     }
    
//     // User is authenticated
//     setIsAuthenticated(true);
//   }, [router]);

//   function toggleSidebar() {
//     setShowSidebar(!showSidebar);
//   }

//   // Don't render the dashboard until authentication is verified
//   if (!isAuthenticated) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-100">
//         <div className="text-center">
//           <p className="text-lg text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }
 
//   return (
//     <div className="bg-gray-100 max-h-[100vh] overflow-y-hidden h-auto flex">
//       {/* Sidebar */}
//       <Sidebar isVisible={showSidebar} toggleSidebar={toggleSidebar} />

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col">
//         <Header toggleSidebar={toggleSidebar} showSidebar={showSidebar} />
//         <main className="overflow pt-[50px] py-4 px-4 h-full overflow-y-auto overflow-x-auto">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }

// export default DashboardLayout;