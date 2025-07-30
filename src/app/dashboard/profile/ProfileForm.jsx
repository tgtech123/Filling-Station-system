'use client';
import React from 'react';

const InputField = ({ label, name, value, editable, onChange }) => (
  <div className="flex flex-col w-full">
    <label className="text-sm font-medium mb-1">{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      disabled={!editable}
      className={`w-full border px-3 py-2 rounded-md text-sm ${
        !editable ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
      }`}
    />
  </div>
);

const ProfileForm = ({ editable = false, formData, onChange }) => {
  return (
    <div className="space-y-6">
      {/* Sales Target */}
      <div className="border p-4 rounded">
        <p className="text-sm font-medium mb-1">Sales Target</p>
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>In Progress: ₦{formData.inProgress}</span>
          <span>Sales Target: ₦{formData.salesTarget}</span>
        </div>
        <input type="range" min="0" max="100" className="w-full" disabled />
      </div>

      {/* Personal Information */}
      <div>
        <h3 className="text-sm font-semibold border-b pb-1 mb-3">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="First Name"
            name="firstName"
            value={formData.firstName}
            editable={editable}
            onChange={onChange}
          />
          <InputField
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            editable={editable}
            onChange={onChange}
          />
          <InputField
            label="Email Address"
            name="email"
            value={formData.email}
            editable={false}
            onChange={onChange}
          />
          <InputField
            label="Phone Number"
            name="phone"
            value={formData.phone}
            editable={false}
            onChange={onChange}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
