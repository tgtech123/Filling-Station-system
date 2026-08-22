"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LogOut, X } from "lucide-react";

/**
 * LogoutConfirmModal
 * Renders a centered overlay asking the user to confirm logout.
 *
 * Props:
 *   isOpen    - controls visibility
 *   onCancel  - called when user dismisses
 *   onConfirm - called when user confirms; caller performs the actual logout
 */
export default function LogoutConfirmModal({ isOpen, onCancel, onConfirm }) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onCancel]);

  /**
   * Rendered into document.body, not where it sits in the tree.
   *
   * This modal lives inside the Sidebar, whose root carries Tailwind's
   * `transform` class for its collapse animation. A transformed element becomes
   * the containing block for any `position: fixed` descendant, so `inset-0`
   * resolved to the SIDEBAR rather than the viewport and the dialog appeared
   * pinned to the left edge instead of the middle of the screen.
   *
   * No amount of centring CSS fixes that from inside; the overlay has to leave
   * the transformed subtree. A portal is the way out, and it also puts the
   * dialog above every other stacking context rather than trusting z-index.
   */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">

        {/* Close button */}
        <div className="flex justify-end p-3 pb-0">
          <button
            onClick={onCancel}
            className="cursor-pointer p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 pt-2 flex flex-col items-center text-center">
          {/* Icon */}
          <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
            <LogOut size={26} className="text-red-500" />
          </div>

          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            Logging out?
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
            Are you sure you want to logout?<br />
            You will be redirected to the login page.
          </p>

          {/* Actions */}
          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              className="cursor-pointer flex-1 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="cursor-pointer flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-sm font-semibold text-white transition-colors"
            >
              Yes, Logout
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
