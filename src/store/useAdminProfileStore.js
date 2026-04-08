import { create } from "zustand";

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
