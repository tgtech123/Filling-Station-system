"use client";

import React, { useState } from "react";
import {
  Users,
  DollarSign,
  Shield,
  Settings,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { useRole } from "../context/RoleContext";
import { useRouter } from "next/navigation";

export default function RoleSelectionPage() {
  const [selectedRole, setSelectedRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Use the setRole method from your context
  const { setRole } = useRole();
  const router = useRouter();

  const roles = [
    {
      id: "attendant",
      name: "Station Attendant",
      description:
        "Handle daily operations, manage shifts, and process sales transactions",
      icon: <DollarSign className="w-8 h-8" />,
      color: "from-orange-400 to-orange-600",
      permissions: ["Shift Management", "Sales Entry", "Basic Reports"],
    },
    {
      id: "cashier",
      name: "Cashier",
      description:
        "Handle payments, process transactions, and manage cash register operations",
      icon: <DollarSign className="w-8 h-8" />,
      color: "from-pink-400 to-pink-600",
      permissions: ["Payment Processing", "Transaction Records", "Cash Management"],
    },
    {
      id: "accountant",
      name: "Accountant",
      description:
        "Manage financial records, generate reports, and handle accounting tasks",
      icon: <Users className="w-8 h-8" />,
      color: "from-purple-400 to-purple-600",
      permissions: [
        "Financial Reports",
        "Accounting Records",
        "Budget Analysis",
      ],
    },
    {
      id: "supervisor",
      name: "Supervisor",
      description:
        "Oversee operations, manage staff, and monitor performance metrics",
      icon: <Shield className="w-8 h-8" />,
      color: "from-blue-400 to-blue-600",
      permissions: [
        "Staff Management",
        "Inventory Control",
        "Performance Reports",
        "All Accountant Access",
      ],
    },
    {
      id: "manager",
      name: "Manager",
      description:
        "Full system access with complete control over all operations and settings",
      icon: <Settings className="w-8 h-8" />,
      color: "from-green-400 to-green-600",
      permissions: [
        "System Settings",
        "User Management",
        "Analytics Dashboard",
        "Audit Logs",
        "All Access",
      ],
    },
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
  };

  const handleProceed = () => {
    if (!selectedRole) return;

    setIsLoading(true);

    try {
      // Use your setRole method from context
      setRole(selectedRole);
      
      // Add a small delay to ensure state is updated before navigation
      setTimeout(() => {
        router.push("/dashboard");
      }, 100);
    } catch (error) {
      console.error("Error setting role:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Select Your Role
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose your role to access the appropriate dashboard features and
            permissions
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => handleRoleSelect(role.id)}
              className={`relative cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                selectedRole === role.id
                  ? "ring-4 ring-blue-500 ring-opacity-50 shadow-2xl"
                  : "hover:shadow-xl"
              }`}
            >
              <div className="bg-white rounded-2xl p-6 h-full border border-gray-200">
                {/* Selection Indicator */}
                {selectedRole === role.id && (
                  <div className="absolute -top-2 -right-2">
                    <CheckCircle className="w-8 h-8 text-blue-500 bg-white rounded-full shadow-lg" />
                  </div>
                )}
                {/* Role Icon */}
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${role.color} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg`}
                >
                  {role.icon}
                </div>

                {/* Role Info */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {role.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {role.description}
                </p>

                {/* Permissions */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    Key Permissions:
                  </h4>
                  <ul className="space-y-1">
                    {role.permissions.slice(0, 3).map((permission, index) => (
                      <li
                        key={index}
                        className="text-xs text-gray-500 flex items-center"
                      >
                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-2"></div>
                        {permission}
                      </li>
                    ))}
                    {role.permissions.length > 3 && (
                      <li className="text-xs text-gray-400 italic">
                        +{role.permissions.length - 3} more...
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="text-center">
          <button
            onClick={handleProceed}
            disabled={!selectedRole || isLoading}
            className={`inline-flex items-center cursor-pointer px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
              selectedRole && !isLoading
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Loading Dashboard...
              </>
            ) : (
              <>
                Access Dashboard
                <ArrowRight className="ml-2 w-5 h-5" />
              </>
            )}
          </button>

          {selectedRole && !isLoading && (
            <p className="mt-4 text-gray-600">
              Proceeding as:{" "}
              <span className="font-semibold capitalize">{selectedRole}</span>
            </p>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <div className="bg-blue-50 rounded-xl p-6 max-w-2xl mx-auto">
            <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
            <p className="text-blue-700 text-sm">
              Contact your system administrator if you're unsure about your role
              or need different access permissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// export default RoleSelectionPage;
// "use client";
// import React, { useState } from "react";
// import {
//   Users,
//   DollarSign,
//   Shield,
//   Settings,
//   ArrowRight,
//   CheckCircle,
// } from "lucide-react";
// import { useRole } from "../context/RoleContext";
// import { useRouter } from "next/navigation";

// const RoleSelectionPage = () => {
//   const [selectedRole, setSelectedRole] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   // Use the setRole method from your context
//   const { setRole } = useRole();
//   const router = useRouter();

//   const roles = [
//     {
//       id: "cashier",
//       name: "Cashier",
//       description:
//         "Handle payments, process transactions, and manage cash register operations",
//       icon: <DollarSign className="w-8 h-8" />,
//       color: "from-pink-400 to-pink-600",
//       permissions: ["Payment Processing", "Transaction Records", "Cash Management"],
//     },
//     {
//       id: "attendant",
//       name: "Station Attendant",
//       description:
//         "Handle daily operations, manage shifts, and process sales transactions",
//       icon: <Users className="w-8 h-8" />,
//       color: "from-orange-400 to-orange-600",
//       permissions: ["Shift Management", "Sales Entry", "Basic Reports"],
//     },
//     {
//       id: "accountant",
//       name: "Accountant",
//       description:
//         "Manage financial records, generate reports, and handle accounting tasks",
//       icon: <FileText className="w-8 h-8" />,
//       color: "from-purple-400 to-purple-600",
//       permissions: [
//         "Financial Reports",
//         "Accounting Records",
//         "Budget Analysis",
//       ],
//     },
//     {
//       id: "supervisor",
//       name: "Supervisor",
//       description:
//         "Oversee operations, manage staff, and monitor performance metrics",
//       icon: <Shield className="w-8 h-8" />,
//       color: "from-blue-400 to-blue-600",
//       permissions: [
//         "Staff Management",
//         "Inventory Control",
//         "Performance Reports",
//         "All Accountant Access",
//       ],
//     },
//     {
//       id: "manager",
//       name: "Manager",
//       description:
//         "Full system access with complete control over all operations and settings",
//       icon: <Settings className="w-8 h-8" />,
//       color: "from-green-400 to-green-600",
//       permissions: [
//         "System Settings",
//         "User Management",
//         "Analytics Dashboard",
//         "Audit Logs",
//         "All Access",
//       ],
//     },
//   ];

//   const handleRoleSelect = (roleId) => {
//     setSelectedRole(roleId);
//   };

//   const handleProceed = () => {
//     if (!selectedRole) return;

//     setIsLoading(true);

//     try {
//       // Use your setRole method from context
//       setRole(selectedRole);
      
//       // Add a small delay to ensure state is updated before navigation
//       setTimeout(() => {
//         router.push("/dashboard");
//       }, 100);
//     } catch (error) {
//       console.error("Error setting role:", error);
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
//       <div className="max-w-6xl w-full">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <div className="flex items-center justify-center mb-6">
//             <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
//               <Shield className="w-8 h-8 text-white" />
//             </div>
//           </div>
//           <h1 className="text-4xl font-bold text-gray-900 mb-4">
//             Select Your Role
//           </h1>
//           <p className="text-xl text-gray-600 max-w-2xl mx-auto">
//             Choose your role to access the appropriate dashboard features and
//             permissions
//           </p>
//         </div>

//         {/* Role Cards */}
//         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
//           {roles.map((role) => (
//             <div
//               key={role.id}
//               onClick={() => handleRoleSelect(role.id)}
//               className={`relative cursor-pointer transition-all duration-300 transform hover:scale-105 ${
//                 selectedRole === role.id
//                   ? "ring-4 ring-blue-500 ring-opacity-50 shadow-2xl"
//                   : "hover:shadow-xl"
//               }`}
//             >
//               <div className="bg-white rounded-2xl p-6 h-full border border-gray-200">
//                 {/* Selection Indicator */}
//                 {selectedRole === role.id && (
//                   <div className="absolute -top-2 -right-2">
//                     <CheckCircle className="w-8 h-8 text-blue-500 bg-white rounded-full shadow-lg" />
//                   </div>
//                 )}

//                 {/* Role Icon */}
//                 <div
//                   className={`w-16 h-16 bg-gradient-to-r ${role.color} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg`}
//                 >
//                   {role.icon}
//                 </div>

//                 {/* Role Info */}
//                 <h3 className="text-xl font-semibold text-gray-900 mb-2">
//                   {role.name}
//                 </h3>
//                 <p className="text-gray-600 text-sm mb-4 leading-relaxed">
//                   {role.description}
//                 </p>

//                 {/* Permissions */}
//                 <div className="space-y-2">
//                   <h4 className="text-sm font-medium text-gray-700">
//                     Key Permissions:
//                   </h4>
//                   <ul className="space-y-1">
//                     {role.permissions.slice(0, 3).map((permission, index) => (
//                       <li
//                         key={index}
//                         className="text-xs text-gray-500 flex items-center"
//                       >
//                         <div className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-2"></div>
//                         {permission}
//                       </li>
//                     ))}
//                     {role.permissions.length > 3 && (
//                       <li className="text-xs text-gray-400 italic">
//                         +{role.permissions.length - 3} more...
//                       </li>
//                     )}
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Action Button */}
//         <div className="text-center">
//           <button
//             onClick={handleProceed}
//             disabled={!selectedRole || isLoading}
//             className={`inline-flex items-center cursor-pointer px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
//               selectedRole && !isLoading
//                 ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
//                 : "bg-gray-300 text-gray-500 cursor-not-allowed"
//             }`}
//           >
//             {isLoading ? (
//               <>
//                 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
//                 Loading Dashboard...
//               </>
//             ) : (
//               <>
//                 Access Dashboard
//                 <ArrowRight className="ml-2 w-5 h-5" />
//               </>
//             )}
//           </button>

//           {selectedRole && !isLoading && (
//             <p className="mt-4 text-gray-600">
//               Proceeding as:{" "}
//               <span className="font-semibold capitalize">{selectedRole}</span>
//             </p>
//           )}
//         </div>

//         {/* Footer Info */}
//         <div className="mt-12 text-center">
//           <div className="bg-blue-50 rounded-xl p-6 max-w-2xl mx-auto">
//             <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
//             <p className="text-blue-700 text-sm">
//               Contact your system administrator if you're unsure about your role
//               or need different access permissions.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RoleSelectionPage;