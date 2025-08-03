// ActionButtons.jsx
import React from "react";
import { Eye, Printer } from "lucide-react";

const ActionButtons = () => (
  <div className="flex gap-2">
    <button
    //   onClick={onView}
      className="text-gray-600 border-[1.5px] cursor-pointer py-1.5 px-2 rounded-xl"
      title="View"
    >
      <Eye size={22} />
    </button>
    <button
    //   onClick={onPrint}
      className=" border-[1.5px] cursor-pointer py-1.5 px-2 rounded-xl text-blue-600"
      title="Print"
    >
      <Printer size={22} />
    </button>
  </div>
);

export default ActionButtons;
