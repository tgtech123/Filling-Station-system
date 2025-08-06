"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Add debugging
    console.log("🔍 RoleContext: Initializing...");
    
    try {
      const storedRole = localStorage.getItem("userRole");
      
      
      if (storedRole && storedRole !== 'null' && storedRole !== 'undefined') {
        setUserRole(storedRole);
        
      } else {
        console.log("RoleContext: No valid role found");
      }
    } catch (error) {
      console.error("RoleContext: Error reading localStorage:", error);
    }
    
    setIsLoading(false);
  }, []);

  // Debug role changes
  useEffect(() => {
    console.log("🔍 RoleContext: userRole changed to:", userRole);
  }, [userRole]);

  const setRole = (role) => {
    console.log("🔍 RoleContext: setRole called with:", role);
    try {
      setUserRole(role);
      localStorage.setItem("userRole", role);
      console.log("✅ RoleContext: Role successfully set to:", role);
    } catch (error) {
      console.error("❌ RoleContext: Error setting role:", error);
    }
  };

  const clearRole = () => {
    console.log("🔍 RoleContext: clearRole called");
    setUserRole(null);
    localStorage.removeItem("userRole");
  };

  const getRoleInfo = () => {
    switch (userRole) {
      case "attendant":
        return { name: "Station Attendant", level: 1, color: "orange" };
        case "cashier":
          return { name: "Cashier", level: 2, color: "pink" };
      case "accountant":
        return { name: "Accountant", level: 3, color: "purple" };
      case "supervisor":
        return { name: "Supervisor", level: 4, color: "blue" };
      case "manager":
        return { name: "Manager", level: 5, color: "green" };
      default:
        return null;
    }
  };

  const contextValue = {
    userRole,
    setRole,
    clearRole,
    getRoleInfo,
    isLoading
  };

  console.log("🔍 RoleContext: Current context value:", { userRole, isLoading });

  return (
    <RoleContext.Provider value={contextValue}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};