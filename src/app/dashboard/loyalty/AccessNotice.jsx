"use client";
import { Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";

/**
 * Shown instead of a loyalty screen the signed-in role may not open.
 *
 * The server refuses these endpoints anyway (fuelLoyalty.route.ts), so without
 * this the user force-navigating to the URL gets the full screen shell, an
 * empty list and a 403 in the console — which reads as the app being broken
 * rather than the permission being deliberate. Says plainly who the screen is
 * for, and offers the way back.
 */
export default function AccessNotice({
  title   = "You don't have access to this screen",
  message = "Ask your manager if you need it.",
  backHref = "/dashboard/loyalty",
  backLabel = "Back to Loyalty",
}) {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Lock className="w-5 h-5 text-gray-400" />
      </div>
      <p className="font-bold text-gray-700">{title}</p>
      <p className="text-sm text-gray-400 mt-1">{message}</p>
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <ArrowLeft size={16} /> {backLabel}
      </Link>
    </div>
  );
}
