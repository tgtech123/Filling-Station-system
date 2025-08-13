'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { FiPhone } from 'react-icons/fi';
import { HiOutlineMail } from "react-icons/hi";
import EditFormField from './EditFormField';
import {ProfileImageUpload} from './ProfileImageUpload ';
import { Save, X } from 'lucide-react';
import ImageUpload from './ImageUpload';

const EditProfilePage = ({ profileData }) => {
  const [formData, setFormData] = useState(profileData);
  const [errors, setErrors] = useState({});

  const sectionStyle = "grid grid-cols-1 sm:grid-cols-2 gap-4";

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '',
    }));
  };

  const handleSave = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required *';
    if (!formData.lastName) newErrors.lastName = 'Last name is required  *';
    if (!formData.email) newErrors.email = 'Email is required *';
    if (!formData.phone) newErrors.phone = 'Phone number is required *';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log('Saved Data:', formData);
      alert('Changes saved successfully!');
    }
  };

  return (
    <div className="bg-neutral-50 p-6 rounded-lg shadow-md w-full max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-bold">Attendant Profile</h2>
          <p className="text-sm text-gray-500">Personal and employment information</p>
        </div>
        <Link href="/dashboard/profile">
          <button className=" text-gray-700 cursor-pointer hover:text-red-500 px-3 py-2 rounded-md">
            <X size={20} />
          </button>
        </Link>
      </div>

      {/* Profile Summary */}
      <div className="flex flex-col md:flex-row justify-between items-center rounded-md p-4 space-y-2 md:space-y-0 md:space-x-4">
        <div className="flex flex-col sm:flex-row items-center gap-2 md:mr-14 text-center sm:text-left">
          {/* <ProfileImageUpload /> */}
          <ImageUpload/>
          <div>
            <h3 className="font-semibold text-gray-700 text-base sm:text-lg">
              {formData.fullName}
            </h3>
            <p className="text-sm text-gray-500">{formData.position}</p>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap justify-center">
          <Link href="/dashboard/profile">
            <button className="bg-white border hover:text-gray-400 px-4 py-2 rounded-xl text-sm font-semibold">
              Cancel
            </button>
          </Link>
          
          <Link href="/dashboard/profile">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-500"
            >
              <Save />
              Save Changes
            </button>
          </Link>

        </div>
      </div>

      {/* Sales Summary */}
      <div className="mt-6 border-1 rounded-3xl p-5">
        <label className="text-sm font-semibold text-gray-600">Sales Target</label>
        <div className="flex justify-between text-xs text-gray-500 mt-3">
          <span className="flex flex-col gap-1">
            In Progress <h2 className="text-gray-700 font-semibold">₦{formData.currentSales}</h2>
          </span>
          <span className="flex flex-col gap-1">
            Sales Target <h2 className="text-gray-700 font-semibold">₦{formData.targetSales}</h2>
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
          <div className="h-2 bg-blue-600 rounded-full" style={{ width: '25%' }} />
        </div>
      </div>

      <div className='bg-neutral-100 rounded py-2 pl-3 text-neutral-800 font-semibold'>
        STAFF DETAILS
      </div>

      {/* Personal Info (Editable) */}
      <section>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Personal Information</h4>
        <div className={sectionStyle}>
          <div>
            <EditFormField
              label="First name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              formData={formData}
              errors={errors}
              disabled={false}
            />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
          </div>

          <div>
            <EditFormField
              label="Last name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              formData={formData}
              errors={errors}
              disabled={false}
            />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
          </div>

          <div>
            <EditFormField
              label="Email address"
              name="email"
              value={formData.email}
              icon={<HiOutlineMail className=' mt-0.5' size={20}/>}
              onChange={handleChange}
              formData={formData}
              errors={errors}
              disabled={false}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <EditFormField
              label="Phone number"
              name="phone"
              value={formData.phone}
              icon={<FiPhone className=' mt-0.5' size={20}/>}
              onChange={handleChange}
              formData={formData}
              errors={errors}
              disabled={false}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>
        </div>
      </section>

      {/* Employment Info (Read-only) */}
      <section>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Employment Information</h4>
        <div className={sectionStyle}>
          <EditFormField label="Employee ID" name="employeeId" value={formData.employeeId} disabled />
          <EditFormField label="Role/Position" name="position" value={formData.position} disabled />
          <EditFormField label="Start date" name="startDate" value={formData.startDate} disabled />
          <EditFormField label="Shift type" name="shiftType" value={formData.shiftType} disabled />
          <EditFormField label="Responsibilities" name="responsibilities" value={formData.responsibilities} disabled />
          <EditFormField label="Pay frequency" name="payFrequency" value={formData.payFrequency} disabled />
          <EditFormField label="Average amount" name="avgAmount" value={formData.avgAmount} disabled />
          <EditFormField label="Sales Target" name="monthlyTarget" value={formData.monthlyTarget} disabled />
        </div>
      </section>

      {/* Security Section */}
      <section>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Password and Security</h4>
        <div className={sectionStyle}>
          <EditFormField label="Current password" type="password" value="**************" disabled />
          <EditFormField label="New password" type="password" value="**************" disabled />
          <EditFormField label="Confirm new password" type="password" value="**************" disabled />
        </div>
      </section>
    </div>
  );
};

export default EditProfilePage;
