"use client";
import React, { useRef, useState } from "react";
import { X, Save, SquarePen, Mail, Phone, Eye, EyeOff } from "lucide-react";
import Avatar from "@/components/Avatar";
import ImageUploadButton from "@/components/ImageUploadButton";
import useImageStore from "@/store/useImageStore";
import useAdminProfileStore from "@/store/useAdminProfileStore";
import axios from "axios";

const MyProfileModal = ({ isOpen, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isMessage, setIsMessage] = useState({ type: "", text: "" });

  const [adminId] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      return u.id || u._id || "admin-default";
    } catch {
      return "admin-default";
    }
  });
  const { setImage } = useImageStore();
  const { updateName, updateImage } = useAdminProfileStore();

  const [formData, setFormData] = useState({
    firstName: "Oboh",
    lastName: "Thankgod",
    emailAddress: "tgtech101@gmail.com",
    phoneNumber: "+234 7068690289",
  });

  const [tempData, setTempData] = useState(formData);
  const messageTimer = useRef(null);

  // ── Change Password state ──────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  if (!isOpen) return null;

  const handleSave = () => {
    clearTimeout(messageTimer.current);
    setFormData(tempData);
    setIsEditing(false);
    setIsMessage({ type: "success", text: "Profile updated successfully!" });
    messageTimer.current = setTimeout(
      () => setIsMessage({ type: "", text: "" }),
      3000
    );
    // Sync name to store + localStorage so Header/Sidebar update instantly
    updateName(tempData.firstName, tempData.lastName);
  };

  const handleCancel = () => {
    setTempData(formData);
    setIsEditing(false);
    setIsMessage({ type: "", text: "" });
  };

  const handleImageUpload = (uploadedUrl) => {
    setImage(adminId, uploadedUrl);
    updateImage(uploadedUrl);
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError("New password must contain at least one uppercase letter");
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setPasswordError("New password must contain at least one number");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match");
      return;
    }

    try {
      setPasswordLoading(true);
      const token = localStorage.getItem("token");
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API}/api/auth/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPasswordSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to change password"
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 z-50 w-full flex items-center justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col p-8 bg-white dark:bg-gray-800 w-[56.3125rem] max-h-[90vh] overflow-y-auto scrollbar-hide rounded-xl"
      >
        <span
          onClick={onClose}
          className="border-[1px] mt-[2rem] cursor-pointer border-neutral-600 rounded-full p-2 w-fit ml-auto"
        >
          <X size={26} />
        </span>

        {/* ── Header ──────────────────────────────────────── */}
        <div>
          <h1 className="text-[1.375rem] font-semibold leading-[100%]">
            My Profile
          </h1>
          <p className="text-[1rem] mt-2">
            Manage your profile information and security settings
          </p>

          <div className="flex justify-between mt-[2rem]">
            <div className="flex gap-7">
              {isEditing ? (
                <ImageUploadButton
                  userId={adminId}
                  onUploadComplete={handleImageUpload}
                  label="Change Picture"
                />
              ) : (
                <Avatar userId={adminId} size="lg" />
              )}

              <div className="flex flex-col gap-2">
                <h1 className="text-[1.275rem] font-semibold leading-[134%]">
                  {formData.firstName} {formData.lastName}
                </h1>
                <p className="text-[1rem] leading-[150%]">General Admin</p>
              </div>
            </div>

            {!isEditing ? (
              <button
                onClick={() => {
                  setTempData(formData);
                  setIsEditing(true);
                }}
                className="flex gap-3 bg-[#0080FF] w-[150px] h-[40px] text-white font-semibold rounded-lg cursor-pointer hover:bg-blue-700 items-center justify-center"
              >
                <SquarePen size={24} />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="flex gap-2 border border-neutral-300 w-[120px] h-[40px] text-neutral-700 font-semibold rounded-lg cursor-pointer hover:bg-neutral-100 items-center justify-center"
                >
                  <X size={18} />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex gap-2 bg-[#0080FF] w-[150px] h-[40px] text-white font-semibold rounded-lg cursor-pointer hover:bg-blue-700 items-center justify-center"
                >
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            )}
          </div>

          {isMessage.text && (
            <p
              className={`text-[0.875rem] font-medium mt-3 ${
                isMessage.type === "error" ? "text-red-500" : "text-green-500"
              }`}
            >
              {isMessage.text}
            </p>
          )}

          <hr className="border-[1px] border-neutral-200 mt-[2rem]" />
        </div>

        {/* ── Personal Information  */}
        <div className="mt-[2rem]">
          <div className="mb-[1.375rem]">
            <h1 className="text-[1rem] font-semibold leading-[150%] text-neutral-800">
              Personal Information
            </h1>
            <p className="mt-[4px] text-[0.875rem] leading-[150%]">
              Your personal details and contact information
            </p>
          </div>

          <form className="grid lg:grid-cols-2 grid-cols-1 gap-5">
            <div className="flex flex-col gap-2">
              <label className="font-bold text-[0.875rem] leading-[150%]">
                First name
              </label>
              <input
                type="text"
                name="firstName"
                value={isEditing ? tempData.firstName : formData.firstName}
                onChange={(e) =>
                  setTempData({ ...tempData, firstName: e.target.value })
                }
                disabled={!isEditing}
                className={`w-[25.656rem] h-[3.25rem] border-[1.8px] ${
                  !isEditing ? "bg-neutral-200 border-neutral-300" : ""
                } focus:border-[2px] focus:border-blue-500 border-neutral-300 focus:outline-none rounded-xl pl-3`}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-[0.875rem] leading-[150%]">
                Last name
              </label>
              <input
                type="text"
                name="lastName"
                value={isEditing ? tempData.lastName : formData.lastName}
                onChange={(e) =>
                  setTempData({ ...tempData, lastName: e.target.value })
                }
                disabled={!isEditing}
                className={`w-[25.656rem] h-[3.25rem] border-[1.8px] ${
                  !isEditing ? "bg-neutral-200 border-neutral-300" : ""
                } focus:border-[2px] focus:border-blue-500 border-neutral-300 focus:outline-none rounded-xl pl-3`}
              />
            </div>
            <div className="relative flex flex-col gap-2">
              <label className="font-bold text-[0.875rem] leading-[150%]">
                Email Address
              </label>
              <input
                type="text"
                name="emailAddress"
                value={
                  isEditing ? tempData.emailAddress : formData.emailAddress
                }
                onChange={(e) =>
                  setTempData({ ...tempData, emailAddress: e.target.value })
                }
                disabled={!isEditing}
                className={`w-[25.656rem] h-[3.25rem] border-[1.8px] ${
                  !isEditing ? "bg-neutral-200 border-neutral-300" : ""
                } focus:border-[2px] focus:border-blue-500 border-neutral-300 focus:outline-none rounded-xl pl-10`}
              />
              <Mail size={24} className="absolute mt-11 ml-3 text-neutral-500" />
            </div>
            <div className="relative flex flex-col gap-2">
              <label className="font-bold text-[0.875rem] leading-[150%]">
                Phone number
              </label>
              <input
                type="text"
                name="phoneNumber"
                value={isEditing ? tempData.phoneNumber : formData.phoneNumber}
                onChange={(e) =>
                  setTempData({ ...tempData, phoneNumber: e.target.value })
                }
                disabled={!isEditing}
                className={`w-[25.656rem] h-[3.25rem] border-[1.8px] ${
                  !isEditing ? "bg-neutral-200 border-neutral-300" : ""
                } focus:border-[2px] focus:border-blue-500 border-neutral-300 focus:outline-none rounded-xl pl-10`}
              />
              <Phone className="absolute mt-11 ml-3 text-neutral-500" />
            </div>
          </form>
        </div>

        {/* ── Change Password  */}
        <hr className="my-6 border-gray-200" />

        <div className="mb-[1.375rem]">
          <h3 className="text-[1rem] font-semibold leading-[150%] text-neutral-800">
            Change Password
          </h3>
          <p className="mt-[4px] text-[0.875rem] leading-[150%]">
            Update your account password
          </p>
        </div>

        <div className="grid lg:grid-cols-2 grid-cols-1 gap-5">
          {/* Current Password */}
          <div className="relative flex flex-col gap-2">
            <label className="font-bold text-[0.875rem] leading-[150%]">
              Current Password
            </label>
            <input
              type={showCurrent ? "text" : "password"}
              placeholder="*********************"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-[25.656rem] h-[3.25rem] border-[1.8px] focus:border-[2px] focus:border-blue-500 border-neutral-300 focus:outline-none rounded-xl pl-3 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((p) => !p)}
              className="absolute right-3 top-11 text-neutral-400"
            >
              {showCurrent ? <EyeOff size={24} /> : <Eye size={24} />}
            </button>
          </div>

          {/* New Password */}
          <div className="relative flex flex-col gap-2">
            <label className="font-bold text-[0.875rem] leading-[150%]">
              New Password
            </label>
            <input
              type={showNew ? "text" : "password"}
              placeholder="*********************"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-[25.656rem] h-[3.25rem] border-[1.8px] focus:border-[2px] focus:border-blue-500 border-neutral-300 focus:outline-none rounded-xl pl-3 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNew((p) => !p)}
              className="absolute right-3 top-11 text-neutral-400"
            >
              {showNew ? <EyeOff size={24} /> : <Eye size={24} />}
            </button>
          </div>

          {/* Confirm New Password */}
          <div className="relative flex flex-col gap-2">
            <label className="font-bold text-[0.875rem] leading-[150%]">
              Confirm New Password
            </label>
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="*********************"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-[25.656rem] h-[3.25rem] border-[1.8px] focus:border-[2px] focus:border-blue-500 border-neutral-300 focus:outline-none rounded-xl pl-3 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((p) => !p)}
              className="absolute right-3 top-11 text-neutral-400"
            >
              {showConfirm ? <EyeOff size={24} /> : <Eye size={24} />}
            </button>
          </div>
        </div>

        {passwordError && (
          <p className="text-[0.875rem] font-medium text-red-500 mt-3">
            {passwordError}
          </p>
        )}
        {passwordSuccess && (
          <p className="text-[0.875rem] font-medium text-green-500 mt-3">
            {passwordSuccess}
          </p>
        )}

        <div className="mt-5 mb-4">
          <button
            onClick={handleChangePassword}
            disabled={passwordLoading}
            className="flex gap-2 bg-[#0080FF] px-6 h-[40px] text-white font-semibold rounded-lg cursor-pointer hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed items-center justify-center"
          >
            {passwordLoading ? "Changing..." : "Change Password"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyProfileModal;
