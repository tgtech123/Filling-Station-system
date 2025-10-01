export default function TransactionsTable() {
  const transactions = [
    { date: "04/17/23", service: "Fuel sales", amount: "₦120,000", type: "inflow" },
    { date: "04/17/23", service: "Lubricant sales", amount: "₦120,000", type: "inflow" },
    { date: "04/17/23", service: "Staff payment", amount: "₦120,000", type: "outflow" },
    { date: "04/17/23", service: "Repair & maintenance", amount: "₦120,000", type: "outflow" },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
      <table className="w-full text-left">
        <thead>
          <tr className="text-gray-500 text-sm border-b">
            <th className="py-2">Date</th>
            <th>Service</th>
            <th>Amount</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t, i) => (
            <tr key={i} className="border-b text-sm">
              <td className="py-2">{t.date}</td>
              <td>{t.service}</td>
              <td>{t.amount}</td>
              <td>
                {t.type === "inflow" ? (
                  <span className="px-2 py-1 rounded-md bg-green-100 text-green-600 text-xs">Inflow ↓</span>
                ) : (
                  <span className="px-2 py-1 rounded-md bg-red-100 text-red-600 text-xs">Outflow ↑</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
