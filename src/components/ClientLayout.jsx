"use client";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppWidget from "./WhatsAppWidget";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";

export default function ClientLayout({ children }) {
  useSessionTimeout();
  const pathname = usePathname();
  const [waFloatEnabled, setWaFloatEnabled] = useState(false);

  useEffect(() => {
    setWaFloatEnabled(localStorage.getItem("wa_float_enabled") === "1");
    const sync = () => setWaFloatEnabled(localStorage.getItem("wa_float_enabled") === "1");
    window.addEventListener("wa-float-toggle", sync);
    return () => window.removeEventListener("wa-float-toggle", sync);
  }, []);

  const hideOnExactRoutes = ["/login"];
  const hideOnPrefixRoutes = ["/dashboard", "/reset-password", "/admin", "/gas-order"];

  const hideNavAndFooter =
    hideOnExactRoutes.includes(pathname) ||
    hideOnPrefixRoutes.some((route) => pathname.startsWith(route));

  const isLoggedIn = pathname.startsWith("/dashboard");

  return (
    <div>
      {!hideNavAndFooter && <Navbar />}
      {children}
      {!hideNavAndFooter && <Footer />}
      {isLoggedIn && waFloatEnabled && <WhatsAppWidget />}
    </div>
  );
}
