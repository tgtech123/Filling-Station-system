"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { ImSpinner3 } from "react-icons/im";
import Image from "next/image";
import SuccessPage from "./SuccessPage";

const PaymentPageOne = () => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [isTransferOpened, setIsTransferOpened] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Fetch all countries + states in one call
  useEffect(() => {
    const fetchCountries = async () => {
      setLoadingCountries(true);
      try {
        const res = await fetch(
          "https://countriesnow.space/api/v0.1/countries/states",
        );
        const json = await res.json();

        // Deduplicate by name, then sort
        const seen = new Set();
        const sorted = json.data
          .filter((c) => {
            if (seen.has(c.name)) return false;
            seen.add(c.name);
            return true;
          })
          .map((c) => ({ name: c.name, states: c.states }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setCountries(sorted);
      } catch (err) {
        console.error("Failed to fetch countries:", err);
      } finally {
        setLoadingCountries(false);
      }
    };
    fetchCountries();
  }, []);

  // Derive states from selected country
  useEffect(() => {
    if (!selectedCountry) {
      setStates([]);
      setSelectedState("");
      return;
    }
    const country = countries.find((c) => c.name === selectedCountry);
    if (country) {
      const sorted = [...country.states].sort((a, b) =>
        a.name.localeCompare(b.name),
      );
      setStates(sorted);
    }
  }, [selectedCountry, countries]);

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      // Replace this later with actual payment API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      //spins for 3 secs and then render the success page
      setIsLoading(false);
      setIsSuccess(true);
    } catch (err) {
      console.log("Payment failed:", err);
      setIsLoading(false);
    }
  };

  // {if(isSuccess)
  //   return <SuccessPage />
  // }

  return (
    <div className="p-10">
      {isSuccess && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white  max-w-lg w-full shadow-2xl rounded-2xl lg:p-8 p-3 max-h-[90vh] overflow-y-auto scrollbar-hide "
          >
            <button 
            onClick={() => setIsSuccess(false)} 
            className="absolute top-10 right-132 bg-white rounded-full p-2 hover:scale-105 transition cursor-pointer "
            >
            <X size={28} />
            </button>
            <SuccessPage />
          </div>
        </div>
      )}

      <div className="flex gap-4 items-center">
        <Image
          src="/station-logo.png"
          height={70}
          width={120}
          alt="station logo"
        />
        <h1 className="text-[1.5rem] font-semibold text-[#6B6B6B]">Checkout</h1>
      </div>

      <div className="lg:flex w-full lg:gap-5 mt-[3rem]">
        {/* Left Column */}
        <div className="flex-1 mb-[3rem]">
          <h1 className="text-[1.75rem] font-semibold leading-[100%] mb-[2.75rem]">
            1. Enter an email address for your station account
          </h1>

          <div className="flex flex-col gap-4 p-5 bg-white rounded-lg">
            <label className="text-[1rem] font-medium">
              Your email address:
            </label>
            <input
              type="email"
              placeholder="example@email.com"
              className="lg:w-[41.3125rem] w-[20.3125rem] h-[3.75rem] border-2 border-[#D9D9D9] focus:border-2 focus:border-blue-600 outline-none pl-3 rounded-lg"
            />
          </div>

          <h1 className="text-[1.75rem] font-semibold leading-[100%] mt-[2rem] mb-[2.75rem]">
            2. Select a payment method
          </h1>
          {/* the left card */}
          <div className="flex flex-col gap-4">
            <div className="lg:w-full bg-white rounded-lg w-[22rem] h-auto  border-[1px] border-neutral-400 p-4 items-center">
              <p className="flex justify-between">
                <span className="text-[1.225rem] font-semibold ">
                  Credit or debit card
                </span>
                <button onClick={() => setIsOpened(!isOpened)}>
                  {isOpened ? (
                    <ChevronRight size={26} className="ml-auto" />
                  ) : (
                    <ChevronDown size={26} className="ml-auto" />
                  )}
                </button>
              </p>

              {isOpened && (
                <div>
                  <hr className="border-[1.5px] border-neutral-300 mb-[1rem] mt-[1rem]" />
                  <div className="mt-[2rem]">
                    <h1 className="text-[1.25rem] font-medium leading-[121%] mb-[1.5rem]">
                      Payment Information
                    </h1>
                    <div className="grid lg:grid-cols-2 grid-cols-1 gap-7">
                      <div className="flex flex-col gap-3">
                        <label className="text-[1rem] font-medium text-[#6B6B6B]">
                          First name
                        </label>
                        <input
                          type="text"
                          placeholder=""
                          className=" w-[20rem] h-[3.75rem] pl-3 rounded-lg border-2 border-neutral-400 focus:border-2 focus:border-blue-600 outline-none "
                        />
                      </div>
                      <div className="flex flex-col gap-3">
                        <label className="text-[1rem] font-medium text-[#6B6B6B]">
                          Last name
                        </label>
                        <input
                          type="text"
                          placeholder=""
                          className=" w-[20rem] h-[3.75rem] pl-3 rounded-lg border-2 border-neutral-400 focus:border-2 focus:border-blue-600 outline-none "
                        />
                      </div>
                      <div className="flex flex-col gap-3">
                        <label className="text-[1rem] font-medium text-[#6B6B6B]">
                          Card number
                        </label>
                        <input
                          type="text"
                          placeholder="0000 0000 0000 0000"
                          className=" w-[20rem] h-[3.75rem] pl-3 rounded-lg border-2 border-neutral-400 focus:border-2 focus:border-blue-600 outline-none "
                        />
                      </div>

                      <div className="flex flex-col gap-3">
                        <label className="text-[1rem] font-medium text-[#6B6B6B]">
                          Expiration date
                        </label>
                        <input
                          type="date"
                          placeholder="MM/YY"
                          className=" w-[20rem] h-[3.75rem] pl-3 pr-3 font-semibold text-blue-600 rounded-lg border-2 border-neutral-400 focus:border-2 focus:border-blue-600 outline-none "
                        />
                      </div>
                      <div className="flex flex-col gap-3">
                        <label className="text-[1rem] font-medium text-[#6B6B6B]">
                          CVV/CVC
                        </label>
                        <input
                          type="text"
                          placeholder="000"
                          className=" w-[20rem] h-[3.75rem] pl-3  rounded-lg border-2 border-neutral-400 focus:border-2 focus:border-blue-600 outline-none "
                        />
                      </div>
                    </div>
                    <button className="text-white font-semibold bg-blue-500 text-[1rem] rounded-full mt-[2rem] flex ml-auto hover:bg-blue-700 px-6 py-3 ">
                      Continue
                    </button>
                    <hr className="border-[1.5px] border-neutral-300 mb-[1rem] mt-[1rem]" />
                    <p className="lg:text-[1rem] text-[0.875rem] font-medium leading-[-5%] mb-[2rem]">
                      Services are subscription based. The subscription will
                      automatically renew for an additional 1 month term unless
                      you cancel it. You can manage your subscription (extend,
                      upgrade, cancel auto-renewal) at any time from your
                      Station Account using our instructions
                    </p>

                    <p className="lg:text-[1rem] text-[0.875rem] font-medium text-[#888888]">
                      By purchasing this subscription and clicking “Continue”,
                      you agree to the terms of service, auto-renewal terms,
                      electronic document delivery, and acknowledge the privacy
                      policy.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:w-full bg-white rounded-lg w-[22rem] h-auto border-[1px] border-neutral-400 p-4 ">
              <p className=" flex justify-between">
                <span className="text-[1.225rem] font-semibold">
                  Bank Transfer
                </span>
                <button onClick={() => setIsTransferOpened(!isTransferOpened)}>
                  {isTransferOpened ? (
                    <ChevronRight size={26} className="ml-auto" />
                  ) : (
                    <ChevronDown size={26} className="ml-auto" />
                  )}
                </button>
              </p>

              {isTransferOpened && (
                <div>
                  <div>
                    <hr className="border-[1.5px] border-neutral-300 mb-[1rem] mt-[1rem]" />
                    <div className="mt-[2rem]">
                      <div className="flex flex-col items-center justify-center">
                        <h1 className="lg:text-[1.375rem] text-[1.125rem] font-semibold text-neutral-400 mb-[1rem]">
                          Transfer of ₦600,000 to:
                        </h1>
                        <p className="lg:text-[1.5rem] text-[1rem] font-semibold italic ">
                          Polaris Bank
                        </p>
                        <span className="lg:text-[2.5rem] text-[1.375rem] font-bold text-[#0A0D13]">
                          0123456781
                        </span>
                        <div className="lg:text-[1.5rem] text-[1.375rem]  font-bold text-blue-500">
                          Acct Name:
                          <span className="pl-2 text-red-500 italic">
                            FuelDesk Management System
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handlePayment}
                        disabled={isLoading}
                        className="text-white font-semibold bg-blue-500 text-[1rem] rounded-full mt-[2rem] flex gap-4 ml-auto hover:bg-blue-700 px-6 py-3 "
                      >
                        {isLoading ? " Processing ..." : "Confirm Payment"}
                        {isLoading && (
                          <ImSpinner3 size={26} className="animate-spin" />
                        )}
                      </button>

                      <hr className="border-[1.5px] border-neutral-300 mb-[1rem] mt-[1rem]" />

                      <p className="lg:text-[1rem] text-[0.875rem] font-medium text-[#888888]">
                        By purchasing this subscription and clicking “Continue”,
                        you agree to the terms of service, auto-renewal terms,
                        electronic document delivery, and acknowledge the
                        privacy policy.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:w-full bg-white rounded-lg w-[22rem] h-[4.5rem] border-[1px] border-neutral-400 flex p-4 justify-between items-center">
              <h1 className="text-[1.225rem] font-semibold">
                Google Pay{" "}
                <span className="text-neutral-300 font-medium italic">
                  (currently not available)
                </span>
              </h1>
              <ChevronDown size={26} />
            </div>
            <div className="lg:w-full bg-white rounded-lg w-[22rem] h-[4.5rem] border-[1px] border-neutral-400 flex p-4 justify-between items-center">
              <h1 className="text-[1.225rem] font-semibold">
                Crypto Currencies{" "}
                <span className="text-neutral-300 font-medium italic">
                  (currently not available)
                </span>
              </h1>
              <ChevronDown size={26} />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex-1">
          <h1 className="text-[1.75rem] font-semibold leading-[100%] mb-[2.75rem]">
            Order summary
          </h1>

          <div className="bg-white w-full h-auto lg:p-5 p-3 border-[1px] border-neutral-300 rounded-xl">
            <div>
              <h1 className="text-[1.25rem] font-medium mb-[0.875rem]">Plus</h1>
              <p className="flex justify-between">
                <span className="text-[#6B6B6B] text-[1.25rem] font-medium">
                  Monthly plan ($22.5/mo)
                </span>
                <span className="text-[1.25rem] font-medium">$22.5</span>
              </p>
            </div>

            <hr className="border-[1.5px] border-neutral-200 mt-[2rem]" />

            <div className="mt-[2rem]">
              <div className="text-[1.25rem] font-medium mb-[0.875rem] flex items-center gap-3">
                Tax country:
                {/* Country Dropdown */}
                <div className="flex justify-between gap-5">
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="border-2 border-neutral-300 lg:w-[18rem] w-fit py-1.5 rounded-lg"
                    disabled={loadingCountries}
                  >
                    <option value="">
                      {loadingCountries ? "Loading..." : "Select country"}
                    </option>
                    {countries.map((country, index) => (
                      <option
                        className="w-fit"
                        key={`${country.name}-${index}`}
                        value={country.name}
                      >
                        {country.name}
                      </option>
                    ))}
                  </select>

                  {/* State Dropdown — appears after country is selected */}
                  {selectedCountry && (
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="border-2 border-neutral-300 px-3 py-1.5 rounded-lg lg:w-[18rem] w-fit"
                    >
                      <option value="">Select state</option>
                      {states.map((state) => (
                        <option key={state.name} value={state.name}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <p className="flex justify-between">
                <span className="text-[1.25rem] font-medium text-[#6B6B6B]">
                  Sales tax 0%
                </span>
                <span className="text-[#191A15] text-[1.25rem] font-medium">
                  $0.00
                </span>
              </p>
            </div>

            <div className="flex justify-between mt-[1rem]">
              <h1 className="text-[1.375rem] font-semibold">Total</h1>
              <h1 className="text-[1.375rem] font-semibold">$22.5</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPageOne;
