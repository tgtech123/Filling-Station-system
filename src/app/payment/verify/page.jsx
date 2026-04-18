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
  const [isExistingUser, setIsExistingUser] = useState(false);

  useEffect(() => {
    if (!reference) {
      router.push("/dashboard/manager");
      return;
    }

    const verify = async () => {
      try {
        const result = await verifyPayment(reference);
        setPlanName(result.data?.planName || "");

        // Check if user is already logged in as manager (upgrading plan)
        let existing = false;
        try {
          const token = localStorage.getItem("token");
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          existing = !!(token && user.role === "manager");
        } catch {}
        setIsExistingUser(existing);

        // Clear stale auth data for new users to prevent middleware conflicts
        if (!existing) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }

        sessionStorage.removeItem("selectedPlan");
        setStatus("success");

        if (existing) {
          // Existing manager upgrading — go to dashboard
          setTimeout(() => {
            router.push("/dashboard/manager");
          }, 3000);
        } else {
          // New user — store verification and redirect to registration
          const payerInfoRaw = sessionStorage.getItem("payerInfo");
          const paymentData = {
            verified: true,
            plan: result.data?.planName,
            reference: reference,
            payer: payerInfoRaw ? JSON.parse(payerInfoRaw) : null,
          };
          sessionStorage.setItem(
            "paymentVerified",
            JSON.stringify(paymentData)
          );
          setTimeout(() => {
            router.push("/pricing?register=true");
          }, 2000);
        }
      } catch (err) {
        console.error("Verify failed:", err);
        setStatus("failed");
        setTimeout(() => {
          router.push("/dashboard/manager");
        }, 3000);
      }
    };

    verify();
  }, [reference]);

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
              {isExistingUser
                ? `Welcome to ${planName}! Your plan is now active.`
                : "Payment confirmed! Now let's set up your station account."}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {isExistingUser
                ? "Redirecting to dashboard..."
                : "Redirecting to registration..."}
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
              Redirecting to dashboard...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
