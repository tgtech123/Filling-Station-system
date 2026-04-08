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
import useAdminStore from "@/store/useAdminStore";
import toast from "react-hot-toast";

const ActionModal = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;

  const [isToggle, setIsToggle] = useState(false);
  const [isSuspendOpen, setIsSuspendOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { updateStationStatus, deleteStation } = useAdminStore();

  const stationId = data?._raw?._id || data?._raw?.id || data?.id;
  const stationName = data?.stationName || "this station";

  const handleSuspend = async () => {
    setIsLoading(true);
    try {
      const res = await updateStationStatus(stationId, false);
      if (res.success) {
        setIsSuspendOpen(true);
      } else {
        setIsErrorOpen(true);
      }
    } catch {
      setIsErrorOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${stationName}"? This cannot be undone.`)) return;
    setIsDeleting(true);
    try {
      const res = await deleteStation(stationId);
      if (res.success) {
        toast.success(`"${stationName}" deleted successfully`);
        onClose();
      } else {
        toast.error(res.error || "Failed to delete station");
      }
    } catch {
      toast.error("An error occurred while deleting");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 flex z-50 justify-center items-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-md lg:w-[36.8125rem] lg:max-h-[90vh] max-h-[85vh] overflow-y-auto p-8 w-fit scrollbar-hide"
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
            {/* Company info */}
            <div className="mt-[1rem] mb-[2rem]">
              <div className="flex gap-6">
                <span className="bg-blue-500 text-white text-[2rem] flex items-center justify-center font-semibold rounded-full h-22 w-22">
                  {stationName.slice(0, 2).toUpperCase()}
                </span>
                <div className="flex flex-col gap-4">
                  <h1 className="text-[1.125rem] font-semibold">{stationName}</h1>
                  <p className="flex gap-2 text-neutral-500 font-semibold text-[1rem] leading-[150%]">
                    <MapPin size={24} />
                    {data?.owner || data?._raw?.location || "—"}
                  </p>
                  <button
                    className={`w-fit px-3 h-[29px] font-semibold text-[14px] rounded-2xl ${
                      data?.status === "Active"
                        ? "bg-[#F1F9F1] text-[#07834B]"
                        : "bg-[#FEF2E5] text-[#F57C00]"
                    }`}
                  >
                    {data?.status || "—"}
                  </button>
                </div>
              </div>
            </div>
            {/* Maintenance toggle */}
            <div className="flex flex-col gap-5">
              <button
                onClick={() => setIsToggle(!isToggle)}
                className="cursor-pointer flex justify-end"
              >
                {isToggle ? (
                  <BsToggleOn className="text-blue-700 transition-transform duration-200 scale-105" size={28} />
                ) : (
                  <BsToggleOff size={28} className="text-neutral-600 transition-transform duration-200 scale-105" />
                )}
              </button>
              <p className="text-neutral-500 text-[1rem] font-medium">
                Maintenance mode
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-4">
            <div className="flex gap-7">
              <span className="flex gap-2">
                <Mail size={24} />
                <h1 className="text-[1rem] font-medium text-[#616161]">
                  {data?._raw?.owner?.email || data?._raw?.email || "—"}
                </h1>
              </span>
              <span className="flex gap-2">
                <Phone size={24} />
                <h1 className="text-[1rem] font-medium text-[#616161]">
                  {data?._raw?.owner?.phone || data?._raw?.phone || "—"}
                </h1>
              </span>
            </div>
            <span className="flex gap-3">
              <CalendarDays size={24} />
              <h1 className="text-[1rem] font-medium text-[#616161]">
                Registered{" "}
                {data?._raw?.createdAt
                  ? new Date(data._raw.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </h1>
            </span>
          </div>

          {/* Owner info */}
          <div className="border-t-[2px] p-2 lg:p-4 border-b-[2px] border-gray-200">
            <div className="flex lg:gap-5 gap-3 items-center">
              <div className="bg-[#fbf2e7] w-[40px] h-[40px] flex items-center justify-center rounded-sm">
                <User size={22} className="text-[#FF8C05]" />
              </div>
              <h1 className="text-[1rem] font-semibold">Owner Information</h1>
            </div>
            <div className="grid lg:grid-cols-2 grid-cols-1">
              <span className="flex flex-col gap-1">
                <span className="text-[#616161] text-[0.875rem]">First Name</span>
                <span className="text-[0.895rem] font-semibold leading-[140%]">
                  {data?._raw?.owner?.firstName || "—"}
                </span>
              </span>
              <span className="flex flex-col mb-[1rem] gap-1">
                <span className="text-[#616161] text-[0.875rem]">Last Name</span>
                <span className="text-[0.895rem] font-semibold leading-[140%]">
                  {data?._raw?.owner?.lastName || "—"}
                </span>
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-[#616161] text-[0.875rem]">Email Address</span>
                <span className="text-[0.895rem] font-semibold leading-[140%]">
                  {data?._raw?.owner?.email || "—"}
                </span>
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-[#616161] text-[0.875rem]">Phone</span>
                <span className="text-[0.895rem] font-semibold leading-[140%]">
                  {data?._raw?.owner?.phone || "—"}
                </span>
              </span>
            </div>
          </div>

          {/* Subscription info */}
          <div className="border-b-[2px] border-gray-200 lg:p-4 p-2">
            <div className="flex lg:gap-5 gap-3 items-center mb-[1.235rem]">
              <div className="bg-[#fbf2e7] w-[40px] h-[40px] flex items-center justify-center rounded-sm">
                <TbTargetArrow size={22} className="text-[#FF8C05]" />
              </div>
              <h1 className="text-[1rem] font-semibold">Subscription Information</h1>
            </div>
            <div className="mt-[1rem] grid lg:grid-cols-2 grid-cols-1">
              <span className="flex flex-col gap-1">
                <span className="text-[#616161] text-[0.895rem]">Current Plan</span>
                <span className="text-[1rem] font-semibold bg-[#F3F5F9] rounded-2xl w-fit px-3 h-[32px] text-[#0156D1] text-center flex items-center justify-center">
                  {data?.plan || "—"}
                </span>
              </span>
              <span className="flex flex-col mb-[1rem] gap-1">
                <span className="text-[#616161] text-[0.795rem]">Status</span>
                <span className={`text-[1rem] font-semibold rounded-2xl w-fit px-3 h-[32px] text-center flex items-center justify-center ${
                  data?.status === "Active"
                    ? "bg-[#F1F9F1] text-[#07834B]"
                    : "bg-[#FEF2E5] text-[#F57C00]"
                }`}>
                  {data?.status || "—"}
                </span>
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-[#616161] text-[0.785rem]">Expiry</span>
                <span className="text-[0.895rem] font-semibold leading-[140%]">
                  {data?.expiryDate || "—"}
                </span>
              </span>
            </div>
          </div>

          <div className="mt-[1rem]">
            <div className="flex gap-3 items-center">
              <div className="bg-[#FFF1F3] rounded-md h-[2.5rem] w-[2.5rem] flex items-center justify-center">
                <Image src="/material-zoom.png" height={20} width={20} alt="zoom" />
              </div>
              <div>
                <span className="text-[1rem] font-semibold">Action </span>
                <p className="text-neutral-500 text-[0.875rem] font-medium">
                  Manage this station's account and subscription
                </p>
              </div>
            </div>
          </div>

          <div className="mt-[1.235rem] flex flex-col gap-4">
            <button
              onClick={handleSuspend}
              disabled={isLoading}
              className="flex gap-2 items-center cursor-pointer justify-center text-[#F57C00] border-[1px] border-[#F57C00] w-full py-2 rounded-full text-[0.875rem] font-medium disabled:opacity-50"
            >
              <Pause size={18} />
              {isLoading ? "Suspending..." : "Temporary Suspend Access"}
            </button>
            <button className="flex gap-2 items-center cursor-pointer justify-center border-[1px] border-[#D0D5DD] w-full py-2 rounded-full text-[0.875rem] font-medium">
              <MdLockReset size={18} />
              Reset Owner Password
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex gap-2 items-center cursor-pointer justify-center text-[#B71C1C] border-[1px] border-[#B71C1C] w-full py-2 rounded-full text-[0.875rem] font-medium disabled:opacity-50"
            >
              <Trash2 size={18} />
              {isDeleting ? "Deleting..." : "Delete Station"}
            </button>
          </div>

          <SuspendSuccessModal
            isOpen={isSuspendOpen}
            onClose={() => setIsSuspendOpen(false)}
            stationName={stationName}
          />
          <SuspendErrorModal
            isOpen={isErrorOpen}
            onClose={() => setIsErrorOpen(false)}
            stationName={stationName}
          />
        </div>
      </div>
    </div>
  );
};

export default ActionModal;
