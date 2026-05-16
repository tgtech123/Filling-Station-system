export default function KeyRatioCard({ data = [], columns = [] }) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-700">{columns[0]}</p>
      </div>
      <div className="divide-y divide-gray-50">
        {data.map((row, rowIndex) => (
          <div key={rowIndex} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
            <span className="text-sm text-gray-600 pr-4">{row[0]}</span>
            <span className="text-sm font-semibold text-gray-800 shrink-0 tabular-nums">{row[1]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
