"use client";

import { Manrope, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { usePathname } from "next/navigation";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata = {
  title: "Filling Station App",
  description: "Filling Station Management System",
};

const pathname = usePathname();
const hideNavAndFooter = pathname.includes('login');

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.variable} ${manrope.variable} antialiased`}
      >
        {!hideNavAndFooter && <Navbar />}
          {children}
        {!hideNavAndFooter && <Footer />}
      </body>
    </html>
  );
}
