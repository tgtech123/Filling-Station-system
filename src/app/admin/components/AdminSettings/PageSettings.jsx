import React from "react";

const PageSettings = () => {
  return (
    <div>
      <div className="flex flex-col gap-3">
        <h1 className="text-[1.75rem] font-semibold leading-[100%]">
          Platform Settings
        </h1>
        <p className="text-[1.125rem] leading-[100%] text-neutral-500">
          Configure Flourish station settings and preferences
        </p>
      </div>

      <div className="mt-[1.375rem] bg-white rounded-xl p-5">
        <h1 className="font-semibold text-[1rem]">Platform Information</h1>
        <p className="text-[1rem] text-neutral-500">
          Manage your platform identity and contact details
        </p>

        <hr className="w-full mt-[1.5rem]" />

        <div className="flex flex-col gap-3 mt-[1.375rem] ">
          <label className="text-[0.875rem] font-bold">Platform Name</label>
          <input
            type="text"
            placeholder="Flourish Station"
            className="w-full h-[3.25rem] pl-3 rounded-lg border-[2px] border-neutral-300 focus:border-[2px] focus:border-blue-600 outline-none"
          />
          <p className="text-sm text-neutral-400">Used in emails & branding</p>
        </div>


        <div className=" flex flex-col gap-2 mt-[1.375rem] ">

            <div className="grid lg:grid-cols-2 grid-cols-1 gap-5 w-full">
                <div className="flex flex-col" >
                    <label className="text-[0.875rem] font-bold">Contact Email</label>
                    <input
                    type="text"
                    placeholder="flourishstation2026@gmail.com"
                    className="h-[3.25rem] pl-3 rounded-lg border-[2px] border-neutral-300 focus:border-[2px] focus:border-blue-600 outline-none"
                    />

                </div>
                <div className="flex flex-col">
                    <label className="text-[0.875rem] font-bold">Contact Phone</label>
                    <input
                    type="text"
                    placeholder="+234 9030203547"
                    className="h-[3.25rem] pl-3 rounded-lg border-[2px] border-neutral-300 focus:border-[2px] focus:border-blue-600 outline-none"
                    />
                    </div>
            </div>
          <p className="text-sm text-neutral-400">Public contact for station owners</p>
        </div>
      </div>

      <div className="mt-[1.375rem] p-5 bg-white rounded-xl">
        <p className="flex flex-col gap-3">
            <span className="text-[1.125rem] font-semibold leading-[100%]">Billing Settings</span>
            <span className="text-[1rem] text-neutral-400 leading-[150%]">
                Configure billing and payment preferences
            </span>
        </p>

        <hr className="w-full mt-[1.375rem]" />

        <div className="flex flex-col gap-2 mt-[1.375rem]">
            <h1 className="text-[1rem] font-bold leading-[100%]">Default Currency</h1>
            <input type="text" placeholder="₦ Nigeria naira" className="w-full h-[3.25rem] pl-3 rounded-lg border-[2px] border-neutral-300 focus:border-[2px] focus:border-blue-600 outline-none" />
            <p className="text-[0.875rem] text-neutral-400">Used for all pricing and invoices</p>
        </div>

      </div>
    </div>
  );
};

export default PageSettings;
