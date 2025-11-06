"use client";
import React, { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Loader2, X, User } from "lucide-react";
import { useImageStore } from "@/store/useImageStore";

export default function ProfileImageUpload({ userId, currentImage, size = "large" }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const {
    uploadUserImage,
    clearUserImage,
    uploading,
    errors,
    getUserImage,
  } = useImageStore();

  const storedImage = getUserImage(userId);
  const isUploading = uploading[userId] || false;
  const error = errors[userId];

  // Use stored image, or current image, or default
  const displayImage = preview || storedImage || currentImage || "/default-avatar.png";

  // Size configurations
  const sizeClasses = {
    small: "w-16 h-16",
    medium: "w-24 h-24",
    large: "w-16 h-16",
    xlarge: "w-16 h-16",
  };

  const sizeClass = sizeClasses[size] || sizeClasses.large;

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary via backend
    const result = await uploadUserImage(userId, file);

    // Check if result is the imageUrl string or an error object
    if (result && !result.error) {
      console.log("✅ Image uploaded successfully:", result);
      setPreview(null);
    } else {
      const errorMessage = result?.error || "Upload failed";
      console.error("❌ Upload failed:", errorMessage);
      alert(`Upload failed: ${errorMessage}`);
      setPreview(null);
    }
  };

  const handleRemove = () => {
    if (confirm("Remove profile picture?")) {
      clearUserImage(userId);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Image Container */}
      <div className="relative group">
        <div className={`${sizeClass} rounded-full overflow-hidden border-2 border-gray-300 relative bg-gray-100 flex items-center justify-center`}>
          {displayImage && displayImage !== "/default-avatar.png" ? (
            <Image
              src={displayImage}
              alt="Profile"
              fill
              className="object-cover"
              sizes={size === "xlarge" ? "160px" : size === "large" ? "128px" : size === "medium" ? "96px" : "64px"}
            />
          ) : (
            <User size={size === "xlarge" ? 64 : size === "large" ? 48 : 32} className="text-gray-400" />
          )}

          {/* Loading Overlay */}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="animate-spin text-white" size={3} />
            </div>
          )}

          {/* Hover Overlay */}
          {!isUploading && (
            <div
              onClick={triggerFileInput}
              className=" absolute rounded-full bg-none bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center cursor-pointer"
            >
              <Camera className="text-black opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
            </div>
          )}
        </div>

        {/* Remove Button */}
        {storedImage && !isUploading && (
          <button
            onClick={handleRemove}
            className=" absolute -bottom-2 -left-4 flex items-center rounded-full border-[2px] bg-red-600 text-white p-1.5 hover:bg-red-600 hover:text-white shadow-sm"
            title="Remove image"
          >
            <X size={16} />
          
          </button>
        )}
      </div>

      {/* Upload Button */}
      {/* <button
        onClick={triggerFileInput}
        disabled={isUploading}
        className="px-2 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isUploading ? (
          <>
            <Loader2 className="animate-spin" size={16} />
            Uploading...
          </>
        ) : (
          <>
            <Camera size={16} />
            Change Photo
          </>
        )}
      </button> */}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}
    </div>
  );
}