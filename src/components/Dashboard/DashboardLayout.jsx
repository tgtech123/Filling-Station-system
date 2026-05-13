"use client";

import Sidebar from "@/components/Dashboard/Sidebar";
import Header from "@/components/Dashboard/Header";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";

function DashboardLayout({ children }) {
  const router = useRouter();
  const [showSidebar, setShowSidebar] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [daysLeft, setDaysLeft] = useState(null);
  const [endsAt, setEndsAt] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Idle session timeout — logs out after 20 min of inactivity
  useSessionTimeout();

  useEffect(() => {
    // Auth guard — redirect to login if no token
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (!token || !user) {
      router.replace("/login");
      return;
    }

    try {
      const parsed = JSON.parse(user);
      if (parsed.accessMode === "read-only") {
        setIsReadOnly(true);
        setDaysLeft(parsed.gracePeriodDaysLeft ?? null);
        setEndsAt(parsed.gracePeriodEndsAt ?? null);
      }
    } catch {
      // ignore parse errors
    }

    setAuthChecked(true);
  }, [router]);

  const formattedEndsAt = endsAt
    ? new Date(endsAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  function toggleSidebar() {
    setShowSidebar(!showSidebar);
  }

  // Don't render dashboard until auth is verified (prevents flash for unauthenticated users)
  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 max-h-[100vh] overflow-y-hidden h-auto flex overflow-hidden">
      {/* Mobile overlay */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <Sidebar isVisible={showSidebar} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header toggleSidebar={toggleSidebar} showSidebar={showSidebar} />

        {/* Grace period banner */}
        {isReadOnly && (
          <div className="bg-amber-600 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="shrink-0" />
              <div>
                <p className="font-semibold text-sm">
                  ⚠️ Your station account has been scheduled for deletion
                </p>
                <p className="text-xs text-amber-100">
                  {daysLeft !== null ? `You have ${daysLeft} days of read-only access remaining. ` : ""}
                  Contact support to restore your account.
                  {formattedEndsAt ? ` Full block on ${formattedEndsAt}.` : ""}
                </p>
              </div>
            </div>
            <a
              href="mailto:support@flourishstation.com"
              className="bg-white text-amber-600 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors whitespace-nowrap ml-4"
            >
              Contact Support
            </a>
          </div>
        )}

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