import DisplayCard from "@/components/Dashboard/DisplayCard";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { reportType } from "./exportReportData";
import ExportReportCard from "./ExportReportCard";
import CustomReportBuilder from "./CustomReportBuilder";

export default function ExportReport() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="px-4 lg:px-[40px] mb-10 bg-white shadow-sm h-[150px] lg:h-[90px] flex flex-col lg:flex-row gap-4 lg:gap-0 items-center justify-center lg:justify-between">
        <div className=" mt-2 lg:mt-0 flex flex-col lg:flex-row gap-0 lg:gap-4 items-center">
          <Link
            href="/dashboard"
            className="cursor-pointer border-3 flex  gap-2 border-none lg:border-[#0080ff]  py-2 px-6 rounded-[12px] text-[#0080ff] font-semibold"
          >
            <ArrowLeft />
            Back to Dashboard
          </Link>
          <h4 className="text-2xl font-semibold">Export Reports</h4>
        </div>
        
      </header>


        <div className="px-6 lg:px-[40px]">
            <DisplayCard>
                <h4 className="text-2xl font-semibold text-gray-700">Export Reports</h4>
                <p>
                    Generate and export comprehensive station reports 
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {reportType.map((item) => (
                        <ExportReportCard 
                            key={item.id}
                            title={item.title}
                            desc={item.desc}
                        />
                    ))}
                </div>
            </DisplayCard>
        </div>

        <div className="mt-10 px-6 lg:px-[40px] pb-20">
            <CustomReportBuilder />
        </div>
    </div>
  );
}
