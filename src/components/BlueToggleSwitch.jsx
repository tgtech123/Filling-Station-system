import usePumpStore from "@/store/pumpStore";
import { useState } from "react";

export default function BlueToggleSwitch({enabled, pumpId}) {

  const { updatePump, getPumps } = usePumpStore() 


  const handleUpdate = async () => {
      console.log("pumpId ==", pumpId)
      
      const response = await updatePump({
        pumpId: pumpId,
        status: enabled ? "Inactive" : "Active",
      })
      console.log("response ==", response)
      await getPumps()

  }
  

  return (
    <div
      onClick={handleUpdate}
      className={`w-12 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
        enabled ? "bg-[#1154d4]" : "bg-gray-300"
      }`}
    >
      <div
        className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </div>
  );
}

// import { useState } from "react";

// export default function BlueToggleSwitch() {
//   const [enabled, setEnabled] = useState(false); // local state

//   return (
//     <div
//       onClick={() => setEnabled(!enabled)}
//       className={`w-12 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
//         enabled ? "bg-[#1154d4]" : "bg-gray-300"
//       }`}
//     >
//       <div
//         className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
//           enabled ? "translate-x-5" : "translate-x-0"
//         }`}
//       />
//     </div>
//   );
// }
