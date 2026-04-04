"use client";
import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import useSalesTargetStore from "@/store/useSalesTargetStore";
import { Target } from "lucide-react";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDaysRemaining(endDate) {
  if (!endDate) return null;
  const diff = new Date(endDate) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getProgressColor(pct) {
  if (pct >= 100) return "#7f27ff";
  if (pct > 70) return "#22c55e";
  if (pct >= 30) return "#f59e0b";
  return "#ef4444";
}

const STATUS_BADGE = {
  Active: "bg-green-100 text-green-700",
  Met: "bg-blue-100 text-blue-700",
  Exceeded: "bg-purple-100 text-purple-700",
  Expired: "bg-gray-100 text-gray-500",
};

const radius = 54;
const circumference = 2 * Math.PI * radius;

export default function SalesTargetCard() {
  const { target, loading } = useSalesTargetStore();
  const thumbRef = useRef(null);

  const rawPct = target
    ? target.targetAmount > 0
      ? (target.currentProgress / target.targetAmount) * 100
      : 0
    : 0;
  const progressPct = Math.min(rawPct, 100);

  // Confetti when target is met/exceeded
  useEffect(() => {
    if (progressPct >= 100 && thumbRef.current) {
      const rect = thumbRef.current.getBoundingClientRect();
      const x = rect.left / window.innerWidth;
      const y = rect.top / window.innerHeight;

      confetti({
        particleCount: 150,
        spread: 80,
        origin: { x, y },
        colors: ["#7f27ff", "#f59e0b", "#22c55e", "#ef4444", "#3b82f6", "#ec4899"],
        scalar: 1.2,
      });

      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 120,
          origin: { x, y },
          colors: ["#FFD700", "#FFA500", "#FF69B4", "#00CED1"],
          startVelocity: 45,
        });
      }, 500);

      setTimeout(() => {
        confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0, y: 0.6 } });
        confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1, y: 0.6 } });
      }, 1000);
    }
  }, [progressPct]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 mt-4">
        <div className="flex items-center gap-2 mb-4">
          <Target size={18} className="text-gray-400" />
          <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm">My Sales Target</span>
        </div>
        <div className="animate-pulse flex items-center gap-6">
          <div className="w-[140px] h-[140px] rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!target) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 mt-4">
        <div className="flex items-center gap-2 mb-3">
          <Target size={18} className="text-gray-400" />
          <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm">My Sales Target</span>
        </div>
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
          No active target set
        </p>
      </div>
    );
  }

  const {
    targetAmount = 0,
    currentProgress = 0,
    duration,
    status,
    startDate,
    endDate,
  } = target;

  const color = getProgressColor(rawPct);
  const strokeDashoffset = circumference - (progressPct / 100) * circumference;
  const daysLeft = getDaysRemaining(endDate);
  const isMet = status === "Met" || status === "Exceeded" || progressPct >= 100;

  // Thumb position on the arc
  const angle = (progressPct / 100) * 360 - 90;
  const thumbX = 70 + radius * Math.cos((angle * Math.PI) / 180);
  const thumbY = 70 + radius * Math.sin((angle * Math.PI) / 180);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 mt-4">
      <div className="flex items-center gap-6">

        {/* Circular progress ring */}
        <div className="flex-shrink-0">
          <svg width="140" height="140" viewBox="0 0 140 140">
            {/* Pulse animation style for met state */}
            {isMet && (
              <style>{`
                @keyframes thumbPulse {
                  0%, 100% { r: 8; }
                  50% { r: 11; }
                }
                .thumb-pulse { animation: thumbPulse 1.2s ease-in-out infinite; }
              `}</style>
            )}

            {/* Background ring */}
            <circle
              cx="70" cy="70" r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="12"
            />

            {/* Progress arc */}
            <circle
              cx="70" cy="70" r={radius}
              fill="none"
              stroke={color}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 70 70)"
              style={{ transition: "stroke-dashoffset 1s ease" }}
            />

            {/* Thumb indicator on arc */}
            {progressPct > 0 && (
              <circle
                ref={thumbRef}
                cx={thumbX}
                cy={thumbY}
                r="8"
                fill={color}
                stroke="white"
                strokeWidth="3"
                className={isMet ? "thumb-pulse" : ""}
              />
            )}

            {/* Center percentage */}
            <text
              x="70" y="65"
              textAnchor="middle"
              fontSize="22"
              fontWeight="bold"
              fill={color}
            >
              {rawPct.toFixed(0)}%
            </text>

            {/* Center label */}
            <text
              x="70" y="83"
              textAnchor="middle"
              fontSize="11"
              fill="#9ca3af"
            >
              achieved
            </text>
          </svg>
        </div>

        {/* Right side details */}
        <div className="flex-1 min-w-0">

          {/* Title + icon */}
          <div className="flex items-center gap-1.5 mb-2">
            <Target size={15} className="text-blue-500 flex-shrink-0" />
            <span className="font-semibold text-gray-800 dark:text-gray-100 text-sm">My Sales Target</span>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            {duration && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                {duration}
              </span>
            )}
            {status && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[status] || "bg-gray-100 text-gray-500"}`}>
                {status}
              </span>
            )}
          </div>

          {/* Target & Achieved amounts */}
          <div className="space-y-1 mb-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">Target</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                ₦{targetAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">Achieved</span>
              <span className="text-sm font-semibold" style={{ color }}>
                ₦{currentProgress.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-2 space-y-0.5">
            <div className="flex justify-between">
              <span>Started</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">{formatDate(startDate)}</span>
            </div>
            <div className="flex justify-between">
              <span>Ends</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">{formatDate(endDate)}</span>
            </div>
          </div>

          {/* Days remaining pill */}
          <div className="mt-2">
            {daysLeft === null ? null : daysLeft > 0 ? (
              <span className="inline-block text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
              </span>
            ) : (
              <span className="inline-block text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">
                Target period ended
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Celebration banner */}
      {isMet && (
        <div className="mt-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg p-3 text-white text-center font-semibold animate-bounce text-sm">
          🎉 Target Achieved! Outstanding work!
        </div>
      )}
    </div>
  );
}
