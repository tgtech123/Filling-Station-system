"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, AlignJustify, X, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import useThemePersistence from "@/hooks/useThemePersistence";
import usePlatformStore from "@/store/usePlatformStore";

/**
 * One list, rendered twice — desktop and mobile were drifting apart, with the
 * same page called "Pricing" in one and "Plans & Pricing" in the other.
 */
const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/#book-demo", label: "Book a demo" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
  { href: "/login", label: "Login" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useThemePersistence();
  const { settings, fetchPublicSettings } = usePlatformStore();

  useEffect(() => {
    setMounted(true);
    fetchPublicSettings();
  }, []);

  /**
   * The hash, tracked as state.
   *
   * "Book a demo" is the only entry that points at a fragment rather than a
   * page, and usePathname cannot see a fragment — so without this it could
   * never show as active, and Home would stay underlined while the reader is
   * looking at the demo section. Re-read on pathname change too, because a
   * client-side navigation to /#book-demo from another page sets the hash
   * without ever firing hashchange.
   */
  const [hash, setHash] = useState("");
  useEffect(() => {
    const read = () => setHash(window.location.hash);
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [pathname]);

  const isActive = (href) => {
    if (href.startsWith("/#")) return pathname === "/" && hash === href.slice(1);
    // Home is only "current" when no section is being viewed, so it and
    // "Book a demo" are never underlined at the same time.
    if (href === "/") return pathname === "/" && !hash;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const linkClass = (href) =>
    [
      "whitespace-nowrap text-sm xl:text-[15px] font-semibold transition-colors",
      isActive(href)
        ? "text-[#0080FF] underline underline-offset-8 decoration-2"
        : "text-gray-700 dark:text-gray-300 hover:text-[#0080FF]",
    ].join(" ");

  function handleOpen() {
    setIsOpen(true);
  }

  function handleClose() {
    setIsOpen(false);
  }

  return (
    <div className="h-[90px] flex justify-between items-center px-6 lg:px-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <Image
        src={settings?.logoUrl || "/fueldesk-logo.png"}
        className="w-[90px] lg:w-[130px] h-auto object-contain"
        alt="logo"
        width={130}
        height={50}
        unoptimized={!!(settings?.logoUrl)}
      />

      {/* Desktop Menu — text stepped down from text-lg and the gap from 10 to 5,
          because at 100% zoom on a 1366-wide laptop the row ran out of space and
          "Book a demo" wrapped onto two lines. whitespace-nowrap makes that
          impossible again rather than merely unlikely. The theme toggle moved to
          sit beside the call to action: it is a control, not a destination, and
          having it between two links was breaking the row up. */}
      <div className="hidden lg:flex items-center gap-5 xl:gap-6">
        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={linkClass(href)}
            aria-current={isActive(href) ? "page" : undefined}
          >
            {label}
          </Link>
        ))}

        {/* Dark / Light mode toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700 transition-colors"
          aria-label="Toggle dark mode"
        >
          {mounted && (theme === "dark" ? (
            <Sun size={16} className="text-yellow-500" />
          ) : (
            <Moon size={16} className="text-gray-600" />
          ))}
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {mounted ? (theme === "dark" ? "Light" : "Dark") : "Dark"}
          </span>
        </button>

        {/* One button, not a button nested inside a clickable div — that markup
            is invalid and put a second, unlabelled tab stop in the header. */}
        <button
          type="button"
          onClick={() => router.push("/pricing")}
          className="flex items-center gap-1.5 whitespace-nowrap rounded-[8px] bg-[#0080ff] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0066cc] cursor-pointer"
        >
          Get Started Now!
          <ArrowRight size={16} aria-hidden="true" />
        </button>
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

          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm ${
                isActive(href)
                  ? "text-[#0080FF] font-semibold underline underline-offset-4 decoration-2"
                  : "text-gray-700 dark:text-gray-300"
              }`}
              aria-current={isActive(href) ? "page" : undefined}
              onClick={() => setIsOpen(false)}
            >
              {label}
            </Link>
          ))}

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
