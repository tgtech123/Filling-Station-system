"use client";
import React, { useRef, useState } from "react";
import { X, Save, SquarePen, Mail, Phone, EyeOff, Eye } from "lucide-react";
import Image from "next/image";
import CloudinaryUploader from "@/components/CloudinaryUploader";
import { useImageStore } from "@/store/useImageStore";

const MyProfileModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null; 
  const [isToggleOne, setIsToggleOne] = useState(false)
  const [isHiddenTwo, setIsHiddenTwo] = useState(false)
  const [isHiddenThree, setIsHiddenThree] = useState(false)

  const [isEditing, setIsEditing] = useState(false);

  const USER_ID = "admin-user-1"
  const {getUserImage, setUserImage} = useImageStore()

  const storedImage = getUserImage(USER_ID) || "/john-melo-2.png"

  const [formData, setFormData] = useState({
    firstName: "Oboh",
    lastName: "Thankgod",
    emailAddress: "tgtech101@gmail.com",
    phoneNumber: "+234 7068690289",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    profileImage: storedImage,
  });

  const [tempData, setTempData] = useState(formData);
  const [isMessage, setIsMessage] = useState({type: "", text: ""})

  const messageTimer = useRef(null)

  const handleSave = ()=>{
    clearTimeout(messageTimer.current)
    if(tempData.newPassword !== tempData.confirmNewPassword){
      setIsMessage({type: "error", text:"Passwords do not match! ☹️😦"})
      messageTimer.current = setTimeout(()=> setIsMessage({type: "", text: ""}), 3000)
      return;
    }
    setFormData(tempData)
    setIsEditing(false)
    setIsMessage({type:"Password match! 😍", text: "Password match!. Profile updated successfully! 😂😍"})
    messageTimer.current = setTimeout(()=> setIsMessage({type:"", text:""}), 3000)
  }

  const handleCancel = () =>{
    setTempData(formData)
    setIsEditing(false)
    setIsMessage({type:"", text: ""})
  }

  const handleImageUpload = (uploadedUrl) =>{
    setUserImage(USER_ID, uploadedUrl)
    setTempData(prev => ({...prev, profileImage: uploadedUrl })) // saves the image to temp until user hits Save
  }
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 z-50 w-full flex items-center justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col p-8 bg-white w-[56.3125rem] max-h-[90vh] h-[53.94rem] overflow-y-auto scrollbar-hide rounded-xl  "
      >
        <span
          onClick={onClose}
          className="border-[1px] mt-[2rem] cursor-pointer border-neutral-600 rounded-full p-2 w-fit ml-auto "
        >
          <X size={26} />
        </span>

        <div>
          <h1 className="text-[1.375rem] font-semibold leading-[100%] ">
            My Profile
          </h1>
          <p className="text-[1rem] mt-2">
            Manage your profile information and security settings
          </p>

          <div className="flex justify-between mt-[2rem] ">
            <div className="flex gap-7">
              
              {isEditing ? (
                <CloudinaryUploader
                user={formData}
                  onUploadComplete={handleImageUpload}
                />
              ) : (
                  <Image
                    src={formData.profileImage}
                    height={70}
                    width={70}
                    alt="profile image"
                    className="rounded-full object-cover w-[4.25rem] h-[4.25rem]"
                  />

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

            ): (
                <div className='flex gap-2'>
                <button
                  onClick={handleCancel}
                  className='flex gap-2 border border-neutral-300 w-[120px] h-[40px] text-neutral-700 font-semibold rounded-lg cursor-pointer hover:bg-neutral-100 items-center justify-center'
                >
                  <X size={18} />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className='flex gap-2 bg-[#0080FF] w-[150px] h-[40px] text-white font-semibold rounded-lg cursor-pointer hover:bg-blue-700 items-center justify-center'
                >
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            )}
          </div>

          <hr className="border-[1px] border-neutral-200 mt-[2rem]" />
        </div>

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
                onChange={(e)=> setTempData({...tempData, firstName: e.target.value})}
                disabled={!isEditing}
                className={`w-[25.656rem] h-[3.25rem] border-[1.8px] ${!isEditing ? "bg-neutral-200 border-neutral-300" : ""} focus:border-[2px] focus:border-blue-500 border-neutral-300 focus:outline-none rounded-xl pl-3`}
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
                onChange={(e)=> setTempData({...tempData, lastName: e.target.value})}
                disabled={!isEditing}
               className={`w-[25.656rem] h-[3.25rem] border-[1.8px] ${!isEditing ? "bg-neutral-200 border-neutral-300" : ""} focus:border-[2px] focus:border-blue-500 border-neutral-300 focus:outline-none rounded-xl pl-3`}
              />
            </div>
            <div className="relative flex flex-col gap-2">
              <label className="font-bold text-[0.875rem] leading-[150%]">
                Email Address
              </label>
              <input
                type="text"
                name="emailAddress"
                value={isEditing ? tempData.emailAddress : formData.emailAddress}
                onChange={(e)=> setTempData({...tempData, emailAddress: e.target.value})}
                disabled={!isEditing}
                className={`w-[25.656rem] h-[3.25rem] border-[1.8px] ${!isEditing ? "bg-neutral-200 border-neutral-300" : ""} focus:border-[2px] focus:border-blue-500 border-neutral-300 focus:outline-none rounded-xl pl-10`}
              />
              <Mail size={24} className="absolute mt-11 ml-3 text-neutral-500" />
            </div>
            <div className=" relative flex flex-col gap-2">
              <label className="font-bold text-[0.875rem] leading-[150%]">
                Phone number
              </label>
              <input
                type="text"
                name="phoneNumber"
                value={isEditing ? tempData.phoneNumber : formData.phoneNumber}
                onChange={(e)=> setTempData({...tempData, phoneNumber: e.target.value})}
                disabled={!isEditing}
                className={`w-[25.656rem] h-[3.25rem] border-[1.8px] ${!isEditing ? "bg-neutral-200 border-neutral-300" : ""} focus:border-[2px] focus:border-blue-500 border-neutral-300 focus:outline-none rounded-xl pl-10`}
              />
              <Phone className="absolute mt-11 ml-3 text-neutral-500" />
            </div>
          </form>
          <hr className="border-[1.5px] mt-[1.5rem] mb-[2rem] border-neutral-200 w-full" />

          {/* the second form */}

          <div className="mb-[1.375rem]">
            <h1 className="text-[1rem] font-semibold leading-[150%] text-neutral-800">
              Password and Security
            </h1>
            <p className="mt-[4px] text-[0.875rem] leading-[150%]">
              Update your password
            </p>
          </div>

          <form className="grid lg:grid-cols-2 grid-cols-1 gap-5">
            <div className="relative flex flex-col gap-2">
              <label className="font-bold text-[0.875rem] leading-[150%]">
                Current password
              </label>
              <input
                type={isToggleOne ? "text" : "password"}
                name="currentPassword"
                placeholder="*********************"
                value={tempData.currentPassword}
                onChange={(e)=> setTempData({...tempData, currentPassword: e.target.value})}
                disabled={!isEditing}
                className={`w-[25.656rem] h-[3.25rem] border-[1.8px] ${!isEditing ? "bg-neutral-200 border-neutral-300" : ""} focus:border-[2px] focus:border-blue-500 border-neutral-300 focus:outline-none rounded-xl pl-3`}
                />
                <button  type="button" disabled={!isEditing} onClick={()=> setIsToggleOne(prev=> !prev)} className={`absolute right-3 top-11 text-neutral-400`}>
                  {isToggleOne ? (
                  <EyeOff size={24} />
                ):(
                  <Eye size={24} />
                )}
                </button>
            </div>

            <div className="relative flex flex-col gap-2">
              <label className="font-bold text-[0.875rem] leading-[150%]">
                New password
              </label>
              <input
                type={isHiddenTwo ? "text" : "password"}
                name="newPassword"
                placeholder="*********************"
                value={tempData.newPassword}
                onChange={(e) => setTempData({...tempData, newPassword: e.target.value})}
                disabled={!isEditing}
                className={`w-[25.656rem] h-[3.25rem] border-[1.8px] ${!isEditing ? "bg-neutral-200 border-neutral-300" : ""} focus:border-[2px] focus:border-blue-500 border-neutral-300 focus:outline-none rounded-xl pl-3`}
              />

              <button type="button" onClick={()=> setIsHiddenTwo(prev => !prev)} disabled={!isEditing} className="absolute right-3 top-11 text-neutral-400">
                {isHiddenTwo ? <EyeOff size={24} /> : <Eye size={24}/>}
              </button>
            </div>
            
            <div className="relative flex flex-col gap-2">
              <label className="font-bold text-[0.875rem] leading-[150%]">
                Confirm new password
              </label>
              <input
                type={isHiddenThree ? "text" : "password"}
                name="confirmNewPassword"
                value={tempData.confirmNewPassword}
                onChange={(e)=> setTempData({...tempData, confirmNewPassword: e.target.value})}
                disabled={!isEditing}
                placeholder="*********************"
                className={`w-[25.656rem] h-[3.25rem] border-[1.8px] ${!isEditing ? "bg-neutral-200 border-neutral-300" : ""} focus:border-[2px] focus:border-blue-500 border-neutral-300 focus:outline-none rounded-xl pl-3`}
              />

              <button disabled={!isEditing} type="button" onClick={() => setIsHiddenThree(prev => !prev)} className=" absolute right-3 top-11 text-neutral-400">
                {isHiddenThree ? <EyeOff size={24}/> : <Eye size={24}/>}
              </button>
              
              {isMessage.text && (
                <p className={`text-[0.875rem] font-medium ${isMessage.type === 'error' ? "text-red-400" : "text-green-500"}`}>
                    {isMessage.text}
                </p>
              )}
            </div>


          </form>
        </div>
      </div>
    </div>
  );
};

export default MyProfileModal;
