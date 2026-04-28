"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import usePaymentStore from "@/store/usePaymentStore";

export default function PaymentVerifyPage() {
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

        // Backend tells us definitively:
        // - isGuest: true + isExistingUser: false  → new user, email has no station yet
        // - isGuest: true + isExistingUser: true   → existing manager paid as guest, plan upgraded
        // - isGuest: false / undefined             → authenticated user upgrading from dashboard
        // Safety net: guest references always start with "FS_GUEST_" — use this as a fallback
        // in case the backend's early-exit path omits the isGuest field.
        const isGuestRef = reference?.startsWith("FS_GUEST_");
        const isGuestPayment = data.isGuest === true || isGuestRef === true;
        const existingAccount = data.isExistingUser === true;
        const authenticatedUpgrade = !isGuestPayment;

        setStatus("success");

        if (authenticatedUpgrade) {
          // Logged-in manager upgraded — hard reload so all stores re-fetch with new plan data
          setRedirectTarget("dashboard");
          setTimeout(() => { window.location.href = "/dashboard/manager"; }, 3000);
        } else if (existingAccount) {
          // Guest email matched an existing account — plan already upgraded.
          // If they were already logged in (upgrading from dashboard), go straight to dashboard.
          // If they weren't logged in (typed an existing email on pricing page), send to login.
          const alreadyLoggedIn = !!localStorage.getItem("token");
          if (alreadyLoggedIn) {
            setRedirectTarget("dashboard");
            setTimeout(() => { window.location.href = "/dashboard/manager"; }, 3000);
          } else {
            setRedirectTarget("login");
            setTimeout(() => {
              router.push(
                `/login?upgraded=true&plan=${encodeURIComponent(data.planName || "")}`
              );
            }, 3000);
          }
        } else {
          // Brand new user — store verification data and open the create-station modal
          setRedirectTarget("setup");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          const payerInfoRaw = sessionStorage.getItem("payerInfo");
          // Preserve the selectedPlan that was written when the user clicked the plan card
          // (it has the correct price). Only fall back to payment response data if it's missing.
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
          // Keep "paymentVerified" so RegisterManagerModal reads the reference in createManager()
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
          setTimeout(() => router.push("/pricing?register=true"), 2000);
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
      text: `Your ${planName} plan is now active on your account.`,
      redirect: "Redirecting to login to access your upgraded dashboard...",
    },
    setup: {
      text: "Payment confirmed! Now let's set up your station account.",
      redirect: "Redirecting to account setup...",
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
