// ActionButtons.jsx
import React from "react";
import { Eye, Printer } from "lucide-react";

const ActionButtons = () => (
  <div className="flex gap-2">
    <button
    //   onClick={onView}
      className="text-gray-600 hover:text-blue-500"
      title="View"
    >
      <Eye size={18} />
    </button>
    <button
    //   onClick={onPrint}
      className="text-gray-600 hover:text-blue-500"
      title="Print"
    >
      <Printer size={18} />
    </button>
  </div>
);

export default ActionButtons;
