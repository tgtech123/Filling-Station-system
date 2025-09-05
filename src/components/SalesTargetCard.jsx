"use client";

export default function SalesTargetCard({ 
  title = "Sales target", 
  period = "Monthly",
  current = 120000,
  target = 350000,
  currency = "₦"
}) {
  const progress = (current / target) * 100;
  const progressClamped = Math.min(progress, 100);

  return (
    <div className="bg-transparent rounded-2xl p-4 w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-700 font-medium text-sm">{title}</h3>
        <span className="text-gray-500 font-medium text-sm">{period}</span>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="relative">
          {/* Background track */}
          <div className="w-full h-3 bg-gray-300 rounded-full">
            {/* Progress fill */}
            <div 
              className="h-3 bg-blue-500 rounded-full relative transition-all duration-500"
              style={{ width: `${progressClamped}%` }}
            >
              {/* Progress handle */}
              <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
                <div className="w-5 h-5 bg-gray-400 rounded-full border-2 border-white shadow-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Values */}
      <div className="text-right">
        <span className="text-gray-500 text-sm font-medium">
          {currency}{current.toLocaleString()}/{currency}{target.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
