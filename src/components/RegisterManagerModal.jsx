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
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import ToggleSwitch from "./ToggleSwtich";
import ImageUploadButton from "./ImageUploadButton";
import Avatar from "./Avatar";
import { useRouter } from "next/navigation";
import usePaymentStore from "@/store/usePaymentStore";
import useTermsStore from "@/store/useTermsStore";

export default function RegisterManagerModal({ onclose, payerInfo }) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const API = process.env.NEXT_PUBLIC_API;
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [stepErrors, setStepErrors] = useState({});
  const stationImageId = useRef(`station-reg-${Date.now()}`).current;
  const router = useRouter();
  const { initializePayment } = usePaymentStore();
  const { termsText, loading: termsLoading, fetchTerms } = useTermsStore();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    emergencyContact: "",
    image: "",
    stationName: "",
    stationId: "",
    stationEmail: "",
    stationPhone: "",
    stationAddress: "",
    stationCity: "",
    stationCountry: "",
    stationZipCode: "",
    licenseNumber: "",
    taxId: "",
    establishmentDate: "",
    stationImage: "",
    businessType: "",
    numberOfPumps: 1,
    operationHours: "",
    tankCapacity: "",
    averageMonthlyRevenue: "",
    staffMembers: 1,
    fuelTypesOffered: [],
    additionalServices: [],
    password: "",
    confirmPassword: "",
    twoFactorAuthEnabled: false,
    notificationPreferences: {
      email: true,
      sms: false,
      push: true,
      lowStock: true,
      mail: false,
      sales: true,
      staffs: false,
    },
    termsAccepted: false,
  });

  useEffect(() => {
    fetchTerms();
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem("selectedPlan");
    if (stored) {
      try {
        setSelectedPlan(JSON.parse(stored));
      } catch {
        // ignore malformed data
      }
    }
    if (payerInfo) {
      setFormData((prev) => ({
        ...prev,
        firstName: payerInfo.name?.split(" ")[0] || "",
        lastName: payerInfo.name?.split(" ").slice(1).join(" ") || "",
        email: payerInfo.email || "",
      }));
    }
  }, [payerInfo]);

  const clearErrors = () => setStepErrors({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (stepErrors[name]) {
      setStepErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (type === "checkbox" && (name === "fuelTypesOffered" || name === "additionalServices")) {
      setFormData((prev) => ({
        ...prev,
        [name]: checked ? [...prev[name], value] : prev[name].filter((i) => i !== value),
      }));
    } else if (name.startsWith("notification_")) {
      const key = name.replace("notification_", "");
      setFormData((prev) => ({
        ...prev,
        notificationPreferences: { ...prev.notificationPreferences, [key]: checked },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleToggleChange = (name, value) => {
    if (name === "twoFactorAuthEnabled") {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({
        ...prev,
        notificationPreferences: { ...prev.notificationPreferences, [name]: value },
      }));
    }
  };

  const createManager = async () => {
    try {
      setIsLoading(true);
      setError("");
      if (formData.password !== formData.confirmPassword) throw new Error("Passwords do not match");
      if (!formData.termsAccepted) throw new Error("Please accept the Terms of Service and Privacy Policy");

      const response = await fetch(`${API}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          emergencyContact: formData.emergencyContact,
          image: formData.image,
          stationName: formData.stationName,
          stationAddress: formData.stationAddress,
          stationEmail: formData.stationEmail,
          stationPhone: formData.stationPhone,
          stationCity: formData.stationCity,
          stationCountry: formData.stationCountry,
          stationZipCode: formData.stationZipCode,
          licenseNumber: formData.licenseNumber,
          taxId: formData.taxId,
          establishmentDate: formData.establishmentDate,
          stationImage: formData.stationImage,
          businessType: formData.businessType,
          numberOfPumps: parseInt(formData.numberOfPumps),
          operationHours: formData.operationHours,
          tankCapacity: formData.tankCapacity,
          averageMonthlyRevenue: formData.averageMonthlyRevenue,
          fuelTypesOffered: formData.fuelTypesOffered,
          additionalServices: formData.additionalServices,
          password: formData.password,
          twoFactorAuthEnabled: formData.twoFactorAuthEnabled,
          notificationPreferences: formData.notificationPreferences,
          selectedPlan: selectedPlan?.slug || "free",
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to create account");

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      setStep(5);

      if (data.requiresPayment && selectedPlan && selectedPlan.billingCycle !== "free") {
        sessionStorage.setItem(
          "pendingPayment",
          JSON.stringify({
            slug: selectedPlan.slug,
            billingCycle: selectedPlan.billingCycle,
            name: selectedPlan.name,
            amount: selectedPlan.amount,
          })
        );
      }
    } catch (err) {
      setError(err.message);
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const validateStep = (currentStep) => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (currentStep === 1) {
      if (!formData.firstName?.trim()) errors.firstName = "First name is required";
      if (!formData.lastName?.trim()) errors.lastName = "Last name is required";
      if (!formData.email?.trim()) errors.email = "Email is required";
      else if (!emailRegex.test(formData.email)) errors.email = "Please enter a valid email";
      if (!formData.phone?.trim()) errors.phone = "Phone number is required";
      if (!formData.address?.trim()) errors.address = "Address is required";
      if (!formData.city?.trim()) errors.city = "City is required";
      if (!formData.state?.trim()) errors.state = "State is required";
    }

    if (currentStep === 2) {
      if (!formData.stationName?.trim()) errors.stationName = "Station name is required";
      if (!formData.stationEmail?.trim()) errors.stationEmail = "Station email is required";
      else if (!emailRegex.test(formData.stationEmail)) errors.stationEmail = "Please enter a valid email";
      if (!formData.stationPhone?.trim()) errors.stationPhone = "Station phone is required";
      if (!formData.stationAddress?.trim()) errors.stationAddress = "Station address is required";
      if (!formData.stationCity?.trim()) errors.stationCity = "Station city is required";
      if (!formData.stationCountry?.trim()) errors.stationCountry = "Country is required";
      if (!formData.licenseNumber?.trim()) errors.licenseNumber = "License number is required";
      if (!formData.establishmentDate) errors.establishmentDate = "Establishment date is required";
    }

    if (currentStep === 3) {
      if (!formData.businessType) errors.businessType = "Please select a business type";
      if (!formData.tankCapacity?.trim()) errors.tankCapacity = "Tank capacity is required";
      if (!formData.fuelTypesOffered?.length) errors.fuelTypesOffered = "Please select at least one fuel type";
    }

    if (currentStep === 4) {
      if (!formData.password) errors.password = "Password is required";
      else if (formData.password.length < 8) errors.password = "Password must be at least 8 characters";
      if (!formData.confirmPassword) errors.confirmPassword = "Please confirm your password";
      else if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Passwords do not match";
      if (!formData.termsAccepted) errors.termsAccepted = "Please accept the Terms of Service";
    }

    return errors;
  };

  const handleNextStep = () => {
    clearErrors();
    const errors = validateStep(step);
    if (Object.keys(errors).length > 0) {
      setStepErrors(errors);
      document.querySelector(".modal-content")?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (step < 4) setStep(step + 1);
    else createManager();
  };

  const handlePreviousStep = () => {
    clearErrors();
    if (step > 1) setStep(step - 1);
  };

  const handleAccessDashboard = async () => {
    const pendingPayment = sessionStorage.getItem("pendingPayment");
    if (pendingPayment) {
      sessionStorage.removeItem("pendingPayment");
      sessionStorage.removeItem("selectedPlan");
      const payment = JSON.parse(pendingPayment);
      try {
        await initializePayment(payment.slug, payment.billingCycle);
      } catch {
        sessionStorage.removeItem("payerInfo");
        router.push("/dashboard/manager");
        onclose();
      }
    } else {
      sessionStorage.removeItem("selectedPlan");
      sessionStorage.removeItem("payerInfo");
      sessionStorage.removeItem("paymentVerified");
      router.push("/dashboard/manager");
      onclose();
    }
  };

  const featuresData = [
    { id: 1, title: "Real-Time Analytics", description: "Monitor sales, inventory, and performance", imageUrl: "/analytics.png" },
    { id: 2, title: "Pump Control", description: "Remote pump management and diagnostics", imageUrl: "/pump.png" },
    { id: 3, title: "Staff Management", description: "Schedule shifts and track performance", imageUrl: "/staff.png" },
    { id: 4, title: "Inventory Control", description: "Smart Inventory management system", imageUrl: "/trend.png" },
    { id: 5, title: "Fuel Monitoring", description: "Track levels and automate reorders", imageUrl: "/fuel.png" },
    { id: 6, title: "Financial Tracking", description: "Revenue, expenses, and profit analysis", imageUrl: "/naira.png" },
  ];

  // ── Shared sub-components ──

  const StepProgress = () => (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-6 mt-4">
      {[1, 2, 3, 4].map((s) => (
        <div key={s} className="flex items-center gap-1.5 sm:gap-2">
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              s < step
                ? "bg-green-500 text-white"
                : s === step
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
            }`}
          >
            {s < step ? "✓" : s}
          </div>
          {s < 4 && (
            <div className={`w-6 sm:w-8 h-0.5 transition-colors ${s < step ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"}`} />
          )}
        </div>
      ))}
    </div>
  );

  const ModalHeader = ({ title }) => (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="text-base sm:text-xl font-semibold text-gray-800 dark:text-white leading-snug">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Complete the form below to setup your station
        </p>
      </div>
      <button
        onClick={onclose}
        className="shrink-0 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
      >
        <X size={20} />
      </button>
    </div>
  );

  const StepBadge = ({ current, label }) => (
    <div className="flex font-semibold text-xs sm:text-sm text-gray-600 dark:text-gray-300 justify-between items-center px-3 py-2 mt-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
      <span>STEP {current} OF 4</span>
      <span>{label}</span>
    </div>
  );

  const ErrorBanner = () =>
    Object.keys(stepErrors).length > 0 ? (
      <div className="mt-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg px-3 py-2 flex items-start gap-2">
        <span className="text-red-500 text-sm shrink-0 mt-0.5">⚠</span>
        <p className="text-red-600 dark:text-red-400 text-sm">
          Please fill in all required fields before continuing.
        </p>
      </div>
    ) : null;

  const FieldError = ({ field }) =>
    stepErrors[field] ? (
      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
        <span>⚠</span> {stepErrors[field]}
      </p>
    ) : null;

  const inputCls = (field, extra = "") =>
    `border-2 ${
      stepErrors[field] ? "border-red-400 dark:border-red-500" : "border-gray-300 dark:border-gray-600"
    } p-2 rounded-lg w-full text-sm bg-white dark:bg-gray-700 dark:text-gray-100 ${extra}`.trim();

  const grayInputCls = (field) =>
    `border-2 ${
      stepErrors[field] ? "border-red-400 dark:border-red-500" : "border-gray-300 dark:border-gray-600"
    } p-2 bg-gray-100 dark:bg-gray-700 dark:text-gray-100 rounded-lg w-full text-sm`;

  const selectCls = (field) =>
    `w-full p-2 text-sm border-2 ${
      stepErrors[field] ? "border-red-400 dark:border-red-500" : "border-gray-300 dark:border-gray-600"
    } rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100`;

  const labelCls = "block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1";

  const NavButtons = ({ onPrev, onNext, nextLabel = "Save & Continue", showPrev = true }) => (
    <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 mt-6">
      {showPrev && (
        <button
          type="button"
          onClick={onPrev}
          disabled={isLoading}
          className="cursor-pointer py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm border-2 border-[#0080ff] text-[#0080ff] hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50"
        >
          <ArrowLeft size={16} /> Previous
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={isLoading}
        className="cursor-pointer px-5 py-2 flex items-center justify-center gap-2 text-sm text-white rounded-lg bg-[#0080ff] hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <><Loader2 className="animate-spin" size={15} /> Creating Account...</>
        ) : (
          <>{nextLabel} <ArrowRight size={16} /></>
        )}
      </button>
    </div>
  );

  // ── Shared modal wrapper ──
  const modalWrap = "bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-xl max-w-3xl w-full mx-auto max-h-[92vh] sm:max-h-[88vh] overflow-y-auto scrollbar-hide modal-content";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <div className={modalWrap}>
          <ModalHeader title="Welcome! Let's create your account" />
          <StepProgress />

          {selectedPlan && (
            <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg px-3 py-2">
              <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold">
                Selected: {selectedPlan.name}
                {selectedPlan.billingCycle !== "free" &&
                  ` — ₦${selectedPlan.amount?.toLocaleString()}/${selectedPlan.billingCycle === "yearly" ? "yr" : "mo"}`}
              </span>
            </div>
          )}

          <StepBadge current={1} label="PERSONAL INFORMATION" />
          <ErrorBanner />

          <div className="mt-3">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Let's know you</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Tell us about yourself to personalise your account</p>
          </div>

          {error && (
            <div className="mt-3 p-3 text-sm bg-red-50 border border-red-300 text-red-700 rounded-lg">{error}</div>
          )}

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>First name</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Dave" className={inputCls("firstName")} />
              <FieldError field="firstName" />
            </div>
            <div>
              <label className={labelCls}>Last name</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Johnson" className={inputCls("lastName")} />
              <FieldError field="lastName" />
            </div>
            <div className="relative">
              <label className={labelCls}>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="davejohnson234@gmail.com" className={inputCls("email", "pl-9")} />
              <Mail size={15} className="text-gray-400 absolute top-[2.1rem] left-2.5" />
              <FieldError field="email" />
            </div>
            <div className="relative">
              <label className={labelCls}>Phone Number</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="08134249483" className={inputCls("phone", "pl-9")} />
              <Phone size={15} className="text-gray-400 absolute top-[2.1rem] left-2.5" />
              <FieldError field="phone" />
            </div>
            <div className="relative sm:col-span-2">
              <label className={labelCls}>Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Your house address..." className={inputCls("address", "pl-9")} />
              <MapPin size={15} className="text-gray-400 absolute top-[2.1rem] left-2.5" />
              <FieldError field="address" />
            </div>
            <div>
              <label className={labelCls}>City</label>
              <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="Your city..." className={grayInputCls("city")} />
              <FieldError field="city" />
            </div>
            <div>
              <label className={labelCls}>State</label>
              <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="Your state..." className={grayInputCls("state")} />
              <FieldError field="state" />
            </div>
            <div>
              <label className={labelCls}>Zip Code</label>
              <input type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange} placeholder="45869" className={inputCls("")} />
            </div>
            <div className="relative">
              <label className={labelCls}>Emergency Contact</label>
              <input type="text" name="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange} placeholder="08134249483" className={inputCls("", "pl-9")} />
              <Phone size={15} className="text-gray-400 absolute top-[2.1rem] left-2.5" />
            </div>
          </div>

          <div className="mt-5 text-xs bg-[#dcd2ff] text-[#7f27ff] font-semibold flex items-center gap-2 px-3 py-2 rounded-md w-fit">
            <TriangleAlert size={15} />
            No part of your information shall be disclosed to a third party!
          </div>

          <NavButtons showPrev={false} onNext={handleNextStep} />
        </div>
      )}

      {/* ── STEP 2 ── */}
      {step === 2 && (
        <div className={modalWrap}>
          <ModalHeader title="Tell us about your station" />
          <StepProgress />
          <StepBadge current={2} label="STATION INFORMATION" />
          <ErrorBanner />

          <div className="mt-3">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Station details</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Help us configure the system for your specific location</p>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Station Name</label>
              <input type="text" name="stationName" value={formData.stationName} onChange={handleInputChange} placeholder="Station 2" className={inputCls("stationName")} />
              <FieldError field="stationName" />
            </div>
            <div>
              <label className={labelCls}>Station ID</label>
              <input type="text" name="stationId" value={formData.stationId} onChange={handleInputChange} placeholder="0046" className={inputCls("")} />
            </div>
            <div className="relative">
              <label className={labelCls}>Station Email Address</label>
              <input type="email" name="stationEmail" value={formData.stationEmail} onChange={handleInputChange} placeholder="station2@gmail.com" className={inputCls("stationEmail", "pl-9")} />
              <Mail size={15} className="text-gray-400 absolute top-[2.1rem] left-2.5" />
              <FieldError field="stationEmail" />
            </div>
            <div className="relative">
              <label className={labelCls}>Station Phone Number</label>
              <input type="text" name="stationPhone" value={formData.stationPhone} onChange={handleInputChange} placeholder="08134249483" className={inputCls("stationPhone", "pl-9")} />
              <Phone size={15} className="text-gray-400 absolute top-[2.1rem] left-2.5" />
              <FieldError field="stationPhone" />
            </div>
            <div className="relative sm:col-span-2">
              <label className={labelCls}>Station Address</label>
              <input type="text" name="stationAddress" value={formData.stationAddress} onChange={handleInputChange} placeholder="Your station address..." className={inputCls("stationAddress", "pl-9")} />
              <MapPin size={15} className="text-gray-400 absolute top-[2.1rem] left-2.5" />
              <FieldError field="stationAddress" />
            </div>
            <div>
              <label className={labelCls}>Station City</label>
              <input type="text" name="stationCity" value={formData.stationCity} onChange={handleInputChange} placeholder="Your station city..." className={grayInputCls("stationCity")} />
              <FieldError field="stationCity" />
            </div>
            <div>
              <label className={labelCls}>Station Country</label>
              <input type="text" name="stationCountry" value={formData.stationCountry} onChange={handleInputChange} placeholder="Your station country..." className={grayInputCls("stationCountry")} />
              <FieldError field="stationCountry" />
            </div>
            <div>
              <label className={labelCls}>Zip Code</label>
              <input type="text" name="stationZipCode" value={formData.stationZipCode} onChange={handleInputChange} placeholder="45869" className={inputCls("")} />
            </div>
            <div>
              <label className={labelCls}>License Number</label>
              <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleInputChange} placeholder="058" className={inputCls("licenseNumber")} />
              <FieldError field="licenseNumber" />
            </div>
            <div>
              <label className={labelCls}>Tax ID</label>
              <input type="text" name="taxId" value={formData.taxId} onChange={handleInputChange} placeholder="47058" className={inputCls("")} />
            </div>
            <div>
              <label className={labelCls}>Establishment Date</label>
              <input type="date" name="establishmentDate" value={formData.establishmentDate} onChange={handleInputChange} className={inputCls("establishmentDate")} />
              <FieldError field="establishmentDate" />
            </div>
          </div>

          <div className="mt-4">
            <label className={labelCls}>Station Logo / Image</label>
            <div className="flex items-center gap-4 mt-1">
              <Avatar
                userId={stationImageId}
                currentImage={formData.stationImage}
                size="lg"
              />
              <ImageUploadButton
                userId={stationImageId}
                currentImage={formData.stationImage}
                onUploadComplete={(url) =>
                  setFormData((prev) => ({ ...prev, stationImage: url }))
                }
                label="Upload Logo"
              />
            </div>
          </div>

          <NavButtons onPrev={handlePreviousStep} onNext={handleNextStep} />
        </div>
      )}

      {/* ── STEP 3 ── */}
      {step === 3 && (
        <div className={modalWrap}>
          <ModalHeader title="Configure your business" />
          <StepProgress />
          <StepBadge current={3} label="BUSINESS INFORMATION" />
          <ErrorBanner />

          <div className="mt-3">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Operational parameters</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Set up your station's operational configuration</p>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Business Type</label>
              <select name="businessType" value={formData.businessType} onChange={handleInputChange} className={selectCls("businessType")}>
                <option value="">Select Business Type</option>
                <option value="independent">Independent Station</option>
                <option value="franchise">Franchise</option>
                <option value="corporate">Corporate Owned</option>
              </select>
              <FieldError field="businessType" />
            </div>
            <div>
              <label className={labelCls}>Number of Pumps</label>
              <select name="numberOfPumps" value={formData.numberOfPumps} onChange={handleInputChange} className={selectCls("")}>
                {Array.from({ length: 30 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Operating Hours</label>
              <select name="operationHours" value={formData.operationHours} onChange={handleInputChange} className={selectCls("")}>
                <option value="">Select Hours</option>
                <option value="24/7">24/7</option>
                <option value="6am-10pm">6 AM – 10 PM</option>
                <option value="7am-9pm">7 AM – 9 PM</option>
                <option value="8am-8pm">8 AM – 8 PM</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Tank Capacity</label>
              <input type="text" name="tankCapacity" value={formData.tankCapacity} onChange={handleInputChange} placeholder="e.g. 100 Litres" className={inputCls("tankCapacity")} />
              <FieldError field="tankCapacity" />
            </div>
            <div>
              <label className={labelCls}>Average Monthly Revenue</label>
              <input type="text" name="averageMonthlyRevenue" value={formData.averageMonthlyRevenue} onChange={handleInputChange} placeholder="e.g. ₦500,000" className={inputCls("")} />
            </div>
            <div>
              <label className={labelCls}>Staff Members</label>
              <select name="staffMembers" value={formData.staffMembers} onChange={handleInputChange} className={selectCls("")}>
                {Array.from({ length: 30 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className={labelCls}>Fuel Types Offered</label>
              <div className="flex flex-wrap gap-3 sm:gap-6 mt-1 text-sm text-gray-600 dark:text-gray-300 font-medium">
                {["PMS", "AGO", "Diesel", "Kerosene", "Gas"].map((fuel) => (
                  <label key={fuel} className="flex gap-1.5 items-center cursor-pointer">
                    <input type="checkbox" name="fuelTypesOffered" value={fuel} checked={formData.fuelTypesOffered.includes(fuel)} onChange={handleInputChange} className="rounded" />
                    {fuel}
                  </label>
                ))}
              </div>
              <FieldError field="fuelTypesOffered" />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className={labelCls}>Additional Services</label>
              <div className="flex flex-wrap gap-3 sm:gap-5 mt-1 text-sm text-gray-600 dark:text-gray-300 font-medium">
                {["Lubricant Sales", "Car Wash", "Convenience Store", "Auto Repair", "Oil Change", "Food Service"].map((service) => (
                  <label key={service} className="flex gap-1.5 items-center cursor-pointer">
                    <input type="checkbox" name="additionalServices" value={service} checked={formData.additionalServices.includes(service)} onChange={handleInputChange} className="rounded" />
                    {service}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <NavButtons onPrev={handlePreviousStep} onNext={handleNextStep} />
        </div>
      )}

      {/* ── STEP 4 ── */}
      {step === 4 && (
        <div className={modalWrap}>
          <ModalHeader title="Security & notifications" />
          <StepProgress />
          <StepBadge current={4} label="SECURITY AND NOTIFICATIONS" />
          <ErrorBanner />

          {error && (
            <div className="mt-3 p-3 text-sm bg-red-50 border border-red-300 text-red-700 rounded-lg">{error}</div>
          )}

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password card */}
            <div className="border-2 border-gray-200 dark:border-gray-600 p-4 rounded-xl h-fit">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Password & Security</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Set up a strong password for your account</p>

              <div className="mt-4 relative">
                <label className={labelCls}>New password</label>
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Your password"
                  className={inputCls("password", "pr-10")}
                />
                <button
                  type="button"
                  className="absolute top-[2.1rem] right-3"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <Eye size={16} className="text-gray-500" /> : <EyeOff size={16} className="text-gray-500" />}
                </button>
                <FieldError field="password" />
              </div>

              <div className="mt-3 relative">
                <label className={labelCls}>Confirm new password</label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  className={inputCls("confirmPassword", "pr-10")}
                />
                <button
                  type="button"
                  className="absolute top-[2.1rem] right-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <Eye size={16} className="text-gray-500" /> : <EyeOff size={16} className="text-gray-500" />}
                </button>
                <FieldError field="confirmPassword" />
              </div>

              <div className="mt-5 flex justify-between items-center">
                <div>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">2-FACTOR AUTHENTICATOR</p>
                  <p className="text-xs text-gray-500">Highly recommended</p>
                </div>
                <ToggleSwitch
                  checked={formData.twoFactorAuthEnabled}
                  onChange={(value) => handleToggleChange("twoFactorAuthEnabled", value)}
                />
              </div>
            </div>

            {/* Notifications card */}
            <div className="border-2 border-gray-200 dark:border-gray-600 p-4 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Notification Preferences</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Configure how you receive notifications</p>

              <div className="flex flex-col gap-3 mt-4">
                {[
                  { key: "email", label: "Email" },
                  { key: "sms", label: "SMS" },
                  { key: "push", label: "Push" },
                  { key: "lowStock", label: "Low Stock" },
                  { key: "mail", label: "Mail" },
                  { key: "sales", label: "Sales" },
                  { key: "staffs", label: "Staffs" },
                ].map(({ key, label }) => (
                  <div key={key} className="flex justify-between items-center text-sm text-gray-700 dark:text-gray-300">
                    {label}
                    <ToggleSwitch
                      checked={formData.notificationPreferences[key]}
                      onChange={(value) => handleToggleChange(key, value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="mt-5 mb-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Terms of Service & Privacy Policy
            </h3>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-3 max-h-48 overflow-y-auto mb-4">
              {termsLoading ? (
                <p className="text-xs text-gray-400">Loading terms...</p>
              ) : (
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {termsText}
                </p>
              )}
            </div>

            <div className="flex gap-3 items-start">
              <input
                type="checkbox"
                id="termsAccepted"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleInputChange}
                className="mt-0.5 rounded cursor-pointer shrink-0"
              />
              <label htmlFor="termsAccepted" className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 cursor-pointer leading-relaxed">
                I have read and agree to the Terms of Service and Privacy Policy
              </label>
            </div>

            {stepErrors.termsAccepted && (
              <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                <span>⚠</span> {stepErrors.termsAccepted}
              </p>
            )}
          </div>

          <NavButtons
            onPrev={handlePreviousStep}
            onNext={handleNextStep}
            nextLabel={isLoading ? "Creating Account..." : "Complete Setup"}
          />
        </div>
      )}

      {/* ── STEP 5 (success) ── */}
      {step === 5 && (
        <div className="bg-white dark:bg-gray-800 p-5 sm:p-8 rounded-xl shadow-xl max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto scrollbar-hide">
          <div className="mx-auto mb-5 h-16 w-16 sm:h-20 sm:w-20 rounded-full flex justify-center bg-green-600 items-center">
            <Check className="text-white" size={28} />
          </div>
          <h2 className="text-center text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">
            Account Created Successfully
          </h2>

          {selectedPlan && (
            <div className="flex justify-center mt-3 mb-2">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg px-4 py-2 inline-block">
                <p className="text-blue-600 dark:text-blue-400 text-sm font-semibold">
                  {selectedPlan.billingCycle === "free"
                    ? "✅ Free Plan Activated"
                    : `🎯 ${selectedPlan.name} Selected — Complete payment to activate`}
                </p>
              </div>
            </div>
          )}

          <div className="mt-5">
            <h4 className="text-base sm:text-lg text-center font-semibold text-[#0080ff] mb-4">What You'll Get</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {featuresData.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <img src={item.imageUrl} alt="" className="w-8 h-8 sm:w-10 sm:h-10 object-contain shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white">{item.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center sm:justify-end mt-6">
            <button
              onClick={handleAccessDashboard}
              className="bg-[#0080ff] hover:bg-blue-700 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-colors"
            >
              {sessionStorage.getItem("pendingPayment") ? "Proceed to Payment" : "Access Dashboard"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}