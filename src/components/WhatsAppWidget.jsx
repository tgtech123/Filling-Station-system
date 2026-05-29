"use client";
import { useState, useEffect, useRef } from "react";
import { X, GripVertical } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import usePlatformStore from "@/store/usePlatformStore";

const WIDGET_W = 56; // button diameter in px (3.5rem)
const PAD = 16;      // min distance from viewport edges

export default function WhatsAppWidget() {
  const { settings, fetchPublicSettings } = usePlatformStore();
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [bubbleDismissed, setBubbleDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pos, setPos] = useState({ bottom: 24, right: 20 });

  const posRef = useRef({ bottom: 24, right: 20 });
  const dragData = useRef(null);
  const lastTouch = useRef(0);

  useEffect(() => {
    fetchPublicSettings();
    setMounted(true);

    try {
      const saved = localStorage.getItem("wa_widget_pos");
      if (saved) {
        const p = JSON.parse(saved);
        setPos(p);
        posRef.current = p;
      }
    } catch {}

    const alreadyDismissed = sessionStorage.getItem("wa_bubble_dismissed");
    if (!alreadyDismissed) {
      const t = setTimeout(() => setBubbleVisible(true), 3000);
      return () => clearTimeout(t);
    }
  }, []);

  const phone = settings?.supportWhatsApp?.replace(/\D/g, "");
  if (!mounted || !phone) return null;

  const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
    "Hello! I need support."
  )}`;

  const openChat = () => {
    setBubbleVisible(false);
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const dismissBubble = (e) => {
    e.stopPropagation();
    setBubbleVisible(false);
    setBubbleDismissed(true);
    sessionStorage.setItem("wa_bubble_dismissed", "1");
  };

  const startDrag = (e) => {
    const isTouch = e.type === "touchstart";

    // Suppress synthetic mouse events that follow a touch tap
    if (isTouch) lastTouch.current = Date.now();
    if (!isTouch && Date.now() - lastTouch.current < 600) return;

    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    dragData.current = {
      startX: clientX,
      startY: clientY,
      startRight: posRef.current.right,
      startBottom: posRef.current.bottom,
      moved: false,
    };

    const onMove = (ev) => {
      if (!dragData.current) return;
      const cx = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const cy = ev.touches ? ev.touches[0].clientY : ev.clientY;
      const dx = cx - dragData.current.startX;
      const dy = cy - dragData.current.startY;

      if (!dragData.current.moved && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
        dragData.current.moved = true;
        setIsDragging(true);
      }
      if (!dragData.current.moved) return;

      ev.preventDefault();

      const newRight = Math.max(
        PAD,
        Math.min(window.innerWidth - WIDGET_W - PAD, dragData.current.startRight - dx)
      );
      const newBottom = Math.max(
        PAD,
        Math.min(window.innerHeight - WIDGET_W - PAD, dragData.current.startBottom + dy)
      );

      const newPos = { right: newRight, bottom: newBottom };
      posRef.current = newPos;
      setPos(newPos);
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);

      if (!dragData.current?.moved) {
        openChat();
      } else {
        try {
          localStorage.setItem("wa_widget_pos", JSON.stringify(posRef.current));
        } catch {}
      }

      dragData.current = null;
      setIsDragging(false);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
  };

  const showBubble = bubbleVisible && !bubbleDismissed;

  return (
    <div
      className="fixed z-50 flex flex-col items-end gap-3 select-none"
      style={{ bottom: pos.bottom, right: pos.right }}
    >
      {/* ── Greeting bubble ─────────────────────────────────── */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-[17rem] overflow-visible transition-all duration-300 ${
          showBubble
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-3 pointer-events-none"
        }`}
      >
        {/* Bubble tail */}
        <div className="absolute -bottom-[7px] right-[22px] w-3.5 h-3.5 bg-white border-r border-b border-gray-100 rotate-45" />

        <div className="p-4">
          {/* Dismiss */}
          <button
            onClick={dismissBubble}
            className="absolute top-2.5 right-2.5 w-5 h-5 flex items-center justify-center rounded-full text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Dismiss"
          >
            <X size={11} />
          </button>

          {/* Header row */}
          <div className="flex items-center gap-3 pr-4">
            <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center shrink-0 shadow-md">
              <FaWhatsapp size={22} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 leading-none">
                Support Team
              </p>
              <span className="inline-flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                <span className="text-[10px] text-gray-400 font-medium">Online now</span>
              </span>
            </div>
          </div>

          {/* Message */}
          <div className="mt-3 bg-gray-50 rounded-xl rounded-tl-none px-3 py-2.5">
            <p className="text-xs text-gray-600 leading-relaxed">
              👋 Hi there! Need help? Chat with us on WhatsApp — we typically reply within minutes.
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={openChat}
            className="mt-3 w-full bg-[#25D366] hover:bg-[#1ebe5d] active:bg-[#17a351] text-white text-sm font-semibold py-2.5 rounded-xl transition-colors shadow-sm"
          >
            Start Chat
          </button>
        </div>
      </div>

      {/* ── Main floating button ─────────────────────────────── */}
      <button
        onMouseDown={startDrag}
        onTouchStart={startDrag}
        aria-label="Chat with us on WhatsApp"
        className={`relative w-[3.5rem] h-[3.5rem] rounded-full bg-[#25D366] shadow-lg text-white flex items-center justify-center transition-all duration-200 group ${
          isDragging
            ? "cursor-grabbing scale-95 shadow-2xl bg-[#1ebe5d]"
            : "cursor-grab hover:bg-[#1ebe5d] hover:shadow-xl hover:scale-110"
        }`}
      >
        {/* Pulse ring — only when idle */}
        {!showBubble && !isDragging && (
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
        )}

        <FaWhatsapp size={26} />

        {/* Drag-handle hint */}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm opacity-70">
          <GripVertical size={9} className="text-gray-400" />
        </span>

        {/* Tooltip — only when idle and bubble hidden */}
        {!showBubble && !isDragging && (
          <span className="absolute right-full mr-3 whitespace-nowrap bg-gray-900/90 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg">
            Chat on WhatsApp
            <span className="absolute top-1/2 -right-[5px] -translate-y-1/2 border-4 border-transparent border-l-gray-900/90" />
          </span>
        )}
      </button>
    </div>
  );
}