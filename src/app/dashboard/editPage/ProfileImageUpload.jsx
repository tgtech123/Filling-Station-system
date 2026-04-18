"use client";
import Avatar from "@/components/Avatar";
import ImageUploadButton from "@/components/ImageUploadButton";

export default function ProfileImageUpload({
  userId,
  currentImage,
  onUploadComplete,
  size = "lg",
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <Avatar userId={userId} currentImage={currentImage} size={size} />
      <ImageUploadButton
        userId={userId}
        currentImage={currentImage}
        onUploadComplete={onUploadComplete}
        label="Change Photo"
      />
    </div>
  );
}