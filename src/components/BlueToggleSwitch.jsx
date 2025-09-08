import { useState } from "react";

export default function BlueToggleSwitch({enabled}) {
  

  return (
    <div
      onClick={() => setEnabled(!enabled)}
      className={`w-12 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
        enabled ? "bg-[#1154d4]" : "bg-gray-300"
      }`}
    >
      <div
        className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </div>
  );
}
