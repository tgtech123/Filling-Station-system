import Table from "@/components/Table";
import { columns, data } from "./staffReport";


export default function StaffTable() {
    return (
        <div className="bg-white p-4 rounded-[20px] w-full">
            <h2 className="text-gray-600 text-2xl font-semibold">Staff Tracking</h2>
            <p className="my-4 font-semibold text-lg text-gray-500">Monthly staff commission tracking</p>

                <Table 
                    columns={columns}
                    data={data}
                />
    
        </div>
    )
}