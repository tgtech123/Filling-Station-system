"use client";
import { useState, useEffect } from "react";
import useImageStore from "@/store/useImageStore";
import { getImageUrl } from "@/utils/imageUtils";

const sizeMap = {
  sm: { cls: "w-8 h-8",   text: "text-xs"  },
  md: { cls: "w-12 h-12", text: "text-sm"  },
  lg: { cls: "w-16 h-16", text: "text-base"},
  xl: { cls: "w-24 h-24", text: "text-xl"  },
};

function getInitials(name) {
  if (!name || typeof name !== "string") return "?";
  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Avatar({ userId, username, currentImage, size = "md", className = "" }) {
  const [errored, setErrored] = useState(false);

  // Targeted selector — re-renders only when this user's image changes
  const storedUrl = useImageStore((s) => (userId ? (s.userImages[userId] ?? null) : null));

  // Reset error flag when a new URL arrives after upload
  useEffect(() => { if (storedUrl) setErrored(false); }, [storedUrl]);

  const imageUrl = getImageUrl(storedUrl || currentImage);
  const showImage = imageUrl && !errored;
  const { cls, text } = sizeMap[size] || sizeMap.md;
  const initials = getInitials(username);

  return (
    <div
      className={`${cls} rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center overflow-hidden flex-shrink-0 ${className}`}
    >
      {showImage ? (
        <img
          src={imageUrl}
          alt={username || "Avatar"}
          className="w-full h-full object-cover"
          onError={() => setErrored(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className={`text-white font-bold select-none ${text}`}>{initials}</span>
      )}
    </div>
  );
}
