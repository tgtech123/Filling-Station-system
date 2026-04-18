"use client";
import { useRouter } from "next/navigation";
import { Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UpgradePrompt({ role, limit, onClose }) {
  const router = useRouter();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center"
        >
          <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown size={24} className="text-amber-600" />
          </div>

          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Plan Limit Reached
          </h3>

          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            You&apos;ve reached the maximum of{" "}
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {limit} {role}(s)
            </span>{" "}
            on your current plan. Upgrade to add more.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                onClose();
                router.push("/pricing");
              }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Crown size={16} />
              Upgrade Plan
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              Maybe Later
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
