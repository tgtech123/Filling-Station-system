import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useImageStore = create(
  persist(
    (set, get) => ({
      userImages: {}, // store images by user ID
      uploading: {}, // track upload status per user
      errors: {}, // track errors per user

      // Set user image directly
      setUserImage: (userId, imageUrl) =>
        set((state) => ({
          userImages: {
            ...state.userImages,
            [userId]: imageUrl,
          },
        })),

      // Get user image
      getUserImage: (userId) => get().userImages[userId],

      // Clear user image
      clearUserImage: (userId) =>
        set((state) => {
          const updated = { ...state.userImages };
          delete updated[userId];
          return { userImages: updated };
        }),

      // Upload image to Cloudinary and store it
      uploadUserImage: async (userId, file) => {
        // Validate file
        if (!file) {
          set((state) => ({
            errors: { ...state.errors, [userId]: "No file selected" },
          }));
          return { success: false, error: "No file selected" };
        }

        // Set uploading state
        set((state) => ({
          uploading: { ...state.uploading, [userId]: true },
          errors: { ...state.errors, [userId]: null },
        }));

        try {
          // Create FormData
          const formData = new FormData();
          formData.append("file", file);
          formData.append("userId", userId); // Pass userId to backend

          console.log("📤 Uploading image for user:", userId);
          console.log("📦 File size:", file.size, "bytes");
          console.log("📦 File type:", file.type);

          // Upload to your Next.js API route
          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          console.log("📡 Response status:", response.status);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || errorData.details || `Upload failed with status ${response.status}`);
          }

          const data = await response.json();
          console.log("✅ Upload response:", data);

          if (!data.secure_url) {
            throw new Error("No secure_url in response");
          }

          const imageUrl = data.secure_url;

          // Store the image URL in Zustand
          set((state) => ({
            userImages: { ...state.userImages, [userId]: imageUrl },
            uploading: { ...state.uploading, [userId]: false },
          }));

          console.log("✅ Image stored in Zustand for user:", userId);
          return { success: true, imageUrl };
        } catch (error) {
          const errorMsg = error.message || "Upload failed";

          set((state) => ({
            uploading: { ...state.uploading, [userId]: false },
            errors: { ...state.errors, [userId]: errorMsg },
          }));

          console.error(`❌ Upload failed for user ${userId}:`, errorMsg);
          return { success: false, error: errorMsg };
        }
      },
    }),
    {
      name: "user-images-storage", // LocalStorage key
      partialize: (state) => ({ userImages: state.userImages }), // Only persist images
    }
  )
);