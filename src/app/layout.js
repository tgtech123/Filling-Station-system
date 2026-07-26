import { Manrope, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import ThemeProvider from "@/components/ThemeProvider";
import ThemeInitializer from "@/components/ThemeInitializer";
import InputKeyboardGuard from "@/components/InputKeyboardGuard";
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

// resizes-content: virtual keyboard shrinks the layout viewport so inputs
// stay visible above the keyboard instead of being covered by it
export const viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${plusJakartaSans.variable} ${manrope.variable} antialiased`}
      >
        <ThemeProvider>
          <ThemeInitializer />
          <InputKeyboardGuard />
          <ClientLayout>
            {children}
            <Toaster position="top-right" reverseOrder={false} />
          </ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
