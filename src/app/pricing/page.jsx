"use client";
import React, { useState, useEffect } from "react";
import { Check, CheckCircle, Building2, X, CreditCard } from "lucide-react";
import FrequentlyQuestions from "./FrequentlyQuestions";
import usePlansStore from "@/store/usePlansStore";
import RegisterManagerModal from "@/components/RegisterManagerModal";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [buttonOne, setButtonOne] = useState("buttonOne");
  const [showBlue, setShowBlue] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [payerEmail, setPayerEmail] = useState("");
  const [payerName, setPayerName] = useState("");
  const [payerInfo, setPayerInfo] = useState(null);
  const [emailError, setEmailError] = useState("");
  const [initiatingPayment, setInitiatingPayment] = useState(false);
  const [processingPlan, setProcessingPlan] = useState(null);

  const { plans, loading, fetchPublicPlans } = usePlansStore();

  useEffect(() => {
    fetchPublicPlans();
  }, []);

  // Auto-select first plan once loaded
  useEffect(() => {
    if (plans.length > 0 && showBlue === null) {
      setShowBlue(plans[0]._id || plans[0].id || plans[0].slug || "0");
    }
    console.log("Plans from API:", plans);
    console.log(
      "Enterprise plans found:",
      plans.filter((p) => p.slug?.toLowerCase().startsWith("enterprise")).length
    );
  }, [plans]);

  // Auto-open registration modal after successful payment redirect
  useEffect(() => {
    const shouldRegister = searchParams.get("register");
    const paymentVerified = sessionStorage.getItem("paymentVerified");
    if (shouldRegister === "true" && paymentVerified) {
      try {
        const paymentData = JSON.parse(paymentVerified);
        if (paymentData.verified) {
          setPayerInfo(paymentData.payer || null);
          setShowRegisterModal(true);
          sessionStorage.removeItem("paymentVerified");
        }
      } catch {}
    }
  }, [searchParams]);

  const isYearly = buttonOne === "buttonOne";
  const billing = isYearly ? "yearly" : "monthly";

  const isEnterprisePlan = (p) =>
    (p.slug || p.name || "").toLowerCase().startsWith("enterprise");

  const individualPlans = plans.filter((p) => !isEnterprisePlan(p));
  const enterprisePlans = plans.filter((p) => isEnterprisePlan(p));

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
      return plan.monthlyPrice
        ? `₦${Number(plan.monthlyPrice).toLocaleString()}/mo equivalent`
        : `₦${Number(plan.yearlyPrice).toLocaleString()} for 12 months`;
    }
    return "Billed every month";
  };

  const getCtaText = (plan) => {
    if (plan.monthlyPrice === 0 || (plan.slug || plan.name || "").toLowerCase() === "free") {
      return "Get Started Free";
    }
    if (processingPlan === plan.slug) return "Processing...";
    const name = (plan.name || "").replace("Plan", "").trim();
    return `Get ${name}`;
  };

  const comingSoonFeatures = [
    "Priority support",
    "Dedicated support",
    "White-glove onboarding",
    "Dedicated account manager",
    "Custom SLA agreement",
    "API access",
    "Custom integrations",
  ];

  const planKey = (plan, i) =>
    plan._id || plan.id || plan.slug || String(i);

  const handleSelectPlan = (plan) => {
    sessionStorage.setItem(
      "selectedPlan",
      JSON.stringify({
        slug: plan.slug,
        name: plan.name,
        billingCycle: plan.monthlyPrice === 0 ? "free" : billing,
        amount:
          plan.monthlyPrice === 0
            ? 0
            : billing === "monthly"
            ? plan.monthlyPrice
            : plan.yearlyPrice,
      })
    );

    if (
      plan.monthlyPrice === 0 ||
      (plan.slug || plan.name || "").toLowerCase() === "free"
    ) {
      setShowRegisterModal(true);
      return;
    }

    setSelectedPlanForPayment(plan);
    setShowEmailModal(true);
  };

  const handleInitiateGuestPayment = async () => {
    setEmailError("");

    if (!payerName.trim()) {
      setEmailError("Please enter your name");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payerEmail)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    try {
      setInitiatingPayment(true);

      sessionStorage.setItem(
        "payerInfo",
        JSON.stringify({ name: payerName, email: payerEmail })
      );

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/api/payments/initialize-guest`,
        {
          email: payerEmail,
          name: payerName,
          planSlug: selectedPlanForPayment.slug,
          billingCycle: billing,
        }
      );

      window.location.href = response.data.data.authorizationUrl;
    } catch (err) {
      setEmailError(
        err.response?.data?.error ||
          "Failed to initialize payment. Please try again."
      );
      setInitiatingPayment(false);
    }
  };

  const renderCard = (plan, i) => {
    const key = planKey(plan, i);
    const isSelected = showBlue === key;
    const price = getPrice(plan);
    const subtext = getSubtext(plan);
    const ctaText = getCtaText(plan);
    const isEnterprise = isEnterprisePlan(plan);

    return (
      <div
        key={key}
        onClick={() => setShowBlue(key)}
        className={`relative flex flex-col hover:scale-105 transition ${
          isSelected ? "bg-[#1A71F6] text-white" : "bg-white"
        } rounded-xl lg:p-4 p-2 max-w-[22.438rem] border border-neutral-100`}
      >
        {/* Most Popular badge */}
        {plan.isPopular && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
              Most Popular
            </span>
          </div>
        )}

        {/* Best for Networks badge */}
        {plan.slug === "enterprise-pro" && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
              Best for Networks
            </span>
          </div>
        )}

        {/* Plan name + popular badge */}
        <div className="flex justify-between items-start mb-[1rem]">
          <h1 className="text-[1.5rem] font-semibold">{plan.name}</h1>
          {plan.isPopular && (
            <button className="w-[6.875rem] h-[2.3125rem] text-[#0080FF] flex items-center justify-center bg-white font-semibold text-[0.875rem] border border-neutral-400 rounded-full shrink-0">
              Most popular
            </button>
          )}
        </div>

        {/* Branch count badge for enterprise plans */}
        {isEnterprise && plan.allowMultipleBranches && (
          <div
            className={`flex items-center gap-2 mb-4 p-3 rounded-lg border ${
              isSelected
                ? "bg-purple-700/40 border-purple-400/40"
                : "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700"
            }`}
          >
            <Building2 size={16} className="text-purple-400 flex-shrink-0" />
            <span
              className={`text-sm font-semibold ${
                isSelected ? "text-purple-200" : "text-purple-700 dark:text-purple-400"
              }`}
            >
              {plan.maxBranches >= 999
                ? "Unlimited branches"
                : `Up to ${plan.maxBranches} branches`}
            </span>
          </div>
        )}

        {/* Price */}
        {isYearly && plan.monthlyPrice > 0 ? (
          <>
            <div className="flex items-baseline flex-wrap gap-1 mb-[1rem]">
              <span className="text-gray-400 line-through text-sm mr-1">
                ₦{(plan.monthlyPrice * 12).toLocaleString()}
              </span>
              <span
                className={`font-bold text-2xl ${
                  isSelected ? "text-white" : "text-[#000] dark:text-white"
                }`}
              >
                ₦{plan.yearlyPrice.toLocaleString()}
              </span>
              <span
                className={`text-sm ${
                  isSelected ? "text-white/80" : "text-[#6B6B6B]"
                }`}
              >
                /yr
              </span>
              <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold px-2 py-0.5 rounded-full ml-2">
                Save 10%
              </span>
            </div>
            <p
              className={`text-xs mt-1 ${
                isSelected ? "text-white/70" : "text-gray-500 dark:text-gray-400"
              }`}
            >
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
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSelectPlan(plan);
          }}
          className={`rounded-full w-full ${
            isSelected
              ? "text-[#0080FF] bg-white"
              : isEnterprise
              ? "text-purple-600 border-[2px] border-purple-600"
              : "text-[#0080FF] border-[2px] border-[#0080FF]"
          } font-semibold text-[1.25rem] py-3 mt-[2.25rem]`}
        >
          {ctaText}
        </button>

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
            plan.features.map((f, fi) => {
              const isSoon = comingSoonFeatures.some((cs) =>
                f.toLowerCase().includes(cs.toLowerCase())
              );
              return (
                <li key={fi} className="flex items-center gap-2 text-sm list-none">
                  <CheckCircle
                    size={14}
                    className={isSoon ? "text-gray-400 flex-shrink-0" : "text-green-500 flex-shrink-0"}
                  />
                  <span className={isSoon ? "text-gray-400 dark:text-gray-500" : "text-gray-700 dark:text-gray-300"}>
                    {f}
                  </span>
                  {isSoon && (
                    <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs rounded-md font-medium whitespace-nowrap">
                      Soon
                    </span>
                  )}
                </li>
              );
            })
          ) : (
            <p
              className={`text-sm ${
                isSelected ? "text-white/70" : "text-neutral-400"
              }`}
            >
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
  };

  return (
    <div className="bg-neutral-100 flex flex-col items-center justify-center">
      {/* Header */}
      <div className="flex flex-col mt-12 sm:mt-16 lg:mt-20 w-full justify-center items-center text-center mb-[1.5rem] px-4">
        <h1 className="text-2xl sm:text-[2.25rem] md:text-[3rem] lg:text-[4rem] text-[#454545] font-semibold">
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
      <div className="max-w-[75rem] w-full px-4 sm:px-6 pb-8">
        {loading && plans.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-16 text-neutral-400 font-medium">
            No plans available at this time.
          </div>
        ) : (
          <>
            {/* Individual Plans Row */}
            {individualPlans.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {individualPlans.map((plan, i) => renderCard(plan, i))}
              </div>
            )}

            {/* Enterprise Section Heading */}
            {enterprisePlans.length > 0 && (
              <>
                <div className="mt-12 mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-purple-200 dark:to-purple-800" />
                    <span className="flex items-center gap-2 px-4 py-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                      <Building2 size={16} className="text-purple-600" />
                      <span className="text-sm font-semibold text-purple-700 dark:text-purple-400">
                        Enterprise Plans
                      </span>
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-purple-200 dark:to-purple-800" />
                  </div>
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                    For businesses managing multiple filling station locations
                  </p>
                </div>

                {/* Enterprise Plans Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  {enterprisePlans.map((plan, i) =>
                    renderCard(plan, individualPlans.length + i)
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <FrequentlyQuestions />

      {/* Registration Modal (free plan or post-payment) */}
      {showRegisterModal && (
        <RegisterManagerModal
          onclose={() => {
            setShowRegisterModal(false);
            setPayerInfo(null);
          }}
          payerInfo={payerInfo}
        />
      )}

      {/* Email Collection Modal for paid plans */}
      {showEmailModal && selectedPlanForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <button
              onClick={() => setShowEmailModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <CreditCard size={20} className="text-blue-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                Complete Payment
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                {selectedPlanForPayment.name} — ₦
                {(billing === "monthly"
                  ? selectedPlanForPayment.monthlyPrice
                  : selectedPlanForPayment.yearlyPrice
                ).toLocaleString()}
                /{billing === "monthly" ? "mo" : "yr"}
              </p>
            </div>

            {emailError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-600 text-sm">{emailError}</p>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Full Name
                </label>
                <input
                  type="text"
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Email Address
                </label>
                <input
                  type="email"
                  value={payerEmail}
                  onChange={(e) => setPayerEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 mb-4 text-center">
              You will set up your station account after payment
            </p>

            {payerEmail && payerName && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Payment Breakdown
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      {selectedPlanForPayment.name}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ₦{(billing === "monthly"
                        ? selectedPlanForPayment.monthlyPrice
                        : selectedPlanForPayment.yearlyPrice
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Tax (7.5% Nigeria)
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ₦{Math.round(
                        (billing === "monthly"
                          ? selectedPlanForPayment.monthlyPrice
                          : selectedPlanForPayment.yearlyPrice
                        ) * 0.075
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-blue-200 dark:border-blue-700 pt-2 flex justify-between">
                    <span className="font-bold text-gray-900 dark:text-white">
                      Total Amount
                    </span>
                    <span className="font-bold text-blue-600 text-lg">
                      ₦{Math.round(
                        (billing === "monthly"
                          ? selectedPlanForPayment.monthlyPrice
                          : selectedPlanForPayment.yearlyPrice
                        ) * 1.075
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleInitiateGuestPayment}
              disabled={initiatingPayment}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {initiatingPayment ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Redirecting to payment...
                </>
              ) : (
                <>
                  <CreditCard size={16} />
                  Pay Now — ₦
                  {(billing === "monthly"
                    ? selectedPlanForPayment.monthlyPrice
                    : selectedPlanForPayment.yearlyPrice
                  ).toLocaleString()}
                </>
              )}
            </button>

            <button
              onClick={() => setShowEmailModal(false)}
              className="w-full mt-2 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingPage;
