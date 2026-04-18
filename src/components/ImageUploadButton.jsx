"use client";
import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import useImageStore from "@/store/useImageStore";
import toast from "react-hot-toast";

export default function ImageUploadButton({
  userId,
  currentImage,
  onUploadComplete,
  label = "Upload Image",
  accept = "image/*",
  maxSizeMB = 5,
}) {
  const fileRef = useRef(null);
  const { uploadImage, loading } = useImageStore();
  const [preview, setPreview] = useState(currentImage || null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File must be less than ${maxSizeMB}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result);
    reader.readAsDataURL(file);

    try {
      const result = await uploadImage(file, userId);
      toast.success("Image uploaded!");
      onUploadComplete?.(result.url);
    } catch {
      toast.error("Upload failed");
      setPreview(currentImage || null);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden bg-gray-50 dark:bg-gray-700/50">
        {preview ? (
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <Upload size={20} />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={loading}
          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload size={16} />
              {label}
            </>
          )}
        </button>

        {preview && (
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              if (fileRef.current) fileRef.current.value = "";
            }}
            className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}