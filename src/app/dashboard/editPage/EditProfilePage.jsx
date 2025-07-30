'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { FiPhone } from 'react-icons/fi';
import EditFormField from './EditFormField';
import ProfileImageUpload from './ProfileImageUpload ';
import { Save } from 'lucide-react'


const EditProfilePage = ({ profileData }) => {
  const [formData, setFormData] = useState(profileData);
  const [isEditable, setIsEditable] = useState(true); // ONLY personal info is editable

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const sectionStyle = "grid grid-cols-1 sm:grid-cols-2 gap-4";

  const handleSave = () => {
    console.log('Updated Data:', formData);
    alert('Changes saved (you can connect this to your backend).');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-bold">Attendant Profile</h2>
          <p className="text-sm text-gray-500">Personal and employment information</p>
        </div>

        <Link href='/dashboard/profile'>
            <button
            className="bg-blue-600 text-white px-4 py-2 text-sm sm:text-xs md:text-sm lg:text-base rounded-md hover:bg-blue-500 whitespace-nowrap"
            >
            X
            </button>
        </Link>
      
      </div>

      {/* Top Summary */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-gray-50 rounded-md p-4 space-y-4 md:space-y-0 md:space-x-4">
                {/* Left Section - Image and Name */}
                <div className="flex flex-col sm:flex-row items-center gap-4 md:mr-14 text-center sm:text-left">
                    <ProfileImageUpload />

                    <div>
                    <h3 className="font-semibold text-gray-700 text-base sm:text-lg">
                        {formData.fullName}
                    </h3>
                    <p className="text-sm text-gray-500">{formData.position}</p>
                    </div>
                </div>

                {/* Right Section - Buttons */}
                <div className="flex gap-3 flex-wrap justify-center">
                    <Link href='/dashboard/profile'>
                        <button className="bg-white border hover:text-gray-400 px-4 py-2 rounded-xl cursor-pointer font-semibold text-sm sm:text-base">
                        Cancel
                        </button>
                    </Link>

                    <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-blue-600 text-white font-medium px-4 py-2 rounded-md cursor-pointer hover:bg-blue-500 text-sm sm:text-base"
                    >
                    <Save />
                    Save Changes
                    </button>
                </div>
            </div>


            <div className="mt-6 border-1 rounded-3xl p-5">
                <label className="text-sm font-semibold text-gray-600">Sales Target</label>
                <div className="flex justify-between text-xs text-gray-500 mt-3">
                    <span className='flex flex-col gap-1 '> In Progress <h2 className='text-gray-700 font-semibold'>₦{formData.currentSales}</h2> </span>
                    <span className='flex flex-col gap-1 '> Sales Target <h2 className='text-gray-700 font-semibold'>₦{formData.targetSales}</h2> </span>
                </div>
            <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                <div className="h-2 bg-blue-600 rounded-full" style={{ width: '25%' }} />
            </div>
            </div>
     

      {/* Personal Info */}
      <section>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Personal Information</h4>
        <div className={sectionStyle}>
          <EditFormField
            label="First name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            disabled={false}
          />
          <EditFormField
            label="Last name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            disabled={false}
          />
          <EditFormField
            label="Email address"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={false}
          />
          <EditFormField
            label="Phone number"
            name="phone"
            value={formData.phone}
            icon={<FiPhone />}
            onChange={handleChange}
            disabled={false}
          />
        </div>
      </section>

      {/* Employment Info (Read-only) */}
      <section>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Employment Information</h4>
        <div className={sectionStyle}>
          <EditFormField label="Employee ID" value={formData.employeeId} disabled />
          <EditFormField label="Role/Position" value={formData.position} disabled />
          <EditFormField label="Start date" value={formData.startDate} disabled />
          <EditFormField label="Shift type" value={formData.shiftType} disabled />
          <EditFormField label="Responsibilities" value={formData.responsibilities} disabled />
          <EditFormField label="Pay frequency" value={formData.payFrequency} disabled />
          <EditFormField label="Average amount" value={formData.avgAmount} disabled />
          <EditFormField label="Sales Target" value={formData.monthlyTarget} disabled />
        </div>
      </section>

      {/* Password (Still disabled) */}
      <section>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Password and Security</h4>
        <div className={sectionStyle}>
          <EditFormField label="Current password" type="password" value={"*****************"} disabled />
          <EditFormField label="New password" type="password" value={'**************'} disabled />
          <EditFormField label="Confirm new password" type="password" value={"***************"} disabled />
        </div>
      </section>
    </div>
  );
};

export default EditProfilePage;
