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

          if (!response.ok) {
            const errBody = await response.json().catch(() => ({}));
            throw new Error(errBody.error || errBody.details || `Upload failed (${response.status})`);
          }

          const data = await response.json();

          const transformedUrl = getCdnUrl(data.secure_url, {
            width: 400,
            height: 400,
          });

          set((state) => ({
            userImages: { ...state.userImages, [userId]: transformedUrl },
            loading: false,
          }));

          // Keep localStorage user object in sync so the current session
          // and any future login-response seeding both see the latest URL.
          try {
            const raw = localStorage.getItem("user");
            if (raw) {
              const u = JSON.parse(raw);
              u.image = transformedUrl;
              localStorage.setItem("user", JSON.stringify(u));
            }
          } catch {}

          // Persist to the account so the photo survives a new device, a new
          // browser, or clearing storage — and so the value the app reads back
          // at login is the one that was uploaded.
          //
          // This previously posted to /api/auth/profile/image, which was never
          // built: the call failed silently inside this catch and the image
          // only ever lived in localStorage. It now uses the self-service
          // profile endpoint, which accepts `image`.
          try {
            const token = localStorage.getItem("token");
            if (token) {
              const res = await fetch(`${process.env.NEXT_PUBLIC_API || ""}/api/auth/me`, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ image: transformedUrl }),
              });
              if (!res.ok) {
                console.error("Profile image did not save to the account:", res.status);
              }
            }
          } catch (err) {
            // Non-fatal for this session — the image is already on screen — but
            // log it, because silently swallowing this is what hid the missing
            // endpoint in the first place.
            console.error("Profile image sync failed:", err?.message);
          }

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