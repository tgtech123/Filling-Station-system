import { Progress } from "@/components/Dashboard/Progress";
import { CircleFadingArrowUp, Star, TrendingUp, TriangleAlert } from "lucide-react";
import { TbTargetArrow } from "react-icons/tb";

export default function StaffPerformanceCard({
  imgName,
  name,
  role,
  completedShifts,
  targetTrend,
  shiftType,
  ltrsSold,
  discrepancy,
  totalSales,
  customerRating,
  errorCount,
  efficiencyScore
}) {
  return (
    <div className="border-2 border-[#e7e7e7] rounded-[20px] p-4">
      <div className="1 flex flex-col lg:flex-row justify-between items-center">
        <div className="flex flex-col lg:flex-row gap-2 items-center lg:items-start">
          <img src={imgName} alt="" />
          <div>
            <h4 className="font-medium text-lg text-center lg:text-left">
              {name}
            </h4>
            <p className="text-[16px] text-gray-500 text-center lg:text-left">
              {role}
            </p>

            <div className="mt-3">
              <h5 className="text-sm text-gray-500 text-center lg:text-left">
                Completed shifts
              </h5>
              <p className="font-semibold text-center lg:text-left">
                {completedShifts}
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="mt-3 lg:mt-0 text-xs font-medium">Sales target</p>
          {/* <Progress */}
          <div className="my-2 min-w-[200px] lg:min-w-[150px] w-full h-4 bg-gray-200 rounded-full relative overflow-hidden">
            <div
              className={`h-4 bg-blue-500 w-[80%] rounded-full transition-all duration-500`}
              style={{ width: `70%` }}
            ></div>
          </div>
          <p className="text-sm flex gap-1 text-green-500">
            <TrendingUp />
            {targetTrend}
          </p>
          <p className="text-xs text-gray-600">From last quarter</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border-t-1 pt-4 border-[#e7e7e7]">
          <h4 className="font-medium mt-4 lg:mt-0">
            Quarter sales performance
          </h4>
          <div className="mt-3 text-sm flex justify-between">
            <div className="flex gap-1">
              <CircleFadingArrowUp />
              <p>Shift Type</p>
            </div>
            <p>{shiftType}</p>
          </div>
          <div className="mt-3 text-sm flex justify-between">
            <div className="flex gap-1">
              <img src="/pumpNozzle.png" alt="" />
              <p>Litres Sold</p>
            </div>
            <p>{ltrsSold} Ltrs</p>
          </div>
          <div className="mt-3 text-sm flex justify-between">
            <div className="flex gap-1">
              <TrendingUp />
              <p>Total Sales</p>
            </div>
            <p>{totalSales}</p>
          </div>
          <div className="mt-3 text-sm flex justify-between">
            <div className="flex gap-1">
              <TriangleAlert />
              <p>Discrepancy</p>
            </div>
            <p>{discrepancy}</p>
          </div>
        </div>

        {/* Performance rating */}
        <div className="pt-4">
          <h4 className="font-medium mt-4 lg:mt-0">
            Performance Rating
          </h4>
          <div className="mt-3 text-sm flex justify-between">
            <div className="flex gap-1">
              <Star />
              <p>Customer rating</p>
            </div>
            <p>{customerRating}</p>
          </div>

          <div className="mt-3 text-sm flex justify-between">
            <div className="flex gap-1">
              <TriangleAlert />
              <p>Error count</p>
            </div>
            <p>{errorCount}</p>
          </div>

          <div className="mt-3 text-sm flex justify-between">
            <div className="flex gap-1">
              <TbTargetArrow size={24}/>
              <p>Efficiency score</p>
            </div>
            <p>{efficiencyScore}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
