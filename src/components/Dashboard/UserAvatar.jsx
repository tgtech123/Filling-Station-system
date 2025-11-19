
"use client";
import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";
import { useImageStore } from "@/store/useImageStore";

export default function UserAvatar({ userId, username, userRole, currentImage }) {
  const { getUserImage } = useImageStore();

  const storedImage = getUserImage(userId);
  const imageUrl = currentImage || storedImage;

  // Debug logs
  console.log("🔍 UserAvatar Debug:", {
    userId,
    currentImage,
    storedImage,
    finalImageUrl: imageUrl
  });

  return (
    <div className="flex gap-2 items-center">
      {/* Avatar Image */}
      <div className="relative w-12 h-12 rounded-md overflow-hidden border-2 border-gray-300 bg-gray-100 flex items-center justify-center">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={username || "User avatar"}
            fill
            className="object-cover"
            sizes="48px"
            unoptimized={imageUrl.includes('cloudinary.com')}
          />
        ) : (
          <User size={24} className="text-gray-400" />
        )}
      </div>

      <div>
        <h4 className="text-black text-md font-semibold">{username}</h4>
        <p className="text-sm text-[#1a71f6] font-semibold">
          {userRole === "View Profile" ? (
            <Link
              className="text-[#1a71f6] font-semibold hover:underline"
              href="/dashboard/profile"
            >
              View Profile
            </Link>
          ) : (
            userRole
          )}
        </p>
      </div>
    </div>
  );
}