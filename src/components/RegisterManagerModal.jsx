// "use client";

// import {
//   ArrowLeft,
//   ArrowRight,
//   Check,
//   Mail,
//   MapPin,
//   Phone,
//   TriangleAlert,
//   X,
// } from "lucide-react";
// import { useState } from "react";
// import ToggleSwitch from "./ToggleSwtich";
// import Link from "next/link";

// export default function RegisterManagerModal({ onclose }) {
//   const [step, setStep] = useState(1);

//   const handleNextStep = () => {
//     setStep((prev) => prev + 1);
//   };
//   const handlePreviousStep = () => {
//     setStep((prev) => prev - 1);
//   };

//   const featuresData = [
//     {
//       id: 1,
//       title: "Real-Time Analytics",
//       description: "Monitor sales, inventory, and performance",
//       imageUrl: "/analytics.png" 
//     },
//     {
//       id: 2,
//       title: "Pump Control",
//       description: "Remote pump management and diagnostics",
//       imageUrl: "/pump.png" 
//     },
//     {
//       id: 3,
//       title: "Staff Management",
//       description: "Schedule shifts and track performance",
//       imageUrl: "/staff.png" 
//     },
//     {
//       id: 4,
//       title: "Inventory Control",
//       description: "Smart Inventory management system",
//       imageUrl: "/trend.png" 
//     },
//     {
//       id: 5,
//       title: "Fuel Monitoring",
//       description: "Track levels and automate reorders",
//       imageUrl: "/fuel.png" 
//     },
//     {
//       id: 6,
//       title: "Financial Tracking",
//       description: "Revenue, expenses, and profit analysis",
//       imageUrl: "/naira.png" 
//     },
//   ]
//   return (
//     <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
//       {step === 1 && (
//         // <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full mx-auto min-h-[400px] overflow-y-scroll">
//         <div
//           className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full mx-auto 
//                 max-h-[80vh] overflow-y-auto scrollbar-hide"
//         >
//           <div className="flex items-start justify-between">
//             <div>
//               <h2 className="text-2xl font-semibold text-gray-800">
//                 Welcome! Let's get started in creating your account
//               </h2>
//               <h4>Complete the form below to setup your station</h4>
//             </div>

//             <button
//               onClick={onclose}
//               className="text-gray-600 hover:text-gray-700 text-2xl font-bold"
//             >
//               <X />
//             </button>
//           </div>

//           <div className="p-2 mt-6 bg-gray-100 flex  font-semibold text-gray-600 justify-between items-center">
//             <h5>STEP 1 OF 4</h5>
//             <h5>PERSONAL INFORMATION</h5>
//           </div>

//           <div className="mt-4">
//             <h5 className="font-semibold text-gray-600">Let's know you</h5>
//             <p className="text-sm text-gray-600">
//               Tell us about yourself to personalize your account
//             </p>
//           </div>

//           <form className="mt-6 grid w-full grid-cols-1 lg:grid-cols-2 gap-2">
//             {/* <div className="w-full flex gap-4 flex-col lg:flex-row"> */}
//             <div className="">
//               <p className="text-sm font-semibold">First name</p>
//               <input
//                 type="text"
//                 placeholder="Dave"
//                 className="border-2 border-gray-300 p-2 rounded-[8px] w-full"
//               />
//             </div>
//             <div className="">
//               <p className="text-sm font-semibold">Last name</p>
//               <input
//                 type="text"
//                 placeholder="Johnson"
//                 className="border-2 border-gray-300 p-2 rounded-[8px] w-full "
//               />
//             </div>
//             <div className="relative">
//               <p className="text-sm font-semibold">Email Address</p>
//               <input
//                 type="email"
//                 placeholder="davejohnson234@gmail.com"
//                 className="border-2 pl-10 border-gray-300 p-2 rounded-[8px] w-full "
//               />
//               <Mail className="text-gray-400 absolute top-7 left-2" />
//             </div>

//             <div className="relative">
//               <p className="text-sm font-semibold">Phone Number</p>
//               <input
//                 type="text"
//                 placeholder="08134249483"
//                 className="border-2 border-gray-300 p-2 pl-10 rounded-[8px] w-full "
//               />
//               <Phone className="text-gray-400 absolute top-7 left-2" />
//             </div>
//             <div className="relative lg:col-span-2">
//               <p className="text-sm font-semibold">Address</p>
//               <input
//                 type="text"
//                 placeholder="your house address..."
//                 className="border-2 border-gray-300 p-2 pl-10 rounded-[8px] w-full "
//               />
//               <MapPin className="text-gray-400 absolute top-7 left-2" />
//             </div>
//             <div className="">
//               <p className="text-sm font-semibold">City</p>
//               <input
//                 type="text"
//                 placeholder="your city..."
//                 className="border-2 border-[#c0bebe] p-2 bg-[#e4e3e3] rounded-[8px] w-full "
//               />
        
//             </div>
//             <div className="">
//               <p className="text-sm font-semibold">State</p>
//               <input
//                 type="text"
//                 placeholder="your state..."
//                 className="border-2 border-[#c0bebe] p-2 bg-[#e4e3e3] rounded-[8px] w-full "
//               />
//             </div>
//             <div className="">
//               <p className="text-sm font-semibold">Zip Code</p>
//               <input
//                 type="text"
//                 placeholder="45869"
//                 className="border-2 border-gray-300 p-2 rounded-[8px] w-full "
//               />
//             </div>
//             <div className="relative">
//               <p className="text-sm font-semibold">Emergency Contact</p>
//               <input
//                 type="text"
//                 placeholder="08134249483"
//                 className="border-2 border-gray-gray-300 pl-10 p-2  rounded-[8px] w-full "
//               />
//               <Phone className="text-gray-400 absolute top-7 left-2" />
//             </div>
//             {/* </div> */}
//           </form>
//           <div className="mt-6 text-xs bg-[#dcd2ff] w-fit text-[#7f27ff] font-semibold flex items-center gap-2 p-2">
//             <TriangleAlert size={17} />
//             No part of your information shall be disclosed to a third party!
//           </div>
//           <div className="flex justify-end gap-3 p-6">
//             <button
//               onClick={handleNextStep}
//               className="cursor-pointer px-4 py-2 flex items-center gap-2 text-white rounded-md bg-[#0080ff] transition-colors"
//             >
//               Save & Continue
//               <ArrowRight />
//             </button>
//           </div>
//         </div>
//       )}

