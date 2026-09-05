"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import usePaymentStore from "@/store/usePaymentStore";
import { extractApiError } from "@/lib/config";

function PaymentVerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const { verifyPayment } = usePaymentStore();

  const [status, setStatus] = useState("verifying"); // verifying | success | failed
  const [planName, setPlanName] = useState("");
  // "dashboard" → authenticated upgrade goes to /dashboard/manager
  // "login"     → existing-email guest goes to /login with upgrade banner
  // "setup"     → brand new user goes to /pricing?register=true to create station
  const [redirectTarget, setRedirectTarget] = useState("dashboard");
  const [failureReason, setFailureReason] = useState("");

  useEffect(() => {
    if (!reference) {
      router.push("/dashboard/manager");
      return;
    }

    const verify = async () => {
      try {
        const result = await verifyPayment(reference);
        const data = result.data || {};
        setPlanName(data.planName || data.plan || "");

        // Determine payment context:
        // - isGuest: true + isExistingUser: false  → brand-new user, no station yet
        // - isGuest: true + isExistingUser: true   → existing manager paid as guest, plan upgraded
        // - isGuest: false / undefined             → authenticated manager upgrading from dashboard
        //
        // Safety nets used in order of reliability:
        // 1. sessionStorage.payerInfo   — written by the pricing page ONLY after initialize-guest
        //    succeeds. That endpoint rejects with account_exists if the email is already a manager,
        //    so its presence is the strongest signal that this is a brand-new user.
        // 2. data.isGuest / reference prefix — tells us it's a guest flow at all.
        // 3. data.isExistingUser — can be wrong if the backend found a partial/stale record, so
        //    we treat it as advisory rather than authoritative for non-logged-in guests.
        const isGuestRef       = reference?.startsWith("FS_GUEST_");
        const isGuestPayment   = data.isGuest === true || isGuestRef === true;
        const alreadyLoggedIn  = !!localStorage.getItem("token");
        const existingAccount  = data.isExistingUser === true;
        const authenticatedUpgrade = !isGuestPayment;

        // payerInfo is present iff the user went through our guest checkout on THIS device —
        // meaning the email was confirmed new at initialization time.
        let payerInfoRaw = null;
        let isConfirmedNewUser = false;
        try {
          payerInfoRaw = sessionStorage.getItem("payerInfo");
          isConfirmedNewUser = isGuestPayment && !alreadyLoggedIn && !!payerInfoRaw;
        } catch {}

        setStatus("success");

        if (alreadyLoggedIn || authenticatedUpgrade) {
          // Logged-in user upgraded their plan — reload so all stores pick up the new plan
          setRedirectTarget("dashboard");
          setTimeout(() => { window.location.href = "/dashboard/manager"; }, 3000);

        } else {
          // Guest payment, user is not logged in → always go to station setup.
          // The RegisterManagerModal handles the case where the email already has a station
          // by prompting the user to log in from within that flow.
          setRedirectTarget("setup");
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          if (!sessionStorage.getItem("selectedPlan")) {
            sessionStorage.setItem(
              "selectedPlan",
              JSON.stringify({
                slug: data.planSlug,
                name: data.planName,
                billingCycle: data.billingCycle,
              })
            );
          }

          sessionStorage.setItem(
            "paymentVerified",
            JSON.stringify({
              verified: true,
              plan: data.planName,
              planSlug: data.planSlug,
              billingCycle: data.billingCycle,
              reference,
              payer: payerInfoRaw ? JSON.parse(payerInfoRaw) : null,
            })
          );

          setTimeout(() => {
            window.location.href = "/pricing?register=true";
          }, 2000);
        }
      } catch (err) {
        // The card has already been charged by this point. Silently bouncing the
        // customer back to pricing reads as "my money is gone" and invites them
        // to pay a second time — which is exactly what happened. Keep them here,
        // show the reference, and tell them the truth: the payment is recorded
        // and their plan is waiting.
        console.error("Verify failed:", err);
        setFailureReason(
          err?.response?.data?.error || extractApiError(err) || err?.message || ""
        );
        setStatus("failed");
      }
    };

    verify();
  }, [reference]);

  const successBody = {
    dashboard: {
      text: `Your ${planName} plan is now active on your account.`,
      redirect: "Redirecting to your dashboard...",
    },
    login: {
      text: `Your ${planName} plan has been activated on your existing account.`,
      redirect: "Redirecting to login to access your upgraded dashboard...",
    },
    setup: {
      text: `Payment confirmed! Your ${planName} plan is ready. Let's set up your station.`,
      redirect: "Redirecting to station setup...",
    },
  }[redirectTarget] || {};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">

        {status === "verifying" && (
          <>
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Verifying Payment...
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Please wait while we confirm your payment
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Payment Successful! 🎉
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {successBody.text}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {successBody.redirect}
            </p>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              We could not confirm your payment yet
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              <strong>Your payment is safe.</strong> If your card was charged, the
              payment is recorded and your plan is waiting — this is only a problem
              confirming it right now. <strong>Please do not pay again.</strong>
            </p>

            {reference && (
              <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-3 mb-4 text-left">
                <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">
                  Your reference — quote this to support
                </p>
                <p className="font-mono text-xs break-all dark:text-gray-200">{reference}</p>
              </div>
            )}

            {failureReason && (
              <p className="text-xs text-gray-400 mb-4">Details: {failureReason}</p>
            )}

            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 mb-2"
            >
              Try again
            </button>
            <button
              onClick={() => { window.location.href = "/pricing"; }}
              className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300"
            >
              Continue registration
            </button>
            <p className="text-xs text-gray-400 mt-3">
              To finish later, return to Pricing and enter <strong>the same email
              address you paid with</strong> — we will recognise the payment and take
              you straight to setup without charging you again.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentVerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PaymentVerifyContent />
    </Suspense>
  );
}
