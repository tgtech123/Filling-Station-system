// import Table from "@/components/Table";
// import { columns, data } from "./staffReport";


// export default function StaffTable() {
//     return (
//         <div className="bg-white p-4 rounded-[20px] w-full">
//             <h2 className="text-gray-600 text-2xl font-semibold">Staff Tracking</h2>
//             <p className="my-4 font-semibold text-lg text-gray-500">Monthly staff commission tracking</p>

//                 <Table 
//                     columns={columns}
//                     data={data}
//                 />
//         </div>
//     )
// }
'use client'
import { useEffect, useState } from "react";
import Table from "@/components/Table";
import useCommissionStore from "@/store/useCommissionStore";

export default function StaffTable() {
    const [tableData, setTableData] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);

    const { 
        staffTracking, 
        loading, 
        errors, 
        fetchStaffTracking 
    } = useCommissionStore();

    const columns = ['Staff name', 'Role', 'Sales', 'Commission%', 'Commission amount', 'Bonus', 'Total earnings'];

    useEffect(() => {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        
        setSelectedMonth(currentMonth);
        setSelectedYear(currentYear);
        
        fetchStaffTracking(currentMonth, currentYear);
    }, [fetchStaffTracking]);

    useEffect(() => {
        if (staffTracking && staffTracking.length > 0) {
            const transformedData = staffTracking.map(payment => {
                const staffName = payment.staff?.name || payment.staffName || 'N/A';
                const role = payment.staff?.role || payment.role || 'N/A';
                const totalSales = payment.totalSales || 0;
                const commissionRate = payment.commissionRate || 0;
                const commissionAmount = payment.totalCommission || 0;
                const bonus = payment.bonusAmount || 0;
                const totalEarnings = commissionAmount + bonus;

                return [
                    staffName,
                    role,
                    `₦${totalSales.toLocaleString('en-US')}`,
                    `${commissionRate}%`,
                    `₦${commissionAmount.toLocaleString('en-US')}`,
                    `₦${bonus.toLocaleString('en-US')}`,
                    `₦${totalEarnings.toLocaleString('en-US')}`
                ];
            });

            setTableData(transformedData);
        } else {
            setTableData([]);
        }
    }, [staffTracking]);

    const handleMonthChange = async (e) => {
        const month = parseInt(e.target.value);
        setSelectedMonth(month);
        await fetchStaffTracking(month, selectedYear);
    };

    const handleYearChange = async (e) => {
        const year = parseInt(e.target.value);
        setSelectedYear(year);
        await fetchStaffTracking(selectedMonth, year);
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    const months = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' }
    ];

    return (
        <div className="bg-white p-4 rounded-[20px] w-full">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-gray-600 text-2xl font-semibold">Staff Tracking</h2>
                    <p className="my-4 font-semibold text-lg text-gray-500">Monthly staff commission tracking</p>
                </div>

                <div className="flex gap-3">
                    <select
                        value={selectedMonth || ''}
                        onChange={handleMonthChange}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {months.map(month => (
                            <option key={month.value} value={month.value}>
                                {month.label}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedYear || ''}
                        onChange={handleYearChange}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {years.map(year => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading.staffTracking ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Loading staff tracking data...</div>
                </div>
            ) : errors.staffTracking ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">Error: {errors.staffTracking}</p>
                    <button
                        onClick={() => fetchStaffTracking(selectedMonth, selectedYear)}
                        className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            ) : tableData.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">No staff tracking data available for this period</div>
                </div>
            ) : (
                <Table 
                    columns={columns}
                    data={tableData}
                />
            )}
        </div>
    );
}