"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function ClientLayout({children}) {
  const pathname = usePathname();
  const hideNavAndFooter = pathname.includes("login");
  return (
    <>
        {!hideNavAndFooter && <Navbar />}
        {children}
        {!hideNavAndFooter && <Footer />}
    </>
  );
}
