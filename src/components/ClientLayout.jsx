"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { RoleProvider } from "@/app/context/RoleContext";

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  const hideOnExactRoutes = ["/login"];
  const hideOnPrefixRoutes = ["/dashboard", "/reset-password"];

  const hideNavAndFooter =
    hideOnExactRoutes.includes(pathname) ||
    hideOnPrefixRoutes.some((route) => pathname.startsWith(route));

  return (
    <RoleProvider>
      {!hideNavAndFooter && <Navbar />}
      {children}
      {!hideNavAndFooter && <Footer />}
    </RoleProvider>
  );
}
