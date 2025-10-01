import MyStatCard from "@/components/MyStatCard";
import { cashFlowCardData } from "./cashFlowCardData";
import ReportPage from "../cashflow-charts/ReportPage";

export default function CashFlow() {
  return (
    <div>
      <div className="grid lg:grid-cols-3 grid-cols-2 gap-4">
        {cashFlowCardData.map((item, index) => (
          <MyStatCard
            key={index}
            title={item.title}
            date={item.date}
            amount={item.amount}
            change={item.change}
            changeText={item.changeText}
            trend={item.trend}
            icon={item.icon}
          />
        ))}
      </div>

        <ReportPage/>
    </div>
  );
}
