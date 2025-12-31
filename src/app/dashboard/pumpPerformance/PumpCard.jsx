


// import { Check, Moon, Wrench, X } from "lucide-react";

// export default function PumpCard({ name, product, status, price, litresSold, totalDaySales }) {
//   // Format numbers for display
//   const formattedPrice = Number(price || 0).toLocaleString();
//   const formattedLitres = Number(litresSold || 0).toLocaleString();
//   const formattedSales = Number(totalDaySales || 0).toLocaleString();

//   // Status button styling
//   const getStatusStyle = () => {
//     const styles = {
//       Active: "bg-[#b2ffb4] text-[#04910c]",
//       Inactive: "bg-[#d1d1d1] text-[#b0b0b0]",
//       Idle: "bg-[#dcd2ff] text-[#7f27ff]",
//       Maintenance: "bg-[#fec6aa] text-[#eb2b0b]",
//     };
//     return styles[status] || styles.Inactive;
//   };

//   // Status icon
//   const getStatusIcon = () => {
//     const icons = {
//       Active: <Check size={18} />,
//       Inactive: <X size={18} />,
//       Idle: <Moon size={18} />,
//       Maintenance: <Wrench size={18} />,
//     };
//     return icons[status] || <X size={18} />;
//   };

//   return (
//     <div className="border-2 border-gray-300 rounded-[10px] p-4 hover:shadow-lg transition">
//       <div className="flex justify-between items-center">
//         <div className="flex gap-3 items-center">
//           <div className="h-10 w-10 rounded-full bg-gray-300 flex justify-center items-center">
//             <img src="/pump.png" alt="Pump icon" />
//           </div>
//           <div>
//             <h4 className="text-xl font-semibold mb-1">{name}</h4>
//             <p className="text-gray-600 text-sm">{product}</p>
//           </div>
//         </div>

//         <button className={`rounded-[10px] font-semibold p-2 ${getStatusStyle()}`}>
//           <span className="flex items-center gap-1 text-sm">
//             {status}
//             {getStatusIcon()}
//           </span>
//         </button>
//       </div>

//       <div className="my-6 h-[1px] w-[80%] bg-gray-300"></div>

//       <div className="flex flex-col gap-3">
//         <div className="flex justify-between">
//           <div className="flex items-center gap-2 font-medium text-gray-700">
//             <img src="/priceIcon.png" alt="" />
//             Price/Litre
//           </div>
//           <p className="font-semibold">₦{formattedPrice}</p>
//         </div>

//         <div className="flex justify-between">
//           <div className="flex items-center gap-2 font-medium text-gray-700">
//             <img src="/pumpNozzle.png" alt="" />
//             Litres Sold Today
//           </div>
//           <p className="font-semibold">{formattedLitres}L</p>
//         </div>

//         <div className="flex justify-between">
//           <div className="flex items-center gap-2 font-medium text-gray-700">
//             {Number(totalDaySales) > 0 ? (
//               <img src="/trend.png" alt="" />
//             ) : (
//               <img src="/empty.png" alt="" />
//             )}
//             Sales Today
//           </div>
//           <p className="font-semibold text-green-600">₦{formattedSales}</p>
//         </div>
//       </div>
//     </div>
//   );
// }


import { Check, Moon, Wrench, X } from "lucide-react";

export default function PumpCard({ name, product, status, price, litresSold, totalDaySales }) {
  // Format numbers for display
  const formattedPrice = Number(price || 0).toLocaleString();
  const formattedLitres = Number(litresSold || 0).toLocaleString();
  const formattedSales = Number(totalDaySales || 0).toLocaleString();

  // Status button styling
  const getStatusStyle = () => {
    const styles = {
      Active: "bg-[#b2ffb4] text-[#04910c]",
      Inactive: "bg-[#d1d1d1] text-[#b0b0b0]",
      Idle: "bg-[#dcd2ff] text-[#7f27ff]",
      Maintenance: "bg-[#fec6aa] text-[#eb2b0b]",
    };
    return styles[status] || styles.Inactive;
  };

  // Status icon
  const getStatusIcon = () => {
    const icons = {
      Active: <Check size={18} />,
      Inactive: <X size={18} />,
      Idle: <Moon size={18} />,
      Maintenance: <Wrench size={18} />,
    };
    return icons[status] || <X size={18} />;
  };

  return (
    <div className="border-2 border-gray-300 rounded-[10px] p-4 hover:shadow-lg transition">
      <div className="flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <div className="h-10 w-10 rounded-full bg-gray-300 flex justify-center items-center">
            <img src="/pump.png" alt="Pump icon" />
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-1">{name}</h4>
            <p className="text-gray-600 text-sm">{product}</p>
          </div>
        </div>

        <button className={`rounded-[10px] font-semibold p-2 ${getStatusStyle()}`}>
          <span className="flex items-center gap-1 text-sm">
            {status}
            {getStatusIcon()}
          </span>
        </button>
      </div>

      <div className="my-6 h-[1px] w-[80%] bg-gray-300"></div>

      <div className="flex flex-col gap-3">
        <div className="flex justify-between">
          <div className="flex items-center gap-2 font-medium text-gray-700">
            <img src="/priceIcon.png" alt="" />
            Price/Litre
          </div>
          <p className="font-semibold">₦{formattedPrice}</p>
        </div>

        <div className="flex justify-between">
          <div className="flex items-center gap-2 font-medium text-gray-700">
            <img src="/pumpNozzle.png" alt="" />
            Litres Sold Today
          </div>
          <p className="font-semibold">{formattedLitres}L</p>
        </div>

        <div className="flex justify-between">
          <div className="flex items-center gap-2 font-medium text-gray-700">
            {Number(totalDaySales) > 0 ? (
              <img src="/trend.png" alt="" />
            ) : (
              <img src="/empty.png" alt="" />
            )}
            Sales Today
          </div>
          <p className="font-semibold text-green-600">₦{formattedSales}</p>
        </div>
      </div>
    </div>
  );
}


