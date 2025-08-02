// components/ProfileForm.jsx
import React from "react";
import Link from "next/link";
import FormField from "./FormField";
import { FiPhone } from "react-icons/fi";
import { HiOutlineMail } from "react-icons/hi";
import { X } from "lucide-react";

const ProfilePage = ({ profileData, isEditable = false, onChange }) => {
  const sectionStyle = "grid grid-cols-1 sm:grid-cols-2 gap-4";

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl mx-auto space-y-6 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-bold">Attendant Profile</h2>
          <p className="text-sm text-gray-500">
            Personal and employment information
          </p>
        </div>

        <Link href="/dashboard">
          <button className="bg-blue-600 text-white px-4 py-2 text-sm sm:text-xs md:text-sm lg:text-base rounded-md hover:bg-blue-500 whitespace-nowrap">
            <X size={22} />
          </button>
        </Link>
      </div>

      {/* Top Summary */}
        <div className=" p-4 rounded-md space-y-4">
      {/* Top Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Profile Info */}
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 bg-gray-500 rounded-full text-gray-300 flex items-center justify-center text-[10px]">
                No Image
              </div>

              <div>
                <h3 className="font-semibold text-gray-700">
                  {profileData?.fullName}
                </h3>
                <p className="text-sm text-gray-500">{profileData?.position}</p>
              </div>
            </div>

            {/* Edit Button */}
            <div className="flex sm:justify-end">
              <Link href="/dashboard/editPage">
                <button className="bg-blue-600 text-white px-4 py-2 text-sm md:text-base rounded-md hover:bg-blue-500 whitespace-nowrap w-full sm:w-auto">
                  Edit Profile
                </button>
              </Link>
            </div>
          </div>

      {/* Sales Target Section */}
          <div className="mt-4 w-[670px] border rounded-3xl px-2 py-2 space-y-5">
            <label className="text-sm font-semibold text-gray-600 block">
              Sales Target
            </label>

            <div className="flex flex-col sm:flex-row justify-between gap-4 text-xs text-gray-500">
              <span className="flex flex-col gap-1">
                In Progress
                <h2 className="text-gray-700 font-semibold text-sm">
                  ₦{profileData?.currentSales}
                </h2>
              </span>
              <span className="flex flex-col gap-1">
                Sales Target
                <h2 className="text-gray-700 font-semibold text-sm">
                  ₦{profileData?.targetSales}
                </h2>
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-blue-600 rounded-full"
                style={{ width: "25%" }}
              />
            </div>
          </div>
        </div>

        <div className='bg-neutral-100 rounded py-2 pl-3 text-neutral-800 font-semibold'>
           STAFF DETAILS
        </div>
      {/* Personal Info */}
      <section>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">
          Personal Information
        </h4>
        <div className={sectionStyle}>
          <FormField
            label="First name"
            value={profileData?.firstName}
            disabled={!isEditable}
          />
          <FormField
            label="Last name"
            value={profileData?.lastName}
            disabled={!isEditable}
          />
          <FormField
            label="Email address"
            value={profileData?.email}
            icon={<HiOutlineMail className=' mt-0.5' size={20}/>}
            disabled={!isEditable}
          />
          <FormField
            label="Phone number"
            value={profileData?.phone}
            icon={<FiPhone />}
            disabled={!isEditable}
          />
        </div>
      </section>

      {/* Employment Info */}
      <section>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">
          Employment Information
        </h4>
        <div className={sectionStyle}>
          <FormField
            label="Employee ID"
            value={profileData?.employeeId}
            disabled
          />
          <FormField
            label="Role/Position"
            value={profileData?.position}
            disabled
          />
          <FormField
            label="Start date"
            value={profileData?.startDate}
            disabled
          />
          <FormField
            label="Shift type"
            value={profileData?.shiftType}
            disabled
          />
          <FormField
            label="Responsibilities"
            value={profileData?.responsibilities}
            disabled
          />
          <FormField
            label="Pay frequency"
            value={profileData?.payFrequency}
            disabled
          />
          <FormField
            label="Average amount"
            value={profileData?.avgAmount}
            disabled
          />
          <FormField
            label="Sales Target"
            value={profileData?.monthlyTarget}
            disabled
          />
        </div>
      </section>

      {/* Password */}
      <section>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">
          Password and Security
        </h4>
        <div className={sectionStyle}>
          <FormField
            label="Current password"
            type="password"
            value={"*****************"}
            disabled={true}
          />
          <FormField
            label="New password"
            type="password"
            value={"**************"}
            disabled={true}
          />
          <FormField
            label="Confirm new password"
            type="password"
            value={"***************"}
            disabled={true}
          />
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
