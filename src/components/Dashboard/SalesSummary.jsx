import DisplayCard from "./DisplayCard";
import { CircleFadingArrowUp, CircleGauge, TrendingUp } from "lucide-react";
import FlashCard from "./FlashCard";
import { TbTargetArrow } from "react-icons/tb";
import { Progress } from "./Progress";

export default function SalesSummary() {
  const data = [
    {
      id: 1,
      name: "Total Sales",
      icon: "₦",
      period: "This week",
      variable: "₦81,000",
      trend: 1.5,
    },
    {
      id: 2,
      name: "Litres Sold",
      icon: <CircleGauge />,
      period: "This week",
      variable: "4,534Ltrs",
      trend: 1.5,
    },
    {
      id: 3,
      name: "Total Transaction",
      icon: <TrendingUp />,
      period: "This week",
      variable: "158",
      trend: 1.5,
    },
    {
      id: 4,
      name: "Shifts Completed",
      icon: <CircleFadingArrowUp />,
      period: "For this quarter",
      variable: "23/50",
      trend: 1.5,
    },
    {
      id: 5,
      name: "Sales Target",
      icon: <TbTargetArrow />,
      period: <Progress />,
    },
  ];

  return (
    <DisplayCard>
      <h2 className="text-xl mb-2 font-semibold">Dashboard</h2>
      <h4 className="text-sm font-semibold mb-6">Shift and sales summary</h4>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-2">
        {data.slice(0, 3).map((item) => (
          <FlashCard key={item.id} {...item} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
        {data.slice(3).map((item) => (
          <FlashCard key={item.id} {...item} />
        ))}
      </div>
    </DisplayCard>
  );
}
