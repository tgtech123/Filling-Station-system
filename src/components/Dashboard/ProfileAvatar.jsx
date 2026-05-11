"use client";
import { useState, useRef, useEffect } from "react";
import { Camera, LogOut, User, Loader2 } from "lucide-react";
import { useImageStore } from "@/store/useImageStore";

function getInitials(name) {
  if (!name || typeof name !== "string") return "?";
  return name.trim().split(/\s+/).map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

const sizeMap = {
  sm: { wrap: "w-9 h-9",   text: "text-xs",   cam: 8,  badge: "w-3.5 h-3.5" },
  md: { wrap: "w-11 h-11", text: "text-sm",   cam: 10, badge: "w-4 h-4"     },
  lg: { wrap: "w-16 h-16", text: "text-base", cam: 14, badge: "w-5 h-5"     },
};

export default function ProfileAvatar({
  userId,
  username,
  size = "md",
  onProfileClick,
  profileLabel = "View Profile",
  onLogout,
}) {
  const [errored, setErrored] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const fileRef = useRef(null);
  const { getImage, uploadImage } = useImageStore();

  const storedUrl = userId ? getImage(userId) : null;
  const showImage = !!(storedUrl && !errored);
  const initials = getInitials(username);
  const sz = sizeMap[size] || sizeMap.md;

  useEffect(() => {
    if (!open) return;
    function onOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setUploading(true);
    setOpen(false);
    try {
      await uploadImage(file, userId);
      setErrored(false);
    } catch (err) {
      console.error("Profile photo upload failed:", err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="relative" ref={wrapRef}>
      {/* Avatar circle — click opens dropdown */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative group focus:outline-none cursor-pointer"
        aria-label="Profile options"
      >
        <div
          className={`${sz.wrap} rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-transparent group-hover:ring-blue-400 transition-all duration-200`}
        >
          {uploading ? (
            <Loader2 size={sz.cam + 4} className="text-white animate-spin" />
          ) : showImage ? (
            <img
              src={storedUrl}
              alt={username || "Profile"}
              className="w-full h-full object-cover"
              onError={() => setErrored(true)}
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className={`text-white font-bold select-none ${sz.text}`}>{initials}</span>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
            <Camera size={sz.cam} className="text-white" />
          </div>
        </div>

        {/* Camera badge when no photo — indicates upload available */}
        {!showImage && !uploading && (
          <div
            className={`absolute -bottom-0.5 -right-0.5 ${sz.badge} bg-blue-600 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900`}
          >
            <Camera size={sz.cam - 4} className="text-white" />
          </div>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-[200]">
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <Camera size={15} className="text-blue-500 flex-shrink-0" />
            {showImage ? "Change Photo" : "Upload Photo"}
          </button>

          {onProfileClick && (
            <button
              onClick={() => { onProfileClick(); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left border-t border-gray-100 dark:border-gray-700"
            >
              <User size={15} className="text-blue-500 flex-shrink-0" />
              {profileLabel}
            </button>
          )}

          {onLogout && (
            <button
              onClick={() => { onLogout(); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left border-t border-gray-100 dark:border-gray-700"
            >
              <LogOut size={15} className="flex-shrink-0" />
              Logout
            </button>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
