"use client";

import { useState } from "react";
import { X, MapPin, Phone, Loader2, CheckCircle, Mail } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import useBranchStore from "@/store/useBranchStore";

export default function AddBranchModal({ onClose, onUpgradeRequired }) {
  const { createBranch } = useBranchStore();

  // Step 1 — branch details
  const [step, setStep] = useState(1);
  const [branchName, setBranchName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [pumps, setPumps] = useState("1");
  const [selectedFuels, setSelectedFuels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 2 — invite manager
  const [createdBranch, setCreatedBranch] = useState(null);
  const [inviteData, setInviteData] = useState({ firstName: "", lastName: "", email: "" });
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");

  const fuelOptions = ["PMS", "AGO", "Diesel", "Kerosene", "Gas"];

  const toggleFuel = (fuel) => {
    setSelectedFuels((prev) =>
      prev.includes(fuel) ? prev.filter((f) => f !== fuel) : [...prev, fuel]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!branchName.trim() || !city.trim() || !address.trim()) {
      setError("Branch name, city and address are required");
      return;
    }

    try {
      setLoading(true);
      const result = await createBranch({
        name: branchName.trim(),
        city: city.trim(),
        address: address.trim(),
        country: country.trim(),
        phone: phone.trim(),
        numberOfPumps: Number(pumps),
        fuelTypesOffered: selectedFuels,
      });
      setCreatedBranch(result?.branch || result);
      setStep(2);
    } catch (err) {
      if (err.response?.data?.upgradeRequired) {
        if (onUpgradeRequired) {
          onUpgradeRequired(err.response.data);
          onClose();
        } else {
          setError("Enterprise plan required for multiple branches");
        }
      } else {
        setError(err.response?.data?.error || "Failed to create branch");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async () => {
    setInviteError("");

    if (!inviteData.firstName || !inviteData.lastName || !inviteData.email) {
      setInviteError("All fields are required to send invite");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteData.email)) {
      setInviteError("Please enter a valid email");
      return;
    }

    try {
      setInviting(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API}/api/branches/${createdBranch?.id}/invite`,
        inviteData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Invite sent to ${inviteData.email}!`);
      onClose();
    } catch (err) {
      setInviteError(err.response?.data?.error || "Failed to send invite");
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto scrollbar-hide">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {step === 1 ? "Add New Branch" : "Invite Branch Manager"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {step === 1 ? "Create a new filling station branch" : "Send an invitation to your new branch manager"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step 1 — Branch Details Form */}
        {step === 1 && (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
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

            {/* City + Country */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Lagos"
                  className="w-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. Nigeria"
                  className="w-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
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
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Phone
                </label>
                <div className="relative">
                  <input
                    type="text"
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
                Fuel Types Offered
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

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
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
                  "Create Branch"
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step 2 — Invite Manager */}
        {step === 2 && (
          <div className="p-5">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                Branch Created! 🎉
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                {createdBranch?.name} is ready. Now invite a branch manager.
              </p>
            </div>

            {inviteError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-600 text-sm">{inviteError}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={inviteData.firstName}
                    onChange={(e) => setInviteData((prev) => ({ ...prev, firstName: e.target.value }))}
                    placeholder="John"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={inviteData.lastName}
                    onChange={(e) => setInviteData((prev) => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Doe"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="manager@example.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Skip for now
              </button>
              <button
                onClick={handleSendInvite}
                disabled={inviting}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {inviting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail size={16} />
                    Send Invite
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
