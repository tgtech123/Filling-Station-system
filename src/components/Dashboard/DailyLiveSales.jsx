import Table from "../Table";
import DisplayCard from "./DisplayCard";
import { columns, data } from "../../app/dashboard/shifts/shiftData";

export default function DailyLiveSales() {
  return (
    <DisplayCard>
      <div className="m-0 p-0 pt-6 max-h-[400px] overflow-y-auto scrollbar-hide">
        <h4 className="mb-2 font-semibold text-gray-500">Daily Live Sales</h4>
        <Table columns={columns} data={data} />
      </div>
    </DisplayCard>
  );
}
