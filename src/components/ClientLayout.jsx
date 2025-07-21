"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  const hideOnExactRoutes = ["/login"];
  const hideOnPrefixRoutes = ["/dashboard"];

  const hideNavAndFooter =
    hideOnExactRoutes.includes(pathname) ||
    hideOnPrefixRoutes.some((route) => pathname.startsWith(route));

  return (
    <>
      {!hideNavAndFooter && <Navbar />}
      {children}
      {!hideNavAndFooter && <Footer />}
    </>
  );
}
