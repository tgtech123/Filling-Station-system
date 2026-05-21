"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppWidget from "./WhatsAppWidget";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";

export default function ClientLayout({ children }) {
  useSessionTimeout();
  const pathname = usePathname();

  const hideOnExactRoutes = ["/login"];
  const hideOnPrefixRoutes = ["/dashboard", "/reset-password", "/admin", "/gas-order"];

  const hideNavAndFooter =
    hideOnExactRoutes.includes(pathname) ||
    hideOnPrefixRoutes.some((route) => pathname.startsWith(route));

  return (
    <div>
      {!hideNavAndFooter && <Navbar />}
      {children}
      {!hideNavAndFooter && <Footer />}
      {!hideNavAndFooter && <WhatsAppWidget />}
    </div>
  );
}
