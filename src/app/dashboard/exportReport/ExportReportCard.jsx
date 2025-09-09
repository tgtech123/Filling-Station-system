import { CupSoda, Download } from "lucide-react";

export default function ExportReportCard({title, desc}) {
    return (
        <div className="border-2 border-gray-300 p-4 rounded-[10px]">
            <section className="mb-10 flex gap-3 justify-start">
                <div className="h-10 w-10 rounded-full flex justify-center items-center bg-[#0080ff] text-white">
                    <CupSoda />
                </div>
                <div>
                    <h5 className="text-lg font-semibold mb-2">{title}</h5>
                    <p className="text-sm text-gray-600">
                        {desc}
                    </p>
                </div>
            </section>

            <button className="flex justify-center font-semibold cursor-pointer items-center gap-2 w-full py-2 text-sm bg-[#0080ff] text-white rounded-[8px]">
                Export Report
                <Download />
            </button>
        </div>
    )
}