"use client";
import useImageStore from "@/store/useImageStore";
import { getImageUrl } from "@/utils/imageUtils";
import { User } from "lucide-react";

const sizeMap = {
  sm: { cls: "w-8 h-8", icon: 16 },
  md: { cls: "w-12 h-12", icon: 20 },
  lg: { cls: "w-16 h-16", icon: 28 },
  xl: { cls: "w-24 h-24", icon: 40 },
};

export default function Avatar({ userId, currentImage, size = "md", className = "" }) {
  const { getImage } = useImageStore();

  const storedUrl = userId ? getImage(userId) : null;
  const imageUrl = getImageUrl(storedUrl || currentImage);
  const { cls, icon } = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`${cls} rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0 ${className}`}
    >
      {imageUrl ? (
        <img src={imageUrl} alt="Avatar" className="w-full h-full object-cover" />
      ) : (
        <User size={icon} className="text-gray-400" />
      )}
    </div>
  );
}