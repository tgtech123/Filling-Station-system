"use client";

import Sidebar from "@/components/Dashboard/Sidebar";
import Header from "@/components/Dashboard/Header";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AlertTriangle, Flame, PowerOff, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import useGasStore from "@/store/useGasStore";

function DashboardLayout({ children }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [showSidebar, setShowSidebar] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [daysLeft, setDaysLeft] = useState(null);
  const [endsAt, setEndsAt] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [toggling, setToggling] = useState(false);

  const { gasEnabled, fetchGasStatus, toggleGasDepartment, loading: gasLoading } = useGasStore();
  const isGasPath = pathname?.startsWith("/dashboard/gas");

  // Idle session timeout — logs out after 40 min of inactivity
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
      setUserRole(parsed.role || null);
    } catch {
      // ignore parse errors
    }

    setAuthChecked(true);
  }, [router]);

  // Fetch gas status whenever we land on a gas path
  useEffect(() => {
    if (authChecked && isGasPath) fetchGasStatus();
  }, [authChecked, isGasPath]);

  const handleToggleGas = async () => {
    setToggling(true);
    await toggleGasDepartment();
    setToggling(false);
  };

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
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen lg:h-screen flex lg:overflow-hidden">
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

        <main className="flex-1 pt-[50px] py-4 px-4 overflow-y-auto overflow-x-hidden">
          {/* Gas department disabled screen */}
          {isGasPath && gasEnabled === false ? (
            <div className="min-h-[80vh] flex items-center justify-center">
              <div className="max-w-md w-full mx-auto text-center px-6">
                <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
                  <PowerOff className="w-10 h-10 text-orange-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Gas Department Disabled</h2>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                  The Gas Department has been temporarily disabled for this station.
                  All gas operations, sales, and procurement are frozen until it is re-enabled.
                </p>
                {["manager", "admin"].includes(userRole) ? (
                  <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                    <p className="text-sm text-orange-700 font-medium">
                      Use the <span className="font-bold">Enable</span> button in the sidebar next to "🔥 Gas Department" to re-activate it.
                    </p>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                    <p className="text-sm text-amber-700 font-medium">
                      Contact your station manager to re-enable the Gas Department.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : isGasPath && gasEnabled === null && gasLoading.status ? (
            /* Loading gas status */
            <div className="min-h-[80vh] flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 text-sm">Loading Gas Department…</p>
              </div>
            </div>
          ) : (
            children
          )}
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
//         <main className="flex-1 pt-[50px] py-4 px-4 overflow-y-auto overflow-x-hidden">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }

// export default DashboardLayout;