"use client";
import Avatar from "@/components/Avatar";
import Link from "next/link";

export default function UserAvatar({ userId, username, userRole, currentImage }) {
  return (
    <div className="flex gap-2 items-center">
      <Avatar userId={userId} currentImage={currentImage} size="md" />
      <div>
        <h4 className="text-black dark:text-white text-md font-semibold">{username}</h4>
        <p className="text-sm text-[#1a71f6] font-semibold">
          {userRole === "View Profile" ? (
            <Link className="text-[#1a71f6] font-semibold hover:underline" href="/dashboard/profile">
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