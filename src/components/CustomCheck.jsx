import { Check } from "lucide-react";

export default function CustomCheck() {
    return (
<label className="flex items-center cursor-pointer space-x-3">
  <input
    type="checkbox"
    checked={shiftType.all}
    onChange={() => handleShiftTypeChange("all")}
    className="hidden peer"
  />
  <div className="w-5 h-5 rounded border border-gray-300 bg-white flex items-center justify-center">
    {/* Show checkmark only if checked */}
    <Check className="w-4 h-4 text-green-600 opacity-0 peer-checked:opacity-100" />
  </div>
  <span className="text-sm text-gray-700">All</span>
</label>

    )
}
