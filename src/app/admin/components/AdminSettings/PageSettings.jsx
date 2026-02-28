"use client"
import React, { useState } from "react";
import { BiSolidToggleLeft, BiSolidToggleRight } from "react-icons/bi";
import { SquarePen } from "lucide-react";

const defaultValues = {
  platformName: "Flourish Station",
  contactEmail: "support@flourishstation.com",
  contactPhone: "+234 9030203547",
  currency: "US Dollar (USD)",
  termsAndConditions: `Terms & Conditions\n\nLast updated: May 08, 2024\n\n1. Acceptance of Terms\nBy accessing and using this platform, you accept and agree to be bound by the terms and provision of this agreement.\n\n2. Use License`,
  planStatus: true,
  emailNotifications: true,
  inAppNotifications: false,
  newStationRegistration: true,
  subscriptionPaymentReceived: true,
  subscriptionExpired: true,
  stationSuspended: true,
  systemAlerts: true,
};

const inputClass = "w-full h-[3.25rem] pl-3 rounded-lg border-[2px] border-neutral-300 focus:border-[2px] focus:border-blue-600 outline-none";
const readonlyClass = "w-full h-[3.25rem] pl-3 flex items-center text-gray-700 bg-gray-50 rounded-lg border-[2px] border-neutral-200";

