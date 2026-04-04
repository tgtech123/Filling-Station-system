"use client";
import { useEffect, useRef } from "react";

export function triggerConfetti() {
  if (typeof window === "undefined") return;
  import("canvas-confetti").then((module) => {
    const confetti = module.default;
    confetti({
      particleCount: 200,
      spread: 70,
      origin: { x: 0.5, y: 0.1 },
      colors: ["#FFD700", "#7f27ff", "#1a71f6", "#04910c", "#ff69b4"],
      startVelocity: 45,
      ticks: 200,
    });
    // Second burst for extra effect
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { x: 0.3, y: 0.2 },
        colors: ["#FFD700", "#7f27ff", "#1a71f6", "#04910c", "#ff69b4"],
      });
    }, 400);
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { x: 0.7, y: 0.2 },
        colors: ["#FFD700", "#7f27ff", "#1a71f6", "#04910c", "#ff69b4"],
      });
    }, 700);
  });
}

export default function ConfettiCelebration({ trigger }) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (trigger && !firedRef.current) {
      firedRef.current = true;
      triggerConfetti();
      // Stop after 3 seconds
      const t = setTimeout(() => { firedRef.current = false; }, 3000);
      return () => clearTimeout(t);
    }
  }, [trigger]);

  return null;
}