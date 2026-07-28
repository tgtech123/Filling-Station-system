"use client";
import React, { useState, useEffect } from "react";
import { Plus, X, ChevronUp, ChevronDown, EyeOff, Eye, Loader2 } from "lucide-react";
import { BsToggleOn, BsToggleOff } from "react-icons/bs";
import SuccessMessageModal from "./SuccessMessageModal";
import useStaffStore from "@/store/useStaffStore"; // Import the Zustand store
import useShiftTypeStore from "@/store/useShiftTypeStore";
import UpgradePrompt from "@/components/UpgradePrompt";
import { api } from "@/lib/config";

const NewStaffModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  const isSuperManager = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}").isSuperManager === true;
    } catch {
      return false;
    }
  })();

  const [isLoading, setIsLoading] = useState(false);
  const [newStaffName, setNewStaffName] =useState("");

  // Zustand store
  const { createStaff, error: storeError } = useStaffStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toggleOn, setToggleOn] = useState(false);
  const [isToggleTwo, setIsToggleTwo] = useState(false);
  const [showVisible, setShowVisible] = useState(false);
  
  // Local error state for validation
  const [validationError, setValidationError] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [limitInfo, setLimitInfo] = useState({ role: "", limit: 0 });

  // Shift types — built-ins + this station's custom types (manager can add new)
  const { builtIn, custom, fetchTypes, createType } = useShiftTypeStore();
  const [showNewType, setShowNewType] = useState(false);
  const [newType, setNewType] = useState({ name: "", startTime: "", endTime: "", session: "morning" });
  const [creatingType, setCreatingType] = useState(false);
  const [typeError, setTypeError] = useState("");

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  const shiftTypeOptions = [
    ...builtIn.filter((t) => t.isActive !== false),
    ...custom.filter((t) => t.isActive !== false),
  ];

  const handleCreateType = async () => {
    if (!newType.name.trim()) {
      setTypeError("Enter a name for the shift type");
      return;
    }
    setCreatingType(true);
    setTypeError("");
    const result = await createType(newType);
    setCreatingType(false);
    if (result.success) {
      // Select the freshly created type on the staff form
      setFormData((prev) => ({ ...prev, shiftType: result.data.name }));
      setShowNewType(false);
      setNewType({ name: "", startTime: "", endTime: "", session: "morning" });
    } else {
      setTypeError(result.error);
    }
  };

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    image: "",
    role: "",
    department: "fuel",
    password: "",
    confirmPassword: "",
    shiftType: "",
    responsibility: "",
    addSaleTarget: false,
    targetAmount: "",
    targetDuration: "Monthly",
    payType: "",
    amount: 0,
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
    setValidationError(""); // Clear error on input change
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) return "Please enter a valid email address";
    if (!formData.phone.trim()) return "Phone is required";
    if (!formData.role.trim()) return "Role is required";
    if (!formData.password) return "Password is required";
    if (!formData.confirmPassword) return "Please confirm password";
    if (formData.password !== formData.confirmPassword) return "Passwords do not match";
    if (!formData.shiftType.trim()) return "Shift type is required";
    if (!formData.responsibility.trim()) return "Responsibilities are required";
    if (!formData.payType.trim()) return "Pay type is required";
    if (!formData.amount) return "Amount is required";
    return null;
  };

  // Submit form using Zustand store
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsLoading(true)

    // Validate form
    const validationErr = validateForm();
    if (validationErr) {
      setValidationError(validationErr);
      setIsLoading(false)
      return;
    }

    setValidationError("");

    try {
      // Get token from localStorage
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      // Prepare payload (excluding confirmPassword)
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        image:  "",
        role: formData.role,
        department: (formData.role === "attendant" || formData.role === "cashier") ? (formData.department || "fuel") : undefined,
        password: formData.password.trim(),
        shiftType: formData.shiftType,
        responsibility: formData.responsibility
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        addSaleTarget: formData.addSaleTarget,
        payType: formData.payType,
        amount: parseFloat(formData.amount),
        twoFactorAuthEnabled: formData.twoFactorAuthEnabled,
        notificationPreferences: formData.notificationPreferences,
      };

      // Call Zustand store action
      // await createStaff(payload, token);

      // // Check if there was an error from the store
      // if (storeError) {
      //   console.log(`check ${storeError}`);
      //   return;
      // }

      const result = await createStaff(payload, token);

      if (result?.error) {
        throw new Error(result.error);
      }

      // Apply the sales target to the staff member we just created. Targets are
      // a separate record (SalesTarget) with their own endpoint, so the boolean
      // on the staff document alone was never going to produce one.
      // createStaff resolves to the staff document itself (store returns
      // data.staff), so the id is on the result directly.
      const newStaffId = result?._id || result?.id;
      if (formData.addSaleTarget && formData.targetAmount && newStaffId) {
        try {
          await api.patch(`/api/staff/${newStaffId}/target`, {
            targetAmount: Number(formData.targetAmount),
            duration: formData.targetDuration || "Monthly",
          });
        } catch (targetErr) {
          // The staff member exists — don't fail the whole flow over the
          // target. Say so plainly so it can be set from their profile.
          console.error("Failed to set sales target:", targetErr);
          setValidationError(
            "Staff created, but the sales target could not be saved. Set it from their profile."
          );
        }
      }


      // ✅ Success