//       {step === 2 && (
//         // <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full mx-auto min-h-[400px] overflow-y-scroll">
//         <div
//           className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full mx-auto 
//                 max-h-[80vh] overflow-y-auto scrollbar-hide"
//         >
//           <div className="flex items-start justify-between">
//             <div>
//               <h2 className="text-2xl font-semibold text-gray-800">
//                 Welcome! Let's get started in creating your account
//               </h2>
//               <h4>Complete the form below to setup your station</h4>
//             </div>

//             <button
//               onClick={onclose}
//               className="text-gray-600 hover:text-gray-700 text-2xl font-bold"
//             >
//               <X />
//             </button>
//           </div>

//           <div className="p-2 mt-6 bg-gray-100 flex  font-semibold text-gray-600 justify-between items-center">
//             <h5>STEP 2 OF 4</h5>
//             <h5>STATION INFORMATION</h5>
//           </div>

//           <div className="mt-4">
//             <h5 className="font-semibold text-gray-600">
//               Tell us about your filling station
//             </h5>
//             <p className="text-sm text-gray-600">
//               Help us configure the system for your specific location
//             </p>
//           </div>

//           <form className="mt-6 grid w-full grid-cols-1 lg:grid-cols-2 gap-2">
//             {/* <div className="w-full flex gap-4 flex-col lg:flex-row"> */}
//             <div className="">
//               <p className="text-sm font-semibold">Station name</p>
//               <input
//                 type="text"
//                 placeholder="Station 2"
//                 className="border-2 border-gray-300 p-2 rounded-[8px] w-full"
//               />
//             </div>
//             <div className="">
//               <p className="text-sm font-semibold">Station ID</p>
//               <input
//                 type="text"
//                 placeholder="0046"
//                 className="border-2 border-gray-300 p-2 rounded-[8px] w-full "
//               />
//             </div>
//             <div className="relative">
//               <p className="text-sm font-semibold">Station Email Address</p>
//               <input
//                 type="email"
//                 placeholder="station2@gmail.com"
//                 className="border-2 pl-10 border-gray-300 p-2 rounded-[8px] w-full "
//               />
//               <Mail className="text-gray-400 absolute top-7 left-2" />
//             </div>

//             <div className="relative">
//               <p className="text-sm font-semibold">Station Phone Number</p>
//               <input
//                 type="text"
//                 placeholder="08134249483"
//                 className="border-2 border-gray-300 p-2 pl-10 rounded-[8px] w-full "
//               />
//               <Phone className="text-gray-400 absolute top-7 left-2" />
//             </div>
//             <div className="relative lg:col-span-2">
//               <p className="text-sm font-semibold">Station Address</p>
//               <input
//                 type="text"
//                 placeholder="your station address..."
//                 className="border-2 border-gray-300 p-2 pl-10 rounded-[8px] w-full "
//               />
//               <MapPin className="text-gray-400 absolute top-7 left-2" />
//             </div>
//             <div className="">
//               <p className="text-sm font-semibold">Station City</p>
//               <input
//                 type="text"
//                 placeholder="your station city..."
//                 className="border-2 border-[#c0bebe] p-2 bg-[#e4e3e3] rounded-[8px] w-full "
//               />
//             </div>
//             <div className="">
//               <p className="text-sm font-semibold">Station Country</p>
//               <input
//                 type="text"
//                 placeholder="your station country..."
//                 className="border-2 border-[#c0bebe] p-2 bg-[#e4e3e3] rounded-[8px] w-full "
//               />
//             </div>
//             <div className="">
//               <p className="text-sm font-semibold">Zip Code</p>
//               <input
//                 type="text"
//                 placeholder="45869"
//                 className="border-2 border-gray-300 p-2 rounded-[8px] w-full "
//               />
//             </div>
//             <div className="relative">
//               <p className="text-sm font-semibold">License Number</p>
//               <input
//                 type="text"
//                 placeholder="058"
//                 className="border-2 border-gray-gray-300 p-2  rounded-[8px] w-full "
//               />
//             </div>
//             <div className="relative">
//               <p className="text-sm font-semibold">Tax ID</p>
//               <input
//                 type="text"
//                 placeholder="47058"
//                 className="border-2 border-gray-gray-300 p-2  rounded-[8px] w-full "
//               />
//             </div>
//             <div className="relative">
//               <p className="text-sm font-semibold">Established Date</p>
//               <input
//                 type="text"
//                 placeholder="09034547058"
//                 className="border-2 border-gray-gray-300 p-2  rounded-[8px] w-full "
//               />
//             </div>
//             {/* </div> */}
//           </form>

//           <div className="flex text-sm lg:text-md justify-center lg:justify-between gap-3 p-0 mt-8 lg:mt-0 lg:p-6">
//             <button
//               onClick={handlePreviousStep}
//               className="cursor-pointer py-2 px-4 rounded-md flex items-center gap-2 border-1 border-[#0080ff]"
//             >
//               <ArrowLeft />
//               Previous
//             </button>
//             <button
//               onClick={handleNextStep}
//               className="cursor-pointer px-4 py-2 flex items-center gap-2 text-white rounded-md bg-[#0080ff] transition-colors"
//             >
//               Save & Continue
//               <ArrowRight />
//             </button>
//           </div>
//         </div>
//       )}

