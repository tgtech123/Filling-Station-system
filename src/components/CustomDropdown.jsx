import { GoChevronDown, GoChevronUp } from "react-icons/go";
import { useState } from "react";

export default function CustomDropdown({ label, options, selected, onSelect }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative pb-2">
      {label && (
        <label className=" font-semibold block text-sm text-gray-700 mb-1">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full border-2 border-neutral-400 rounded-md px-3 py-2 text-sm text-gray-700 flex justify-between items-center focus:outline-none focus:border-2 focus:border-blue-600"
      >
        {selected?.value ?? "Select..."}
        {open ? <GoChevronUp size={24}/> : <GoChevronDown size={24} />}
      </button>
      {open && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-blue-600 rounded-md shadow-md max-h-60 overflow-auto">
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => {
                onSelect(option);
                setOpen(false);
              }}
              className="px-3 py-2 text-sm text-gray-700 hover:bg-blue-700 hover:text-white hover:rounded-sm hover:mx-1 cursor-pointer"
            >
              {option.value}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
