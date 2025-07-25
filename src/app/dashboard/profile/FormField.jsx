// components/FormField.jsx
import React from 'react';

const FormField = ({ label, value, icon, type = 'text', disabled = true, name, onChange }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-sm font-semibold text-gray-700">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-2.5 text-gray-500">{icon}</span>}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full h-[42px] rounded-md border px-4 ${
            icon ? 'pl-10' : ''
          } border-gray-300 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
        />
      </div>
    </div>
  );
};

export default FormField;
