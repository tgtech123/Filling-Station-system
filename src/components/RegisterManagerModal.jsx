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
} from "lucide-react";
import { useState } from "react";
import ToggleSwitch from "./ToggleSwtich";
import Link from "next/link";

export default function RegisterManagerModal({ onclose }) {
  const [step, setStep] = useState(1);

  const handleNextStep = () => {
    setStep((prev) => prev + 1);
  };
  const handlePreviousStep = () => {
    setStep((prev) => prev - 1);
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
  ]
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
            <h5 className="font-semibold text-gray-600">
              Tell us about your filling station
            </h5>
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
              <select className="w-full p-2 border-2 border-gray-300 rounded-[8px]">
                <option>Dave</option>
                <option>Johnson</option>
              </select>
            </div>
            <div className="">
              <p className="text-sm font-semibold">Number of Pumps</p>
              <select className="w-full p-2 border-2 border-gray-300 rounded-[8px]">
                {Array.from({ length: 30 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
            <div className="">
              <p className="text-sm font-semibold">Operating Hours</p>
              <select className="w-full p-2 border-2 border-gray-300 rounded-[8px]">
                {Array.from({ length: 30 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <div className="">
              <p className="text-sm font-semibold">Tank Capacity</p>
              <input
                type="text"
                placeholder="e.g 100 Litres"
                className="border-2 border-gray-300 p-2 rounded-[8px] w-full "
              />
              <Phone className="text-gray-400 absolute top-7 left-2" />
            </div>
            <div className="">
              <p className="text-sm font-semibold">Average Monthly Revenue</p>
              <input
                type="text"
                placeholder="your av. monthly revenue"
                className="border-2 border-gray-300 p-2 rounded-[8px] w-full "
              />
            </div>
            <div className="">
              <p className="text-sm font-semibold">Staff Members</p>
              <select className="w-full p-2 border-2 border-gray-300 rounded-[8px]">
                {Array.from({ length: 30 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <div className="cols-span-1 lg:col-span-3">
              <p className="text-sm font-semibold">Fuel types offered</p>

              <div className="flex flex-wrap gap-3 lg:gap-10 text-[#737373] font-medium">
                <label className="flex gap-1 items-center">
                  <span>
                    <input type="checkbox" />
                  </span>
                  PMS
                </label>
                <label className="flex gap-1 items-center">
                  <span>
                    <input type="checkbox" />
                  </span>
                  AGO
                </label>
                <label className="flex gap-1 items-center">
                  <span>
                    <input type="checkbox" />
                  </span>
                  Diesel
                </label>
                <label className="flex gap-1 items-center">
                  <span>
                    <input type="checkbox" />
                  </span>
                  Kerosene
                </label>
                <label className="flex gap-1 items-center">
                  <span>
                    <input type="checkbox" />
                  </span>
                  Gas
                </label>
              </div>
            </div>
            <div className="col-span-1 lg:col-span-3">
              <p className="text-sm font-semibold">Additional services</p>

              <div className="flex flex-wrap gap-4  text-[#737373] font-medium">
                <label className="flex gap-1 items-center">
                  <span>
                    <input type="checkbox" />
                  </span>
                  Lubricant Sales
                </label>
                <label className="flex gap-1 items-center">
                  <span>
                    <input type="checkbox" />
                  </span>
                  Car Wash
                </label>
                <label className="flex gap-1 items-center">
                  <span>
                    <input type="checkbox" />
                  </span>
                  Convenience Store
                </label>
                <label className="flex gap-1 items-center">
                  <span>
                    <input type="checkbox" />
                  </span>
                  Auto Repair
                </label>
                <label className="flex gap-1 items-center">
                  <span>
                    <input type="checkbox" />
                  </span>
                  Oil Change
                </label>
                <label className="flex gap-1 items-center">
                  <span>
                    <input type="checkbox" />
                  </span>
                  Food Service
                </label>
              </div>
            </div>

            {/* </div> */}
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
            <h5>STEP 4 OF 4</h5>
            <h5>SECURITY AND NOTIFICATIONS</h5>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Password and Security */}
            <div className="border-2 h-fit p-4 rounded-[14px] border-gray-300">
              <h3 className="font-semibold">Password and Security</h3>
              <p className="text-sm text-gray-600">Set up strong password for your account</p>

              <div className="mt-6">
                <p className="text-sm font-semibold">New password</p>
                <input
                  type="text"
                  placeholder="Your password"
                  className="border-2 border-gray-300 rounded-[8px] w-full p-2"
                />
              </div>

              <div className="mt-4">
                <p className="text-sm font-semibold">Confirm new password</p>
                <input
                  type="text"
                  placeholder="Your password"
                  className="border-2 border-gray-300 rounded-[8px] w-full p-2"
                />
              </div>

              <div className="mt-8 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">2-FACTOR AUTHENTICATOR</h4>
                  <p>Highly recommended</p>
                </div>
                <ToggleSwitch />
              </div>
            </div>
            <div className="border-2 p-4 rounded-[14px] border-gray-300">
              <h3 className="font-semibold">Notification Preferences</h3>
              <p className="text-sm text-gray-600">Configure how you receive notifications</p>

              <div className="flex flex-col gap-4">
                  <div className="flex justify-between mt-6">
                    Email
                    <ToggleSwitch />
                  </div>
                  <div className="flex justify-between">
                    SMS
                    <ToggleSwitch />
                  </div>
                  <div className="flex justify-between">
                    Push
                    <ToggleSwitch />
                  </div>
                  <div className="flex justify-between">
                    Low Stock
                    <ToggleSwitch />
                  </div>
                  <div className="flex justify-between">
                    Mail
                    <ToggleSwitch />
                  </div>
                  <div className="flex justify-between">
                    Sales
                    <ToggleSwitch />
                  </div>
                  <div className="flex justify-between">
                    Staffs
                    <ToggleSwitch />
                  </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 items-center mt-2 mb-8">
            <input type="checkbox" />
            <p>I agree to the <span className="text-[#0080ff]">Terms of Service</span> and <span className="text-[#0080ff]">Privacy Policy</span></p>
          </div>

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
              Complete Setup
              <ArrowRight />
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
         <div
          className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full mx-auto 
                max-h-[80vh] overflow-y-auto scrollbar-hide "
        >
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
                <Link href="/role-selection" className="bg-[#0080ff] rounded-[8px] p-2 text-white">Access Dashboard</Link>
          </div>

        </div>
      )}

    </div>
  );
}