//       {step === 3 && (
//         // <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full mx-auto min-h-[400px] overflow-y-scroll">
//         <div
//           className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full mx-auto 
//                 max-h-[80vh] overflow-y-auto scrollbar-hide"
//         >
//           <div className="flex items-start justify-between">
//             <div>
//               <h2 className="text-2xl font-semibold text-gray-800">
//                 Welcome! Let's get started in creating your account
//               </h2>
//               <h4>Complete the form below to setup your station</h4>
//             </div>

//             <button
//               onClick={onclose}
//               className="text-gray-600 hover:text-gray-700 text-2xl font-bold"
//             >
//               <X />
//             </button>
//           </div>

//           <div className="p-2 mt-6 bg-gray-100 flex  font-semibold text-gray-600 justify-between items-center">
//             <h5>STEP 3 OF 4</h5>
//             <h5>BUSINESS INFORMATION</h5>
//           </div>

//           <div className="mt-4">
//             <h5 className="font-semibold text-gray-600">
//               Configure your business
//             </h5>
//             <p className="text-sm text-gray-600">
//               Set up your station's operational parameters
//             </p>
//           </div>

//           <form className="mt-6 grid w-full grid-cols-1 lg:grid-cols-3 gap-2">
//             <div className="">
//               <p className="text-sm font-semibold">Business type</p>
//               <select className="w-full p-2 border-2 border-gray-300 rounded-[8px]">
//                 <option>Dave</option>
//                 <option>Johnson</option>
//               </select>
//             </div>
//             <div className="">
//               <p className="text-sm font-semibold">Number of Pumps</p>
//               <select className="w-full p-2 border-2 border-gray-300 rounded-[8px]">
//                 {Array.from({ length: 30 }, (_, i) => (
//                   <option key={i + 1} value={i + 1}>
//                     {i + 1}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className="">
//               <p className="text-sm font-semibold">Operating Hours</p>
//               <select className="w-full p-2 border-2 border-gray-300 rounded-[8px]">
//                 {Array.from({ length: 30 }, (_, i) => (
//                   <option key={i + 1} value={i + 1}>
//                     {i + 1}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="">
//               <p className="text-sm font-semibold">Tank Capacity</p>
//               <input
//                 type="text"
//                 placeholder="e.g 100 Litres"
//                 className="border-2 border-gray-300 p-2 rounded-[8px] w-full "
//               />
//               <Phone className="text-gray-400 absolute top-7 left-2" />
//             </div>
//             <div className="">
//               <p className="text-sm font-semibold">Average Monthly Revenue</p>
//               <input
//                 type="text"
//                 placeholder="your av. monthly revenue"
//                 className="border-2 border-gray-300 p-2 rounded-[8px] w-full "
//               />
//             </div>
//             <div className="">
//               <p className="text-sm font-semibold">Staff Members</p>
//               <select className="w-full p-2 border-2 border-gray-300 rounded-[8px]">
//                 {Array.from({ length: 30 }, (_, i) => (
//                   <option key={i + 1} value={i + 1}>
//                     {i + 1}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="cols-span-1 lg:col-span-3">
//               <p className="text-sm font-semibold">Fuel types offered</p>

//               <div className="flex flex-wrap gap-3 lg:gap-10 text-[#737373] font-medium">
//                 <label className="flex gap-1 items-center">
//                   <span>
//                     <input type="checkbox" />
//                   </span>
//                   PMS
//                 </label>
//                 <label className="flex gap-1 items-center">
//                   <span>
//                     <input type="checkbox" />
//                   </span>
//                   AGO
//                 </label>
//                 <label className="flex gap-1 items-center">
//                   <span>
//                     <input type="checkbox" />
//                   </span>
//                   Diesel
//                 </label>
//                 <label className="flex gap-1 items-center">
//                   <span>
//                     <input type="checkbox" />
//                   </span>
//                   Kerosene
//                 </label>
//                 <label className="flex gap-1 items-center">
//                   <span>
//                     <input type="checkbox" />
//                   </span>
//                   Gas
//                 </label>
//               </div>
//             </div>
//             <div className="col-span-1 lg:col-span-3">
//               <p className="text-sm font-semibold">Additional services</p>

//               <div className="flex flex-wrap gap-4  text-[#737373] font-medium">
//                 <label className="flex gap-1 items-center">
//                   <span>
//                     <input type="checkbox" />
//                   </span>
//                   Lubricant Sales
//                 </label>
//                 <label className="flex gap-1 items-center">
//                   <span>
//                     <input type="checkbox" />
//                   </span>
//                   Car Wash
//                 </label>
//                 <label className="flex gap-1 items-center">
//                   <span>
//                     <input type="checkbox" />
//                   </span>
//                   Convenience Store
//                 </label>
//                 <label className="flex gap-1 items-center">
//                   <span>
//                     <input type="checkbox" />
//                   </span>
//                   Auto Repair
//                 </label>
//                 <label className="flex gap-1 items-center">
//                   <span>
//                     <input type="checkbox" />
//                   </span>
//                   Oil Change
//                 </label>
//                 <label className="flex gap-1 items-center">
//                   <span>
//                     <input type="checkbox" />
//                   </span>
//                   Food Service
//                 </label>
//               </div>
//             </div>

//             {/* </div> */}
//           </form>

//           <div className="flex text-sm lg:text-md justify-center lg:justify-between gap-3 p-0 mt-8 lg:mt-0 lg:p-6">
//             <button
//               onClick={handlePreviousStep}
//               className="cursor-pointer py-2 px-4 rounded-md flex items-center gap-2 border-1 border-[#0080ff]"
//             >
//               <ArrowLeft />
//               Previous
//             </button>
//             <button
//               onClick={handleNextStep}
//               className="cursor-pointer px-4 py-2 flex items-center gap-2 text-white rounded-md bg-[#0080ff] transition-colors"
//             >
//               Save & Continue
//               <ArrowRight />
//             </button>
//           </div>
//         </div>
//       )}
//       {step === 4 && (
//         // <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full mx-auto min-h-[400px] overflow-y-scroll">
//         <div
//           className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full mx-auto 
//                 max-h-[80vh] overflow-y-auto scrollbar-hide"
//         >
//           <div className="flex items-start justify-between">
//             <div>
//               <h2 className="text-2xl font-semibold text-gray-800">
//                 Welcome! Let's get started in creating your account
//               </h2>
//               <h4>Complete the form below to setup your station</h4>
//             </div>

