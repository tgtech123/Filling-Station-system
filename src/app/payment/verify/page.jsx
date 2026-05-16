"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import usePaymentStore from "@/store/usePaymentStore";

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

        if (authenticatedUpgrade || (alreadyLoggedIn && !isGuestPayment)) {
          // Logged-in manager upgraded — hard reload so all stores re-fetch with new plan data
          setRedirectTarget("dashboard");
          setTimeout(() => { window.location.href = "/dashboard/manager"; }, 3000);

        } else if (existingAccount && !isConfirmedNewUser) {
          // Guest email matched an existing account AND we have no local proof this was a
          // fresh registration (payerInfo absent — e.g. existing manager who somehow reached
          // the verify page without going through our guest checkout UI).
          // Plan is already upgraded on the backend; send them to login to access it.
          if (alreadyLoggedIn) {
            setRedirectTarget("dashboard");
            setTimeout(() => { window.location.href = "/dashboard/manager"; }, 3000);
          } else {
            setRedirectTarget("login");
            setTimeout(() => {
              window.location.href = `/login?upgraded=true&plan=${encodeURIComponent(data.planName || "")}`;
            }, 3000);
          }

        } else {
          // Brand-new user — either:
          //   a) Backend confirmed isExistingUser: false, OR
          //   b) payerInfo in sessionStorage overrides an incorrect isExistingUser: true
          //      (can happen when a partial/stale backend record exists for the email)
          setRedirectTarget("setup");
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          // Preserve the selectedPlan written when the user clicked the plan card (it has
          // the correct price). Only fall back to payment response data if it's missing.
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

          // Hard navigation so the pricing page mounts fresh and its searchParams
          // useEffect reliably picks up ?register=true on first render.
          setTimeout(() => {
            window.location.href = "/pricing?register=true";
          }, 2000);
        }
      } catch (err) {
        console.error("Verify failed:", err);
        setStatus("failed");
        setTimeout(() => router.push("/pricing"), 3000);
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
              Payment Failed
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Something went wrong. You can try again from your dashboard.
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Redirecting to pricing page...
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
