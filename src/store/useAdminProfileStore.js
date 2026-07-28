import { create } from "zustand";
import useImageStore from "./useImageStore";

const useAdminProfileStore = create((set) => ({
  adminName: "",
  adminImage: "",
  adminRole: "",

  initProfile: () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      set({
        adminName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Admin",
        adminImage: user.image || "",
        adminRole: user.role || "Admin",
      });

      // Seed the image cache from the account.
      //
      // On a new device or after clearing storage the server has the photo but
      // the local cache is empty — the header reads the account value and the
      // profile modal reads the cache, so without this they disagree and the
      // modal falls back to initials. Only fills a gap; never overwrites a
      // freshly uploaded image that has not synced yet.
      const id = String(user.id || user._id || "");
      if (id && user.image) {
        const { userImages, setImage } = useImageStore.getState();
        if (!userImages[id]) setImage(id, user.image);
      }
    } catch {}
  },

  updateName: (firstName, lastName) => {
    const adminName = `${firstName} ${lastName}`.trim();
    set({ adminName });
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...user, firstName, lastName })
      );
    } catch {}
  },

  updateImage: (imageUrl) => {
    set({ adminImage: imageUrl });
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...user, image: imageUrl })
      );
    } catch {}
  },
}));

export default useAdminProfileStore;
