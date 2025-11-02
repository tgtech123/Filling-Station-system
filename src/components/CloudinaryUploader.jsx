
"use client"
import React, { useState } from "react";
import Image from "next/image";

export default function CloudinaryUploader({ onUpload }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.secure_url) {
        setPreview(data.secure_url);
        if (onUpload) onUpload(data.secure_url); // callback with the image URL
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 border-2 border-dashed border-gray-300 p-6 rounded-2xl hover:border-indigo-500 transition">
      <label className="cursor-pointer">
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
        <span className="text-indigo-600 font-medium hover:underline">
          {loading ? "Uploading..." : "Click to Upload Image"}
        </span>
      </label>

      {preview && (
        <div className="w-48 h-48 relative rounded-lg overflow-hidden border border-gray-200">
          <Image
            src={preview}
            alt="Uploaded preview"
            fill
            className="object-cover"
          />
        </div>
      )}
    </div>
  );
}
