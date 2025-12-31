// import React from "react";
// import { activityData } from "./activityCardData";
// import FlashCard from "@/components/Dashboard/FlashCard";

// const ActivityLogs = () => {
//   return (
//     <div className="bg-white mx-8  rounded-2xl p-5">
//       <div className=" mb-[1.5rem] ">
//         <h1 className="text-xl text-neutral-800 font-semibold mb-[0.75rem]">
//           Activity Logs
//         </h1>
//         <p className="text-md text-neutral-800 ">
//           Monitor and track activities ongoing in your company
//         </p>
//       </div>
 
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:overflow-hidden overflow-auto ">
//         {activityData.map((item, index) => (
//           <FlashCard
//             key={index}
//             name={item.name}
//             period={item.period}
//             number={item.number}
//             icon={item.icon}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ActivityLogs;


"use client";

import React, { useEffect } from "react";
import FlashCard from "@/components/Dashboard/FlashCard";
import useSupervisorStore from "@/store/useSupervisorStore";
import { TrendingUp } from "lucide-react";
import { MdOutlinePersonOutline } from "react-icons/md";
import { CgDanger } from "react-icons/cg";
import Image from "next/image";

const ActivityLogs = () => {
  const { activityLogs, loading, error, fetchActivityLogs } = useSupervisorStore();

  useEffect(() => {
    fetchActivityLogs({ page: 1, limit: 100 });
  }, [fetchActivityLogs]);

  // Extract summary from API response
  const summary = activityLogs?.summary || {
    totalActivities: 0,
    activeUsers: 0,
    failedAttempts: 0,
    criticalActions: 0,
  };

  const activityData = [
    {
      name: "Total Activities",
      period: "",
      number: summary.totalActivities?.toLocaleString() || "0",
      icon: <TrendingUp size={25} className="text-neutral-800 text-lg" />,
    },
    {
      name: "Active Users",
      period: "",
      number: summary.activeUsers?.toString() || "0",
      icon: <MdOutlinePersonOutline size={25} className="text-lg" />
    },
    {
      name: "Failed Attempts",
      period: "",
      number: summary.failedAttempts?.toString() || "0",
      icon: <CgDanger size={25} />
    },
    {
      name: "Critical Actions",
      number: summary.criticalActions?.toString() || "0",
      icon: (
        <Image
          src="/danger.png"
          alt="danger icon"
          width={24}
          height={24}
          className="max-w-[1.5rem] max-h-[1.5rem]"
        />
      ),
    },
  ];

  if (loading && !activityLogs) {
    return (
      <div className="bg-white mx-8 rounded-2xl p-5">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white mx-8 rounded-2xl p-5">
        <div className="text-red-600">Error loading activity logs: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white mx-8 rounded-2xl p-5">
      <div className="mb-[1.5rem]">
        <h1 className="text-xl text-neutral-800 font-semibold mb-[0.75rem]">
          Activity Logs
        </h1>
        <p className="text-md text-neutral-800">
          Monitor and track activities ongoing in your company
        </p>
      </div>
 
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:overflow-hidden overflow-auto">
        {activityData.map((item, index) => (
          <FlashCard
            key={index}
            name={item.name}
            period={item.period}
            number={item.number}
            icon={item.icon}
          />
        ))}
      </div>
    </div>
  );
};

export default ActivityLogs;