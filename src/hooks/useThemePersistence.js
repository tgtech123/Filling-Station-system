"use client";
import { useEffect } from "react";
import { useTheme } from "next-themes";

const API_BASE_URL = process.env.NEXT_PUBLIC_API || "http://localhost:5000";

export default function useThemePersistence() {
  const { theme, setTheme } = useTheme();

  // On mount: read darkMode from localStorage user object and apply
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (typeof user.darkMode === "boolean") {
        setTheme(user.darkMode ? "dark" : "light");
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When theme changes: persist to localStorage user object + fire-and-forget API call
  useEffect(() => {
    if (!theme) return;
    const isDark = theme === "dark";

    // Update localStorage user object
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const user = JSON.parse(raw);
        user.darkMode = isDark;
        localStorage.setItem("user", JSON.stringify(user));
      }
    } catch {}

    // Fire-and-forget API sync
    try {
      const token = localStorage.getItem("token");
      if (token) {
        fetch(`${API_BASE_URL}/api/auth/update-profile`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ darkMode: isDark }),
        }).catch(() => {}); // ignore errors — localStorage is source of truth
      }
    } catch {}
  }, [theme]);

  return { theme, setTheme };
}