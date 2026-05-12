"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, X, CreditCard, Building, Lock } from "lucide-react";
import { ImSpinner3 } from "react-icons/im";
import Image from "next/image";
import SuccessPage from "./SuccessPage";

const PaymentPageOne = () => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [isTransferOpened, setIsTransferOpened] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setLoadingCountries(true);
    fetch("/api/public/locations/countries")
      .then((r) => r.json())
      .then((json) => setCountries(json.data || []))
      .catch((err) => console.error("Failed to fetch countries:", err))
      .finally(() => setLoadingCountries(false));
  }, []);

  useEffect(() => {
    if (!selectedCountry) { setStates([]); setSelectedState(""); return; }
    setLoadingStates(true);
    setStates([]);
    setSelectedState("");
    fetch(`/api/public/locations/states?country=${encodeURIComponent(selectedCountry)}`)
      .then((r) => r.json())
      .then((json) => setStates(json.data || []))
      .catch((err) => console.error("Failed to fetch states:", err))
      .finally(() => setLoadingStates(false));
  }, [selectedCountry]);

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsLoading(false);
      setIsSuccess(true);
    } catch (err) {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full h-12 px-4 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 focus:border-blue-500 outline-none rounded-xl text-sm transition-colors";
  const labelClass = "text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 py-6 sm:py-10">
      {/* Success overlay */}
      {isSuccess && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white dark:bg-gray-800 w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={() => setIsSuccess(false)}
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
            >
              <X size={18} className="text-gray-700 dark:text-gray-200" />
            </button>
            <SuccessPage />
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Image src="/station-logo.png" height={50} width={90} alt="station logo" className="h-10 w-auto object-contain" />
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Checkout</h1>
            <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              <Lock size={11} />
              <span>Secure payment</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* ── Left column ── */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Step 1 */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center shrink-0">1</span>
                <h2 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">Enter email for your station account</h2>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                <label className={labelClass}>Your email address</label>
                <input
                  type="email"
                  placeholder="example@email.com"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Step 2 */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center shrink-0">2</span>
                <h2 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">Select a payment method</h2>
              </div>

              <div className="space-y-3">
                {/* Card payment */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setIsOpened(!isOpened)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                        <CreditCard size={18} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="font-semibold text-gray-800 dark:text-gray-100">Credit or Debit Card</span>
                    </div>
                    {isOpened
                      ? <ChevronRight size={20} className="text-gray-400 rotate-90 transition-transform" />
                      : <ChevronDown size={20} className="text-gray-400 transition-transform" />}
                  </button>

                  {isOpened && (
                    <div className="px-4 sm:px-5 pb-5 border-t border-gray-100 dark:border-gray-700">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100 mt-4 mb-4">Payment Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { label: "First name", type: "text", placeholder: "John" },
                          { label: "Last name", type: "text", placeholder: "Doe" },
                          { label: "Card number", type: "text", placeholder: "0000 0000 0000 0000", full: true },
                          { label: "Expiration date", type: "date", placeholder: "MM/YY" },
                          { label: "CVV / CVC", type: "text", placeholder: "000" },
                        ].map(({ label, type, placeholder, full }) => (
                          <div key={label} className={full ? "sm:col-span-2" : ""}>
                            <label className={labelClass}>{label}</label>
                            <input type={type} placeholder={placeholder} className={inputClass} />
                          </div>
                        ))}
                      </div>
                      <button className="mt-5 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full text-sm transition-colors active:scale-95">
                        Continue
                      </button>
                      <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        Services are subscription based. The subscription will automatically renew unless you cancel it. You can manage your subscription at any time from your Station Account.
                      </p>
                      <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                        By clicking "Continue", you agree to the terms of service, auto-renewal terms, and acknowledge the privacy policy.
                      </p>
                    </div>
                  )}
                </div>

                {/* Bank transfer */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setIsTransferOpened(!isTransferOpened)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                        <Building size={18} className="text-green-600 dark:text-green-400" />
                      </div>
                      <span className="font-semibold text-gray-800 dark:text-gray-100">Bank Transfer</span>
                    </div>
                    {isTransferOpened
                      ? <ChevronRight size={20} className="text-gray-400 rotate-90 transition-transform" />
                      : <ChevronDown size={20} className="text-gray-400 transition-transform" />}
                  </button>

                  {isTransferOpened && (
                    <div className="px-4 sm:px-5 pb-5 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex flex-col items-center text-center py-5 bg-gray-50 dark:bg-gray-700/50 rounded-xl mt-4">
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Transfer ₦600,000 to:</p>
                        <p className="text-base font-bold italic text-gray-700 dark:text-gray-200">Polaris Bank</p>
                        <p className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white my-2 tracking-wider">0123456781</p>
                        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          Acct: <span className="text-red-500 italic">FuelDesk Management System</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handlePayment}
                        disabled={isLoading}
                        className="mt-5 w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-full text-sm transition-colors flex items-center justify-center gap-3 active:scale-95"
                      >
                        {isLoading ? "Processing..." : "Confirm Payment"}
                        {isLoading && <ImSpinner3 size={18} className="animate-spin" />}
                      </button>
                      <p className="mt-4 text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                        By confirming payment, you agree to the terms of service, auto-renewal terms, and acknowledge the privacy policy.
                      </p>
                    </div>
                  )}
                </div>

                {/* Unavailable methods */}
                {["Google Pay", "Crypto Currencies"].map((method) => (
                  <div
                    key={method}
                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between p-4 sm:p-5 opacity-50 cursor-not-allowed"
                  >
                    <div>
                      <span className="font-semibold text-gray-600 dark:text-gray-300">{method}</span>
                      <span className="ml-2 text-xs text-gray-400 dark:text-gray-500 italic">(not available)</span>
                    </div>
                    <ChevronDown size={18} className="text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right column: Order summary ── */}
          <div className="w-full lg:w-80 xl:w-96 shrink-0">
            <h2 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white mb-4">Order Summary</h2>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 sm:p-5 sticky top-6">
              {/* Plan + price */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-base">Plus Plan</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Monthly billing</p>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">$22.5</span>
              </div>

              <hr className="border-gray-100 dark:border-gray-700 mb-4" />

              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tax country</p>
                <div className="space-y-2">
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    disabled={loadingCountries}
                    className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:border-blue-500 rounded-xl px-3 py-2.5 text-sm outline-none transition-colors"
                  >
                    <option value="">{loadingCountries ? "Loading..." : "Select country"}</option>
                    {countries.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  {selectedCountry && (
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:border-blue-500 rounded-xl px-3 py-2.5 text-sm outline-none transition-colors"
                    >
                      <option value="">{loadingStates ? "Loading..." : "Select state"}</option>
                      {states.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Sales tax (0%)</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">$0.00</span>
                </div>
              </div>

              <hr className="border-gray-100 dark:border-gray-700 my-4" />

              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900 dark:text-white">Total</span>
                <span className="text-xl font-black text-blue-600 dark:text-blue-400">$22.5</span>
              </div>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                <Lock size={11} />
                <span>256-bit SSL encrypted payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPageOne;
