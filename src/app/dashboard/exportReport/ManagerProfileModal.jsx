"use client";

import ToggleSwitch from "@/components/ToggleSwtich";
import { Edit, Mail, MapPin, Phone, X, Save } from "lucide-react";
import { useState } from "react";

const ManagerProfileModal = ({ onclose }) => {
  const [active, setActive] = useState("personalInfo");
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [managerData, setManagerData] = useState({
    firstName: "Dave",
    lastName: "Johnson",
    stationName: "Flourish Station",
    stationID: "004",
    stationEmailAddress: "fluorishstation@gmail.com",
    stationPhone: "07034394212",
    stationAddress: "No 2 rumuokoro, portharcourt",
    stationCity: "Benue",
    stationCountry: "Nigeria",
    licenseNo: "0051",
    establishedDate: "04/04/2017",
    taxID: "001459",
    email: "davejohnson2002@gmail.com",
    phone: "08134567253",
    state: "Benue",
    country: "Nigeria",
    zipCode: "455323",
    emergencyContact: "09069572421",
    employeeID: "0025",
    position: "Manager",
    department: "General Dept",
    employmentType: "Contract",
    startDate: "07/12/2018",
    workSchedule: "24/7",
    annualWages: "4,000,000",
    payFrequency: "monthly",
    businessType: "Dave",
    operatingHours: "6am - 11am",
    noOfPumps: 10,
    staffMembers: 17,
    fuelTypesOffered: ["PMS", "AGO", "Diesel"],
    AdditionalServices: "Lubricant sales",
    tankCapacity: "100,000 Litres",
    avMonthlyRevenue: "₦120,000,000",
    theme: "Light",
    language: "English",
    timezone: "GMT-12-23435"
  });

  const handleInputChange = (field, value) => {
    setManagerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Add your save logic here - e.g., API call
    console.log('Saving manager data:', managerData);
    setIsEditMode(false);
  };

  const handleCancel = () => {
    // Reset to original values if needed
    setIsEditMode(false);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setManagerData(prev => ({
          ...prev,
          src: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to get input styling based on edit mode
  const getInputStyles = (hasIcon = false) => {
    const baseStyles = `w-full p-3 rounded-[8px] transition-all duration-200 ${hasIcon ? 'pl-10' : ''}`;
    
    if (isEditMode) {
      return `${baseStyles} bg-white border-2 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none`;
    } else {
      return `${baseStyles} bg-[#e7e7e7] border border-gray-300 text-gray-600 cursor-not-allowed`;
    }
  };

  return (
    <div className="fixed px-4 lg:px-0 inset-0 z-50 flex items-center justify-center bg-black/50">
      {/* modal box */}
      <div className="bg-white border-2 rounded-lg w-full max-w-[400px] lg:max-w-[700px] p-3 max-h-[80vh] scrollbar-hide overflow-y-auto">
        <header className="flex justify-between">
          <div>
            <h3 className="text-[24px] font-semibold">Manager Profile</h3>
            <p>Personal and employment information</p>
          </div>
          <div onClick={onclose} className="cursor-pointer">
            <X />
          </div>
        </header>

        <section className="mt-10 flex flex-col gap-2 lg:flex-row justify-between items-center">
          <div className="flex gap-4 items-center">
            <div className="relative">
              {managerData.src ? (
                <img
                  src={managerData.src}
                  height={60}
                  width={60}
                  alt="manager pic"
                  className="rounded-full h-[60px] w-[60px] object-cover"
                />
              ) : (
                <div className="bg-gray-400 flex justify-center items-center rounded-full h-[60px] text-sm w-[60px]">
                  No img
                </div>
              )}
              
              {/* File input overlay for edit mode */}
              {isEditMode && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer hover:bg-opacity-70 transition-opacity">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Edit className="text-white" size={20} />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="text-[22px] font-semibold">
                {managerData.firstName + " " + managerData.lastName}
              </h4>
              <p>Station Manager - {managerData.stationName}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {!isEditMode ? (
              <button 
                onClick={() => setIsEditMode(true)}
                className="flex gap-1 bg-[#0080ff] items-center text-white p-2 rounded-[10px] text-sm hover:bg-[#0066cc] transition-colors"
              >
                Edit Profile <Edit />
              </button>
            ) : (
              <>
                <button 
                  onClick={handleSave}
                  className="flex gap-1 bg-green-600 items-center text-white p-2 rounded-[10px] text-sm hover:bg-green-700 transition-colors"
                >
                  Save <Save />
                </button>
                <button 
                  onClick={handleCancel}
                  className="flex gap-1 bg-gray-600 items-center text-white p-2 rounded-[10px] text-sm hover:bg-gray-700 transition-colors"
                >
                  Cancel <X />
                </button>
              </>
            )}
          </div>
        </section>

        <section className="mt-8">
          <div className="border-2 text-sm lg:text-md flex flex-wrap gap-2 justify-start lg:justify-between items-center p-3 rounded-[10px] border-gray-300">
            <div
              onClick={() => setActive("personalInfo")}
              className={`cursor-pointer ${
                active === "personalInfo"
                  ? "text-[#0080ff] bg-[#d9edff]"
                  : "bg-transparent"
              } px-6 py-2 rounded-[10px]`}
            >
              Personal
            </div>
            <div
              onClick={() => setActive("station")}
              className={`cursor-pointer ${
                active === "station"
                  ? "text-[#0080ff] bg-[#d9edff]"
                  : "bg-transparent"
              } px-6 py-2 rounded-[10px]`}
            >
              Station
            </div>
            <div
              onClick={() => setActive("employment")}
              className={`cursor-pointer ${
                active === "employment"
                  ? "text-[#0080ff] bg-[#d9edff]"
                  : "bg-transparent"
              } px-6 py-2 rounded-[10px]`}
            >
              Employment
            </div>
            <div
              onClick={() => setActive("business")}
              className={`cursor-pointer ${
                active === "business"
                  ? "text-[#0080ff] bg-[#d9edff]"
                  : "bg-transparent"
              } px-6 py-2 rounded-[10px]`}
            >
              Business
            </div>
            <div
              onClick={() => setActive("preferences")}
              className={`cursor-pointer ${
                active === "preferences"
                  ? "text-[#0080ff] bg-[#d9edff]"
                  : "bg-transparent"
              } px-6 py-2 rounded-[10px]`}
            >
              Preferences
            </div>
          </div>
        </section>

        {/* personal information */}
        {active === "personalInfo" && (
          <section id="personalInfo" className="mt-14">
            <div>
              <h5 className="font-semibold text-lg">Personal Information</h5>
              <p>Your personal details and contact information</p>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-sm mb-1">First name</p>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={managerData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={getInputStyles()}
                />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">Last name</p>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={managerData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={getInputStyles()}
                />
              </div>
              <div className="relative">
                <p className="font-semibold text-sm mb-1">Email Address</p>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={managerData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={getInputStyles(true)}
                />
                <Mail className="text-sm absolute top-8 left-3" />
              </div>
              <div className="relative">
                <p className="font-semibold text-sm mb-1">Phone number</p>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={managerData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={getInputStyles(true)}
                />
                <Phone className="text-sm absolute top-8 left-3" />
              </div>
              <div className="relative col-span-1 lg:col-span-2">
                <p className="font-semibold text-sm mb-1">Address</p>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={managerData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={getInputStyles(true)}
                />
                <MapPin className="text-sm absolute top-8 left-3" />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">State</p>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={managerData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className={getInputStyles()}
                />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">Country</p>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={managerData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className={getInputStyles()}
                />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">Zip Code</p>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={managerData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  className={getInputStyles()}
                />
              </div>
              <div className="relative">
                <p className="font-semibold text-sm mb-1">Emergency contact</p>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={managerData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  className={getInputStyles(true)}
                />
                <Phone className="text-sm absolute top-8 left-3" />
              </div>
            </div>
          </section>
        )}

        {/* station information */}
        {active === "station" && (
          <section id="station" className="mt-14">
            <div>
              <h5 className="font-semibold text-lg">Station Information</h5>
              <p>Details about your station</p>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-sm mb-1">Station name</p>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={managerData.stationName}
                  onChange={(e) => handleInputChange('stationName', e.target.value)}
                  className={getInputStyles()}
                />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">Station ID</p>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={managerData.stationID}
                  onChange={(e) => handleInputChange('stationID', e.target.value)}
                  className={getInputStyles()}
                />
              </div>
              <div className="relative">
                <p className="font-semibold text-sm mb-1">Station email address</p>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={managerData.stationEmailAddress}
                  onChange={(e) => handleInputChange('stationEmailAddress', e.target.value)}
                  className={getInputStyles(true)}
                />
                <Mail className="text-sm absolute top-8 left-3" />
              </div>
              <div className="relative">
                <p className="font-semibold text-sm mb-1">Station phone number</p>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={managerData.stationPhone}
                  onChange={(e) => handleInputChange('stationPhone', e.target.value)}
                  className={getInputStyles(true)}
                />
                <Phone className="text-sm absolute top-8 left-3" />
              </div>
              <div className="relative col-span-1 lg:col-span-2">
                <p className="font-semibold text-sm mb-1">Station Address</p>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={managerData.stationAddress}
                  onChange={(e) => handleInputChange('stationAddress', e.target.value)}
                  className={getInputStyles(true)}
                />
                <MapPin className="text-sm absolute top-8 left-3" />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">Station city</p>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={managerData.stationCity}
                  onChange={(e) => handleInputChange('stationCity', e.target.value)}
                  className={getInputStyles()}
                />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">Country</p>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={managerData.stationCountry}
                  onChange={(e) => handleInputChange('stationCountry', e.target.value)}
                  className={getInputStyles()}
                />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">Zip Code</p>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={managerData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  className={getInputStyles()}
                />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">License Number</p>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={managerData.licenseNo}
                  onChange={(e) => handleInputChange('licenseNo', e.target.value)}
                  className={getInputStyles()}
                />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">Tax ID</p>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={managerData.taxID}
                  onChange={(e) => handleInputChange('taxID', e.target.value)}
                  className={getInputStyles()}
                />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">Established date</p>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={managerData.establishedDate}
                  onChange={(e) => handleInputChange('establishedDate', e.target.value)}
                  className={getInputStyles()}
                />
              </div>
            </div>
          </section>
        )}

        {/* employment info */}
        {active === "employment" && (
          <section id="employment" className="mt-14">
            <div>
              <h5 className="font-semibold text-lg">Employment details</h5>
              <p>Your employment information</p>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-sm mb-1">Employee ID</p>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={managerData.employeeID}
                  onChange={(e) => handleInputChange('employeeID', e.target.value)}
                  className={getInputStyles()}
                />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">Position</p>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={managerData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  className={getInputStyles()}
                />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">Department</p>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={managerData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className={getInputStyles()}
                />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">Employment type</p>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={managerData.employmentType}
                  onChange={(e) => handleInputChange('employmentType', e.target.value)}
                  className={getInputStyles()}
                />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">Start date</p>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={managerData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className={getInputStyles()}
                />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">Work schedule</p>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={managerData.workSchedule}
                  onChange={(e) => handleInputChange('workSchedule', e.target.value)}
                  className={getInputStyles()}
                />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">Annual wages</p>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={managerData.annualWages}
                  onChange={(e) => handleInputChange('annualWages', e.target.value)}
                  className={getInputStyles()}
                />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">Pay frequency</p>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={managerData.payFrequency}
                  onChange={(e) => handleInputChange('payFrequency', e.target.value)}
                  className={getInputStyles()}
                />
              </div>
            </div>
          </section>
        )}

        {/* business info */}
        {active === "business" && (
          <section id="business" className="mt-14">
            <div>
              <h5 className="font-semibold text-lg">Business Information</h5>
              <p>Details of station parameters</p>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-sm mb-1">Business type</p>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={managerData.businessType}
                  onChange={(e) => handleInputChange('businessType', e.target.value)}
                  className={getInputStyles()}
                />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">Operating hours</p>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={managerData.operatingHours}
                  onChange={(e) => handleInputChange('operatingHours', e.target.value)}
                  className={getInputStyles()}
                />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">Number of pumps</p>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={managerData.noOfPumps}
                  onChange={(e) => handleInputChange('noOfPumps', e.target.value)}
                  className={getInputStyles()}
                />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">Staff members</p>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={managerData.staffMembers}
                  onChange={(e) => handleInputChange('staffMembers', e.target.value)}
                  className={getInputStyles()}
                />
              </div>
            </div>

            <div className="mt-10">
              <div>
                <h4 className="font-bold">Fuel types offered</h4>
                <div className="flex gap-3 text-sm font-semibold mt-2">
                  <p className="bg-[#b2ffb4] text-[#04910c] p-2 rounded-xl">
                    {managerData.fuelTypesOffered[0]}
                  </p>
                  <p className="bg-[#fec6aa] text-[#eb2b0b] p-2 rounded-xl">
                    {managerData.fuelTypesOffered[1]}
                  </p>
                  <p className="bg-[#dcd2ff] text-[#7f27ff] p-2 rounded-xl">
                    {managerData.fuelTypesOffered[2]}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-bold mb-3">Additional Services</h4>

                <div className="bg-[#e6ff96] text-[#04910c] text-sm p-2 rounded-xl font-semibold w-fit">
                  Lubricant sales
                </div>

                <div className="mt-8 flex gap-4">
                  <div className="bg-[#dcd2ff] text-[#7f2ff4] flex flex-col items-start lg:items-center font-semibold py-2 px-4 rounded-lg">
                    <h4 className="text-xl lg:text-2xl">
                      {managerData.tankCapacity}
                    </h4>
                    <p className="text-sm">Tank Capacity</p>
                  </div>
                  <div className="bg-[#b2ffb4] flex flex-col items-start lg:items-center py-2 px-4 rounded-lg text-[#04910c] font-semibold">
                    <h4 className="text-xl lg:text-2xl">
                      {managerData.avMonthlyRevenue}
                    </h4>
                    <p className="text-sm">Average Monthly Revenue</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* preferences */}
        {active === "preferences" && (
          <section id="preferences" className="mt-14">
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 items-start gap-4">
              <div className="border-2 border-gray-300 p-6 rounded-xl">
                <div className="mb-6">
                  <h5 className="font-semibold">Notification preferences</h5>
                  <p className="text-sm">
                    Configure how you receive notifications
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <p>Email</p>
                    <ToggleSwitch />
                  </div>
                  <div className="flex justify-between items-center">
                    <p>SMS</p>
                    <ToggleSwitch />
                  </div>
                  <div className="flex justify-between items-center">
                    <p>Push</p>
                    <ToggleSwitch />
                  </div>
                  <div className="flex justify-between items-center">
                    <p>Low stock</p>
                    <ToggleSwitch />
                  </div>
                  <div className="flex justify-between items-center">
                    <p>Sales</p>
                    <ToggleSwitch />
                  </div>
                  <div className="flex justify-between items-center">
                    <p>Staffs</p>
                    <ToggleSwitch />
                  </div>
                </div>
              </div>

              <div className="border-2 border-gray-300 rounded-xl p-6">
                <div className="mb-6">
                  <h5 className="font-semibold">Dashboard preferences</h5>
                  <p className="text-sm">
                    Customize your dashboard experience
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <div>
                    <p className="font-semibold text-sm mb-1">Theme</p>
                    <input 
                      type="text" 
                      disabled={!isEditMode}
                      value={managerData.theme}
                      onChange={(e) => handleInputChange('theme', e.target.value)}
                      className={getInputStyles()}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-1">Language</p>
                    <input 
                      type="text" 
                      disabled={!isEditMode}
                      value={managerData.language}
                      onChange={(e) => handleInputChange('language', e.target.value)}
                      className={getInputStyles()}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-1">Timezone</p>
                    <input 
                      type="text" 
                      disabled={!isEditMode}
                      value={managerData.timezone}
                      onChange={(e) => handleInputChange('timezone', e.target.value)}
                      className={getInputStyles()}
                    />
                  </div>

                  <div className="my-3 flex text-sm justify-between items-center">
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
};

export default ManagerProfileModal;