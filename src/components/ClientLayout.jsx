"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function ClientLayout({children}) {
  const pathname = usePathname();

  const hideOnRoutes = "/login" || pathname.startsWith("/dashboard");

  const hideNavAndFooter = hideOnRoutes.includes(pathname);
  return (
    <>
        {!hideNavAndFooter && <Navbar />}
        {children}
        {!hideNavAndFooter && <Footer />}
    </>
  );
}
