"use client";
import React, { useState } from "react";
import { Check } from "lucide-react";
import MonthlyBill from "./MonthlyBill";
import FrequentlyQuestions from "./FrequentlyQuestions";

const page = () => {
  const [buttonOne, setButtonOne] = useState("buttonOne");
  const [showBlue, setShowBlue] = useState("linkOne");
  return (
    <div className="bg-neutral-100 flex flex-col items-center justify-center ">
      <div className="flex flex-col mt-20 w-full justify-center items-center text-center mb-[1.5rem]">
        <h1 className="text-[1.875rem] sm:text-[2.25rem] md:text-[3rem] lg:text-[4rem] text-[#454545] font-semibold">
          Plans & Pricing
        </h1>
        <p className="text-[1.5rem] sm:text-[1.125rem] md:text-[1.25rem] lg:text-[1.5rem] text-neutral-500 text-center ">
          Flexible plans to fit your business needs, whether you’re just <br />{" "}
          starting or scaling up{" "}
        </p>
      </div>

      {/* the switch section */}
      <div className="border-2 mb-[2.8125rem] rounded-full flex justify-between p-2 items-center border-neutral-200 bg-[#e7e7e7] max-w-[22.0625rem] lg:max-w-[28.0625rem] w-full h-[3.5rem]">
        {/* <div>
              Bill annually
            </div>

            <div>
              Bill Monthly
            </div> */}

        <div
          id="buttonOne"
          onClick={() => setButtonOne("buttonOne")}
        >
          { buttonOne === "buttonOne" ? (
            <div className="flex lg:justify-between justify-center text-[1rem] font-semibold items-center p-2 bg-white rounded-full lg:w-[224px] w-fit lg:h-[48px] h-[44px]">
              <h1 className="font-semibold lg:text-[1rem] text-[0.575rem] text-neutral-800">Bill annually</h1>
              <span className="flex items-center lg:text-[1rem] text-[0.475rem] justify-center text-neutral-500 font-semibold lg:w-[95px] w-[47px] lg:h-[40px] h-[30px] p-1 bg-neutral-100 rounded-full ">
                    Save 10%
                </span>
            </div>  
          ) : (
              
              <h1 className="font-semibold text-[1rem] text-neutral-500">Bill annually</h1>

          )}
        
        </div>

        <div
          id="buttonTwo"
          onClick={() => setButtonOne("buttonTwo")}
        >
          {buttonOne === "buttonTwo" ? (
            <div className="flex lg:justify-between text-[1rem] font-semibold justify-center p-2 bg-white lg:w-[224px] text-sm rounded-full items-center text-center w-fit lg:h-[48px] h-[44px]">
                <h1 className="font-semibold lg:text-[1rem] text-[0.575rem] text-neutral-800">Bill monthly</h1>
                <span className="flex text-neutral-500 items-center justify-center lg:text-[1rem] text-[0.575rem] font-semibold lg:w-[95px] w-[47px] lg:h-[40px] h-[20px] p-1 bg-neutral-100 rounded-full ">
                    Save 0%
                </span>
            </div>
          ) : (
            
            <h1 className="font-semibold text-[1rem] text-neutral-500">Bill monthly</h1>

          )}
          
        </div>
      </div>

      {/* the cards section */}
      {buttonOne === "buttonOne" && (
        <div className="max-w-[70.5625rem] ml-5.5 w-full grid lg:grid-cols-3 grid-cols-1 gap-4 p-4">
          <div
            id="linkOne"
            onClick={() => setShowBlue("linkOne")}
            className={`flex flex-col ${showBlue === "linkOne" ? "bg-[#1A71F6] text-white" : "bg-white"} rounded-xl lg:p-4 p-2 max-w-[22.438rem] border border-neutral-100 `}
          >
            <h1 className="text-[1.5rem] font-semibold mb-[1rem]">Basic</h1>
            <h3
              className={`text-[2.0625rem] font-semibold mb-[1rem] ${showBlue === "linkOne" ? "text-white" : "text-[#000]"} `}
            >
              $9 /mo
            </h3>
            <p
              className={` ${showBlue === "linkOne" ? "text-white" : "text-neutral-300"} font-semibold text-[1rem] leading-[125%] flex gap-2`}
            >
              $120
              <span
                className={` ${showBlue === "linkOne" ? "text-white" : "text-[#6B6B6B]"} text-[1rem] leading-[125%]`}
              >
                $108 for 12 months
              </span>
            </p>
            <span
              className={`font-semibold text-[1rem] mt-[0.5rem] ${showBlue === "linkOne" ? "text-white" : "text-[#6B6B6B]"}`}
            >
              VAT may apply
            </span>

            <button
              className={` rounded-full ${showBlue === "linkOne" ? "text-[#0080FF] bg-white" : "text-[#0080FF] border-[2px] border-[#0080FF]"}   font-semibold text-[1.25rem] py-3 mt-[2.25rem]`}
            >
              Get Basic
            </button>

            <h1
              className={`mt-[2.25rem] mb-[2.25rem] font-medium text-[1rem] ${showBlue === "linkOne" ? "text-white" : "text-[#6B6B6B]"} `}
            >
              What’s included:
            </h1>
            <span className="flex gap-8 mb-[16.563rem]">
              <Check size={28} className="text-[#26DA95]" />

              <span>Feature 1</span>
            </span>
          </div>

          {/* the second card */}
          <div
            id="linkTwo"
            onClick={() => setShowBlue("linkTwo")}
            className={`flex flex-col ${showBlue === "linkTwo" ? "bg-[#1A71F6] text-white" : "bg-white"} rounded-xl p-4 max-w-[22.438rem] border border-neutral-100 `}
          >
            <div className="flex justify-between">
              <h1 className="text-[1.5rem] font-semibold mb-[1rem]">Plus</h1>
              <button className="w-[6.875rem] h-[2.3125rem] text-[#0080FF] flex items-center justify-center bg-white font-semibold text-[0.875rem] border-1 border-neutral-400 rounded-full">
                Most popular
              </button>
            </div>

            <h3
              className={`text-[2.0625rem] font-semibold mb-[1rem] ${showBlue === "linkTwo" ? "text-white" : "text-[#000]"} `}
            >
              $22.5 /mo
            </h3>
            <p
              className={` ${showBlue === "linkTwo" ? "text-white" : "text-neutral-300"} font-semibold text-[1rem] leading-[125%] flex gap-2 `}
            >
              {" "}
              <span className="line-through">$300</span>
              <span
                className={` ${showBlue === "linkTwo" ? "text-white" : "text-[#6B6B6B]"} text-[1rem] leading-[125%]`}
              >
                $270 for 12 months
              </span>
            </p>
            <span
              className={`font-semibold text-[1rem] mt-[0.5rem] ${showBlue === "linkTwo" ? "text-white" : "text-[#6B6B6B]"}`}
            >
              VAT may apply
            </span>

            <button
              className={` rounded-full ${showBlue === "linkTwo" ? "text-[#0080FF] bg-white " : "text-[#0080FF] border-[2px] border-[#0080FF]"} font-semibold text-[1.25rem] py-3 mt-[2.25rem]`}
            >
              Get Plus
            </button>

            <h1
              className={`mt-[2.25rem] mb-[2.25rem] font-medium text-[1rem] ${showBlue === "linkTwo" ? "text-white" : "text-[#6B6B6B]"} `}
            >
              What’s included:
            </h1>
            <span className="flex flex-col gap-5 mb-[6.375rem]">
              <p className="flex gap-6">
                <Check size={28} className="text-[#26DA95]" />
                <span>Feature 1</span>
              </p>
              <p className="flex gap-6">
                <Check size={28} className="text-[#26DA95]" />
                <span>Feature 2</span>
              </p>
              <p className="flex gap-6">
                <Check size={28} className="text-[#26DA95]" />
                <span>Feature 3</span>
              </p>
              <p className="flex gap-6">
                <Check size={28} className="text-[#26DA95]" />
                <span>Feature 4</span>
              </p>
            </span>
          </div>

          {/* the third card */}
          <div
            id="linkThree"
            onClick={() => setShowBlue("linkThree")}
            className={`flex flex-col ${showBlue === "linkThree" ? "bg-[#1A71F6] text-white" : "bg-white"} rounded-xl p-4 max-w-[22.438rem] border border-neutral-100 `}
          >
            <h1 className="text-[1.5rem] font-semibold mb-[1rem]">Prime</h1>
            <h3
              className={`text-[2.0625rem] font-semibold mb-[1rem] ${showBlue === "linkThree" ? "text-white" : "text-[#000]"} `}
            >
              $27 /mo
            </h3>
            <p
              className={` ${showBlue === "linkThree" ? "text-white" : "text-neutral-300"} font-semibold text-[1rem] leading-[125%] flex gap-2`}
            >
              $360
              <span
                className={` ${showBlue === "linkThree" ? "text-white" : "text-[#6B6B6B]"} text-[1rem] leading-[125%]`}
              >
                $324 for 12 months
              </span>
            </p>
            <span
              className={`font-semibold text-[1rem] mt-[0.5rem] ${showBlue === "linkThree" ? "text-white" : "text-[#6B6B6B]"}`}
            >
              VAT may apply
            </span>

            <button
              className={` rounded-full ${showBlue === "linkThree" ? "text-[#0080FF] bg-white" : "text-[#0080FF] border-[#0080FF] border-[2px]"}   font-semibold text-[1.25rem] py-3 mt-[2.25rem]`}
            >
              Get Prime
            </button>

            <h1
              className={`mt-[2.25rem] mb-[2.25rem] font-medium text-[1rem] ${showBlue === "linkThree" ? "text-white" : "text-[#6B6B6B]"} `}
            >
              What’s included:
            </h1>
            <span className="flex flex-col gap-5 mb-[10.0625rem]">
              <p className="flex gap-6">
                <Check size={28} className="text-[#26DA95]" />
                <span>Feature 1</span>
              </p>
              <p className="flex gap-6">
                <Check size={28} className="text-[#26DA95]" />
                <span>Feature 2</span>
              </p>
              <p className="flex gap-6">
                <Check size={28} className="text-[#26DA95]" />
                <span>Feature 3</span>
              </p>
            </span>
          </div>
        </div>
      )}

      {buttonOne === "buttonTwo" && <MonthlyBill />}

      <FrequentlyQuestions />
    </div>
  );
};

export default page;
