import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getCdnUrl } from "@/utils/imageUtils";

const useImageStore = create(
  persist(
    (set, get) => ({
      userImages: {},
      loading: false,
      error: null,

      uploadImage: async (file, userId) => {
        try {
          set({ loading: true, error: null });

          const formData = new FormData();
          formData.append("file", file);
          formData.append("userId", userId);

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) throw new Error("Upload failed");

          const data = await response.json();

          const transformedUrl = getCdnUrl(data.secure_url, {
            width: 400,
            height: 400,
          });

          set((state) => ({
            userImages: { ...state.userImages, [userId]: transformedUrl },
            loading: false,
          }));

          return { url: transformedUrl, publicId: data.public_id };
        } catch (err) {
          set({ loading: false, error: err.message });
          throw err;
        }
      },

      getImage: (userId) => {
        const url = get().userImages[userId];
        return url ? getCdnUrl(url) : null;
      },

      setImage: (userId, url) => {
        set((state) => ({
          userImages: { ...state.userImages, [userId]: getCdnUrl(url) },
        }));
      },

      clearImage: (userId) => {
        set((state) => {
          const copy = { ...state.userImages };
          delete copy[userId];
          return { userImages: copy };
        });
      },

      deleteImage: async (publicId) => {
        try {
          await fetch("/api/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ public_id: publicId }),
          });
        } catch (err) {
          console.error("Delete failed:", err);
        }
      },

      // Legacy compat — used by old components still in codebase
      getUserImage: (userId) => get().userImages[userId] || null,
      setUserImage: (userId, url) => {
        set((state) => ({
          userImages: { ...state.userImages, [userId]: url },
        }));
      },
      clearUserImage: (userId) => {
        set((state) => {
          const copy = { ...state.userImages };
          delete copy[userId];
          return { userImages: copy };
        });
      },
      uploadUserImage: async (userId, file) => {
        try {
          const result = await get().uploadImage(file, userId);
          return { success: true, imageUrl: result.url };
        } catch (err) {
          return { success: false, error: err.message };
        }
      },
    }),
    {
      name: "user-images-storage",
      partialize: (state) => ({ userImages: state.userImages }),
    }
  )
);

export { useImageStore };
export default useImageStore;