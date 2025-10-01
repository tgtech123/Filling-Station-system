import CashflowTrend from "./CashflowTrend";
import InflowChart from "./InflowChart";
import OutflowChart from "./OutflowChart";
import TransactionsTable from "./TransactionsTable";

export default function ReportPage() {
  return (
    <div className=" mt-[0.875rem] min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <CashflowTrend />
          <TransactionsTable />
        </div>

        {/* Right Section */}
        <div className="flex flex-col gap-6">
          <InflowChart />
          <OutflowChart />
        </div>
      </div>
    </div>
  );
}
