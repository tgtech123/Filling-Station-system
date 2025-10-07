"use client";
import React, { useState } from "react";
import { Plus, X, ChevronUp, ChevronDown, EyeOff, Eye } from "lucide-react";
import { BsToggleOn, BsToggleOff } from "react-icons/bs";
import SuccessMessageModal from "./SuccessMessageModal";

const NewStaffModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toggleOn, setToggleOn] = useState(false);
  const [isToggleTwo, setIsToggleTwo] = useState(false);
  const [showVisible, setShowVisible] = useState(false);
  const [isToggleChevron, setIsToggleChevron] = useState(false);
  const [isToggleChevTwo, setIsToggleChevTwo] = useState(false);
  const [togglePayType, setTogglePayType] = useState(false);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const API = process.env.NEXT_PUBLIC_API;

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    image: "",
    role: "",
    password: "",
    confirmPassword: "",
    shiftType: "",
    responsibility: [],
    addSaleTarget: false,
    payType: "",
    amount: "",
    twoFactorAuthEnabled: false,
    notificationPreferences: {
      email: false,
      sms: false,
      push: false,
      lowStock: false,
      mail: false,
      sales: false,
      staffs: false,
    },
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // Clear error on input change
  };

  // Handle responsibility input (convert to array)
  const handleResponsibilityChange = (e) => {
    const value = e.target.value;
    // const responsibilityArray = value.split(",").map((item) => item.trim());
    const responsibilityArray = value.split(/\s+/).map((item) => item.trim());
    setFormData((prev) => ({
      ...prev,
      responsibility: responsibilityArray,
    }));
  };
  
  // Handle toggle for sales target
  const handleSalesTargetToggle = () => {
    setToggleOn(!toggleOn);
    setFormData((prev) => ({
      ...prev,
      addSaleTarget: !toggleOn,
    }));
  };

  // Validate form
  const validateForm = () => {
    if (!formData.firstName.trim()) return "First name is required";
    if (!formData.lastName.trim()) return "Last name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!formData.phone.trim()) return "Phone is required";
    if (!formData.role.trim()) return "Role is required";
    if (!formData.password) return "Password is required";
    if (!formData.confirmPassword) return "Please confirm password";
    if (formData.password !== formData.confirmPassword) return "Passwords do not match";
    if (!formData.shiftType.trim()) return "Shift type is required";
    if (formData.responsibility.length === 0 || !formData.responsibility[0]) 
      return "Responsibilities are required";
    if (!formData.payType.trim()) return "Pay type is required";
    if (!formData.amount) return "Amount is required";
    return null;
  };

  
    // Submit form
     const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        const validationError = validateForm();
        if (validationError) {
          setError(validationError);
          alert(validationError);
          return;
        }

        setIsLoading(true);
        setError("");

        try {
          // Get token from localStorage
          const token = localStorage.getItem("token");

          if (!token) {
            throw new Error("Authentication token not found. Please login again.");
          }

          // Prepare payload
          const payload = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            image: formData.image || undefined,
            role: formData.role,
            password: formData.password,
            shiftType: formData.shiftType,
            responsibility: formData.responsibility,
            addSaleTarget: formData.addSaleTarget,
            payType: formData.payType,
            amount: parseFloat(formData.amount),
            twoFactorAuthEnabled: formData.twoFactorAuthEnabled,
            notificationPreferences: formData.notificationPreferences,
          };

          // Send request
          const response = await fetch(`${API}/api/auth`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });

          const data = await response.json();
          console.log("API Response:", data); // 🪵 Debugging line

          if (!response.ok) {
            // Check if server provided a custom message
            const errorMsg =
              data.message ||
              data.error ||
              `Server error (${response.status}): ${response.statusText}`;
            throw new Error(errorMsg);
          }

          // ✅ Success
          alert("✅ Staff created successfully!");
          setIsModalOpen(true);

          // Reset form
          setFormData({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            image: "",
            role: "",
            password: "",
            confirmPassword: "",
            shiftType: "",
            responsibility: [],
            addSaleTarget: false,
            payType: "",
            amount: "",
            twoFactorAuthEnabled: false,
            notificationPreferences: {
              email: false,
              sms: false,
              push: false,
              lowStock: false,
              mail: false,
              sales: false,
              staffs: false,
            },
          });
          setToggleOn(false);
        } catch (err) {
          const errMsg = err.message || "An unexpected error occurred";
          setError(errMsg);
          alert(`❌ ${errMsg}`);
          console.error("❌ Error creating staff:", err);
        } finally {
          setIsLoading(false);
        }
            };



  return (
    <div
      onClick={onClose}
      className="bg-black/50 w-full flex justify-center items-center fixed inset-0 z-50 h-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white lg:w-[60.1875rem] w-fit rounded-2xl max-h-[90vh] overflow-hidden"
      >
        <div className="overflow-y-auto max-h-[90vh] p-5">
          <p className="mb-[2rem] flex justify-between">
            <span className="flex flex-col">
              <span className="text-[1.5rem] font-semibold leading-[100%] mb-[0.75rem]">
                Add New Staff Member
              </span>
              <span className="text-[1.125rem] leading-[100%]">
                Enter details of the new staff
              </span>
            </span>

            <span
              onClick={onClose}
              className="h-8 w-8 flex items-center justify-center hover:bg-neutral-300 cursor-pointer rounded-full"
            >
              <X />
            </span>
          </p>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div>
            <h1 className="text-[1.125rem] mb-[0.5rem] text-neutral-800">
              PERSONAL INFORMATION
            </h1>

            <hr className="border-[1px] border-neutral-100" />

            <form
              onSubmit={handleSubmit}
              className="mt-[1.5rem] grid grid-cols-1 lg:grid-cols-2 gap-3"
            >
              <span className="flex flex-col gap-2">
                <label className="text-[0.875rem] font-bold leading-[150%] text-[#323130]">
                  First name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Sam"
                  className="text-neutral-500 border-[2px] pl-3 border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500 w-[27.719rem] h-[3.25rem] rounded-2xl"
                />
              </span>
              <span className="flex flex-col gap-2">
                <label className="text-[0.875rem] font-bold leading-[150%] text-[#323130]">
                  Last name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  className="text-neutral-500 pl-3 w-[27.719rem] h-[3.25rem] border-[2px] border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500 rounded-2xl"
                />
              </span>
              <span className="flex flex-col gap-2">
                <label className="text-[0.875rem] font-bold leading-[150%] text-[#323130]">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="sam@example.com"
                  className="text-neutral-500 pl-3 w-[27.719rem] h-[3.25rem] border-[2px] border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500 rounded-2xl"
                />
              </span>
              <span className="flex flex-col gap-2">
                <label className="text-[0.875rem] font-bold leading-[150%] text-[#323130]">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1234567890"
                  className="text-neutral-500 pl-3 w-[27.719rem] h-[3.25rem] rounded-2xl border-[2px] border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500"
                />
              </span>
              <span className="flex flex-col gap-2 relative">
                <label className="text-[0.875rem] font-bold leading-[150%] text-[#323130]">
                  Temporary password
                </label>
                <input
                  name="password"
                  value={formData.password}
                  type={isToggleTwo ? "text" : "password"}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="text-neutral-500 pl-3 w-[27.719rem] h-[3.25rem] rounded-2xl border-[2px] border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span
                  onClick={() => setIsToggleTwo(!isToggleTwo)}
                  className="absolute text-neutral-500 top-10 right-5 cursor-pointer"
                >
                  {isToggleTwo ? <EyeOff /> : <Eye />}
                </span>
              </span>

              <span className="flex flex-col gap-2 relative">
                <label className="text-[0.875rem] font-bold leading-[150%] text-[#323130]">
                  Confirm temporary password
                </label>
                <input
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  type={showVisible ? "text" : "password"}
                  onChange={handleInputChange}
                  placeholder="Confirm password"
                  className="text-neutral-500 pl-3 w-[27.719rem] h-[3.25rem] rounded-2xl border-[2px] border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span
                  onClick={() => setShowVisible(!showVisible)}
                  className="absolute text-neutral-500 top-11 right-5 cursor-pointer"
                >
                  {showVisible ? <EyeOff /> : <Eye />}
                </span>
              </span>
            </form>

            <hr className="border-[1px] border-neutral-100 mt-[1rem]" />

            <h1 className="text-[1.125rem] mb-[1rem] text-neutral-800 mt-[1rem]">
              JOB INFORMATION
            </h1>

            <hr className="border-[1px] border-neutral-100" />
          </div>

          <div>
            <p className="grid grid-cols-1 lg:grid-cols-2 mb-[0.75rem]">
              <span className="flex flex-col gap-2 relative">
                <label className="font-bold text-[0.875rem]">Role</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  placeholder="Cashier"
                  className="text-neutral-500 border-[2px] pl-3 border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500 w-[27.719rem] h-[3.25rem] rounded-2xl"
                />

                <span
                  onClick={() => setIsToggleChevron(!isToggleChevron)}
                  className="absolute text-neutral-500 top-10 right-7 cursor-pointer"
                >
                  {isToggleChevron ? (
                    <ChevronUp size={26} />
                  ) : (
                    <ChevronDown size={26} />
                  )}
                </span>
              </span>
              <span className="flex flex-col gap-2 relative">
                <label className="font-bold text-[0.875rem]">Shift type</label>
                <input
                  type="text"
                  name="shiftType"
                  value={formData.shiftType}
                  onChange={handleInputChange}
                  placeholder="Morning"
                  className="text-neutral-500 border-[2px] pl-3 border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500 w-[27.719rem] h-[3.25rem] rounded-2xl"
                />

                <span
                  onClick={() => setIsToggleChevTwo(!isToggleChevTwo)}
                  className="absolute text-neutral-500 top-10 right-6 cursor-pointer"
                >
                  {isToggleChevTwo ? (
                    <ChevronUp size={26} />
                  ) : (
                    <ChevronDown size={26} />
                  )}
                </span>
              </span>
            </p>

            <span className="flex flex-col gap-2">
              <span className="font-bold text-[0.875rem]">
                Responsibilities
              </span>
              <input
                type="text"
                name="responsibility"
                value={formData.responsibility.join(" ")}
                onChange={handleResponsibilityChange}
                placeholder="Overseas operations of other staffs, approves reconciled shifts and give report to manager"
                className="text-neutral-500 border-[2px] pl-3 border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500 w-full h-[3.25rem] rounded-2xl"
              />
            </span>

            <hr className="border-[1px] border-neutral-100 mb-[1rem]" />
            <p className="flex justify-between">
              <span className="text-[1.5rem] font-semibold ">
                Add sales target
              </span>

              <span onClick={handleSalesTargetToggle} className="cursor-pointer">
                {toggleOn ? (
                  <BsToggleOn size={25} className="text-blue-600" />
                ) : (
                  <BsToggleOff size={25} className="text-neutral-500 " />
                )}
              </span>
            </p>
            <hr className="border-[1px] border-neutral-100 mt-[1rem]" />
          </div>

          <div>
            <hr className="border-[1px] border-neutral-100 mt-[1rem]" />

            <h1 className="text-[1.125rem] mb-[1rem] text-neutral-800 mt-[1rem]">
              PAY INFORMATION
            </h1>

            <hr className="border-[1px] border-neutral-100 mb-[0.75rem]" />

            <p className="grid grid-cols-1 lg:grid-cols-2 mb-[0.75rem]">
              <span className="flex flex-col gap-2 relative">
                <label className="font-bold text-[0.875rem]">Pay type</label>
                <input
                  type="text"
                  name="payType"
                  value={formData.payType}
                  onChange={handleInputChange}
                  placeholder="Monthly Salary"
                  className="text-neutral-500 border-[2px] pl-3 border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500 w-[27.719rem] h-[3.25rem] rounded-2xl"
                />

                <span
                  onClick={() => setTogglePayType(!togglePayType)}
                  className="absolute top-10 right-7 text-neutral-500 cursor-pointer"
                >
                  {togglePayType ? (
                    <ChevronUp size={26} />
                  ) : (
                    <ChevronDown size={26} />
                  )}
                </span>
              </span>
              <span className="flex flex-col gap-2">
                <label className="font-bold text-[0.875rem]">Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="40000"
                  className="text-neutral-500 border-[2px] pl-3 border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500 w-[27.719rem] h-[3.25rem] rounded-2xl"
                />
              </span>
            </p>

            <hr className="border-[1px] border-neutral-100 mb-[1.5rem] mt-[1rem]" />

            <p className="lg:grid-cols-2 grid grid-cols-1 gap-2 w-full ">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="bg-white border-2 cursor-pointer h-[3rem] font-bold text-blue-600 border-blue-600 rounded-2xl disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-blue-600 outline-none cursor-pointer h-[3rem] rounded-2xl font-bold text-white disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isLoading ? "Adding Staff..." : "Add Staff Member"}
              </button>
            </p>
            <SuccessMessageModal
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                onClose(); // Close the main modal too
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewStaffModal;