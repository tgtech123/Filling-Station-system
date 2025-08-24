import DisplayCard from "@/components/Dashboard/DisplayCard";
import Table from "./Table";
import {
  AssetDataRows,
  AssetDataColumn,
  FixedAssetDataColumn,
  FixedAssetDataRows,
  CurrentLiabilitiesDataColumn,
  CurrentLiabilitiesDataRows,
  LongLiabilitiesDataColumn,
  LongLiabilitiesDataRows,
  EquityDataColumn,
  EquityDataRows
} from "./financeData";

export default function BalanceSheet() {
  return (
    <DisplayCard>
      <h4 className="text-gray-600 text-xl font-semibold">JUNE 2025</h4>

      <div className="border-1 border-[#e7e7e7] rounded-[10px] p-4">
        <h4 className="font-semibold mb-4 text-gray-600">ASSETS</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <Table
            columns={AssetDataColumn}
            data={AssetDataRows}
            highlightedRowIndices={[3]}
          />
          <Table
            columns={FixedAssetDataColumn}
            data={FixedAssetDataRows}
            highlightedRowIndices={[3]}
          />
        </div>
      </div>

      <div className="border-1 border-[#e7e7e7] rounded-[10px] p-4">
        <h4 className="font-semibold mb-4 text-gray-600">LIABILITY & EQUITY</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <Table
            columns={CurrentLiabilitiesDataColumn}
            data={CurrentLiabilitiesDataRows}
            highlightedRowIndices={[3]}
          />
          <Table
            columns={LongLiabilitiesDataColumn}
            data={LongLiabilitiesDataRows}
            highlightedRowIndices={[3]}
          />
        </div>
          <div className="mt-2 py-3 grid grid-cols-2 px-3 bg-gray-100 w-full">
            <p className="text-gray-600 font-semibold text-sm">TOTAL LIABILITIES</p>
            <p className="text-gray-600 font-semibold text-sm">₦120,000,000</p>
          </div>

          <Table data={EquityDataRows} columns={EquityDataColumn} />
          <div className="mt-2 py-3 grid grid-cols-2 px-3 bg-gray-100 w-full">
            <p className="text-gray-600 font-semibold text-sm">TOTAL LIABILITIES & EQUITY</p>
            <p className="text-gray-600 font-semibold text-sm">₦120,000,000</p>
          </div>

      </div>
    </DisplayCard>
  );
}
