"use client";
import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import FrequentlyQuestions from "./FrequentlyQuestions";
import Link from "next/link";
import usePlansStore from "@/store/usePlansStore";

// Skeleton card while loading
const SkeletonCard = () => (
  <div className="flex flex-col bg-white rounded-xl lg:p-4 p-2 max-w-[22.438rem] border border-neutral-100 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
    <div className="h-9 bg-gray-200 rounded w-3/4 mb-3" />
    <div className="h-4 bg-gray-100 rounded w-full mb-2" />
    <div className="h-4 bg-gray-100 rounded w-1/2 mb-6" />
    <div className="h-12 bg-gray-100 rounded-full w-full mb-6" />
    <div className="h-4 bg-gray-100 rounded w-1/3 mb-4" />
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-4 bg-gray-100 rounded w-full" />
      ))}
    </div>
  </div>
);

const PricingPage = () => {
  const [buttonOne, setButtonOne] = useState("buttonOne");
  const [showBlue, setShowBlue] = useState(null);

  const { plans, loading, fetchPublicPlans } = usePlansStore();

  useEffect(() => {
    fetchPublicPlans();
  }, []);

  // Auto-select first plan once loaded
  useEffect(() => {
    if (plans.length > 0 && showBlue === null) {
      setShowBlue(plans[0]._id || plans[0].id || plans[0].slug || "0");
    }
  }, [plans]);

  const isYearly = buttonOne === "buttonOne";

  const getPrice = (plan) => {
    if (isYearly) {
      return plan.yearlyPrice === 0
        ? "Free"
        : `₦${Number(plan.yearlyPrice).toLocaleString()}/yr`;
    }
    return plan.monthlyPrice === 0
      ? "Free"
      : `₦${Number(plan.monthlyPrice).toLocaleString()}/mo`;
  };

  const getSubtext = (plan) => {
    if (isYearly) {
      if (plan.yearlyPrice === 0) return "No charge";
      const monthly = plan.monthlyPrice
        ? `₦${Number(plan.monthlyPrice).toLocaleString()}/mo equivalent`
        : `₦${Number(plan.yearlyPrice).toLocaleString()} for 12 months`;
      return monthly;
    }
    return "Billed every month";
  };

  const getCtaText = (plan) => {
    if (plan.ctaText) return plan.ctaText;
    const slug = (plan.slug || plan.name || "").toLowerCase();
    if (slug === "free" || plan.monthlyPrice === 0) return "Get Started Free";
    return `Get ${plan.name}`;
  };

  const planKey = (plan, i) =>
    plan._id || plan.id || plan.slug || String(i);

  return (
    <div className="bg-neutral-100 flex flex-col items-center justify-center">
      {/* Header */}
      <div className="flex flex-col mt-20 w-full justify-center items-center text-center mb-[1.5rem]">
        <h1 className="text-[1.875rem] sm:text-[2.25rem] md:text-[3rem] lg:text-[4rem] text-[#454545] font-semibold">
          Plans & Pricing
        </h1>
        <p className="text-[1.5rem] sm:text-[1.125rem] md:text-[1.25rem] lg:text-[1.5rem] text-neutral-500 text-center">
          Flexible plans to fit your business needs, whether you're just <br />{" "}
          starting or scaling up
        </p>
      </div>

      {/* Billing toggle */}
      <div className="border-2 mb-[2.8125rem] rounded-full flex justify-between p-2 items-center border-neutral-200 bg-[#e7e7e7] max-w-[22.0625rem] lg:max-w-[28.0625rem] w-full h-[3.5rem]">
        <div id="buttonOne" onClick={() => setButtonOne("buttonOne")}>
          {buttonOne === "buttonOne" ? (
            <div className="flex lg:justify-between justify-center text-[1rem] font-semibold items-center p-2 bg-white rounded-full lg:w-[224px] w-fit lg:h-[48px] h-[44px]">
              <h1 className="font-semibold lg:text-[1rem] text-[0.575rem] text-neutral-800">
                Bill annually
              </h1>
              <span className="flex items-center lg:text-[1rem] text-[0.475rem] justify-center text-neutral-500 font-semibold lg:w-[95px] w-[47px] lg:h-[40px] h-[30px] p-1 bg-neutral-100 rounded-full">
                Save 10%
              </span>
            </div>
          ) : (
            <h1 className="font-semibold text-[1rem] text-neutral-500">
              Bill annually
            </h1>
          )}
        </div>

        <div id="buttonTwo" onClick={() => setButtonOne("buttonTwo")}>
          {buttonOne === "buttonTwo" ? (
            <div className="flex lg:justify-between text-[1rem] font-semibold justify-center p-2 bg-white lg:w-[224px] text-sm rounded-full items-center text-center w-fit lg:h-[48px] h-[44px]">
              <h1 className="font-semibold lg:text-[1rem] text-[0.575rem] text-neutral-800">
                Bill monthly
              </h1>
              <span className="flex text-neutral-500 items-center justify-center lg:text-[1rem] text-[0.475rem] font-semibold lg:w-[95px] w-[47px] lg:h-[40px] h-[20px] p-1 bg-neutral-100 rounded-full">
                Save 0%
              </span>
            </div>
          ) : (
            <h1 className="font-semibold text-[1rem] text-neutral-500">
              Bill monthly
            </h1>
          )}
        </div>
      </div>

      {/* Cards section */}
      <div className="max-w-[70.5625rem] ml-5.5 w-full grid lg:grid-cols-3 grid-cols-1 gap-4 p-4">
        {loading && plans.length === 0 ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : plans.length === 0 ? (
          <div className="col-span-3 text-center py-16 text-neutral-400 font-medium">
            No plans available at this time.
          </div>
        ) : (
          plans.map((plan, i) => {
            const key = planKey(plan, i);
            const isSelected = showBlue === key;
            const price = getPrice(plan);
            const subtext = getSubtext(plan);
            const ctaText = getCtaText(plan);

            return (
              <div
                key={key}
                onClick={() => setShowBlue(key)}
                className={`flex flex-col hover:scale-105 transition ${
                  isSelected ? "bg-[#1A71F6] text-white" : "bg-white"
                } rounded-xl lg:p-4 p-2 max-w-[22.438rem] border border-neutral-100`}
              >
                {/* Plan name + popular badge */}
                <div className="flex justify-between items-start mb-[1rem]">
                  <h1 className="text-[1.5rem] font-semibold">{plan.name}</h1>
                  {plan.isPopular && (
                    <button className="w-[6.875rem] h-[2.3125rem] text-[#0080FF] flex items-center justify-center bg-white font-semibold text-[0.875rem] border border-neutral-400 rounded-full shrink-0">
                      Most popular
                    </button>
                  )}
                </div>

                {/* Price */}
                {isYearly && plan.monthlyPrice > 0 ? (
                  <>
                    <div className="flex items-baseline flex-wrap gap-1 mb-[1rem]">
                      <span className="text-gray-400 line-through text-sm mr-1">
                        ₦{(plan.monthlyPrice * 12).toLocaleString()}
                      </span>
                      <span className={`font-bold text-2xl ${isSelected ? "text-white" : "text-[#000] dark:text-white"}`}>
                        ₦{plan.yearlyPrice.toLocaleString()}
                      </span>
                      <span className={`text-sm ${isSelected ? "text-white/80" : "text-[#6B6B6B]"}`}>/yr</span>
                      <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold px-2 py-0.5 rounded-full ml-2">
                        Save 10%
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${isSelected ? "text-white/70" : "text-gray-500 dark:text-gray-400"}`}>
                      ₦{Math.round(plan.yearlyPrice / 12).toLocaleString()}/mo billed yearly
                    </p>
                  </>
                ) : (
                  <>
                    <h3
                      className={`text-[2.0625rem] font-semibold mb-[1rem] transition-all duration-300 ${
                        isSelected ? "text-white" : "text-[#000] dark:text-white"
                      }`}
                    >
                      {price}
                    </h3>
                    <p
                      className={`${
                        isSelected ? "text-white" : "text-[#6B6B6B]"
                      } font-semibold text-[1rem] leading-[125%]`}
                    >
                      {subtext}
                    </p>
                  </>
                )}
                <span
                  className={`font-semibold text-[1rem] mt-[0.5rem] ${
                    isSelected ? "text-white" : "text-[#6B6B6B]"
                  }`}
                >
                  VAT may apply
                </span>

                {/* CTA button */}
                <Link href="/pricing/paymentPages">
                  <button
                    className={`rounded-full w-full ${
                      isSelected
                        ? "text-[#0080FF] bg-white"
                        : "text-[#0080FF] border-[2px] border-[#0080FF]"
                    } font-semibold text-[1.25rem] py-3 mt-[2.25rem]`}
                  >
                    {ctaText}
                  </button>
                </Link>

                {/* Features */}
                <h1
                  className={`mt-[2.25rem] mb-[2.25rem] font-medium text-[1rem] ${
                    isSelected ? "text-white" : "text-[#6B6B6B]"
                  }`}
                >
                  What's included:
                </h1>
                <span className="flex flex-col gap-5 mb-6">
                  {plan.features && plan.features.length > 0 ? (
                    plan.features.map((f, fi) => (
                      <p key={fi} className="flex gap-6">
                        <Check size={28} className="text-[#26DA95] shrink-0" />
                        <span>{f}</span>
                      </p>
                    ))
                  ) : (
                    <p className={`text-sm ${isSelected ? "text-white/70" : "text-neutral-400"}`}>
                      No features listed
                    </p>
                  )}
                </span>

                {/* Staff limits */}
                {plan.staffLimits && (
                  <div
                    className={`mt-auto pt-4 border-t ${
                      isSelected ? "border-white/20" : "border-neutral-100"
                    }`}
                  >
                    <p
                      className={`text-sm font-medium mb-2 ${
                        isSelected ? "text-white/80" : "text-[#6B6B6B]"
                      }`}
                    >
                      Staff limits:
                    </p>
                    <ul
                      className={`text-sm flex flex-col gap-1 ${
                        isSelected ? "text-white/80" : "text-[#6B6B6B]"
                      }`}
                    >
                      {plan.staffLimits.attendants !== undefined && (
                        <li>
                          {plan.staffLimits.attendants === 999
                            ? "Unlimited"
                            : plan.staffLimits.attendants}{" "}
                          Attendants
                        </li>
                      )}
                      {plan.staffLimits.cashiers !== undefined && (
                        <li>
                          {plan.staffLimits.cashiers === 999
                            ? "Unlimited"
                            : plan.staffLimits.cashiers}{" "}
                          Cashiers
                        </li>
                      )}
                      {plan.staffLimits.managers !== undefined && (
                        <li>
                          {plan.staffLimits.managers === 999
                            ? "Unlimited"
                            : plan.staffLimits.managers}{" "}
                          Managers
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <FrequentlyQuestions />
    </div>
  );
};

export default PricingPage;