;
      setNewStaffName(`${formData.firstName} ${formData.lastName}`)
      setIsModalOpen(true);

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        image: "",
        role: "",
        department: "fuel",
        password: "",
        confirmPassword: "",
        shiftType: "",
        responsibility: "",
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
      if (err?.response?.data?.upgradeRequired) {
        setLimitInfo({
          role: err.response.data.role || "staff",
          limit: err.response.data.limit || 0,
        });
        setShowUpgrade(true);
        setIsLoading(false);
        return;
      }
      const errMsg = err.message || "An unexpected error occurred";
      setValidationError(errMsg);
      alert(`❌ ${errMsg}`);
      console.error("❌ Error creating staff:", err);
    }
  };

  // Display error from store or validation
  const displayError = storeError || validationError;

  return (
    <>
    <div
      onClick={onClose}
      className="bg-black/50 w-full flex justify-center items-start sm:items-center fixed inset-0 z-50 overflow-y-auto py-4 px-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-[60.1875rem] rounded-2xl my-auto"
      >
        <div className="overflow-y-auto max-h-[90dvh] p-5">
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
          {displayError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {displayError}
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
                  className="text-neutral-500 border-[2px] pl-3 border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500 w-full h-[3.25rem] rounded-2xl"
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
                  className="text-neutral-500 pl-3 w-full h-[3.25rem] border-[2px] border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500 rounded-2xl"
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
                  className="text-neutral-500 pl-3 w-full h-[3.25rem] border-[2px] border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500 rounded-2xl"
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
                  className="text-neutral-500 pl-3 w-full h-[3.25rem] rounded-2xl border-[2px] border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500"
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
                  className="text-neutral-500 pl-3 w-full h-[3.25rem] rounded-2xl border-[2px] border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span
                  onClick={() => setIsToggleTwo(!isToggleTwo)}
                  className="absolute text-neutral-500 top-10 right-5 cursor-pointer"
                >
                  {isToggleTwo ? <Eye />  :  <EyeOff />}
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
                  className="text-neutral-500 pl-3 w-full h-[3.25rem] rounded-2xl border-[2px] border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span
                  onClick={() => setShowVisible(!showVisible)}
                  className="absolute text-neutral-500 top-11 right-5 cursor-pointer"
                >
                  {showVisible ? <Eye /> : <EyeOff />}
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
            {/* gap-3 — these two-column rows had no gap at all, so on wide
                screens the two fields sat flush against each other. */}
            <p className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-[0.75rem]">
              <span className="flex flex-col gap-2">
                <label className="font-bold text-[0.875rem]">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="text-neutral-500 border-[2px] pl-3 border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500 w-full h-[3.25rem] rounded-2xl bg-white"
                >
                  <option value="">Select role</option>
                  <option value="attendant">Attendant</option>
                  <option value="cashier">Cashier</option>
                  <option value="accountant">Accountant</option>
                  <option value="supervisor">Supervisor</option>
                  {isSuperManager && <option value="manager">Branch Manager</option>}
                </select>
              </span>
              {(formData.role === "attendant" || formData.role === "cashier") && (
                <span className="flex flex-col gap-2">
                  <label className="font-bold text-[0.875rem]">Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="text-neutral-500 border-[2px] pl-3 border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500 w-full h-[3.25rem] rounded-2xl bg-white"
                  >
                    <option value="fuel">Fuel Department Only</option>
                    <option value="gas">Gas Department Only</option>
                    <option value="both">Both Departments</option>
                  </select>
                </span>
              )}
              <span className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[0.875rem]">Shift type</label>
                  <button
                    type="button"
                    onClick={() => { setShowNewType((v) => !v); setTypeError(""); }}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    <Plus size={13} /> {showNewType ? "Cancel" : "New shift type"}
                  </button>
                </div>
                <select
                  name="shiftType"
                  value={formData.shiftType}
                  onChange={handleInputChange}
                  className="text-neutral-500 border-[2px] pl-3 border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500 w-full h-[3.25rem] rounded-2xl bg-white"
                >
                  <option value="">Select shift</option>
                  {shiftTypeOptions.map((t) => (
                    <option key={t.name} value={t.name}>{t.label}</option>
                  ))}
                </select>

                {/* Inline creator — persists to the station and appears in the
                    supervisor's scheduling page immediately */}
                {showNewType && (
                  <div className="border-2 border-blue-100 bg-blue-50/50 rounded-2xl p-3 mt-1">
                    <input
                      type="text"
                      value={newType.name}
                      onChange={(e) => setNewType((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Type name, e.g. Night Shift"
                      className="w-full border-2 border-neutral-200 bg-white rounded-xl px-3 py-2 text-sm mb-2 outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input
                        type="text"
                        value={newType.startTime}
                        onChange={(e) => setNewType((p) => ({ ...p, startTime: e.target.value }))}
                        placeholder="Start, e.g. 10PM"
                        className="border-2 border-neutral-200 bg-white rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={newType.endTime}
                        onChange={(e) => setNewType((p) => ({ ...p, endTime: e.target.value }))}
                        placeholder="End, e.g. 6AM"
                        className="border-2 border-neutral-200 bg-white rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-xs font-semibold text-gray-600">Schedule group:</label>
                      {["morning", "evening"].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setNewType((p) => ({ ...p, session: s }))}
                          className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                            newType.session === s ? "bg-blue-600 text-white" : "bg-white border border-neutral-200 text-gray-500"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    {typeError && <p className="text-red-500 text-xs mb-2">{typeError}</p>}
                    <button
                      type="button"
                      onClick={handleCreateType}
                      disabled={creatingType}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold py-2 rounded-xl flex items-center justify-center gap-2"
                    >
                      {creatingType ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                      Create &amp; Select
                    </button>
                  </div>
                )}
              </span>
            </p>

            <span className="flex flex-col gap-2">
              <span className="font-bold text-[0.875rem]">
                Responsibilities
              </span>
              <input
                type="text"
                name="responsibility"
                value={formData.responsibility}
                onChange={handleInputChange}
                placeholder="Overseas operations of other staffs, approves reconciled shifts and give report to manager"
                className="text-neutral-500 border-[2px] pl-3 border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500 w-full h-[3.25rem] rounded-2xl"
              />
            </span>

            <hr className="border-[1px] border-neutral-100 mb-[1rem]" />
            <p className="flex justify-between">
              <span className="text-[1.5rem] font-semibold ">
                Add sales target
              </span>

              <span
                onClick={handleSalesTargetToggle}
                role="switch"
                aria-checked={toggleOn}
                aria-label="Add sales target"
                className="cursor-pointer"
              >
                {toggleOn ? (
                  <BsToggleOn size={25} className="text-blue-600" />
                ) : (
                  <BsToggleOff size={25} className="text-neutral-500 " />
                )}
              </span>
            </p>

            {/*
              The toggle used to set a boolean and nothing else — there was no
              way to say what the target actually WAS, so switching it on had no
              visible effect. These fields appear with it and are applied to the
              new staff member right after they are created.
            */}
            {toggleOn && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-[1rem]">
                <span className="flex flex-col gap-2">
                  <label className="text-neutral-800 text-sm font-medium">
                    Target amount (₦) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="targetAmount"
                    value={formData.targetAmount}
                    onChange={handleInputChange}
                    placeholder="e.g. 500000"
                    className="text-neutral-500 border-[2px] pl-3 border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500 w-full h-[3.25rem] rounded-2xl"
                  />
                </span>
                <span className="flex flex-col gap-2">
                  <label className="text-neutral-800 text-sm font-medium">
                    Period <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="targetDuration"
                    value={formData.targetDuration}
                    onChange={handleInputChange}
                    className="text-neutral-500 border-[2px] pl-3 border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500 w-full h-[3.25rem] rounded-2xl"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                  </select>
                </span>
              </div>
            )}

            <hr className="border-[1px] border-neutral-100 mt-[1rem]" />
          </div>

          <div>
            <hr className="border-[1px] border-neutral-100 mt-[1rem]" />

            <h1 className="text-[1.125rem] mb-[1rem] text-neutral-800 mt-[1rem]">
              PAY INFORMATION
            </h1>

            <hr className="border-[1px] border-neutral-100 mb-[0.75rem]" />

            {/* gap-3 — these two-column rows had no gap at all, so on wide
                screens the two fields sat flush against each other. */}
            <p className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-[0.75rem]">
              <span className="flex flex-col gap-2">
                <label className="font-bold text-[0.875rem]">Pay type</label>
                <select
                  name="payType"
                  value={formData.payType}
                  onChange={handleInputChange}
                  className="text-neutral-500 border-[2px] pl-3 border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500 w-full h-[3.25rem] rounded-2xl bg-white"
                >
                  <option value="">Select pay type</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </span>
              <span className="flex flex-col gap-2">
                <label className="font-bold text-[0.875rem]">Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="40000"
                  className="text-neutral-500 border-[2px] pl-3 border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500 w-full h-[3.25rem] rounded-2xl"
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
              staffName={newStaffName}
            />
          </div>
        </div>
      </div>
    </div>
    {showUpgrade && (
      <UpgradePrompt
        role={limitInfo.role}
        limit={limitInfo.limit}
        onClose={() => setShowUpgrade(false)}
      />
    )}

    </>

  );
};

export default NewStaffModal;





// "use client";
// import React, { useState } from "react";
// import { Plus, X, ChevronUp, ChevronDown, EyeOff, Eye } from "lucide-react";
// import { BsToggleOn, BsToggleOff } from "react-icons/bs";
// import SuccessMessageModal from "./SuccessMessageModal";

// const NewStaffModal = ({ isOpen, onClose, children }) => {
//   if (!isOpen) return null;

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [toggleOn, setToggleOn] = useState(false);
//   const [isToggleTwo, setIsToggleTwo] = useState(false);
//   const [showVisible, setShowVisible] = useState(false);
//   const [isToggleChevron, setIsToggleChevron] = useState(false);
//   const [isToggleChevTwo, setIsToggleChevTwo] = useState(false);
//   const [togglePayType, setTogglePayType] = useState(false);
  
//   // Loading and error states
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");
//   const API = process.env.NEXT_PUBLIC_API || "https://fueldesk-station-server.onrender.com";

//   // Form state
//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     phone: "",
//     image: "",
//     role: "",
//     password: "",
//     confirmPassword: "",
//     shiftType: "",
//     responsibility: [],
//     addSaleTarget: false,
//     payType: "",
//     amount: "",
//     twoFactorAuthEnabled: false,
//     notificationPreferences: {
//       email: false,
//       sms: false,
//       push: false,
//       lowStock: false,
//       mail: false,
//       sales: false,
//       staffs: false,
//     },
//   });

//   // Handle input changes
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//     setError(""); // Clear error on input change
//   };

//   // Handle responsibility input (convert to array)
//   const handleResponsibilityChange = (e) => {
//     const value = e.target.value;
//     // const responsibilityArray = value.split(",").map((item) => item.trim());
//     const responsibilityArray = value.split(/\s+/).map((item) => item.trim());
//     setFormData((prev) => ({
//       ...prev,
//       responsibility: responsibilityArray,
//     }));
//   };
  
//   // Handle toggle for sales target
//   const handleSalesTargetToggle = () => {
//     setToggleOn(!toggleOn);
//     setFormData((prev) => ({
//       ...prev,
//       addSaleTarget: !toggleOn,
//     }));
//   };

//   // Validate form
//   const validateForm = () => {
//     if (!formData.firstName.trim()) return "First name is required";
//     if (!formData.lastName.trim()) return "Last name is required";
//     if (!formData.email.trim()) return "Email is required";
//     if (!formData.phone.trim()) return "Phone is required";
//     if (!formData.role.trim()) return "Role is required";
//     if (!formData.password) return "Password is required";
//     if (!formData.confirmPassword) return "Please confirm password";
//     if (formData.password !== formData.confirmPassword) return "Passwords do not match";
//     if (!formData.shiftType.trim()) return "Shift type is required";
//     if (formData.responsibility.length === 0 || !formData.responsibility[0]) 
//       return "Responsibilities are required";
//     if (!formData.payType.trim()) return "Pay type is required";
//     if (!formData.amount) return "Amount is required";
//     return null;
//   };

  
//     // Submit form
//      const handleSubmit = async (e) => {
//         e.preventDefault();

//         // Validate form
//         const validationError = validateForm();
//         if (validationError) {
//           setError(validationError);
//           alert(validationError);
//           return;
//         }

//         setIsLoading(true);
//         setError("");

//         try {
//           // Get token from localStorage
//           const token = localStorage.getItem("token");

//           if (!token) {
//             throw new Error("Authentication token not found. Please login again.");
//           }

//           // Prepare payload
//           const payload = {
//             firstName: formData.firstName,
//             lastName: formData.lastName,
//             email: formData.email,
//             phone: formData.phone,
//             image: formData.image || undefined,
//             role: formData.role,
//             password: formData.password,
//             shiftType: formData.shiftType,
//             responsibility: formData.responsibility,
//             addSaleTarget: formData.addSaleTarget,
//             payType: formData.payType,
//             amount: parseFloat(formData.amount),
//             twoFactorAuthEnabled: formData.twoFactorAuthEnabled,
//             notificationPreferences: formData.notificationPreferences,
//           };

//           // Send request
//           const response = await fetch(`${API}/api/auth`, {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${token}`,
//             },
//             body: JSON.stringify(payload),
//           });

//           const data = await response.json();
//           console.log("API Response:", data); // 🪵 Debugging line

//           if (!response.ok) {
//             // Check if server provided a custom message
//             const errorMsg =
//               data.message ||
//               data.error ||
//               `Server error (${response.status}): ${response.statusText}`;
//             throw new Error(errorMsg);
//           }

//           // ✅ Success
//           alert("✅ Staff created successfully!");
//           setIsModalOpen(true);

//           // Reset form
//           setFormData({
//             firstName: "",
//             lastName: "",
//             email: "",
//             phone: "",
//             image: "",
//             role: "",
//             password: "",
//             confirmPassword: "",
//             shiftType: "",
//             responsibility: [],
//             addSaleTarget: false,
//             payType: "",
//             amount: "",
//             twoFactorAuthEnabled: false,
//             notificationPreferences: {
//               email: false,
//               sms: false,
//               push: false,
//               lowStock: false,
//               mail: false,
//               sales: false,
//               staffs: false,
//             },
//           });
//           setToggleOn(false);
//         } catch (err) {
//           const errMsg = err.message || "An unexpected error occurred";
//           setError(errMsg);
//           alert(`❌ ${errMsg}`);
//           console.error("❌ Error creating staff:", err);
//         } finally {
//           setIsLoading(false);
//         }
//             };



//   return (
//     <div
//       onClick={onClose}
//       className="bg-black/50 w-full flex justify-center items-center fixed inset-0 z-50 h-auto"
//     >
//       <div
//         onClick={(e) => e.stopPropagation()}
//         className="bg-white lg:w-[60.1875rem] w-fit rounded-2xl max-h-[90vh] overflow-hidden"
//       >
//         <div className="overflow-y-auto max-h-[90vh] p-5">
//           <p className="mb-[2rem] flex justify-between">
//             <span className="flex flex-col">
//               <span className="text-[1.5rem] font-semibold leading-[100%] mb-[0.75rem]">
//                 Add New Staff Member
//               </span>
//               <span className="text-[1.125rem] leading-[100%]">
//                 Enter details of the new staff
//               </span>
//             </span>

//             <span
//               onClick={onClose}
//               className="h-8 w-8 flex items-center justify-center hover:bg-neutral-300 cursor-pointer rounded-full"
//             >
//               <X />
//             </span>
//           </p>

//           {/* Error Message */}
//           {error && (
//             <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
//               {error}
//             </div>
//           )}

//           <div>
//             <h1 className="text-[1.125rem] mb-[0.5rem] text-neutral-800">
//               PERSONAL INFORMATION
//             </h1>

//             <hr className="border-[1px] border-neutral-100" />

//             <form
//               onSubmit={handleSubmit}
//               className="mt-[1.5rem] grid grid-cols-1 lg:grid-cols-2 gap-3"
//             >
//               <span className="flex flex-col gap-2">
//                 <label className="text-[0.875rem] font-bold leading-[150%] text-[#323130]">
//                   First name
//                 </label>
//                 <input
//                   type="text"
//                   name="firstName"
//                   value={formData.firstName}
//                   onChange={handleInputChange}
//                   placeholder="Sam"
//                   className="text-neutral-500 border-[2px] pl-3 border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500 w-full h-[3.25rem] rounded-2xl"
//                 />
//               </span>
//               <span className="flex flex-col gap-2">
//                 <label className="text-[0.875rem] font-bold leading-[150%] text-[#323130]">
//                   Last name
//                 </label>
//                 <input
//                   type="text"
//                   name="lastName"
//                   value={formData.lastName}
//                   onChange={handleInputChange}
//                   placeholder="Doe"
//                   className="text-neutral-500 pl-3 w-full h-[3.25rem] border-[2px] border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500 rounded-2xl"
//                 />
//               </span>
//               <span className="flex flex-col gap-2">
//                 <label className="text-[0.875rem] font-bold leading-[150%] text-[#323130]">
//                   Email
//                 </label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleInputChange}
//                   placeholder="sam@example.com"
//                   className="text-neutral-500 pl-3 w-full h-[3.25rem] border-[2px] border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500 rounded-2xl"
//                 />
//               </span>
//               <span className="flex flex-col gap-2">
//                 <label className="text-[0.875rem] font-bold leading-[150%] text-[#323130]">
//                   Phone
//                 </label>
//                 <input
//                   type="tel"
//                   name="phone"
//                   value={formData.phone}
//                   onChange={handleInputChange}
//                   placeholder="+1234567890"
//                   className="text-neutral-500 pl-3 w-full h-[3.25rem] rounded-2xl border-[2px] border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500"
//                 />
//               </span>
//               <span className="flex flex-col gap-2 relative">
//                 <label className="text-[0.875rem] font-bold leading-[150%] text-[#323130]">
//                   Temporary password
//                 </label>
//                 <input
//                   name="password"
//                   value={formData.password}
//                   type={isToggleTwo ? "text" : "password"}
//                   onChange={handleInputChange}
//                   placeholder="Enter your password"
//                   className="text-neutral-500 pl-3 w-full h-[3.25rem] rounded-2xl border-[2px] border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500"
//                 />
//                 <span
//                   onClick={() => setIsToggleTwo(!isToggleTwo)}
//                   className="absolute text-neutral-500 top-10 right-5 cursor-pointer"
//                 >
//                   {isToggleTwo ? <EyeOff /> : <Eye />}
//                 </span>
//               </span>

//               <span className="flex flex-col gap-2 relative">
//                 <label className="text-[0.875rem] font-bold leading-[150%] text-[#323130]">
//                   Confirm temporary password
//                 </label>
//                 <input
//                   name="confirmPassword"
//                   value={formData.confirmPassword}
//                   type={showVisible ? "text" : "password"}
//                   onChange={handleInputChange}
//                   placeholder="Confirm password"
//                   className="text-neutral-500 pl-3 w-full h-[3.25rem] rounded-2xl border-[2px] border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500"
//                 />
//                 <span
//                   onClick={() => setShowVisible(!showVisible)}
//                   className="absolute text-neutral-500 top-11 right-5 cursor-pointer"
//                 >
//                   {showVisible ? <EyeOff /> : <Eye />}
//                 </span>
//               </span>
//             </form>

//             <hr className="border-[1px] border-neutral-100 mt-[1rem]" />

//             <h1 className="text-[1.125rem] mb-[1rem] text-neutral-800 mt-[1rem]">
//               JOB INFORMATION
//             </h1>

//             <hr className="border-[1px] border-neutral-100" />
//           </div>

//           <div>
//             <p className="grid grid-cols-1 lg:grid-cols-2 mb-[0.75rem]">
//               <span className="flex flex-col gap-2 relative">
//                 <label className="font-bold text-[0.875rem]">Role</label>
//                 <input
//                   type="text"
//                   name="role"
//                   value={formData.role}
//                   onChange={handleInputChange}
//                   placeholder="Cashier"
//                   className="text-neutral-500 border-[2px] pl-3 border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500 w-full h-[3.25rem] rounded-2xl"
//                 />

//                 <span
//                   onClick={() => setIsToggleChevron(!isToggleChevron)}
//                   className="absolute text-neutral-500 top-10 right-7 cursor-pointer"
//                 >
//                   {isToggleChevron ? (
//                     <ChevronUp size={26} />
//                   ) : (
//                     <ChevronDown size={26} />
//                   )}
//                 </span>
//               </span>
//               <span className="flex flex-col gap-2 relative">
//                 <label className="font-bold text-[0.875rem]">Shift type</label>
//                 <input
//                   type="text"
//                   name="shiftType"
//                   value={formData.shiftType}
//                   onChange={handleInputChange}
//                   placeholder="Morning"
//                   className="text-neutral-500 border-[2px] pl-3 border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500 w-full h-[3.25rem] rounded-2xl"
//                 />

//                 <span
//                   onClick={() => setIsToggleChevTwo(!isToggleChevTwo)}
//                   className="absolute text-neutral-500 top-10 right-6 cursor-pointer"
//                 >
//                   {isToggleChevTwo ? (
//                     <ChevronUp size={26} />
//                   ) : (
//                     <ChevronDown size={26} />
//                   )}
//                 </span>
//               </span>
//             </p>

//             <span className="flex flex-col gap-2">
//               <span className="font-bold text-[0.875rem]">
//                 Responsibilities
//               </span>
//               <input
//                 type="text"
//                 name="responsibility"
//                 value={formData.responsibility.join(" ")}
//                 onChange={handleResponsibilityChange}
//                 placeholder="Overseas operations of other staffs, approves reconciled shifts and give report to manager"
//                 className="text-neutral-500 border-[2px] pl-3 border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500 w-full h-[3.25rem] rounded-2xl"
//               />
//             </span>

//             <hr className="border-[1px] border-neutral-100 mb-[1rem]" />
//             <p className="flex justify-between">
//               <span className="text-[1.5rem] font-semibold ">
//                 Add sales target
//               </span>

//               <span onClick={handleSalesTargetToggle} className="cursor-pointer">
//                 {toggleOn ? (
//                   <BsToggleOn size={25} className="text-blue-600" />
//                 ) : (
//                   <BsToggleOff size={25} className="text-neutral-500 " />
//                 )}
//               </span>
//             </p>
//             <hr className="border-[1px] border-neutral-100 mt-[1rem]" />
//           </div>

//           <div>
//             <hr className="border-[1px] border-neutral-100 mt-[1rem]" />

//             <h1 className="text-[1.125rem] mb-[1rem] text-neutral-800 mt-[1rem]">
//               PAY INFORMATION
//             </h1>

//             <hr className="border-[1px] border-neutral-100 mb-[0.75rem]" />

//             <p className="grid grid-cols-1 lg:grid-cols-2 mb-[0.75rem]">
//               <span className="flex flex-col gap-2 relative">
//                 <label className="font-bold text-[0.875rem]">Pay type</label>
//                 <input
//                   type="text"
//                   name="payType"
//                   value={formData.payType}
//                   onChange={handleInputChange}
//                   placeholder="Monthly Salary"
//                   className="text-neutral-500 border-[2px] pl-3 border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500 w-full h-[3.25rem] rounded-2xl"
//                 />

//                 <span
//                   onClick={() => setTogglePayType(!togglePayType)}
//                   className="absolute top-10 right-7 text-neutral-500 cursor-pointer"
//                 >
//                   {togglePayType ? (
//                     <ChevronUp size={26} />
//                   ) : (
//                     <ChevronDown size={26} />
//                   )}
//                 </span>
//               </span>
//               <span className="flex flex-col gap-2">
//                 <label className="font-bold text-[0.875rem]">Amount</label>
//                 <input
//                   type="number"
//                   name="amount"
//                   value={formData.amount}
//                   onChange={handleInputChange}
//                   placeholder="40000"
//                   className="text-neutral-500 border-[2px] pl-3 border-neutral-100 outline-none focus:ring-1 focus:ring-blue-500 w-full h-[3.25rem] rounded-2xl"
//                 />
//               </span>
//             </p>

//             <hr className="border-[1px] border-neutral-100 mb-[1.5rem] mt-[1rem]" />

//             <p className="lg:grid-cols-2 grid grid-cols-1 gap-2 w-full ">
//               <button
//                 type="button"
//                 onClick={onClose}
//                 disabled={isLoading}
//                 className="bg-white border-2 cursor-pointer h-[3rem] font-bold text-blue-600 border-blue-600 rounded-2xl disabled:opacity-50"
//               >
//                 Cancel
//               </button>

//               <button
//                 type="button"
//                 onClick={handleSubmit}
//                 disabled={isLoading}
//                 className="bg-blue-600 outline-none cursor-pointer h-[3rem] rounded-2xl font-bold text-white disabled:bg-blue-400 disabled:cursor-not-allowed"
//               >
//                 {isLoading ? "Adding Staff..." : "Add Staff Member"}
//               </button>
//             </p>
//             <SuccessMessageModal
//               isOpen={isModalOpen}
//               onClose={() => {
//                 setIsModalOpen(false);
//                 onClose(); // Close the main modal too
//               }}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default NewStaffModal;