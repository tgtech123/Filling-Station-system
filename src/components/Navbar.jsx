"use client";

import Image from "next/image";
import img from "../assets/station-logo.png";
import Link from "next/link";
import { ArrowRight, AlignJustify, X, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useThemePersistence from "@/hooks/useThemePersistence";

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useThemePersistence();

  useEffect(() => { setMounted(true); }, []);

  function handleOpen() {
    setIsOpen(true);
  }

  function handleClose() {
    setIsOpen(false);
  }

  return (
    <div className="h-[90px] flex justify-between items-center px-6 lg:px-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <Image src={img} className="w-[90px] lg:w-[130px]" alt="logo image" />

      {/* Desktop Menu */}
      <div className="hidden lg:flex gap-10 items-center">
        <Link href="/" className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          Home
        </Link>

        {/* Dark / Light mode toggle — replaces Features link */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700 transition-colors"
          aria-label="Toggle dark mode"
        >
          {mounted && (theme === "dark" ? (
            <Sun size={18} className="text-yellow-500" />
          ) : (
            <Moon size={18} className="text-gray-600" />
          ))}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {mounted ? (theme === "dark" ? "Light" : "Dark") : "Dark"}
          </span>
        </button>

        <Link href="/pricing" className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          Pricing
        </Link>
        <Link href="/contact" className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          Contact
        </Link>
        <Link href="/login" className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          Login
        </Link>

        <div
          className="flex bg-[#0080ff] font-semibold gap-2 py-3 px-6 rounded-[8px] text-white items-center cursor-pointer"
          onClick={() => router.push("/pricing")}
        >
          Get Started Now!
          <button className="bg-[#0080FF]" size="lg">
            <ArrowRight />
          </button>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div
        className="block lg:hidden cursor-pointer bg-[#0080FF] text-white p-[6px] rounded-md"
        onClick={handleOpen}
      >
        <AlignJustify size={26} className="font-semibold" />
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-2 px-4 py-6 rounded-md bg-[#FFFAF4] dark:bg-gray-900 right-3 z-40 flex flex-col gap-3">
          <div
            className="flex justify-end my-2 cursor-pointer"
            onClick={handleClose}
          >
            <X
              size={32}
              className="bg-[#0080ff] text-white p-[2px] rounded-md"
            />
          </div>

          <Link href="/" className="text-gray-700 dark:text-gray-300" onClick={() => setIsOpen(false)}>Home</Link>
          <Link href="/contact" className="text-gray-700 dark:text-gray-300" onClick={() => setIsOpen(false)}>Contact</Link>
          <Link href="/pricing" className="text-gray-700 dark:text-gray-300" onClick={() => setIsOpen(false)}>Plans & Pricing</Link>
          <Link href="/login" className="text-gray-700 dark:text-gray-300" onClick={() => setIsOpen(false)}>Login</Link>

          {/* Dark / Light toggle in mobile menu */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-fit"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? (
              <Sun size={18} className="text-yellow-500" />
            ) : (
              <Moon size={18} className="text-gray-600" />
            )}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {theme === "dark" ? "Light" : "Dark"}
            </span>
          </button>

          <div
            className="cursor-pointer flex bg-[#0080ff] py-3 px-6 rounded-[8px] text-white items-center"
            onClick={() => router.push("/pricing")}
          >
            Get Started Now
            <button className="bg-[#0080FF]" size="lg">
              <ArrowRight />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
