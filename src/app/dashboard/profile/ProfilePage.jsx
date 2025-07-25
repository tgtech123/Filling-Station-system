// components/ProfileForm.jsx
import React from 'react';
import Link from 'next/link';
import FormField from './FormField';
import { FiPhone } from 'react-icons/fi';

const ProfilePage = ({ profileData, isEditable = false, onChange }) => {
  const sectionStyle = "grid grid-cols-1 sm:grid-cols-2 gap-4";

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-bold">Attendant Profile</h2>
          <p className="text-sm text-gray-500">Personal and employment information</p>
        </div>
        
        <Link href="/dashboard/editPage">
          <button className="bg-blue-600 text-white px-4 py-2 text-sm rounded-md hover:bg-blue-500">
            Edit Profile
          </button>
        </Link>
      </div>

      {/* Top Summary */}
      <div className="bg-gray-50 p-4 rounded-md space-y-2">
        <h3 className="font-semibold text-gray-700">{profileData?.fullName}</h3>
        <p className="text-sm text-gray-500">{profileData?.position}</p>
        {/* Sales target bar */}
        <div className="mt-4">
          <label className="text-sm font-semibold text-gray-600">Sales Target</label>
          <div className="flex justify-between text-xs text-gray-500">
            <span>₦{profileData?.currentSales}</span>
            <span>₦{profileData?.targetSales}</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
            <div className="h-2 bg-blue-600 rounded-full" style={{ width: '25%' }} />
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <section>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Personal Information</h4>
        <div className={sectionStyle}>
          <FormField label="First name" value={profileData?.firstName} disabled={!isEditable} />
          <FormField label="Last name" value={profileData?.lastName} disabled={!isEditable} />
          <FormField label="Email address" value={profileData?.email} disabled={!isEditable} />
          <FormField label="Phone number" value={profileData?.phone} icon={<FiPhone />} disabled={!isEditable} />
        </div>
      </section>

      {/* Employment Info */}
      <section>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Employment Information</h4>
        <div className={sectionStyle}>
          <FormField label="Employee ID" value={profileData?.employeeId} disabled />
          <FormField label="Role/Position" value={profileData?.position} disabled />
          <FormField label="Start date" value={profileData?.startDate} disabled />
          <FormField label="Shift type" value={profileData?.shiftType} disabled />
          <FormField label="Responsibilities" value={profileData?.responsibilities} disabled />
          <FormField label="Pay frequency" value={profileData?.payFrequency} disabled />
          <FormField label="Average amount" value={profileData?.avgAmount} disabled />
          <FormField label="Sales Target" value={profileData?.monthlyTarget} disabled />
        </div>
      </section>

      {/* Password */}
      <section>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Password and Security</h4>
        <div className={sectionStyle}>
          <FormField label="Current password" type="password" value="" disabled={false} />
          <FormField label="New password" type="password" value="" disabled={false} />
          <FormField label="Confirm new password" type="password" value="" disabled={false} />
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