//             <button
//               onClick={onclose}
//               className="text-gray-600 hover:text-gray-700 text-2xl font-bold"
//             >
//               <X />
//             </button>
//           </div>

//           <div className="p-2 mt-6 bg-gray-100 flex  font-semibold text-gray-600 justify-between items-center">
//             <h5>STEP 4 OF 4</h5>
//             <h5>SECURITY AND NOTIFICATIONS</h5>
//           </div>

//           <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
//             {/* Password and Security */}
//             <div className="border-2 h-fit p-4 rounded-[14px] border-gray-300">
//               <h3 className="font-semibold">Password and Security</h3>
//               <p className="text-sm text-gray-600">Set up strong password for your account</p>

//               <div className="mt-6">
//                 <p className="text-sm font-semibold">New password</p>
//                 <input
//                   type="text"
//                   placeholder="Your password"
//                   className="border-2 border-gray-300 rounded-[8px] w-full p-2"
//                 />
//               </div>

//               <div className="mt-4">
//                 <p className="text-sm font-semibold">Confirm new password</p>
//                 <input
//                   type="text"
//                   placeholder="Your password"
//                   className="border-2 border-gray-300 rounded-[8px] w-full p-2"
//                 />
//               </div>

//               <div className="mt-8 flex justify-between items-center">
//                 <div>
//                   <h4 className="font-semibold">2-FACTOR AUTHENTICATOR</h4>
//                   <p>Highly recommended</p>
//                 </div>
//                 <ToggleSwitch />
//               </div>
//             </div>
//             <div className="border-2 p-4 rounded-[14px] border-gray-300">
//               <h3 className="font-semibold">Notification Preferences</h3>
//               <p className="text-sm text-gray-600">Configure how you receive notifications</p>

//               <div className="flex flex-col gap-4">
//                   <div className="flex justify-between mt-6">
//                     Email
//                     <ToggleSwitch />
//                   </div>
//                   <div className="flex justify-between">
//                     SMS
//                     <ToggleSwitch />
//                   </div>
//                   <div className="flex justify-between">
//                     Push
//                     <ToggleSwitch />
//                   </div>
//                   <div className="flex justify-between">
//                     Low Stock
//                     <ToggleSwitch />
//                   </div>
//                   <div className="flex justify-between">
//                     Mail
//                     <ToggleSwitch />
//                   </div>
//                   <div className="flex justify-between">
//                     Sales
//                     <ToggleSwitch />
//                   </div>
//                   <div className="flex justify-between">
//                     Staffs
//                     <ToggleSwitch />
//                   </div>
//               </div>
//             </div>
//           </div>

//           <div className="flex gap-2 items-center mt-2 mb-8">
//             <input type="checkbox" />
//             <p>I agree to the <span className="text-[#0080ff]">Terms of Service</span> and <span className="text-[#0080ff]">Privacy Policy</span></p>
//           </div>

//           <div className="flex text-sm lg:text-md justify-center lg:justify-between gap-3 p-0 mt-8 lg:mt-0 lg:p-6">
//             <button
//               onClick={handlePreviousStep}
//               className="cursor-pointer py-2 px-4 rounded-md flex items-center gap-2 border-1 border-[#0080ff]"
//             >
//               <ArrowLeft />
//               Previous
//             </button>
//             <button
//               onClick={handleNextStep}
//               className="cursor-pointer px-4 py-2 flex items-center gap-2 text-white rounded-md bg-[#0080ff] transition-colors"
//             >
//               Complete Setup
//               <ArrowRight />
//             </button>
//           </div>
//         </div>
//       )}

//       {step === 5 && (
//          <div
//           className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full mx-auto 
//                 max-h-[80vh] overflow-y-auto scrollbar-hide "
//         >
//           <div className="mt-4 mx-auto mb-6 h-20 w-20 rounded-full flex justify-center bg-[#04910c] items-center">
//             <Check className="text-white font-semibold" size={30}/>
//           </div>
//           <h2 className="text-center">Account Created Successfully</h2>

//           <div className="mt-6">
//               <h4 className="text-lg text-center font-semibold text-[#0080ff] mb-6">What You'll Get</h4>

//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//                 {featuresData.map((item) => (
//                   <div key={item.id} className="flex items-start gap-3">
//                     <img src={item.imageUrl} alt="" />
//                     <div>
//                       <h4 className="font-semibold">{item.title}</h4>
//                       <p className="text-sm">
//                         {item.description}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//           </div>

//           <div className="flex justify-center lg:justify-end my-6" onClick={onclose}>
//                 <Link href="/role-selection" className="bg-[#0080ff] rounded-[8px] p-2 text-white">Access Dashboard</Link>
//           </div>

//         </div>
//       )}

//     </div>
//   );
// }



"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Mail,
  MapPin,
  Phone,
  TriangleAlert,
  X,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import ToggleSwitch from "./ToggleSwtich";
import Link from "next/link";

