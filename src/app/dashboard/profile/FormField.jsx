// components/FormField.jsx
import React from 'react';

const FormField = ({ label, value, onChange, icon, type = "text", error, disabled }) => {
  return (

    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        {icon && <div className="absolute inset-y-0 left-3 flex items-center text-gray-400">{icon}</div>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md text-sm ${
            icon ? "pl-10" : ""
          } ${error ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring ${disabled ? "bg-neutral-200 text-neutral-500" : ""}`}
          disabled={disabled}
        />
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}



export default FormField;
