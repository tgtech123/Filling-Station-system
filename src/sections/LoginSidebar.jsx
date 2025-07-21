// import React, { useState } from "react";
// import { BiHomeAlt } from "react-icons/bi";
// import { HiOutlineChartBar } from "react-icons/hi";
// import { BsChevronUp } from "react-icons/bs";
// import { HiOutlineChevronDown } from "react-icons/hi2";
// import { CgTrending } from "react-icons/cg";
// import { IoHelpCircleOutline } from "react-icons/io5";
// import { CiDark } from "react-icons/ci";
// import { BsToggleOn, BsToggleOff } from "react-icons/bs";
// import { MdOutlineLogout } from "react-icons/md";

// const LoginSidebar = () => {
//   const [isToggle, setIsToggle] = useState(false);

//   const handleToggle = () => {
//     setIsToggle(!isToggle);
//   };

//   return (
//     <div className="w-full max-w-[180px] h-auto sm:h-full bg-white rounded-md p-3">
//       <img src="/station-logo.png" alt="#" className="h-10 w-auto mb-6" />

//       <div className="leading-5 flex flex-col gap-y-4">
//         <h1 className="text-[16px] text-gray-400">GENERAL</h1>

//         <p className="bg-[#FF9D29] flex gap-2 items-center p-1 rounded-md w-full">
//           <BiHomeAlt className="text-white" size={20} />
//           <span className="text-white text-[14px] font-medium">Dashboard</span>
//         </p>

//         <div className="flex items-center">
//           <HiOutlineChartBar className="text-gray-400 mr-3" size={22} />
//           <p className="flex items-center justify-between gap-8 text-[16px] text-gray-400 w-full">
//             Reports
//             <BsChevronUp />
//           </p>
//         </div>

//         <div className="flex items-center">
//           <BiHomeAlt className="text-gray-400 mr-3" size={22} />
//           <p className="flex items-center justify-between gap-4 text-[16px] text-gray-400 w-full">
//             Commisions
//             <HiOutlineChevronDown size={20} />
//           </p>
//         </div>

//         <p className="flex items-center gap-4 text-gray-400">
//           <CgTrending size={22} />
//           Trends
//         </p>

//         <div className="flex flex-col gap-2 mt-4">
//           <h1 className="text-[14px] font-medium text-gray-400">TOOLS</h1>
//           <p className="flex gap-2 items-center text-gray-400">
//             <IoHelpCircleOutline size={22} />
//             Help
//           </p>

//           <p className="flex gap-2 items-center text-gray-400">
//             <CiDark size={22} />
//             Dark Mode
//             <span className="ml-auto">
//               {isToggle ? (
//                 <BsToggleOn
//                   onClick={handleToggle}
//                   size={22}
//                   className="cursor-pointer"
//                 />
//               ) : (
//                 <BsToggleOff
//                   size={22}
//                   onClick={handleToggle}
//                   className="cursor-pointer"
//                 />
//               )}
//             </span>
//           </p>
//         </div>

//         <div className="flex items-center justify-between border-[1.5px] border-gray-400 h-auto py-2 px-2 rounded mt-10 gap-2">
//           <img
//             src="/sammi.jpeg"
//             alt="user profile"
//             className="h-10 w-12 rounded-md object-cover"
//           />
//           <div className="flex-1 text-[12px] leading-4 text-gray-400">
//             <h1 className="font-semibold text-black">Dave Johnson</h1>
//             Attendant
//           </div>
//           <MdOutlineLogout size={22} className="text-red-500 cursor-pointer" />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginSidebar;
