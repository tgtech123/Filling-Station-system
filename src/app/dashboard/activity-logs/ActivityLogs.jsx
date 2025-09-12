import React from "react";
import { activityData } from "./activityCardData";
import FlashCard from "@/components/Dashboard/FlashCard";

const ActivityLogs = () => {
  return (
    <div className="bg-white mx-8  rounded-2xl p-5">
      <div className=" mb-[1.5rem] ">
        <h1 className="text-xl text-neutral-800 font-semibold mb-[0.75rem]">
          Activity Logs
        </h1>
        <p className="text-md text-neutral-800 ">
          Monitor and track activities ongoing in your company
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:overflow-hidden overflow-auto ">
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
