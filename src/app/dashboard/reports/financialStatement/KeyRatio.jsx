import DisplayCard from "@/components/Dashboard/DisplayCard";
import KeyRatioCard from "./KeyRatioCard";
import { 
  efficiencyDataColumn,
  efficiencyDataRows,
  leverageDataColumn,
  leverageDataRows,
  liquidityDataColumn,
  liquidityDataRows,
  profitabilityDataColumn,
  profitabilityDataRows,


} from "./financeData";

export default function KeyRatio() {
  return (
    <DisplayCard>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* <div> */}
          <KeyRatioCard
            columns={profitabilityDataColumn}
            data={profitabilityDataRows}
          />
          <KeyRatioCard
            columns={liquidityDataColumn}
            data={liquidityDataRows}
          />
          <KeyRatioCard
            columns={efficiencyDataColumn}
            data={efficiencyDataRows}
          />
          <KeyRatioCard
            columns={leverageDataColumn}
            data={leverageDataRows}
          />
        </div>
        <div>
          <h3 className="my-2 text-lg font-semibold">Report Summary</h3>
          <textarea className="w-full border-2 border-gray-200 p-2 h-auto rounded-[12px] min-h-[120px]">
            </textarea>
        </div>
      {/* </div> */}
    </DisplayCard>
  );
}
