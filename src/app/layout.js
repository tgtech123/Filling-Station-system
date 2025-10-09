import { Manrope, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import { Toaster } from "react-hot-toast";

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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.variable} ${manrope.variable} antialiased`}
      >
        <ClientLayout>
          {children}
          <Toaster position="top-right" reverseOrder={false} />
        </ClientLayout>
      </body>
    </html>
  );
}
