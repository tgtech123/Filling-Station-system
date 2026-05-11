"use client";
import Avatar from "@/components/Avatar";
import Link from "next/link";

export default function UserAvatar({
  userId,
  username,
  userRole,
  currentImage,
  onProfileClick,
  compact = false,
}) {
  return (
    <div className="flex gap-2 items-center">
      <Avatar userId={userId} username={username} currentImage={currentImage} size="md" />

      {!compact && (
        <div className="min-w-0">
          <h4 className="text-black dark:text-white text-sm font-semibold truncate max-w-[120px]">
            {username}
          </h4>
          <p className="text-sm text-[#1a71f6] font-semibold">
            {onProfileClick ? (
              <button
                onClick={onProfileClick}
                className="text-[#1a71f6] font-semibold hover:underline text-left"
              >
                Manager Profile
              </button>
            ) : userRole === "View Profile" ? (
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
      )}
    </div>
  );
}
