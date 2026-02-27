"use client";
import React, { useState } from "react";
import {
  X,
  MapPin,
  User,
  Phone,
  Pause,
  Trash2,
  Mail,
  CalendarDays,
} from "lucide-react";
import { BsToggleOn, BsToggleOff } from "react-icons/bs";
import { TbTargetArrow } from "react-icons/tb";
import { MdLockReset } from "react-icons/md";
import Image from "next/image";
import SuspendSuccessModal from "./SuspendSuccessModal";
import SuspendErrorModal from "./SuspendErrorModal";

const ActionModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [isToggle, setIsToggle] = useState(false);
  const [isSuspendOpen, setIsSuspendOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isErrorOpen, setIsErrorOpen] = useState(false);

  const handleSuspend = async () => {
    setIsLoading(true);

    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          const isSuspend = false;
          isSuspend ? resolve() : reject(new Error("Suspension failed"));
        }, 1000);
      });

      setIsSuspendOpen(true);

    } catch (error) {
      setIsErrorOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 flex z-50 justify-center items-center "
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className=" relative bg-white rounded-md lg:w-[36.8125rem] lg:max-h-[90vh] max-h-[85vh] overflow-y-auto p-8 w-fit scrollbar-hide "
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-neutral-200 border-1px border-neutral-900 hover:scale-105 hover:bg-gray-100 rounded-full p-1 transition"
        >
          <X size={24} className="text-neutral-700" />
        </button>
        <h1 className="text-[1.385rem] font-semibold leading-[100%] mb-[1rem]">
          Station Details
        </h1>

        <hr className="border-1 mb-[2rem]" />

        <div>
          <div className="flex justify-between">
            {/* left hand company info section */}
            <div className="mt-[1rem] mb-[2rem]">
              <div className="flex gap-6">
                <span className="bg-blue-500 text-white text-[2rem] flex items-center justify-center font-semibold rounded-full h-22 w-22 ">
                  EM
                </span>
                <div className="flex flex-col gap-4">
                  <h1 className="text-[1.125rem] font-semibold">
                    Exxon Mobile East
                  </h1>
                  <p className="flex gap-2 text-neutral-500 font-semibold text-[1rem] leadig-[150%]">
                    <MapPin size={24} />
                    Abuja, Nigeria
                  </p>
                  <button className="bg-[#F1F9F1] text-[#07834B] w-[60px] h-[29px] font-semibold text-[14px] rounded-2xl">
                    Active
                  </button>
                </div>
              </div>
            </div>
            {/* right hand toggle section */}
            <div className="flex flex-col gap-5">
              <button
                onClick={() => setIsToggle(!isToggle)}
                className="cursor-pointer flex justify-end "
              >
                {isToggle ? (
                  <BsToggleOn
                    className=' text-blue-700 transition-transform duration-200 scale-105"'
                    size={28}
                  />
                ) : (
                  <BsToggleOff
                    size={28}
                    className="text-neutral-600 transition-transform duration-200 scale-105"
                  />
                )}
              </button>
              <p className="text-neutral-500 text-[1rem] font-medium">
                Maintenance mode
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-4 ">
            <div className="flex gap-7">
              <span className="flex gap-2">
                <Mail size={24} />
                <h1 className="text-[1rem] font-medium text-[#616161]">
                  {" "}
                  john.doe@company.com
                </h1>
              </span>
              <span className="flex gap-2">
                <Phone size={24} />
                <h1 className="text-[1rem] font-medium text-[#616161]">
                  +234 9030 203547
                </h1>
              </span>
            </div>

            <span className="flex gap-3">
              <CalendarDays size={24} />
              <h1 className="text-[1rem] font-medium text-[#616161]">
                Registered Dec. 2025
              </h1>
            </span>
          </div>

          <div className="border-t-[2px] p-2 lg:p-4 border-b-[2px] border-gray-200">
            <div className="flex lg:gap-5 gap-3 items-center ">
              <div className="bg-[#fbf2e7] w-[40px] h-[40px] flex items-center justify-center rounded-sm ">
                <User size={22} className="text-[#FF8C05]" />
              </div>
              <h1 className="text-[1rem] font-semibold">Owner Information</h1>
            </div>
            {/* The ownership info */}
            <div className=" grid lg:grid-cols-2 grid-cols-1 ">
              <span className="flex flex-col gap-1 ">
                <span className="text-[#616161] text-[0.875rem]">
                  First Name
                </span>
                <span className="text-[0.895rem] font-semibold leading-[140%]">
                  Dickson
                </span>
              </span>
              <span className="flex flex-col mb-[1rem] gap-1 ">
                <span className="text-[#616161] text-[0.875rem]">
                  Last Name
                </span>
                <span className="text-[0.895rem] font-semibold leading-[140%]">
                  Dickson
                </span>
              </span>
              <span className="flex flex-col gap-1 ">
                <span className="text-[#616161] text-[0.875rem]">
                  Email Address
                </span>
                <span className="text-[0.895rem] font-semibold leading-[140%]">
                  johhn.doe@gmail.com
                </span>
              </span>
              <span className="flex flex-col gap-1 ">
                <span className="text-[#616161] text-[0.875rem]">Phone</span>
                <span className="text-[0.895rem] font-semibold leading-[140%]">
                  +90 243 5645394
                </span>
              </span>
            </div>
          </div>
          {/* the subscription infor */}
          <div className="border-b-[2px] border-gray-200 lg:p-4 p-2">
            <div className="flex lg:gap-5 gap-3 items-center mb-[1.235rem]">
              <div className="bg-[#fbf2e7] w-[40px] h-[40px] flex items-center justify-center rounded-sm ">
                <TbTargetArrow size={22} className="text-[#FF8C05]" />
              </div>
              <h1 className="text-[1rem] font-semibold">
                Subscription Information
              </h1>
            </div>
            <div className="mt-[1rem] grid lg:grid-cols-2 grid-cols-1 ">
              <span className="flex flex-col gap-1 ">
                <span className="text-[#616161] text-[0.895rem]">
                  Current Plan
                </span>
                <span className="text-[1rem] font-semibold bg-[#F3F5F9] rounded-2xl w-[61px] h-[32px] text-[#0156D1] text-center flex items-center justify-center ">
                  Prime
                </span>
              </span>
              <span className="flex flex-col mb-[1rem] gap-1 ">
                <span className="text-[#616161] text-[0.795rem]">Status</span>
                <span className="text-[1rem] font-semibold bg-[#F1F9F1] rounded-2xl w-[61px] h-[32px] text-[#07834B] text-center flex items-center justify-center ">
                  Active
                </span>
              </span>
              <span className="flex flex-col gap-1 ">
                <span className="text-[#616161] text-[0.785rem]">
                  Start Date
                </span>
                <span className="text-[0.895rem] font-semibold leading-[140%]">
                  December 1, 2024
                </span>
              </span>
              <span className="flex flex-col gap-1 ">
                <span className="text-[#616161] text-[0.785rem]">Expiry</span>
                <span className="text-[0.895rem] font-semibold leading-[140%]">
                  December 1, 2025
                </span>
              </span>
            </div>
          </div>

          <div className="mt-[1rem]">
            <div className="flex gap-3 items-center ">
              <div className="bg-[#FFF1F3] rounded-md h-[2.5rem] w-[2.5rem] flex items-center justify-center ">
                <Image
                  src="/material-zoom.png"
                  height={20}
                  width={20}
                  alt="zoom"
                />
              </div>
              <div>
                <span className="text-[1rem] font-semibold">Action </span>
                <p className="text-neutral-500 text-[0.875rem] font-medium">
                  Manage this station’s account and subscription
                </p>
              </div>
            </div>
          </div>

          <div className="mt-[1.235rem] flex flex-col gap-4">
            <button
              onClick={handleSuspend}
              disabled={isLoading}
              className="flex gap-2 items-center cursor-pointer justify-center text-[#F57C00] border-[1px] border-[#F57C00] w-full py-2 rounded-full text-[0.875rem] font-medium"
            >
              <Pause size={18} />
              {isLoading
                ? "Temporary Suspending...."
                : " Temporary Suspend Access"}
            </button>
            <button className="flex gap-2 items-center cursor-pointer justify-center border-[1px] border-[#D0D5DD] w-full py-2 rounded-full text-[0.875rem] font-medium">
              <MdLockReset size={18} />
              Reset Owner Password
            </button>
            <button className="flex gap-2 items-center cursor-pointer justify-center text-[#B71C1C] border-[1px] border-[#B71C1C] w-full py-2 rounded-full text-[0.875rem] font-medium">
              <Trash2 size={18} />
              Delete Station
            </button>
          </div>
          <SuspendSuccessModal
            isOpen={isSuspendOpen}
            onClose={() => setIsSuspendOpen(false)}
          />
          <SuspendErrorModal
            isOpen={isErrorOpen}
            onClose={() => setIsErrorOpen(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default ActionModal;
