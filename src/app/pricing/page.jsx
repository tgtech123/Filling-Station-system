"use client";
import React, { useState, useEffect, Suspense } from "react";
import { CheckCircle, Building2, X, CreditCard, Zap } from "lucide-react";
import FrequentlyQuestions from "./FrequentlyQuestions";
import usePlansStore from "@/store/usePlansStore";
import RegisterManagerModal from "@/components/RegisterManagerModal";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/config";

const SkeletonCard = () => (
  <div className="flex flex-col bg-white rounded-2xl p-5 sm:p-6 border border-neutral-100 animate-pulse w-full">
    <div className="h-6 bg-gray-200 rounded-lg w-1/2 mb-4" />
    <div className="h-10 bg-gray-200 rounded-lg w-3/4 mb-3" />
    <div className="h-4 bg-gray-100 rounded w-full mb-2" />
    <div className="h-4 bg-gray-100 rounded w-1/2 mb-8" />
    <div className="h-12 bg-gray-100 rounded-full w-full mb-8" />
    <div className="h-4 bg-gray-100 rounded w-1/3 mb-5" />
    <div className="flex flex-col gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-4 bg-gray-100 rounded w-full" />
      ))}
    </div>
  </div>
);

const PricingPage = () => {
  const searchParams = useSearchParams();
  const [billing, setBilling] = useState("yearly");
  const [showBlue, setShowBlue] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [payerEmail, setPayerEmail] = useState("");
  const [payerName, setPayerName] = useState("");
  const [payerInfo, setPayerInfo] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailExists, setEmailExists] = useState(false);
  const [initiatingPayment, setInitiatingPayment] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);

  const { plans, loading, fetchPublicPlans } = usePlansStore();

  useEffect(() => { fetchPublicPlans(); }, []);

  useEffect(() => {
    if (plans.length > 0 && showBlue === null) {
      setShowBlue(plans[0]._id || plans[0].id || plans[0].slug || "0");
    }
  }, [plans]);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const userRaw = localStorage.getItem("user");
      if (token && userRaw) {
        const user = JSON.parse(userRaw);
        const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
        if (fullName) setPayerName(fullName);
        if (user.email) setPayerEmail(user.email);
        setIsLoggedIn(true);
        api
          .get("/api/payments/current-plan")
          .then((res) => setCurrentPlan(res.data.data))
          .catch(() => {});
      }
    } catch {}
  }, []);

  useEffect(() => {
    const shouldRegister = searchParams.get("register");
    const paymentVerified = sessionStorage.getItem("paymentVerified");
    if (shouldRegister === "true" && paymentVerified) {
      try {
        const paymentData = JSON.parse(paymentVerified);
        if (paymentData.verified) {
          setPayerInfo(paymentData.payer || null);
          setShowRegisterModal(true);
        }
      } catch {}
    }
  }, [searchParams]);

  const isYearly = billing === "yearly";
  const isEnterprisePlan = (p) =>
    (p.slug || p.name || "").toLowerCase().startsWith("enterprise");
  const individualPlans = plans.filter((p) => !isEnterprisePlan(p));
  const enterprisePlans = plans.filter((p) => isEnterprisePlan(p));

  const getPrice = (plan) => {
    if (isYearly)
      return plan.yearlyPrice === 0 ? "Free" : `₦${Number(plan.yearlyPrice).toLocaleString()}/yr`;
    return plan.monthlyPrice === 0 ? "Free" : `₦${Number(plan.monthlyPrice).toLocaleString()}/mo`;
  };

  const getPlanRelation = (plan) => {
    if (!isLoggedIn || !currentPlan) return "new";
    if (plan.slug === currentPlan.plan) return "same";
    const currentPlanData = plans.find((p) => p.slug === currentPlan.plan);
    const thisPrice = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
    const currentPrice = currentPlanData ? (isYearly ? currentPlanData.yearlyPrice : currentPlanData.monthlyPrice) : 0;
    return thisPrice > currentPrice ? "upgrade" : "downgrade";
  };

  const getCtaText = (plan, relation) => {
    if (plan.monthlyPrice === 0 || (plan.slug || plan.name || "").toLowerCase() === "free")
      return "Get Started Free";
    const name = (plan.name || "").replace("Plan", "").trim();
    if (relation === "same") return `Renew ${name}`;
    if (relation === "upgrade") return `Upgrade to ${name}`;
    if (relation === "downgrade") return `Downgrade to ${name}`;
    return `Get ${name}`;
  };

  const comingSoonFeatures = [
    "Dedicated support","White-glove onboarding",
    "Dedicated account manager","Custom SLA agreement","API access","Custom integrations",
  ];

  const planKey = (plan, i) => plan._id || plan.id || plan.slug || String(i);

  const handleSelectPlan = (plan) => {
    sessionStorage.setItem("selectedPlan", JSON.stringify({
      slug: plan.slug,
      name: plan.name,
      billingCycle: plan.monthlyPrice === 0 ? "free" : billing,
      amount: plan.monthlyPrice === 0 ? 0 : isYearly ? plan.yearlyPrice : plan.monthlyPrice,
    }));
    if (plan.monthlyPrice === 0 || (plan.slug || plan.name || "").toLowerCase() === "free") {
      setShowRegisterModal(true);
      return;
    }
    setSelectedPlanForPayment(plan);
    setShowEmailModal(true);
  };

  const handleAuthenticatedPayment = async (plan) => {
    try {
      setInitiatingPayment(true);
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/api/payments/initialize",
        { planSlug: plan.slug, billingCycle: billing }
      );
      window.location.href = response.data.data.authorizationUrl;
    } catch (err) {
      setInitiatingPayment(false);
      alert(err.response?.data?.error || "Failed to initialize payment. Please try again.");
    }
  };

  const closeEmailModal = () => {
    setShowEmailModal(false);
    setEmailError("");
    setEmailExists(false);
  };

  const handleInitiateGuestPayment = async () => {
    setEmailError("");
    setEmailExists(false);
    if (!payerName.trim()) { setEmailError("Please enter your name"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payerEmail)) {
      setEmailError("Please enter a valid email address"); return;
    }
    try {
      setInitiatingPayment(true);
      sessionStorage.setItem("payerInfo", JSON.stringify({ name: payerName, email: payerEmail }));
      const response = await api.post("/api/payments/initialize-guest", {
        email: payerEmail, name: payerName,
        planSlug: selectedPlanForPayment.slug, billingCycle: billing,
      });
      window.location.href = response.data.data.authorizationUrl;
    } catch (err) {
      if (err.response?.data?.error === "account_exists") setEmailExists(true);
      else setEmailError(err.response?.data?.message || "Failed to initialize payment. Please try again.");
      setInitiatingPayment(false);
    }
  };

  const renderCard = (plan, i) => {
    const key = planKey(plan, i);
    const isSelected = showBlue === key;
    const isEnterprise = isEnterprisePlan(plan);
    const relation = getPlanRelation(plan);
    const ctaText = getCtaText(plan, relation);

    const ctaBtnClass = () => {
      if (isSelected) {
        if (relation === "same") return "bg-orange-100 text-orange-600 font-semibold";
        if (relation === "downgrade") return "bg-white/20 text-white/70";
        return "bg-white text-[#0080FF] font-semibold";
      }
      if (relation === "same") return "text-orange-500 border-2 border-orange-400";
      if (relation === "downgrade") return "text-gray-400 border-2 border-gray-200";
      if (isEnterprise) return "text-purple-600 border-2 border-purple-500 font-semibold";
      return "text-[#0080FF] border-2 border-[#0080FF] font-semibold";
    };

    return (
      <div
        key={key}
        onClick={() => setShowBlue(key)}
        className={`relative flex flex-col w-full rounded-2xl p-5 sm:p-6 border transition-all duration-200 active:scale-[0.99] cursor-pointer
          ${isSelected
            ? "bg-[#1A71F6] text-white border-[#1A71F6] shadow-xl shadow-blue-200"
            : "bg-white border-neutral-100 shadow-sm hover:shadow-md hover:border-blue-100"
          }`}
      >
        {/* Popular / Enterprise badge */}
        {(plan.isPopular || plan.slug === "enterprise-pro") && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
            <span className={`${plan.slug === "enterprise-pro" ? "bg-purple-600" : "bg-blue-600"} text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap shadow`}>
              {plan.slug === "enterprise-pro" ? "Best for Networks" : "Most Popular"}
            </span>
          </div>
        )}

        {/* Plan name row */}
        <div className="flex items-start justify-between mb-4 mt-1">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{plan.name}</h2>
          {plan.isPopular && !isSelected && (
            <span className="text-[#0080FF] text-xs font-semibold border border-blue-200 bg-blue-50 px-3 py-1 rounded-full shrink-0 ml-2">
              Popular
            </span>
          )}
        </div>

        {/* Branch badge for enterprise */}
        {isEnterprise && plan.allowMultipleBranches && (
          <div className={`flex items-center gap-2 mb-4 p-2.5 rounded-xl border text-sm font-semibold
            ${isSelected ? "bg-purple-700/30 border-purple-400/30 text-purple-200" : "bg-purple-50 border-purple-100 text-purple-700"}`}>
            <Building2 size={15} className="shrink-0" />
            {plan.maxBranches >= 999 ? "Unlimited branches" : `Up to ${plan.maxBranches} branches`}
          </div>
        )}

        {/* Price */}
        <div className="mb-1">
          {isYearly && plan.monthlyPrice > 0 ? (
            <>
              <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1">
                <span className={`line-through text-sm ${isSelected ? "text-white/50" : "text-gray-400"}`}>
                  ₦{(plan.monthlyPrice * 12).toLocaleString()}
                </span>
                <span className="text-3xl sm:text-4xl font-bold">
                  ₦{(plan.yearlyPrice ?? Math.round(plan.monthlyPrice * 12 * 0.9)).toLocaleString()}
                </span>
                <span className={`text-sm ${isSelected ? "text-white/70" : "text-gray-500"}`}>/yr</span>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">Save 10%</span>
              </div>
              <p className={`text-xs mt-1.5 ${isSelected ? "text-white/60" : "text-gray-400"}`}>
                ₦{Math.round(plan.yearlyPrice / 12).toLocaleString()}/mo billed yearly
              </p>
            </>
          ) : (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-bold">{getPrice(plan)}</span>
              </div>
              <p className={`text-sm mt-1 ${isSelected ? "text-white/70" : "text-gray-500"}`}>
                {plan.monthlyPrice === 0 ? "No charge" : "Billed every month"}
              </p>
            </>
          )}
          <p className={`text-xs mt-0.5 ${isSelected ? "text-white/50" : "text-gray-400"}`}>VAT may apply</p>
        </div>

        {/* CTA button */}
        <button
          onClick={(e) => { e.stopPropagation(); handleSelectPlan(plan); }}
          className={`w-full rounded-full py-3 sm:py-3.5 text-base font-semibold mt-6 transition-all active:scale-95 ${ctaBtnClass()}`}
        >
          {ctaText}
        </button>

        {/* Features */}
        <p className={`mt-6 mb-4 text-sm font-semibold uppercase tracking-wide ${isSelected ? "text-white/70" : "text-gray-400"}`}>
          What's included
        </p>
        <ul className="flex flex-col gap-3">
          {plan.features && plan.features.length > 0 ? (
            plan.features.map((f, fi) => {
              const isSoon = comingSoonFeatures.some((cs) => f.toLowerCase().includes(cs.toLowerCase()));
              return (
                <li key={fi} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle
                    size={16}
                    className={`mt-0.5 shrink-0 ${isSoon ? "text-gray-300" : "text-green-400"}`}
                  />
                  <span className={isSoon
                    ? isSelected ? "text-white/40" : "text-gray-400"
                    : isSelected ? "text-white/90" : "text-gray-700"}>
                    {f}
                  </span>
                  {isSoon && (
                    <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded-md font-medium
                      ${isSelected ? "bg-white/10 text-white/50" : "bg-amber-100 text-amber-600"}`}>
                      Soon
                    </span>
                  )}
                </li>
              );
            })
          ) : (
            <li className={`text-sm ${isSelected ? "text-white/50" : "text-gray-400"}`}>No features listed</li>
          )}
        </ul>

        {/* Staff limits */}
        {plan.staffLimits && (
          <div className={`mt-6 pt-4 border-t ${isSelected ? "border-white/20" : "border-gray-100"}`}>
            <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isSelected ? "text-white/60" : "text-gray-400"}`}>
              Staff limits
            </p>
            <ul className={`text-sm flex flex-col gap-1.5 ${isSelected ? "text-white/80" : "text-gray-600"}`}>
              {plan.staffLimits.attendants !== undefined && (
                <li className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white/50" : "bg-gray-300"}`} />
                  {plan.staffLimits.attendants === 999 ? "Unlimited" : plan.staffLimits.attendants} Attendants
                </li>
              )}
              {plan.staffLimits.cashiers !== undefined && (
                <li className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white/50" : "bg-gray-300"}`} />
                  {plan.staffLimits.cashiers === 999 ? "Unlimited" : plan.staffLimits.cashiers} Cashiers
                </li>
              )}
              {plan.staffLimits.managers !== undefined && (
                <li className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white/50" : "bg-gray-300"}`} />
                  {plan.staffLimits.managers === 999 ? "Unlimited" : plan.staffLimits.managers} Managers
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero header */}
      <div className="w-full px-4 sm:px-6 pt-12 sm:pt-16 lg:pt-24 pb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full mb-5">
          <Zap size={14} className="shrink-0" />
          Simple, transparent pricing
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4">
          Plans & Pricing
        </h1>
        <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
          Flexible plans to fit your business needs, whether you're just starting out or scaling up.
        </p>
      </div>

      {/* Billing toggle */}
      <div className="flex justify-center px-4 mb-10">
        <div className="flex bg-white border border-gray-200 rounded-full p-1 shadow-sm w-full max-w-xs sm:max-w-sm">
          <button
            onClick={() => setBilling("yearly")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-sm font-semibold transition-all duration-200
              ${isYearly ? "bg-blue-600 text-white shadow" : "text-gray-500 hover:text-gray-700"}`}
          >
            Bill Annually
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full transition-colors
              ${isYearly ? "bg-white/20 text-white" : "bg-green-100 text-green-600"}`}>
              Save 10%
            </span>
          </button>
          <button
            onClick={() => setBilling("monthly")}
            className={`flex-1 flex items-center justify-center py-2.5 px-4 rounded-full text-sm font-semibold transition-all duration-200
              ${!isYearly ? "bg-blue-600 text-white shadow" : "text-gray-500 hover:text-gray-700"}`}
          >
            Bill Monthly
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        {loading && plans.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-medium">
            No plans available at this time.
          </div>
        ) : (
          <>
            {individualPlans.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {individualPlans.map((plan, i) => renderCard(plan, i))}
              </div>
            )}

            {enterprisePlans.length > 0 && (
              <>
                <div className="mt-14 mb-7 flex items-center gap-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-purple-200" />
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-purple-50 border border-purple-100 rounded-full shrink-0">
                    <Building2 size={14} className="text-purple-600" />
                    <span className="text-sm font-semibold text-purple-700">Enterprise Plans</span>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-purple-200" />
                </div>
                <p className="text-center text-sm text-gray-500 mb-6">
                  For businesses managing multiple filling station locations
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {enterprisePlans.map((plan, i) => renderCard(plan, individualPlans.length + i))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <FrequentlyQuestions />

      {showRegisterModal && (
        <RegisterManagerModal
          onclose={() => { setShowRegisterModal(false); setPayerInfo(null); }}
          payerInfo={payerInfo}
        />
      )}

      {showEmailModal && selectedPlanForPayment && (
        <ModalPayment
          plan={selectedPlanForPayment}
          relation={getPlanRelation(selectedPlanForPayment)}
          billing={billing}
          isLoggedIn={isLoggedIn}
          payerName={payerName}
          payerEmail={payerEmail}
          setPayerName={setPayerName}
          setPayerEmail={setPayerEmail}
          emailError={emailError}
          setEmailError={setEmailError}
          emailExists={emailExists}
          setEmailExists={setEmailExists}
          initiatingPayment={initiatingPayment}
          onClose={closeEmailModal}
          onPay={isLoggedIn ? () => handleAuthenticatedPayment(selectedPlanForPayment) : handleInitiateGuestPayment}
        />
      )}
    </div>
  );
};

function ModalPayment({
  plan, relation, billing, isLoggedIn,
  payerName, payerEmail, setPayerName, setPayerEmail,
  emailError, setEmailError, emailExists, setEmailExists,
  initiatingPayment, onClose, onPay,
}) {
  const isRenew = relation === "same";
  const modalTitle = isRenew ? "Renew Your Plan" : relation === "upgrade" ? "Upgrade Your Plan" : "Complete Payment";
  const planNote = isLoggedIn
    ? isRenew ? "Your plan will be renewed for another billing cycle." : "Your plan will be upgraded immediately after payment."
    : "You will set up your station account after payment.";
  const planPrice = billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
      <div className="relative bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 w-full sm:max-w-sm max-h-[92vh] overflow-y-auto">
        {/* Handle bar for mobile bottom sheet */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5 sm:hidden" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
        >
          <X size={16} />
        </button>

        <div className="text-center mb-6">
          <div className={`w-12 h-12 ${isRenew ? "bg-orange-100" : "bg-blue-100"} rounded-full flex items-center justify-center mx-auto mb-3`}>
            <CreditCard size={20} className={isRenew ? "text-orange-500" : "text-blue-600"} />
          </div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">{modalTitle}</h3>
          <p className="text-gray-500 text-sm mt-1">
            {plan.name} — ₦{planPrice.toLocaleString()}/{billing === "monthly" ? "mo" : "yr"}
          </p>
        </div>

        {emailExists && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
            <p className="text-amber-800 text-sm font-semibold mb-1">Account already exists</p>
            <p className="text-amber-700 text-xs">
              This email is already registered.{" "}
              <Link href="/login" className="underline font-semibold">Log in to upgrade</Link>{" "}
              from your dashboard instead.
            </p>
          </div>
        )}

        {emailError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
            <p className="text-red-600 text-sm">{emailError}</p>
          </div>
        )}

        {isLoggedIn && (
          <div className={`flex items-center gap-2 border rounded-xl px-3 py-2.5 mb-4 text-xs font-medium
            ${isRenew ? "bg-orange-50 border-orange-200 text-orange-700" : "bg-blue-50 border-blue-200 text-blue-700"}`}>
            <span className={`w-2 h-2 rounded-full shrink-0 ${isRenew ? "bg-orange-500" : "bg-blue-500"}`} />
            {isRenew ? "Renewing your current plan" : "Upgrading your existing station account"}
          </div>
        )}

        <div className="space-y-3">
          {[
            { label: "Full Name", type: "text", value: payerName, setter: setPayerName, placeholder: "John Doe" },
            { label: "Email Address", type: "email", value: payerEmail, setter: setPayerEmail, placeholder: "you@example.com" },
          ].map(({ label, type, value, setter, placeholder }) => (
            <div key={label}>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">{label}</label>
              <input
                type={type}
                value={value}
                onChange={(e) => {
                  if (!isLoggedIn) {
                    setter(e.target.value);
                    if (type === "email") { setEmailExists(false); setEmailError(""); }
                  }
                }}
                readOnly={isLoggedIn}
                placeholder={placeholder}
                className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
                  ${isLoggedIn ? "bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed" : "bg-white border-gray-300 text-gray-900"}`}
              />
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-3 mb-4 text-center">{planNote}</p>

        {payerEmail && payerName && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
            <p className="text-sm font-bold text-gray-900 mb-3">Payment Breakdown</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{plan.name}</span>
                <span className="font-semibold">₦{planPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (7.5%)</span>
                <span className="font-semibold">₦{Math.round(planPrice * 0.075).toLocaleString()}</span>
              </div>
              <div className="border-t border-blue-200 pt-2 flex justify-between">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-bold text-blue-600 text-base">₦{Math.round(planPrice * 1.075).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onPay}
          disabled={initiatingPayment}
          className={`w-full py-3.5 ${isRenew ? "bg-orange-500 hover:bg-orange-600" : "bg-blue-600 hover:bg-blue-700"} text-white rounded-xl font-bold text-sm disabled:opacity-50 transition-colors flex items-center justify-center gap-2 active:scale-[0.98]`}
        >
          {initiatingPayment ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Redirecting...</>
          ) : (
            <><CreditCard size={16} />{isRenew ? "Renew Now" : "Pay Now"} — ₦{planPrice.toLocaleString()}</>
          )}
        </button>

        <button onClick={onClose} className="w-full mt-3 py-2.5 text-sm text-gray-400 hover:text-gray-600 font-medium">
          Cancel
        </button>
      </div>
    </div>
  );
}

function PricingPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PricingPage />
    </Suspense>
  );
}

export default PricingPageWrapper;
