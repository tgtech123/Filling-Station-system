
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function DurationDropdown() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("Select option");

  const quickOptions = ["This month", "Last quarter", "This year"];

  return (
    <div className="w-full  text-sm">
      <label className="block text-gray-600 mb-1 font-semibold">Duration</label>

      {/* Top Select */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center border border-blue-500 rounded-md px-3 py-2 focus:outline-none"
      >
        <span>{selected}</span>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="border border-blue-500 rounded-md mt-1 bg-white shadow">
          {/* From / To */}
          <div className="flex divide-x divide-blue-500">
            <select className="w-1/2 p-2 border-b-1 border-blue-500 focus:outline-none">
              <option>From</option>
              <option>Jan</option>
              <option>Feb</option>
            </select>
            <select className="w-1/2 p-2 border-b-1 border-blue-500 focus:outline-none">
              <option>To</option>
              <option>Mar</option>
              <option>Apr</option>
            </select>
          </div>

          {/* Quick Options */}
          <ul className="mt-1">
            {quickOptions.map((opt) => (
              <li key={opt}>
                <button
                  onClick={() => {
                    setSelected(opt);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-blue-100 ${
                    selected === opt ? "bg-blue-500 text-white" : ""
                  }`}
                >
                  {opt}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
