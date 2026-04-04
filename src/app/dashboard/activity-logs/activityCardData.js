// activityCardData.js
// Only defines the static parts (label, icon) for each card.
// The live numbers come from activityLogs.summary in the Zustand store.

import { TrendingUp } from "lucide-react";
import { MdOutlinePersonOutline } from "react-icons/md";
import { CgDanger } from "react-icons/cg";
import Image from "next/image";

// Keys map 1-to-1 with the API summary fields:
// totalActivities | activeUsers | failedAttempts | criticalActions
export const activityCardConfig = [
  {
    summaryKey: "totalActivities",
    name:       "Total Activities",
    icon:       <TrendingUp size={25} className="text-neutral-800" />,
  },
  {
    summaryKey: "activeUsers",
    name:       "Active Users",
    icon:       <MdOutlinePersonOutline size={25} />,
  },
  {
    summaryKey: "failedAttempts",
    name:       "Failed Attempts",
    icon:       <CgDanger size={25} />,
  },
  {
    summaryKey: "criticalActions",
    name:       "Critical Actions",
    icon:       (
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