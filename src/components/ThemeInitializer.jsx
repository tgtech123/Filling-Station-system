"use client";
import { useEffect } from "react";
import { useTheme } from "next-themes";

// Reads darkMode from the localStorage user object and applies it on first load.
// This runs in every page so the theme is restored immediately after login/refresh.
export default function ThemeInitializer() {
  const { setTheme } = useTheme();

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (typeof user.darkMode === "boolean") {
        setTheme(user.darkMode ? "dark" : "light");
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