export default function RegisterManagerModal({ onclose }) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const API = process.env.NEXT_PUBLIC_API;
  
  // Form state for all steps
  const [formData, setFormData] = useState({
    // Step 1 - Personal Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    emergencyContact: "",
    image: "",

    // Step 2 - Station Information
    stationName: "",
    stationId: "",
    stationEmail: "",
    stationPhone: "",
    stationAddress: "",
    stationCity: "",
    stationCountry: "",
    stationZipCode: "",
    licenseNumber: "",
    taxId: "",
    establishmentDate: "",
    stationImage: "",

    // Step 3 - Business Information
    businessType: "",
    numberOfPumps: 1,
    operationHours: "",
    tankCapacity: "",
    averageMonthlyRevenue: "",
    staffMembers: 1,
    fuelTypesOffered: [],
    additionalServices: [],

    // Step 4 - Security and Notifications
    password: "",
    confirmPassword: "",
    twoFactorAuthEnabled: false,
    notificationPreferences: {
      email: true,
      sms: false,
      push: true,
      lowStock: true,
      mail: false,
      sales: true,
      staffs: false,
    },
    termsAccepted: false,
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox' && (name === 'fuelTypesOffered' || name === 'additionalServices')) {
      setFormData(prev => ({
        ...prev,
        [name]: checked 
          ? [...prev[name], value]
          : prev[name].filter(item => item !== value)
      }));
    } else if (name.startsWith('notification_')) {
      const notificationKey = name.replace('notification_', '');
      setFormData(prev => ({
        ...prev,
        notificationPreferences: {
          ...prev.notificationPreferences,
          [notificationKey]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Handle toggle switch changes
  const handleToggleChange = (name, value) => {
    if (name === 'twoFactorAuthEnabled') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        notificationPreferences: {
          ...prev.notificationPreferences,
          [name]: value
        }
      }));
    }
  };

  // API call to create manager
  const createManager = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Validate password confirmation
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Validate terms acceptance
      if (!formData.termsAccepted) {
        throw new Error("Please accept the Terms of Service and Privacy Policy");
      }

      const response = await fetch(`${API}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Personal Details (Step 1)
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          emergencyContact: formData.emergencyContact,
          image: formData.image,

          // Station Details (Step 2)
          stationName: formData.stationName,
          stationAddress: formData.stationAddress,
          stationEmail: formData.stationEmail,
          stationPhone: formData.stationPhone,
          stationCity: formData.stationCity,
          stationCountry: formData.stationCountry,
          stationZipCode: formData.stationZipCode,
          licenseNumber: formData.licenseNumber,
          taxId: formData.taxId,
          establishmentDate: formData.establishmentDate,
          stationImage: formData.stationImage,

          // Operational Details (Step 3)
          businessType: formData.businessType,
          numberOfPumps: parseInt(formData.numberOfPumps),
          operationHours: formData.operationHours,
          tankCapacity: formData.tankCapacity,
          averageMonthlyRevenue: formData.averageMonthlyRevenue,
          fuelTypesOffered: formData.fuelTypesOffered,
          additionalServices: formData.additionalServices,

          // Security & Preferences (Step 4)
          password: formData.password,
          twoFactorAuthEnabled: formData.twoFactorAuthEnabled,
          notificationPreferences: formData.notificationPreferences,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create account');
      }

      // Success - move to step 5
      setStep(5);
      
      // Optionally store user data in localStorage or context
      // localStorage.setItem('user', JSON.stringify(data.manager));
      // localStorage.setItem('station', JSON.stringify(data.station));
      
    } catch (err) {
      setError(err.message);
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = () => {
    if (step < 4) {
      setStep(prev => prev + 1);
    } else if (step === 4) {
      // Submit form on step 4
      createManager();
    }
  };

  const handlePreviousStep = () => {
    setStep(prev => prev - 1);
  };

  const featuresData = [
    {
      id: 1,
      title: "Real-Time Analytics",
      description: "Monitor sales, inventory, and performance",
      imageUrl: "/analytics.png" 
    },
    {
      id: 2,
      title: "Pump Control",
      description: "Remote pump management and diagnostics",
      imageUrl: "/pump.png" 
    },
    {
      id: 3,
      title: "Staff Management",
      description: "Schedule shifts and track performance",
      imageUrl: "/staff.png" 
    },
    {
      id: 4,
      title: "Inventory Control",
      description: "Smart Inventory management system",
      imageUrl: "/trend.png" 
    },
    {
      id: 5,
      title: "Fuel Monitoring",
      description: "Track levels and automate reorders",
      imageUrl: "/fuel.png" 
    },
    {
      id: 6,
      title: "Financial Tracking",
      description: "Revenue, expenses, and profit analysis",
      imageUrl: "/naira.png" 
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
      {step === 1 && (
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full mx-auto max-h-[80vh] overflow-y-auto scrollbar-hide">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Welcome! Let's get started in creating your account
              </h2>
              <h4>Complete the form below to setup your station</h4>
            </div>
            <button
              onClick={onclose}
              className="text-gray-600 hover:text-gray-700 text-2xl font-bold"
            >
              <X />
            </button>
          </div>

          <div className="p-2 mt-6 bg-gray-100 flex font-semibold text-gray-600 justify-between items-center">
            <h5>STEP 1 OF 4</h5>
            <h5>PERSONAL INFORMATION</h5>
          </div>

          <div className="mt-4">
            <h5 className="font-semibold text-gray-600">Let's know you</h5>
            <p className="text-sm text-gray-600">
              Tell us about yourself to personalize your account
            </p>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form className="mt-6 grid w-full grid-cols-1 lg:grid-cols-2 gap-2">
            <div className="">
              <p className="text-sm font-semibold">First name</p>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Dave"
                className="border-2 border-gray-300 p-2 rounded-[8px] w-full"
                required
              />
            </div>
            <div className="">
              <p className="text-sm font-semibold">Last name</p>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Johnson"
                className="border-2 border-gray-300 p-2 rounded-[8px] w-full"
                required
              />
            </div>
            <div className="relative">
              <p className="text-sm font-semibold">Email Address</p>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="davejohnson234@gmail.com"
                className="border-2 pl-10 border-gray-300 p-2 rounded-[8px] w-full"
                required
              />
              <Mail className="text-gray-400 absolute top-7 left-2" />
            </div>
            <div className="relative">
              <p className="text-sm font-semibold">Phone Number</p>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="08134249483"
                className="border-2 border-gray-300 p-2 pl-10 rounded-[8px] w-full"
                required
              />
              <Phone className="text-gray-400 absolute top-7 left-2" />
            </div>
            <div className="relative lg:col-span-2">
              <p className="text-sm font-semibold">Address</p>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="your house address..."
                className="border-2 border-gray-300 p-2 pl-10 rounded-[8px] w-full"
                required
              />
              <MapPin className="text-gray-400 absolute top-7 left-2" />
            </div>
            <div className="">
              <p className="text-sm font-semibold">City</p>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="your city..."
                className="border-2 border-[#c0bebe] p-2 bg-[#e4e3e3] rounded-[8px] w-full"
                required
              />
            </div>
            <div className="">
              <p className="text-sm font-semibold">State</p>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="your state..."
                className="border-2 border-[#c0bebe] p-2 bg-[#e4e3e3] rounded-[8px] w-full"
                required
              />
            </div>
            <div className="">
              <p className="text-sm font-semibold">Zip Code</p>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                placeholder="45869"
                className="border-2 border-gray-300 p-2 rounded-[8px] w-full"
                required
              />
            </div>
            <div className="relative">
              <p className="text-sm font-semibold">Emergency Contact</p>
              <input
                type="text"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleInputChange}
                placeholder="08134249483"
                className="border-2 border-gray-300 pl-10 p-2 rounded-[8px] w-full"
                required
              />
              <Phone className="text-gray-400 absolute top-7 left-2" />
            </div>
          </form>

          <div className="mt-6 text-xs bg-[#dcd2ff] w-fit text-[#7f27ff] font-semibold flex items-center gap-2 p-2">
            <TriangleAlert size={17} />
            No part of your information shall be disclosed to a third party!
          </div>

          <div className="flex justify-end gap-3 p-6">
            <button
              onClick={handleNextStep}
              className="cursor-pointer px-4 py-2 flex items-center gap-2 text-white rounded-md bg-[#0080ff] transition-colors"
            >
              Save & Continue
              <ArrowRight />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full mx-auto max-h-[80vh] overflow-y-auto scrollbar-hide">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Welcome! Let's get started in creating your account
              </h2>
              <h4>Complete the form below to setup your station</h4>
            </div>
            <button
              onClick={onclose}
              className="text-gray-600 hover:text-gray-700 text-2xl font-bold"
            >
              <X />
            </button>
          </div>

          <div className="p-2 mt-6 bg-gray-100 flex font-semibold text-gray-600 justify-between items-center">
            <h5>STEP 2 OF 4</h5>
            <h5>STATION INFORMATION</h5>
          </div>

          <div className="mt-4">
            <h5 className="font-semibold text-gray-600">
              Tell us about your filling station
            </h5>
            <p className="text-sm text-gray-600">
              Help us configure the system for your specific location
            </p>
          </div>

          <form className="mt-6 grid w-full grid-cols-1 lg:grid-cols-2 gap-2">
            <div className="">
              <p className="text-sm font-semibold">Station name</p>
              <input
                type="text"
                name="stationName"
                value={formData.stationName}
                onChange={handleInputChange}
                placeholder="Station 2"
                className="border-2 border-gray-300 p-2 rounded-[8px] w-full"
                required
              />
            </div>
            <div className="">
              <p className="text-sm font-semibold">Station ID</p>
              <input
                type="text"
                name="stationId"
                value={formData.stationId}
                onChange={handleInputChange}
                placeholder="0046"
                className="border-2 border-gray-300 p-2 rounded-[8px] w-full"
              />
            </div>
            <div className="relative">
              <p className="text-sm font-semibold">Station Email Address</p>
              <input
                type="email"
                name="stationEmail"
                value={formData.stationEmail}
                onChange={handleInputChange}
                placeholder="station2@gmail.com"
                className="border-2 pl-10 border-gray-300 p-2 rounded-[8px] w-full"
                required
              />
              <Mail className="text-gray-400 absolute top-7 left-2" />
            </div>
            <div className="relative">
              <p className="text-sm font-semibold">Station Phone Number</p>
              <input
                type="text"
                name="stationPhone"
                value={formData.stationPhone}
                onChange={handleInputChange}
                placeholder="08134249483"
                className="border-2 border-gray-300 p-2 pl-10 rounded-[8px] w-full"
                required
              />
              <Phone className="text-gray-400 absolute top-7 left-2" />
            </div>
            <div className="relative lg:col-span-2">
              <p className="text-sm font-semibold">Station Address</p>
              <input
                type="text"
                name="stationAddress"
                value={formData.stationAddress}
                onChange={handleInputChange}
                placeholder="your station address..."
                className="border-2 border-gray-300 p-2 pl-10 rounded-[8px] w-full"
                required
              />
              <MapPin className="text-gray-400 absolute top-7 left-2" />
            </div>
            <div className="">
              <p className="text-sm font-semibold">Station City</p>
              <input
                type="text"
                name="stationCity"
                value={formData.stationCity}
                onChange={handleInputChange}
                placeholder="your station city..."
                className="border-2 border-[#c0bebe] p-2 bg-[#e4e3e3] rounded-[8px] w-full"
                required
              />
            </div>
            <div className="">
              <p className="text-sm font-semibold">Station Country</p>
              <input
                type="text"
                name="stationCountry"
                value={formData.stationCountry}
                onChange={handleInputChange}
                placeholder="your station country..."
                className="border-2 border-[#c0bebe] p-2 bg-[#e4e3e3] rounded-[8px] w-full"
                required
              />
            </div>
            <div className="">
              <p className="text-sm font-semibold">Zip Code</p>
              <input
                type="text"
                name="stationZipCode"
                value={formData.stationZipCode}
                onChange={handleInputChange}
                placeholder="45869"
                className="border-2 border-gray-300 p-2 rounded-[8px] w-full"
                required
              />
            </div>
            <div className="">
              <p className="text-sm font-semibold">License Number</p>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                placeholder="058"
                className="border-2 border-gray-300 p-2 rounded-[8px] w-full"
                required
              />
            </div>
            <div className="">
              <p className="text-sm font-semibold">Tax ID</p>
              <input
                type="text"
                name="taxId"
                value={formData.taxId}
                onChange={handleInputChange}
                placeholder="47058"
                className="border-2 border-gray-300 p-2 rounded-[8px] w-full"
                required
              />
            </div>
            <div className="">
              <p className="text-sm font-semibold">Established Date</p>
              <input
                type="date"
                name="establishmentDate"
                value={formData.establishmentDate}
                onChange={handleInputChange}
                className="border-2 border-gray-300 p-2 rounded-[8px] w-full"
                required
              />
            </div>
          </form>

          <div className="flex text-sm lg:text-md justify-center lg:justify-between gap-3 p-0 mt-8 lg:mt-0 lg:p-6">
            <button
              onClick={handlePreviousStep}
              className="cursor-pointer py-2 px-4 rounded-md flex items-center gap-2 border-1 border-[#0080ff]"
            >
              <ArrowLeft />
              Previous
            </button>
            <button
              onClick={handleNextStep}
              className="cursor-pointer px-4 py-2 flex items-center gap-2 text-white rounded-md bg-[#0080ff] transition-colors"
            >
              Save & Continue
              <ArrowRight />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full mx-auto max-h-[80vh] overflow-y-auto scrollbar-hide">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Welcome! Let's get started in creating your account
              </h2>
              <h4>Complete the form below to setup your station</h4>
            </div>
            <button
              onClick={onclose}
              className="text-gray-600 hover:text-gray-700 text-2xl font-bold"
            >
              <X />
            </button>
          </div>

          <div className="p-2 mt-6 bg-gray-100 flex font-semibold text-gray-600 justify-between items-center">
            <h5>STEP 3 OF 4</h5>
            <h5>BUSINESS INFORMATION</h5>
          </div>

          <div className="mt-4">
            <h5 className="font-semibold text-gray-600">
              Configure your business
            </h5>
            <p className="text-sm text-gray-600">
              Set up your station's operational parameters
            </p>
          </div>

          <form className="mt-6 grid w-full grid-cols-1 lg:grid-cols-3 gap-2">
            <div className="">
              <p className="text-sm font-semibold">Business type</p>
              <select 
                name="businessType"
                value={formData.businessType}
                onChange={handleInputChange}
                className="w-full p-2 border-2 border-gray-300 rounded-[8px]"
                required
              >
                <option value="">Select Business Type</option>
                <option value="independent">Independent Station</option>
                <option value="franchise">Franchise</option>
                <option value="corporate">Corporate Owned</option>
              </select>
            </div>
            <div className="">
              <p className="text-sm font-semibold">Number of Pumps</p>
              <select 
                name="numberOfPumps"
                value={formData.numberOfPumps}
                onChange={handleInputChange}
                className="w-full p-2 border-2 border-gray-300 rounded-[8px]"
                required
              >
                {Array.from({ length: 30 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
            <div className="">
              <p className="text-sm font-semibold">Operating Hours</p>
              <select 
                name="operationHours"
                value={formData.operationHours}
                onChange={handleInputChange}
                className="w-full p-2 border-2 border-gray-300 rounded-[8px]"
                required
              >
                <option value="">Select Hours</option>
                <option value="24/7">24/7</option>
                <option value="6am-10pm">6 AM - 10 PM</option>
                <option value="7am-9pm">7 AM - 9 PM</option>
                <option value="8am-8pm">8 AM - 8 PM</option>
              </select>
            </div>
            <div className="">
              <p className="text-sm font-semibold">Tank Capacity</p>
              <input
                type="text"
                name="tankCapacity"
                value={formData.tankCapacity}
                onChange={handleInputChange}
                placeholder="e.g 100 Litres"
                className="border-2 border-gray-300 p-2 rounded-[8px] w-full"
                required
              />
            </div>
            <div className="">
              <p className="text-sm font-semibold">Average Monthly Revenue</p>
              <input
                type="text"
                name="averageMonthlyRevenue"
                value={formData.averageMonthlyRevenue}
                onChange={handleInputChange}
                placeholder="your av. monthly revenue"
                className="border-2 border-gray-300 p-2 rounded-[8px] w-full"
                required
              />
            </div>
            <div className="">
              <p className="text-sm font-semibold">Staff Members</p>
              <select 
                name="staffMembers"
                value={formData.staffMembers}
                onChange={handleInputChange}
                className="w-full p-2 border-2 border-gray-300 rounded-[8px]"
                required
              >
                {Array.from({ length: 30 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-1 lg:col-span-3">
              <p className="text-sm font-semibold">Fuel types offered</p>
              <div className="flex flex-wrap gap-3 lg:gap-10 text-[#737373] font-medium">
                {['PMS', 'AGO', 'Diesel', 'Kerosene', 'Gas'].map((fuel) => (
                  <label key={fuel} className="flex gap-1 items-center">
                    <input 
                      type="checkbox" 
                      name="fuelTypesOffered"
                      value={fuel}
                      checked={formData.fuelTypesOffered.includes(fuel)}
                      onChange={handleInputChange}
                    />
                    {fuel}
                  </label>
                ))}
              </div>
            </div>

            <div className="col-span-1 lg:col-span-3">
              <p className="text-sm font-semibold">Additional services</p>
              <div className="flex flex-wrap gap-4 text-[#737373] font-medium">
                {['Lubricant Sales', 'Car Wash', 'Convenience Store', 'Auto Repair', 'Oil Change', 'Food Service'].map((service) => (
                  <label key={service} className="flex gap-1 items-center">
                    <input 
                      type="checkbox" 
                      name="additionalServices"
                      value={service}
                      checked={formData.additionalServices.includes(service)}
                      onChange={handleInputChange}
                    />
                    {service}
                  </label>
                ))}
              </div>
            </div>
          </form>

          <div className="flex text-sm lg:text-md justify-center lg:justify-between gap-3 p-0 mt-8 lg:mt-0 lg:p-6">
            <button
              onClick={handlePreviousStep}
              className="cursor-pointer py-2 px-4 rounded-md flex items-center gap-2 border-1 border-[#0080ff]"
            >
              <ArrowLeft />
              Previous
            </button>
            <button
              onClick={handleNextStep}
              className="cursor-pointer px-4 py-2 flex items-center gap-2 text-white rounded-md bg-[#0080ff] transition-colors"
            >
              Save & Continue
              <ArrowRight />
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full mx-auto max-h-[80vh] overflow-y-auto scrollbar-hide">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Welcome! Let's get started in creating your account
              </h2>
              <h4>Complete the form below to setup your station</h4>
            </div>
            <button
              onClick={onclose}
              className="text-gray-600 hover:text-gray-700 text-2xl font-bold"
            >
              <X />
            </button>
          </div>

          <div className="p-2 mt-6 bg-gray-100 flex font-semibold text-gray-600 justify-between items-center">
            <h5>STEP 4 OF 4</h5>
            <h5>SECURITY AND NOTIFICATIONS</h5>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Password and Security */}
            <div className="border-2 h-fit p-4 rounded-[14px] border-gray-300">
              <h3 className="font-semibold">Password and Security</h3>
              <p className="text-sm text-gray-600">Set up strong password for your account</p>

              <div className="mt-6">
                <p className="text-sm font-semibold">New password</p>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Your password"
                  className="border-2 border-gray-300 rounded-[8px] w-full p-2"
                  required
                />
              </div>

              <div className="mt-4">
                <p className="text-sm font-semibold">Confirm new password</p>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  className="border-2 border-gray-300 rounded-[8px] w-full p-2"
                  required
                />
              </div>

              <div className="mt-8 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">2-FACTOR AUTHENTICATOR</h4>
                  <p>Highly recommended</p>
                </div>
                <ToggleSwitch 
                  checked={formData.twoFactorAuthEnabled}
                  onChange={(value) => handleToggleChange('twoFactorAuthEnabled', value)}
                />
              </div>
            </div>
            
            <div className="border-2 p-4 rounded-[14px] border-gray-300">
              <h3 className="font-semibold">Notification Preferences</h3>
              <p className="text-sm text-gray-600">Configure how you receive notifications</p>

              <div className="flex flex-col gap-4">
                <div className="flex justify-between mt-6">
                  Email
                  <ToggleSwitch 
                    checked={formData.notificationPreferences.email}
                    onChange={(value) => handleToggleChange('email', value)}
                  />
                </div>
                <div className="flex justify-between">
                  SMS
                  <ToggleSwitch 
                    checked={formData.notificationPreferences.sms}
                    onChange={(value) => handleToggleChange('sms', value)}
                  />
                </div>
                <div className="flex justify-between">
                  Push
                  <ToggleSwitch 
                    checked={formData.notificationPreferences.push}
                    onChange={(value) => handleToggleChange('push', value)}
                  />
                </div>
                <div className="flex justify-between">
                  Low Stock
                  <ToggleSwitch 
                    checked={formData.notificationPreferences.lowStock}
                    onChange={(value) => handleToggleChange('lowStock', value)}
                  />
                </div>
                <div className="flex justify-between">
                  Mail
                  <ToggleSwitch 
                    checked={formData.notificationPreferences.mail}
                    onChange={(value) => handleToggleChange('mail', value)}
                  />
                </div>
                <div className="flex justify-between">
                  Sales
                  <ToggleSwitch 
                    checked={formData.notificationPreferences.sales}
                    onChange={(value) => handleToggleChange('sales', value)}
                  />
                </div>
                <div className="flex justify-between">
                  Staffs
                  <ToggleSwitch 
                    checked={formData.notificationPreferences.staffs}
                    onChange={(value) => handleToggleChange('staffs', value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 items-center mt-2 mb-8">
            <input 
              type="checkbox" 
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleInputChange}
              required
            />
            <p>I agree to the <span className="text-[#0080ff]">Terms of Service</span> and <span className="text-[#0080ff]">Privacy Policy</span></p>
          </div>

          <div className="flex text-sm lg:text-md justify-center lg:justify-between gap-3 p-0 mt-8 lg:mt-0 lg:p-6">
            <button
              onClick={handlePreviousStep}
              className="cursor-pointer py-2 px-4 rounded-md flex items-center gap-2 border-1 border-[#0080ff]"
              disabled={isLoading}
            >
              <ArrowLeft />
              Previous
            </button>
            <button
              onClick={handleNextStep}
              disabled={isLoading}
              className="cursor-pointer px-4 py-2 flex items-center gap-2 text-white rounded-md bg-[#0080ff] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Creating Account...
                </>
              ) : (
                <>
                  Complete Setup
                  <ArrowRight />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full mx-auto max-h-[80vh] overflow-y-auto scrollbar-hide">
          <div className="mt-4 mx-auto mb-6 h-20 w-20 rounded-full flex justify-center bg-[#04910c] items-center">
            <Check className="text-white font-semibold" size={30}/>
          </div>
          <h2 className="text-center">Account Created Successfully</h2>

          <div className="mt-6">
            <h4 className="text-lg text-center font-semibold text-[#0080ff] mb-6">What You'll Get</h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {featuresData.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <img src={item.imageUrl} alt="" />
                  <div>
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="text-sm">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center lg:justify-end my-6" onClick={onclose}>
            <Link href="/role-selection" className="bg-[#0080ff] rounded-[8px] p-2 text-white">
              Access Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
