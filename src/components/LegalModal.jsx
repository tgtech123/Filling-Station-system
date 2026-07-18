"use client";
import { useEffect } from "react";
import { X, FileText, ShieldCheck } from "lucide-react";
import useTermsStore from "@/store/useTermsStore";

/**
 * Shared Terms of Service / Privacy Policy modal.
 *
 * Usage:
 *   const [legalDoc, setLegalDoc] = useState(null); // "terms" | "privacy" | null
 *   <LegalModal type={legalDoc} onClose={() => setLegalDoc(null)} />
 *
 * Content is admin-managed (Platform Settings → Legal) and fetched from the
 * public settings endpoint on first open.
 */
export default function LegalModal({ type, onClose }) {
  const { termsText, privacyText, loading, fetchTerms } = useTermsStore();

  const isOpen = type === "terms" || type === "privacy";

  useEffect(() => {
    if (!isOpen) return;
    // Fetch once — both documents come back from the same endpoint
    if (!termsText && !privacyText) fetchTerms();

    const onKeyDown = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const isTerms = type === "terms";
  const title = isTerms ? "Terms of Service" : "Privacy Policy";
  const Icon = isTerms ? FileText : ShieldCheck;
  const text = isTerms ? termsText : privacyText;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="bg-white dark:bg-gray-800 w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
              <Icon size={18} className="text-blue-600 dark:text-blue-400" />
            </span>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 sm:px-6 py-4 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col gap-3 py-4 animate-pulse">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-11/12" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            </div>
          ) : (
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {text}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
