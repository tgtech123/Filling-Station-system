"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import ConfettiCelebration from "./ConfettiCelebration";
import useNotificationStore from "@/store/useNotificationStore";

export default function TargetCelebrationModal() {
  const [celebrationMsg, setCelebrationMsg] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const { messages, fetchMessages, markMessageRead } = useNotificationStore();

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    console.log("🎯 All messages:", messages);
    if (!messages?.length) return;
    const targetMsg = messages.find(
      (m) =>
        !m.read &&
        m.category === "system_update" &&
        m.title?.toLowerCase().includes("met your target")
    );
    console.log("🎯 Target notification found:", targetMsg);
    if (targetMsg) {
      setCelebrationMsg(targetMsg);
      setShowConfetti(true);
    }
  }, [messages]);

  function handleDismiss() {
    if (celebrationMsg) {
      const id = celebrationMsg._id || celebrationMsg.id;
      markMessageRead(id);
    }
    setCelebrationMsg(null);
    setShowConfetti(false);
  }

  if (!celebrationMsg) return null;

  return (
    <>
      <ConfettiCelebration trigger={showConfetti} />
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
          {/* Gradient top bar */}
          <div className="h-2 bg-gradient-to-r from-purple-500 via-blue-500 to-green-500" />

          <div className="p-6 text-center">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Congratulations!</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              {celebrationMsg.body || celebrationMsg.message || celebrationMsg.description || "You met your sales target!"}
            </p>
            <button
              onClick={handleDismiss}
              className="cursor-pointer w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Thanks! 🙌
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
