"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

// App-wide error boundary: catches render/runtime errors thrown anywhere under
// the app (including dashboard pages) and shows a themed, recoverable screen
// instead of a blank crash. Root-layout errors fall through to global-error.jsx.
export default function Error({ error, reset }) {
  useEffect(() => {
    // Surface for logging/monitoring without leaking details to the user.
    console.error("App error boundary:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-900/30">
          <AlertTriangle className="h-7 w-7 text-red-500 dark:text-red-400" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          An unexpected error occurred while loading this page. You can try again,
          or return to your dashboard.
        </p>
        {error?.digest && (
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            Reference: {error.digest}
          </p>
        )}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 active:scale-95"
          >
            <RotateCcw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto rounded-full border border-gray-200 dark:border-gray-700 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
