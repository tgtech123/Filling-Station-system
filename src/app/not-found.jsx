import Link from "next/link";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <p className="text-7xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400">
          404
        </p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Page not found
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
          Check the address, or head back to a familiar place.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 active:scale-95"
          >
            Go to dashboard
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto rounded-full border border-gray-200 dark:border-gray-700 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