const PageSettings = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(defaultValues);
  const [saved, setSaved] = useState(defaultValues);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target ? e.target.value : e }));
  const setToggle = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = () => { setSaved(form); setIsEditing(false); };
  const handleCancel = () => { setForm(saved); setIsEditing(false); };

  const SectionHeader = ({ title, subtitle }) => (
    <>
      <div className="flex flex-col gap-3">
        <span className="text-lg font-semibold leading-[100%]">{title}</span>
        <span className="text-base text-neutral-400 leading-[150%]">{subtitle}</span>
      </div>
      <hr className="w-full mt-[1.375rem]" />
    </>
  );

  const Toggle = ({ valueKey }) => {
    const value = form[valueKey];
    const toggle = () => isEditing && setForm((f) => ({ ...f, [valueKey]: !f[valueKey] }));
    return (
      <div onClick={toggle} className={isEditing ? "cursor-pointer" : "cursor-default"}>
        {value
          ? <BiSolidToggleRight size={42} className="text-blue-600" />
          : <BiSolidToggleLeft size={42} className="text-gray-400" />
        }
      </div>
    );
  };

  const ToggleRow = ({ label, hint, valueKey }) => (
    <div className="flex justify-between mt-[1.375rem] border-[2px] border-neutral-300 w-full min-h-[5.4375rem] rounded-lg p-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-[1rem] font-semibold leading-[100%]">{label}</h1>
        <p className="text-[0.875rem] text-neutral-400 font-medium leading-[150%]">{hint}</p>
      </div>
      <Toggle valueKey={valueKey} />
    </div>
  );

  return (
    <div className="flex flex-col w-full pb-10">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl lg:text-[1.75rem] font-semibold leading-[100%]">Platform Settings</h1>
          <p className="text-base lg:text-[1.125rem] leading-[100%] text-neutral-500">
            Configure Flourish station settings and preferences
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-5 py-2 bg-blue-600 cursor-pointer text-white font-semibold flex gap-2 items-center rounded-2xl hover:bg-blue-700 transition"
          >
            <SquarePen size={18} />
            Edit
          </button>
        )}
      </div>

      {/* Platform Information */}
      <div className="mt-[1.375rem] bg-white w-full rounded-xl p-4 lg:p-5">
        <SectionHeader title="Platform Information" subtitle="Manage your platform identity and contact details" />

        <div className="flex flex-col gap-2 mt-[1.375rem]">
          <label className="text-[0.875rem] font-bold">Platform Name</label>
          {isEditing
            ? <input type="text" value={form.platformName} onChange={set("platformName")} className={inputClass} />
            : <div className={readonlyClass}>{saved.platformName}</div>
          }
          <p className="text-sm text-neutral-400">Used in emails & branding</p>
        </div>

        <div className="flex flex-col gap-2 mt-[1.375rem]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full">
            <div className="flex flex-col gap-2">
              <label className="text-[0.875rem] font-bold">Contact Email</label>
              {isEditing
                ? <input type="email" value={form.contactEmail} onChange={set("contactEmail")} className={inputClass} />
                : <div className={readonlyClass}>{saved.contactEmail}</div>
              }
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[0.875rem] font-bold">Contact Phone</label>
              {isEditing
                ? <input type="tel" value={form.contactPhone} onChange={set("contactPhone")} className={inputClass} />
                : <div className={readonlyClass}>{saved.contactPhone}</div>
              }
            </div>
          </div>
          <p className="text-sm text-neutral-400">Public contact for station owners</p>
        </div>
      </div>

      {/* Billing Settings */}
      <div className="mt-[1.375rem] p-4 lg:p-5 bg-white rounded-xl w-full">
        <SectionHeader title="Billing Settings" subtitle="Configure billing and payment preferences" />
        <div className="flex flex-col gap-2 mt-[1.375rem]">
          <label className="text-[1rem] font-bold">Default Currency</label>
          {isEditing
            ? <input type="text" value={form.currency} onChange={set("currency")} className={inputClass} />
            : <div className={readonlyClass}>{saved.currency}</div>
          }
          <p className="text-[0.875rem] text-neutral-400">Used for all pricing and invoices</p>
        </div>
      </div>

      {/* Legal */}
      <div className="mt-[1.375rem] p-4 lg:p-5 bg-white rounded-xl w-full">
        <SectionHeader title="Legal" subtitle="Manage legal documents and policies" />
        <div className="flex flex-col gap-2 mt-[1.375rem]">
          <label className="text-[1rem] font-bold">Terms & Conditions</label>
          {isEditing ? (
            <textarea
              value={form.termsAndConditions}
              onChange={set("termsAndConditions")}
              className="w-full lg:h-[12.25rem] h-[7.125rem] pl-3 pt-2 rounded-lg border-[2px] border-neutral-300 focus:border-blue-600 outline-none resize-none"
            />
          ) : (
            <div className="w-full lg:min-h-[12.25rem] min-h-[7.125rem] pl-3 pt-2 rounded-lg border-[2px] border-neutral-200 bg-gray-50 text-gray-700 text-sm whitespace-pre-wrap">
              {saved.termsAndConditions}
            </div>
          )}
          <p className="text-[0.875rem] text-neutral-400">Displayed to users during registration</p>
        </div>
      </div>

      {/* Access Control */}
      <div className="mt-[1.375rem] p-4 lg:p-5 bg-white rounded-xl w-full">
        <SectionHeader title="Access Control" subtitle="Control who can register on your platform" />
        <ToggleRow label="Plan Status" hint="This plan is active and visible to customers" valueKey="planStatus" />
      </div>

      {/* Notification Channels */}
      <div className="mt-[1.375rem] p-4 lg:p-5 bg-white rounded-xl w-full">
        <SectionHeader title="Notification Channels" subtitle="Choose how you receive notifications" />
        <ToggleRow label="Email Notifications" hint="Receive important updates via email" valueKey="emailNotifications" />
        <ToggleRow label="In-App Notifications" hint="See alerts while logged into the dashboard" valueKey="inAppNotifications" />
      </div>

      {/* Notification Types */}
      <div className="mt-[1.375rem] p-4 lg:p-5 bg-white rounded-xl w-full">
        <SectionHeader title="Notification Types" subtitle="Choose which events you want to be notified about" />
        <ToggleRow label="New Station Registration" hint="When a filling station registers on the platform" valueKey="newStationRegistration" />
        <ToggleRow label="Subscription Payment Received" hint="When a subscription payment is successfully received" valueKey="subscriptionPaymentReceived" />
        <ToggleRow label="Subscription Expired or Overdue" hint="When a subscription expires or payment is overdue" valueKey="subscriptionExpired" />
        <ToggleRow label="Station Suspended or Reactivated" hint="When a station is suspended or reactivated" valueKey="stationSuspended" />
        <ToggleRow label="System Alerts (Critical Events)" hint="Receive alerts for critical system events and issues" valueKey="systemAlerts" />
      </div>

      {/* Save / Cancel — only visible in edit mode */}
      {isEditing && (
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={handleCancel}
            className="px-6 py-2.5 rounded-xl border-[2px] border-neutral-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition flex items-center gap-2"
          >
            <SquarePen size={18} />
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default PageSettings;


//     "use client"
// import React, { useState } from "react";
// import { BiSolidToggleLeft, BiSolidToggleRight  } from "react-icons/bi";
// import { SquarePen } from "lucide-react";


// const PageSettings = () => {

//     const[isToggleOne, setIsToggleOne] = useState(false)
//     const[isToggleTwo, setIsToggleTwo] = useState(false)
//     const[isToggleThree, setIsToggleThree] = useState(false)
//     const[isToggleFour, setIsToggleFour] = useState(false)
//     const[isToggleFive, setIsToggleFive] = useState(false)
//     const [isToggleNum1, setIsToggleNum1] = useState(false)
//     const [isToggleNum2, setIsToggleNum2] = useState(false)
//     const [isActive, setIsActive] = useState ("page2")
//   return (
//     <div className="flex flex-col w-full">
//       {/* Header */}

//       <div className="flex justify-between">
//         <div className="flex flex-col gap-3">
//             <h1 className="text-2xl lg:text-[1.75rem] font-semibold leading-[100%]">
//             Platform Settings
//             </h1>
//             <p className="text-base lg:text-[1.125rem] leading-[100%] text-neutral-500">
//             Configure Flourish station settings and preferences
//             </p>
//         </div>


//         <button className="px-5 py-2 bg-blue-600 cursor-pointer text-white font-semibold flex gap-3 items-center justify-center rounded-2xl">
//             <SquarePen />
//             Edit
//         </button>

//         {/* <div className=" flex gap-4 bg-blue-500 p-1.5 rounded-2xl">
//             <button  className="bg-neutral-50 px-5 py-2 cursor-pointer hover:bg-blue-100 hover:text-blue-600 font-bold rounded-full">Page 1</button>
//             <button onClick={() => setIsActive("page2")} className="bg-neutral-50 px-5 py-2 cursor-pointer hover:bg-blue-100 hover:text-blue-600 font-bold rounded-full" >
//                 Page 2
//             </button>          
//         </div> */}

        
//       </div>

//       {/* Platform Information */}
//       <div className="mt-[1.375rem] bg-white w-full rounded-xl p-4 lg:p-5">
//         <h1 className="font-semibold text-[1rem]">Platform Information</h1>
//         <p className="text-[1rem] text-neutral-500">
//           Manage your platform identity and contact details
//         </p>

//         <hr className="w-full mt-[1.5rem]" />

//         {/* Platform Name */}
//         <div className="flex flex-col gap-3 mt-[1.375rem]">
//           <label className="text-[0.875rem] font-bold">Platform Name</label>
//           <input
//             type="text"
//             placeholder="Flourish Station"
//             className="w-full h-[3.25rem] pl-3 rounded-lg border-[2px] border-neutral-300 focus:border-[2px] focus:border-blue-600 outline-none"
//           />
//           <p className="text-sm text-neutral-400">Used in emails & branding</p>
//         </div>

//         {/* Contact Fields */}
//         <div className="flex flex-col gap-2 mt-[1.375rem]">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full">
//             <div className="flex flex-col gap-2">
//               <label className="text-[0.875rem] font-bold">Contact Email</label>
//               <input
//                 type="email"
//                 placeholder="flourishstation2026@gmail.com"
//                 className="w-full h-[3.25rem] pl-3 rounded-lg border-[2px] border-neutral-300 focus:border-[2px] focus:border-blue-600 outline-none"
//               />
//             </div>
//             <div className="flex flex-col gap-2">
//               <label className="text-[0.875rem] font-bold">Contact Phone</label>
//               <input
//                 type="tel"
//                 placeholder="+234 9030203547"
//                 className="w-full h-[3.25rem] pl-3 rounded-lg border-[2px] border-neutral-300 focus:border-[2px] focus:border-blue-600 outline-none"
//               />
//             </div>
//           </div>
//           <p className="text-sm text-neutral-400">Public contact for station owners</p>
//         </div>
//       </div>

//       {/* Billing Settings */}
//       <div className="mt-[1.375rem] p-4 lg:p-5 bg-white rounded-xl w-full">
//         <div className="flex flex-col gap-3">
//           <span className="text-lg lg:text-[1.125rem] font-semibold leading-[100%]">
//             Billing Settings
//           </span>
//           <span className="text-base text-neutral-400 leading-[150%]">
//             Configure billing and payment preferences
//           </span>
//         </div>

//         <hr className="w-full mt-[1.375rem]" />

//         <div className="flex flex-col gap-2 mt-[1.375rem]">
//           <h1 className="text-[1rem] font-bold leading-[100%]">Default Currency</h1>
//           <input
//             type="text"
//             placeholder="₦ Nigeria naira"
//             className="w-full h-[3.25rem] pl-3 rounded-lg border-[2px] border-neutral-300 focus:border-[2px] focus:border-blue-600 outline-none"
//           />
//           <p className="text-[0.875rem] text-neutral-400">Used for all pricing and invoices</p>
//         </div>
//       </div>

//       {/* The Legal settings */}
//       <div className="mt-[1.375rem] p-4 lg:p-5 bg-white rounded-xl w-full">
//         <div className="flex flex-col gap-3">
//           <span className="text-lg lg:text-[1.125rem] font-semibold leading-[100%]">
//             Legal
//           </span>
//           <span className="text-base text-neutral-400 leading-[150%]">
//             Manage legal documents and policies
//           </span>
//         </div>

//         <hr className="w-full mt-[1.375rem]" />

//         <div className="flex flex-col gap-2 mt-[1.375rem]">
//           <h1 className="text-[1rem] font-bold leading-[100%]">Terms & Conditions</h1>
//           <textarea type="text"
//             placeholder=" Enter Terms & Conditions. Acceptance of Terms "
//             className="w-full lg:h-[12.25rem] h-[7.125rem] pl-3 pt-2 rounded-lg border-[2px] border-neutral-300 focus:border-[2px] focus:border-blue-600 outline-none">
            
//          </textarea>
//           <p className="text-[0.875rem] text-neutral-400">Displayed to users during registration</p>
//         </div>
//       </div>

//       {/* Notification Channels */}
//         <div className="mt-[1.375rem] p-4 lg:p-5 bg-white rounded-xl w-full">
//             <div className="flex flex-col gap-3">
//             <span className="text-lg lg:text-[1.125rem] font-semibold leading-[100%]">
//                 Notification Channels
//             </span>
//             <span className="text-base text-neutral-400 leading-[150%]">
//                 Choose how you receive notifications
//             </span>
//             </div>

//             <hr className="w-full mt-[1.375rem]" />

//             <div className="flex   justify-between mt-[1.375rem] border-[2px] border-neutral-300 w-full h-[5.4375rem] rounded-lg p-4">
//                 <div className="flex flex-col  gap-2 ">
//                     <h1 className="text-[1rem] font-semibold leading-[100%]">Email Notifications</h1>
//                     <p className="text-[0.875rem] text-neutral-400 font-medium leading-[150%]">Receive important updates via email</p>
//                 </div>
                
//                 <div onClick={() => setIsToggleOne(!isToggleOne)}>
//                     {isToggleOne ? (
//                             <BiSolidToggleLeft  size={42} className="text-gray-400" />   
//                     ): (
//                         <BiSolidToggleRight  size={42} className="text-blue-600" />
//                     )}
//                 </div>

//             </div>
//             <div className="flex   justify-between mt-[1.375rem] border-[2px] border-neutral-300 w-full h-[5.4375rem] rounded-lg p-4">
//                 <div className="flex flex-col  gap-2 ">
//                     <h1 className="text-[1rem] font-semibold leading-[100%]">In-App Notifications</h1>
//                     <p className="text-[0.875rem] text-neutral-400 font-medium leading-[150%]">See alerts while logged into the dashboard</p>
//                 </div>
                
//                 <div onClick={() => setIsToggleTwo(!isToggleTwo)}>
//                     {isToggleTwo ? (
//                             < BiSolidToggleRight  size={42} className="text-blue-600" />   
//                     ): (
//                         < BiSolidToggleLeft size={42} className="text-gray-400" />
//                     )}
//                 </div>

//             </div>
//         </div>

//         {/* The Notification Types */}
//         <div className="mt-[1.375rem] p-4 lg:p-5 bg-white rounded-xl w-full">
//             <div className="flex flex-col gap-3">
//             <span className="text-lg lg:text-[1.125rem] font-semibold leading-[100%]">
//                 Notification Types
//             </span>
//             <span className="text-base text-neutral-400 leading-[150%]">
//                 Choose which events you want to be notified about
//             </span>
//             </div>

//             <hr className="w-full mt-[1.375rem]" />

//             <div className="flex   justify-between mt-[1.375rem] border-[2px] border-neutral-300 w-full h-[5.4375rem] rounded-lg p-4">
//                 <div className="flex flex-col  gap-2 ">
//                     <h1 className="text-[1rem] font-semibold leading-[100%]">New Station Registration</h1>
//                     <p className="text-[0.875rem] text-neutral-400 font-medium leading-[150%]">When a filling station registers on the platform</p>
//                 </div>
                
//                 <div onClick={() => setIsToggleNum1(!isToggleNum1)}>
//                     {isToggleNum1 ? (
//                             <BiSolidToggleLeft  size={42} className="text-gray-400" />   
//                     ): (
//                         <BiSolidToggleRight  size={42} className="text-blue-600" />
//                     )}
//                 </div>

//             </div>
//             <div className="flex   justify-between mt-[1.375rem] border-[2px] border-neutral-300 w-full h-[5.4375rem] rounded-lg p-4">
//                 <div className="flex flex-col  gap-2 ">
//                     <h1 className="text-[1rem] font-semibold leading-[100%]">Subscription Payment Received</h1>
//                     <p className="text-[0.875rem] text-neutral-400 font-medium leading-[150%]">When a subscription payment is successfully receieved</p>
//                 </div>
                
//                 <div onClick={() => setIsToggleNum2(!isToggleNum2)}>
//                     {isToggleNum2 ? (
//                             <BiSolidToggleLeft  size={42} className="text-gray-400" />   
//                     ): (
//                         <BiSolidToggleRight  size={42} className="text-blue-600" />
//                     )}
//                 </div>

//             </div>
//             <div className="flex   justify-between mt-[1.375rem] border-[2px] border-neutral-300 w-full h-[5.4375rem] rounded-lg p-4">
//                 <div className="flex flex-col  gap-2 ">
//                     <h1 className="text-[1rem] font-semibold leading-[100%]">Subscription Expired or Overdue</h1>
//                     <p className="text-[0.875rem] text-neutral-400 font-medium leading-[150%]">When a subscription expires or payment is overdue</p>
//                 </div>
                
//                 <div onClick={() => setIsToggleThree(!isToggleThree)}>
//                     {isToggleThree ? (
//                             <BiSolidToggleLeft  size={42} className="text-gray-400" />   
//                     ): (
//                         <BiSolidToggleRight  size={42} className="text-blue-600" />
//                     )}
//                 </div>

//             </div>
//             <div className="flex   justify-between mt-[1.375rem] border-[2px] border-neutral-300 w-full h-[5.4375rem] rounded-lg p-4">
//                 <div className="flex flex-col  gap-2 ">
//                     <h1 className="text-[1rem] font-semibold leading-[100%]">Station Suspended or Reactivated</h1>
//                     <p className="text-[0.875rem] text-neutral-400 font-medium leading-[150%]">When a station is suspended or reactivated</p>
//                 </div>
                
//                 <div onClick={() => setIsToggleFour(!isToggleFour)}>
//                     {isToggleFour ? (
//                             < BiSolidToggleRight  size={42} className="text-blue-600" />   
//                     ): (
//                         < BiSolidToggleLeft size={42} className="text-gray-400" />
//                     )}
//                 </div>

//             </div>
//             <div className="flex   justify-between mt-[1.375rem] border-[2px] border-neutral-300 w-full h-[5.4375rem] rounded-lg p-4">
//                 <div className="flex flex-col  gap-2 ">
//                     <h1 className="text-[1rem] font-semibold leading-[100%]">System Alerts (Critical Events)</h1>
//                     <p className="text-[0.875rem] text-neutral-400 font-medium leading-[150%]">Receive alerts for critical system events and issues</p>
//                 </div>
                
//                 <div onClick={() => setIsToggleFive(!isToggleFive)}>
//                     {isToggleFive ? (
//                             < BiSolidToggleRight  size={42} className="text-blue-600" />   
//                     ): (
//                         <BiSolidToggleLeft  size={42} className="text-blue-600" />
//                     )}
//                 </div>

//             </div>
//         </div>

          
             
//     </div>
//   );
// };

// export default PageSettings;