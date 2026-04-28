"use client";

import ToggleSwitch from "@/components/ToggleSwtich";
import { Edit, Mail, MapPin, Phone, X, Save, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

export default function ManagerProfileModal({ onclose }) {
  const [active, setActive] = useState("personalInfo");
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [userId, setUserId] = useState(null);
  const [originalData, setOriginalData] = useState(null);

  const [managerData, setManagerData] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", state: "", country: "Nigeria",
    zipCode: "", emergencyContact: "",
    stationName: "", stationID: "", stationEmailAddress: "",
    stationPhone: "", stationAddress: "", stationCity: "",
    stationCountry: "Nigeria", licenseNo: "", establishedDate: "", taxID: "",
    employeeID: "", position: "Manager", department: "General Dept",
    employmentType: "Contract", startDate: "", workSchedule: "24/7",
    annualWages: "", payFrequency: "Monthly",
    businessType: "", operatingHours: "", noOfPumps: "",
    staffMembers: "", fuelTypesOffered: [], AdditionalServices: "",
    tankCapacity: "", avMonthlyRevenue: "",
    theme: "Light", language: "English", timezone: "GMT+1",
    src: null,
  });

  // Pre-fill from localStorage on mount
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const st = user.station || {};
      setUserId(user._id || user.id);
      const prefilled = {
        // Personal
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        country: user.country || "Nigeria",
        zipCode: user.zipCode || "",
        emergencyContact: user.emergencyContact || "",
        src: user.image || null,
        // Employment
        employeeID: (user._id || user.id) ? String(user._id || user.id).slice(-6).toUpperCase() : "",
        position: user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Manager",
        startDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-GB") : "",
        // Station
        stationName: st.name || "",
        stationID: st._id ? String(st._id).slice(-6).toUpperCase() : "",
        stationEmailAddress: st.email || "",
        stationPhone: st.phone || "",
        stationAddress: st.address || "",
        stationCity: st.city || "",
        stationCountry: st.country || "Nigeria",
        licenseNo: st.licenseNumber || "",
        taxID: st.taxId || "",
        establishedDate: st.establishmentDate ? new Date(st.establishmentDate).toLocaleDateString("en-GB") : "",
        // Business
        businessType: st.businessType || "",
        noOfPumps: st.numberOfPumps != null ? String(st.numberOfPumps) : "",
        operatingHours: st.operationHours || "",
        tankCapacity: st.tankCapacity != null ? String(st.tankCapacity) : "",
        avMonthlyRevenue: st.averageMonthlyRevenue != null ? String(st.averageMonthlyRevenue) : "",
        fuelTypesOffered: Array.isArray(st.fuelTypesOffered) ? st.fuelTypesOffered : [],
        AdditionalServices: Array.isArray(st.additionalServices) ? st.additionalServices.join(", ") : (st.additionalServices || ""),
      };
      setManagerData(prev => ({ ...prev, ...prefilled }));
      setOriginalData(prefilled);
    } catch {}
  }, []);

  const handleInputChange = (field, value) => {
    setManagerData(prev => ({ ...prev, [field]: value }));
    if (saveError) setSaveError("");
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveError("");
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/auth/update-staff/${userId}`,
        {
          firstName: managerData.firstName,
          lastName: managerData.lastName,
          phone: managerData.phone,
          address: managerData.address,
          city: managerData.city,
          state: managerData.state,
          country: managerData.country,
          zipCode: managerData.zipCode,
          emergencyContact: managerData.emergencyContact,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Sync localStorage so the header name updates immediately
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({
        ...user,
        firstName: managerData.firstName,
        lastName: managerData.lastName,
        phone: managerData.phone,
        address: managerData.address,
        city: managerData.city,
        state: managerData.state,
        country: managerData.country,
        zipCode: managerData.zipCode,
        emergencyContact: managerData.emergencyContact,
      }));
      setOriginalData({ ...managerData });
      setSaveSuccess(true);
      setIsEditMode(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err.response?.data?.message || "Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (originalData) setManagerData({ ...originalData });
    setIsEditMode(false);
    setSaveError("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => handleInputChange("src", ev.target.result);
    reader.readAsDataURL(file);
  };

  const inputCls = (hasIcon = false) => {
    const base = `w-full p-3 rounded-[8px] transition-all duration-200 text-sm dark:text-gray-100 ${hasIcon ? "pl-10" : ""}`;
    return isEditMode
      ? `${base} bg-white dark:bg-gray-700 border-2 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none`
      : `${base} bg-[#e7e7e7] dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed`;
  };

  const tabs = [
    { key: "personalInfo", label: "Personal" },
    { key: "station", label: "Station" },
    { key: "employment", label: "Employment" },
    { key: "business", label: "Business" },
    { key: "preferences", label: "Preferences" },
  ];

  return (
    <div className="fixed px-4 lg:px-0 inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 border-2 dark:border-gray-700 rounded-lg w-full max-w-[400px] lg:max-w-[700px] p-4 max-h-[85vh] scrollbar-hide overflow-y-auto">

        {/* Header */}
        <header className="flex justify-between items-start">
          <div>
            <h3 className="text-[22px] font-semibold dark:text-white">Manager Profile</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Personal and employment information</p>
          </div>
          <button onClick={onclose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors mt-1">
            <X size={20} />
          </button>
        </header>

        {/* Save success */}
        {saveSuccess && (
          <div className="mt-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg px-3 py-2 text-green-700 dark:text-green-400 text-sm font-medium">
            Profile updated successfully!
          </div>
        )}

        {/* Save error */}
        {saveError && (
          <div className="mt-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg px-3 py-2 text-red-700 dark:text-red-400 text-sm">
            {saveError}
          </div>
        )}

        {/* Avatar + name + action buttons */}
        <section className="mt-6 flex flex-col gap-2 lg:flex-row justify-between items-center">
          <div className="flex gap-4 items-center">
            <div className="relative flex-shrink-0">
              {managerData.src ? (
                <img src={managerData.src} alt="profile" className="rounded-full h-[60px] w-[60px] object-cover" />
              ) : (
                <div className="bg-blue-600 flex justify-center items-center rounded-full h-[60px] w-[60px] text-white text-xl font-bold">
                  {(managerData.firstName?.[0] || "") + (managerData.lastName?.[0] || "")}
                </div>
              )}
              {isEditMode && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer hover:bg-black/70 transition-opacity">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <Edit className="text-white" size={16} />
                </div>
              )}
            </div>
            <div>
              <h4 className="text-[20px] font-semibold dark:text-white">
                {`${managerData.firstName} ${managerData.lastName}`.trim() || "Manager"}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Station Manager{managerData.stationName ? ` · ${managerData.stationName}` : ""}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {!isEditMode ? (
              <button
                onClick={() => setIsEditMode(true)}
                className="flex gap-1 items-center bg-[#0080ff] text-white px-3 py-2 rounded-[10px] text-sm hover:bg-[#0066cc] transition-colors"
              >
                <Edit size={15} /> Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex gap-1 items-center bg-green-600 text-white px-3 py-2 rounded-[10px] text-sm hover:bg-green-700 transition-colors disabled:opacity-60"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex gap-1 items-center bg-gray-500 text-white px-3 py-2 rounded-[10px] text-sm hover:bg-gray-600 transition-colors"
                >
                  <X size={15} /> Cancel
                </button>
              </>
            )}
          </div>
        </section>

        {/* Tab nav */}
        <section className="mt-6">
          <div className="border-2 dark:border-gray-700 text-sm flex flex-wrap gap-2 justify-start lg:justify-between items-center p-2 rounded-[10px] border-gray-200">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                className={`px-4 py-2 rounded-[8px] font-medium transition-colors ${
                  active === t.key
                    ? "text-[#0080ff] bg-[#d9edff] dark:bg-blue-900/30"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Personal Info ── */}
        {active === "personalInfo" && (
          <section className="mt-8">
            <h5 className="font-semibold text-base dark:text-white">Personal Information</h5>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Your personal details and contact information</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-sm mb-1 dark:text-gray-300">First name</p>
                <input type="text" disabled={!isEditMode} value={managerData.firstName}
                  onChange={e => handleInputChange("firstName", e.target.value)} className={inputCls()} />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1 dark:text-gray-300">Last name</p>
                <input type="text" disabled={!isEditMode} value={managerData.lastName}
                  onChange={e => handleInputChange("lastName", e.target.value)} className={inputCls()} />
              </div>
              <div className="relative">
                <p className="font-semibold text-sm mb-1 dark:text-gray-300">Email Address <span className="text-xs text-gray-400 font-normal">(read-only)</span></p>
                <input type="email" disabled value={managerData.email}
                  className={`w-full p-3 pl-10 rounded-[8px] text-sm bg-[#e7e7e7] dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-500 cursor-not-allowed`} />
                <Mail size={15} className="absolute top-9 left-3 text-gray-400" />
              </div>
              <div className="relative">
                <p className="font-semibold text-sm mb-1 dark:text-gray-300">Phone number</p>
                <input type="text" disabled={!isEditMode} value={managerData.phone}
                  onChange={e => handleInputChange("phone", e.target.value)} className={inputCls(true)} />
                <Phone size={15} className="absolute top-9 left-3 text-gray-400" />
              </div>
              <div className="relative col-span-1 lg:col-span-2">
                <p className="font-semibold text-sm mb-1 dark:text-gray-300">Address</p>
                <input type="text" disabled={!isEditMode} value={managerData.address}
                  onChange={e => handleInputChange("address", e.target.value)} className={inputCls(true)} />
                <MapPin size={15} className="absolute top-9 left-3 text-gray-400" />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1 dark:text-gray-300">City</p>
                <input type="text" disabled={!isEditMode} value={managerData.city}
                  onChange={e => handleInputChange("city", e.target.value)} className={inputCls()} />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1 dark:text-gray-300">State</p>
                <input type="text" disabled={!isEditMode} value={managerData.state}
                  onChange={e => handleInputChange("state", e.target.value)} className={inputCls()} />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1 dark:text-gray-300">Country</p>
                <input type="text" disabled={!isEditMode} value={managerData.country}
                  onChange={e => handleInputChange("country", e.target.value)} className={inputCls()} />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1 dark:text-gray-300">Zip Code</p>
                <input type="text" disabled={!isEditMode} value={managerData.zipCode}
                  onChange={e => handleInputChange("zipCode", e.target.value)} className={inputCls()} />
              </div>
              <div className="relative">
                <p className="font-semibold text-sm mb-1 dark:text-gray-300">Emergency contact</p>
                <input type="text" disabled={!isEditMode} value={managerData.emergencyContact}
                  onChange={e => handleInputChange("emergencyContact", e.target.value)} className={inputCls(true)} />
                <Phone size={15} className="absolute top-9 left-3 text-gray-400" />
              </div>
            </div>
          </section>
        )}

        {/* ── Station Info ── */}
        {active === "station" && (
          <section className="mt-8">
            <h5 className="font-semibold text-base dark:text-white">Station Information</h5>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Details about your station</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-sm mb-1 dark:text-gray-300">Station name</p>
                <input type="text" disabled={!isEditMode} value={managerData.stationName}
                  onChange={e => handleInputChange("stationName", e.target.value)} className={inputCls()} />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1 dark:text-gray-300">Station ID</p>
                <input type="text" disabled={!isEditMode} value={managerData.stationID}
                  onChange={e => handleInputChange("stationID", e.target.value)} className={inputCls()} />
              </div>
              <div className="relative">
                <p className="font-semibold text-sm mb-1 dark:text-gray-300">Station email</p>
                <input type="email" disabled={!isEditMode} value={managerData.stationEmailAddress}
                  onChange={e => handleInputChange("stationEmailAddress", e.target.value)} className={inputCls(true)} />
                <Mail size={15} className="absolute top-9 left-3 text-gray-400" />
              </div>
              <div className="relative">
                <p className="font-semibold text-sm mb-1 dark:text-gray-300">Station phone</p>
                <input type="text" disabled={!isEditMode} value={managerData.stationPhone}
                  onChange={e => handleInputChange("stationPhone", e.target.value)} className={inputCls(true)} />
                <Phone size={15} className="absolute top-9 left-3 text-gray-400" />
              </div>
              <div className="relative col-span-1 lg:col-span-2">
                <p className="font-semibold text-sm mb-1 dark:text-gray-300">Station address</p>
                <input type="text" disabled={!isEditMode} value={managerData.stationAddress}
                  onChange={e => handleInputChange("stationAddress", e.target.value)} className={inputCls(true)} />
                <MapPin size={15} className="absolute top-9 left-3 text-gray-400" />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1 dark:text-gray-300">Station city</p>
                <input type="text" disabled={!isEditMode} value={managerData.stationCity}
                  onChange={e => handleInputChange("stationCity", e.target.value)} className={inputCls()} />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1 dark:text-gray-300">Country</p>
                <input type="text" disabled={!isEditMode} value={managerData.stationCountry}
                  onChange={e => handleInputChange("stationCountry", e.target.value)} className={inputCls()} />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1 dark:text-gray-300">License number</p>
                <input type="text" disabled={!isEditMode} value={managerData.licenseNo}
                  onChange={e => handleInputChange("licenseNo", e.target.value)} className={inputCls()} />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1 dark:text-gray-300">Tax ID</p>
                <input type="text" disabled={!isEditMode} value={managerData.taxID}
                  onChange={e => handleInputChange("taxID", e.target.value)} className={inputCls()} />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1 dark:text-gray-300">Established date</p>
                <input type="text" disabled={!isEditMode} value={managerData.establishedDate}
                  onChange={e => handleInputChange("establishedDate", e.target.value)} className={inputCls()} />
              </div>
            </div>
          </section>
        )}

        {/* ── Employment ── */}
        {active === "employment" && (
          <section className="mt-8">
            <h5 className="font-semibold text-base dark:text-white">Employment Details</h5>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Your employment information</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-sm mb-1 dark:text-gray-300">Employee ID</p>
                <input type="text" disabled value={managerData.employeeID} className={inputCls()} />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1 dark:text-gray-300">Position</p>
                <input type="text" disabled value={managerData.position} className={inputCls()} />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1 dark:text-gray-300">Department</p>
                <input type="text" disabled={!isEditMode} value={managerData.department}
                  onChange={e => handleInputChange("department", e.target.value)} className={inputCls()} />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1 dark:text-gray-300">Employment type</p>
                <input type="text" disabled={!isEditMode} value={managerData.employmentType}
                  onChange={e => handleInputChange("employmentType", e.target.value)} className={inputCls()} />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1 dark:text-gray-300">Start date</p>
                <input type="text" disabled value={managerData.startDate} className={inputCls()} />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1 dark:text-gray-300">Work schedule</p>
                <input type="text" disabled={!isEditMode} value={managerData.workSchedule}
                  onChange={e => handleInputChange("workSchedule", e.target.value)} className={inputCls()} />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1 dark:text-gray-300">Annual wages</p>
                <input type="text" disabled={!isEditMode} value={managerData.annualWages}
                  onChange={e => handleInputChange("annualWages", e.target.value)} className={inputCls()} />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1 dark:text-gray-300">Pay frequency</p>
                <input type="text" disabled={!isEditMode} value={managerData.payFrequency}
                  onChange={e => handleInputChange("payFrequency", e.target.value)} className={inputCls()} />
              </div>
            </div>
          </section>
        )}

        {/* ── Business ── */}
        {active === "business" && (
          <section className="mt-8">
            <h5 className="font-semibold text-base dark:text-white">Business Information</h5>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Operational parameters of your station</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-sm mb-1 dark:text-gray-300">Business type</p>
                <input type="text" disabled={!isEditMode} value={managerData.businessType}
                  onChange={e => handleInputChange("businessType", e.target.value)} className={inputCls()} />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1 dark:text-gray-300">Operating hours</p>
                <input type="text" disabled={!isEditMode} value={managerData.operatingHours}
                  onChange={e => handleInputChange("operatingHours", e.target.value)} className={inputCls()} />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1 dark:text-gray-300">Number of pumps</p>
                <input type="text" disabled={!isEditMode} value={managerData.noOfPumps}
                  onChange={e => handleInputChange("noOfPumps", e.target.value)} className={inputCls()} />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1 dark:text-gray-300">Staff members</p>
                <input type="text" disabled={!isEditMode} value={managerData.staffMembers}
                  onChange={e => handleInputChange("staffMembers", e.target.value)} className={inputCls()} />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1 dark:text-gray-300">Tank capacity</p>
                <input type="text" disabled={!isEditMode} value={managerData.tankCapacity}
                  onChange={e => handleInputChange("tankCapacity", e.target.value)} className={inputCls()} />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1 dark:text-gray-300">Average monthly revenue</p>
                <input type="text" disabled={!isEditMode} value={managerData.avMonthlyRevenue}
                  onChange={e => handleInputChange("avMonthlyRevenue", e.target.value)} className={inputCls()} />
              </div>
            </div>

            {managerData.fuelTypesOffered?.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-sm dark:text-gray-300 mb-2">Fuel types offered</h4>
                <div className="flex flex-wrap gap-2">
                  {managerData.fuelTypesOffered.map((f, i) => (
                    <span key={i} className="bg-[#d9edff] text-[#0080ff] text-sm px-3 py-1 rounded-xl font-semibold">{f}</span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── Preferences ── */}
        {active === "preferences" && (
          <section className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-start gap-4">
              <div className="border-2 dark:border-gray-700 border-gray-200 p-5 rounded-xl">
                <h5 className="font-semibold dark:text-white mb-1">Notification preferences</h5>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Configure how you receive notifications</p>
                <div className="flex flex-col gap-3 text-sm dark:text-gray-300">
                  {["Email", "SMS", "Push", "Low stock", "Sales", "Staffs"].map(label => (
                    <div key={label} className="flex justify-between items-center">
                      <p>{label}</p>
                      <ToggleSwitch />
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-2 dark:border-gray-700 border-gray-200 rounded-xl p-5">
                <h5 className="font-semibold dark:text-white mb-1">Dashboard preferences</h5>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Customize your dashboard experience</p>
                <div className="flex flex-col gap-3">
                  {[
                    { label: "Theme", key: "theme" },
                    { label: "Language", key: "language" },
                    { label: "Timezone", key: "timezone" },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <p className="font-semibold text-sm mb-1 dark:text-gray-300">{label}</p>
                      <input type="text" disabled={!isEditMode} value={managerData[key] ?? ""}
                        onChange={e => handleInputChange(key, e.target.value)} className={inputCls()} />
                    </div>
                  ))}
                  <div className="mt-2 flex text-sm justify-between items-center dark:text-gray-300">
                    Auto refresh dashboard
                    <ToggleSwitch />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
