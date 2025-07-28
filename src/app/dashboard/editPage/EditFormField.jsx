import React from 'react';

const EditFormField = ({ label, value, formData, onChange, disabled = false, name, icon, type = "text" }) => {
  return (
    <div className="flex flex-col">
      <label className="text-sm text-gray-600 font-medium mb-1">{label}</label>
      <div className="relative">
        {icon && <span className="absolute left-3 top-2 text-gray-400">{icon}</span>}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={formData?.name}
          className={`w-full border text-sm px-3 py-2 text-gray-600 focus:text-black rounded-md focus:outline-[1.4px] focus:outline-blue-500 ${
            icon ? 'pl-10' : 'tg'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        />
      </div>
    </div>
  );
};

export default EditFormField;
