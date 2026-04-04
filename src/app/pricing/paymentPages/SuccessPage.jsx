import { Mail, Box, ChevronRight, ArrowRight } from "lucide-react";
import Image from "next/image";
import React from "react";

const SuccessPage = () => {
  return (
    <div className="">
      {/* lg:w-[34.9375rem] w-full h-auto lg:p-5 p-2 */}
      <div className="flex flex-col items-center justify-center ">
        <Image
          src="/Container.svg"
          height={136}
          width={136}
          alt="container"
          className=" w-[8.5rem] h-[8.5rem]"
        />
        <h1 className="text-[1.75rem] font-semibold leading-[100%] mt-[1rem]">
          Payment Successful
        </h1>
        <p className="mt-[1rem] text-[1rem] text-neutral-400 font-medium leading-[150%]">
          Your subscription has been activated successfully
        </p>
      </div>

      <div className="bg-[#EFF6FF] border-[1px] border-[#D9EDFF] rounded-md mt-[2.125rem] lg:p-5 p-2 flex gap-3 text-[#1A71F6]">
        <span>
          <Mail size={26} />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-[1.125rem] font-medium">Login Details Sent!</h1>

          <p className="text-[0.935rem]">
            Your login credentials have been sent to <span className="font-bold">fillingstation@example.com</span>.
            Please check your inbox (and spam folder) to access your account.
          </p>
        </div>
      </div>

      <hr className="border-[1.6px] border-neutral-300 w-full mt-[2.125rem] mb-[2.125rem]"/>

      
        <p className="flex gap-4 font-semibold mb-[2rem]">
          <Box size={26} />
          <span className="text-[1.125rem] font-semibold">Transaction Details</span>
        </p>

        <div className="flex flex-col gap-5">
            <div className="flex justify-between">
              <h1 className="text-[#717182] font-medium text-[0.985rem]">Amount Paid</h1>
              <span className="text-[1.125rem] font-bold leading-[100%]">NGN 25,000.00</span>
            </div>
            <div className="flex justify-between">
              <h1 className="text-[#717182] font-medium text-[0.985rem]">Subscription Plan</h1>
              <span className="text-[0.875rem] font-bold leading-[100%] bg-[#ECEEF2] px-2 py-1 rounded-lg">Premium plan</span>
            </div>
            <div className="flex justify-between">
              <h1 className="text-[#717182] font-medium text-[0.985rem]">Payment Method</h1>
              <span className="text-[1.125rem] font-bold leading-[100%]">Bank Transfer</span>
            </div>
            <div className="flex justify-between">
              <h1 className="text-[#717182] font-medium text-[0.985rem]">Transaction ID</h1>
              <span className="text-[1.125rem] font-bold leading-[100%]">TXN-2026032400123</span>
            </div>
            <div className="flex justify-between">
              <h1 className="text-[#717182] font-medium text-[0.985rem]">Date & Time</h1>
              <span className="text-[1.125rem] font-bold leading-[100%]">March 24, 2026 at 2:30 PM</span>
            </div>

        </div>
            
      <hr className="border-[1.6px] border-neutral-300 w-full mt-[2.125rem] mb-[2.125rem]"/>
      
      <div className="bg-[#F0FDF4] border-[1px] border-[#B9F8CF] rounded-lg w-full lg:p-5 p-2 flex flex-col gap-[0.4375rem]">
        <h1 className="text-[1rem] font-semibold leading-[150%] text-[#0D542B]">What's Next?</h1>
        <p className="text-[#016630] flex gap-3">
          <ChevronRight size={22}/>
          <span className="text-[0.875rem] leading-[150%]">Check your email for login credentials</span>
        </p>
        <p className="text-[#016630] flex gap-3">
          <ChevronRight size={22}/>
          <span className="text-[0.875rem] leading-[150%]">Login to your filling station management dashboard</span>
        </p>
        <p className="text-[#016630] flex gap-3">
          <ChevronRight size={22}/>
          <span className="text-[0.875rem] leading-[150%]">Complete your station profile setup</span>
        </p>

      </div>

      <div className="flex flex-col items-center justify-center gap-4 mt-[2rem]">
        <button className="w-full text-[1rem] cursor-pointer hover:bg-blue-700 hover:scale-105 transition translate-x-0 h-[3.25rem] bg-blue-500 rounded-full flex items-center justify-center gap-3 font-bold text-white">
          Go to Login
          <ArrowRight size={24}/>
        </button>
        <button className="text-[1rem] font-bold cursor-pointer ">
          Need help?
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;
