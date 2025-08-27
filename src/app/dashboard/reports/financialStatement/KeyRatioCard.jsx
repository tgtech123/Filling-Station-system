// export default function KeyRatioCard({ data = [], columns = [] }) {
//   return (
//     <div>
//       <table>
//         <thead>
//           <tr>
//             {columns.map((col, index) => (
//               <th key={index} className="px-4 py-3 whitespace-nowrap">
//                 {col}
//               </th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           <td>
//             {data.map(())}
//           </td>
//         </tbody>
//       </table>
//     </div>
//   );
// }
// components/KeyRatioCard.jsx
export default function KeyRatioCard({ data = [], columns = [] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 p-4 bg-white">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th
                key={index}
                className="px-4 py-3 text-left text-xl font-semibold text-gray-600"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t">
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-4 py-4 text-gray-700 text-sm leading-relaxed whitespace-nowrap"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
