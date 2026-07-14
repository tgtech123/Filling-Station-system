"use client";

import { useState } from "react";
import { X, MapPin, Phone, Loader2, CheckCircle, Mail, User } from "lucide-react";
import LocationSelector from "@/components/LocationSelector";
import toast from "react-hot-toast";
import useBranchStore from "@/store/useBranchStore";
import NumericInput from "@/components/inputs/NumericInput";

export default function AddBranchModal({ onClose, onUpgradeRequired }) {
  const { createBranch } = useBranchStore();

  const [branchName,      setBranchName]      = useState("");
  const [country,         setCountry]         = useState("Nigeria");
  const [branchState,     setBranchState]     = useState("");
  const [city,            setCity]            = useState("");
  const [address,         setAddress]         = useState("");
  const [phone,           setPhone]           = useState("");
  const [pumps,           setPumps]           = useState("1");
  const [selectedFuels,   setSelectedFuels]   = useState([]);

  // Manager invite fields
  const [managerFirstName, setManagerFirstName] = useState("");
  const [managerLastName,  setManagerLastName]  = useState("");
  const [managerEmail,     setManagerEmail]     = useState("");

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [done,    setDone]    = useState(null); // { branchName, inviteSent, email }

  const fuelOptions = ["PMS", "AGO", "Diesel", "Kerosene", "Gas"];

  const toggleFuel = (fuel) =>
    setSelectedFuels((prev) =>
      prev.includes(fuel) ? prev.filter((f) => f !== fuel) : [...prev, fuel]
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!branchName.trim() || !city.trim() || !address.trim()) {
      setError("Branch name, city and address are required");
      return;
    }
    if (!managerFirstName.trim() || !managerLastName.trim() || !managerEmail.trim()) {
      setError("Manager name and email are required to send the invite");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(managerEmail.trim())) {
      setError("Please enter a valid manager email address");
      return;
    }

    try {
      setLoading(true);
      const result = await createBranch({
        name:            branchName.trim(),
        country:         country.trim(),
        state:           branchState.trim(),
        city:            city.trim(),
        address:         address.trim(),
        phone:           phone.trim(),
        numberOfPumps:   Number(pumps),
        fuelTypesOffered: selectedFuels,
        managerFirstName: managerFirstName.trim(),
        managerLastName:  managerLastName.trim(),
        managerEmail:     managerEmail.trim().toLowerCase(),
      });

      setDone({
        branchName: result?.branch?.name || branchName,
        inviteSent: result?.inviteSent,
        email:      managerEmail.trim(),
      });
    } catch (err) {
      if (err.response?.data?.upgradeRequired) {
        if (onUpgradeRequired) {
          onUpgradeRequired(err.response.data);
          onClose();
        } else {
          setError("Enterprise plan required for multiple branches");
        }
      } else {
        setError(
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to create branch"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto scrollbar-hide">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {done ? "Branch Created" : "Add New Branch"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {done
                ? "Your new branch is live"
                : "Fill in branch details and invite a manager"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Success state ── */}
        {done ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={28} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {done.branchName} is ready!
              </h3>
              {done.inviteSent ? (
                <p className="text-sm text-gray-500 mt-1">
                  An invite email has been sent to <span className="font-medium text-blue-600">{done.email}</span>.
                  They have 48 hours to accept and set up their account.
                </p>
              ) : (
                <p className="text-sm text-amber-600 mt-1">
                  Branch created but the invite email could not be delivered to {done.email}.
                  You can resend from the branch card on the Overview page.
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (

        /* ── Create form ── */
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Branch Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Branch Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              placeholder="e.g. Lekki Branch"
              className="w-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LocationSelector
              country={country}
              state={branchState}
              city={city}
              onCountryChange={(v) => { setCountry(v); setBranchState(""); setCity(""); }}
              onStateChange={(v) => { setBranchState(v); setCity(""); }}
              onCityChange={setCity}
              defaultCountry="Nigeria"
              required={{ city: true }}
              labels={{ city: "City" }}
              labelCls="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1"
              selectCls="w-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
              wrapperCls=""
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full branch address"
                className="w-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2.5 pl-9 text-sm focus:outline-none focus:border-blue-500"
              />
              <MapPin size={16} className="absolute left-2.5 top-3 text-gray-400" />
            </div>
          </div>

          {/* Phone + Pumps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <div className="relative">
                <NumericInput
                  variant="tel"
                  maxLength={11}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Branch phone number"
                  className="w-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2.5 pl-9 text-sm focus:outline-none focus:border-blue-500"
                />
                <Phone size={16} className="absolute left-2.5 top-3 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Number of Pumps
              </label>
              <select
                value={pumps}
                onChange={(e) => setPumps(e.target.value)}
                className="w-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
              >
                {Array.from({ length: 20 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Fuel Types */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Product Types Offered
            </label>
            <div className="flex flex-wrap gap-3">
              {fuelOptions.map((fuel) => (
                <label
                  key={fuel}
                  className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 font-medium cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedFuels.includes(fuel)}
                    onChange={() => toggleFuel(fuel)}
                    className="accent-blue-600"
                  />
                  {fuel}
                </label>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Mail size={15} className="text-blue-500 shrink-0" />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Branch Manager Invite <span className="text-red-500">*</span>
              </p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              An invitation email will be sent to this person so they can set up their manager account.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  First Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={managerFirstName}
                    onChange={(e) => setManagerFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2.5 pl-8 text-sm focus:outline-none focus:border-blue-500"
                  />
                  <User size={13} className="absolute left-2.5 top-3.5 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={managerLastName}
                  onChange={(e) => setManagerLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={managerEmail}
                  onChange={(e) => setManagerEmail(e.target.value)}
                  placeholder="manager@example.com"
                  className="w-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2.5 pl-9 text-sm focus:outline-none focus:border-blue-500"
                />
                <Mail size={14} className="absolute left-2.5 top-3 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Branch & Send Invite"
              )}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
