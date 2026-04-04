"use client";
import React, { useEffect } from 'react';
import { Users, Briefcase, Wallet, Target } from "lucide-react";
import FlashCard from "@/components/Dashboard/FlashCard";
import SwitchButton from './SwitchButton';
import useStaffManagementStore from "@/store/useStaffManagementStore";

const StaffManagement = () => {
  const { staffData, loading, errors, fetchStaffManagement } = useStaffManagementStore();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) fetchStaffManagement(token);
  }, [fetchStaffManagement]);

  return (
    <div className='bg-neutral-100 mt-22 p-6'>
      <div className='p-4 bg-white rounded-xl w-full mt-3 shadow-md'>
        <h1 className='text-xl mb-2 font-bold text-neutral-700'>Staff Management</h1>
        <p className='text-md font-medium text-neutral-700'>Manage staff schedules and responsibilities</p>

        {loading.staffManagement ? (
          <p className="text-gray-500 mt-4">Loading staff data...</p>
        ) : errors.staffManagement ? (
          <p className="text-red-500 mt-4">{errors.staffManagement}</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <FlashCard
              name="Total Staff"
              icon={<Users size={18} />}
              number={staffData?.totalStaff || 0}
            />
            <FlashCard
              name="On Duty"
              icon={<Briefcase size={18} />}
              period="Today"
              number={staffData?.onDuty || 0}
            />
            <FlashCard
              name="Average Staff Salary"
              icon={<Wallet size={18} />}
              number={`₦${staffData?.averageStaffSalary?.toLocaleString() || "0"}`}
            />
            <FlashCard
              name="Overall Staff Performance"
              icon={<Target size={18} />}
              number={`${staffData?.overallStaffPerformance || 0}%`}
            />
          </div>
        )}
      </div>

      <div className='mt-4'>
        <SwitchButton />
      </div>
    </div>
  );
};

export default StaffManagement;