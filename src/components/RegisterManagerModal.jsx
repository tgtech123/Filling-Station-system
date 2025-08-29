"use client";

import {
    ArrowLeft,
  ArrowRight,
  Mail,
  MapPin,
  Phone,
  TriangleAlert,
  X,
} from "lucide-react";
import { useState } from "react";

export default function RegisterManagerModal({ onclose }) {
  const [step, setStep] = useState(1);

  const handleNextStep = () => {
    setStep((prev) => prev + 1);
  };
  const handlePreviousStep = () => {
    setStep((prev) => prev - 1);
  };
  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
      {step === 1 && (
        // <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full mx-auto min-h-[400px] overflow-y-scroll">
        <div
          className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full mx-auto 
                max-h-[80vh] overflow-y-auto scrollbar-hide"
        >
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

          <div className="p-2 mt-6 bg-gray-100 flex  font-semibold text-gray-600 justify-between items-center">
            <h5>STEP 1 OF 4</h5>
            <h5>PERSONAL INFORMATION</h5>
          </div>

          <div className="mt-4">
            <h5 className="font-semibold text-gray-600">Let's know you</h5>
            <p className="text-sm text-gray-600">
              Tell us about yourself to personalize your account
            </p>
          </div>

          <form className="mt-6 grid w-full grid-cols-1 lg:grid-cols-2 gap-2">
            {/* <div className="w-full flex gap-4 flex-col lg:flex-row"> */}
            <div className="">
              <p className="text-sm font-semibold">First name</p>
              <input
                type="text"
                placeholder="Dave"
                className="border-2 border-gray-300 p-2 rounded-[8px] w-full"
              />
            </div>
            <div className="">
              <p className="text-sm font-semibold">Last name</p>
              <input
                type="text"
                placeholder="Johnson"
                className="border-2 border-gray-300 p-2 rounded-[8px] w-full "
              />
            </div>
            <div className="relative">
              <p className="text-sm font-semibold">Email Address</p>
              <input
                type="email"
                placeholder="davejohnson234@gmail.com"
                className="border-2 pl-10 border-gray-300 p-2 rounded-[8px] w-full "
              />
              <Mail className="text-gray-400 absolute top-7 left-2" />
            </div>

            <div className="relative">
              <p className="text-sm font-semibold">Phone Number</p>
              <input
                type="text"
                placeholder="08134249483"
                className="border-2 border-gray-300 p-2 pl-10 rounded-[8px] w-full "
              />
              <Phone className="text-gray-400 absolute top-7 left-2" />
            </div>
            <div className="relative lg:col-span-2">
              <p className="text-sm font-semibold">Address</p>
              <input
                type="text"
                placeholder="your house address..."
                className="border-2 border-gray-300 p-2 pl-10 rounded-[8px] w-full "
              />
              <MapPin className="text-gray-400 absolute top-7 left-2" />
            </div>
            <div className="">
              <p className="text-sm font-semibold">City</p>
              <input
                type="text"
                placeholder="your city..."
                className="border-2 border-[#c0bebe] p-2 bg-[#e4e3e3] rounded-[8px] w-full "
              />
              <MapPin className="text-gray-400 absolute top-7 left-2" />
            </div>
            <div className="">
              <p className="text-sm font-semibold">State</p>
              <input
                type="text"
                placeholder="your state..."
                className="border-2 border-[#c0bebe] p-2 bg-[#e4e3e3] rounded-[8px] w-full "
              />
            </div>
            <div className="">
              <p className="text-sm font-semibold">Zip Code</p>
              <input
                type="text"
                placeholder="45869"
                className="border-2 border-gray-300 p-2 rounded-[8px] w-full "
              />
            </div>
            <div className="relative">
              <p className="text-sm font-semibold">Emergency Contact</p>
              <input
                type="text"
                placeholder="08134249483"
                className="border-2 border-gray-gray-300 pl-10 p-2  rounded-[8px] w-full "
              />
              <Phone className="text-gray-400 absolute top-7 left-2" />
            </div>
            {/* </div> */}
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
        // <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full mx-auto min-h-[400px] overflow-y-scroll">
        <div
          className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full mx-auto 
                max-h-[80vh] overflow-y-auto scrollbar-hide"
        >
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

          <div className="p-2 mt-6 bg-gray-100 flex  font-semibold text-gray-600 justify-between items-center">
            <h5>STEP 2 OF 4</h5>
            <h5>STATION INFORMATION</h5>
          </div>

          <div className="mt-4">
            <h5 className="font-semibold text-gray-600">Tell us about your filling station</h5>
            <p className="text-sm text-gray-600">
              Help us configure the system for your specific location
            </p>
          </div>

          <form className="mt-6 grid w-full grid-cols-1 lg:grid-cols-2 gap-2">
            {/* <div className="w-full flex gap-4 flex-col lg:flex-row"> */}
            <div className="">
              <p className="text-sm font-semibold">Station name</p>
              <input
                type="text"
                placeholder="Station 2"
                className="border-2 border-gray-300 p-2 rounded-[8px] w-full"
              />
            </div>
            <div className="">
              <p className="text-sm font-semibold">Station ID</p>
              <input
                type="text"
                placeholder="0046"
                className="border-2 border-gray-300 p-2 rounded-[8px] w-full "
              />
            </div>
            <div className="relative">
              <p className="text-sm font-semibold">Station Email Address</p>
              <input
                type="email"
                placeholder="station2@gmail.com"
                className="border-2 pl-10 border-gray-300 p-2 rounded-[8px] w-full "
              />
              <Mail className="text-gray-400 absolute top-7 left-2" />
            </div>

            <div className="relative">
              <p className="text-sm font-semibold">Station Phone Number</p>
              <input
                type="text"
                placeholder="08134249483"
                className="border-2 border-gray-300 p-2 pl-10 rounded-[8px] w-full "
              />
              <Phone className="text-gray-400 absolute top-7 left-2" />
            </div>
            <div className="relative lg:col-span-2">
              <p className="text-sm font-semibold">Station Address</p>
              <input
                type="text"
                placeholder="your station address..."
                className="border-2 border-gray-300 p-2 pl-10 rounded-[8px] w-full "
              />
              <MapPin className="text-gray-400 absolute top-7 left-2" />
            </div>
            <div className="">
              <p className="text-sm font-semibold">Station City</p>
              <input
                type="text"
                placeholder="your station city..."
                className="border-2 border-[#c0bebe] p-2 bg-[#e4e3e3] rounded-[8px] w-full "
              />
              <MapPin className="text-gray-400 absolute top-7 left-2" />
            </div>
            <div className="">
              <p className="text-sm font-semibold">Station Country</p>
              <input
                type="text"
                placeholder="your station country..."
                className="border-2 border-[#c0bebe] p-2 bg-[#e4e3e3] rounded-[8px] w-full "
              />
            </div>
            <div className="">
              <p className="text-sm font-semibold">Zip Code</p>
              <input
                type="text"
                placeholder="45869"
                className="border-2 border-gray-300 p-2 rounded-[8px] w-full "
              />
            </div>
            <div className="relative">
              <p className="text-sm font-semibold">License Number</p>
              <input
                type="text"
                placeholder="058"
                className="border-2 border-gray-gray-300 p-2  rounded-[8px] w-full "
              />
            </div>
            <div className="relative">
              <p className="text-sm font-semibold">Tax ID</p>
              <input
                type="text"
                placeholder="47058"
                className="border-2 border-gray-gray-300 p-2  rounded-[8px] w-full "
              />
            </div>
            <div className="relative">
              <p className="text-sm font-semibold">Established Date</p>
              <input
                type="text"
                placeholder="09034547058"
                className="border-2 border-gray-gray-300 p-2  rounded-[8px] w-full "
              />
            </div>
            {/* </div> */}
          </form>
          
          <div className="flex justify-between gap-3 p-6">
            <button 
                onClick={handlePreviousStep}
                className="py-2 px-4 rounded-md flex items-center gap-2 border-1 border-[#0080ff]"
            >
                <ArrowLeft />
                Previous
            </button>
            <button
              onClick={handleNextStep}
              className="px-4 py-2 flex items-center gap-2 text-white rounded-md bg-[#0080ff] transition-colors"
            >
              Save & Continue
              <ArrowRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
