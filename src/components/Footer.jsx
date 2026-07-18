"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import usePlatformStore from "@/store/usePlatformStore";
import LegalModal from "@/components/LegalModal";

export default function Footer() {
  const { settings, fetchPublicSettings } = usePlatformStore();
  const [legalDoc, setLegalDoc] = useState(null); // "terms" | "privacy" | null

  useEffect(() => {
    fetchPublicSettings();
  }, []);

  const logoSrc = settings?.logoUrl || "/fueldesk-logo.png";
  const name = settings?.platformName || "FuelDesk";

  return (
    <footer className="relative bg-gradient-to-br from-[#0a1628] via-[#132958] to-[#0d1f45] overflow-hidden">
      {/* Top gradient accent bar */}
      <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50" />

      {/* Background decorative blobs */}
      <div className="absolute top-0 right-0 w-[28rem] h-[28rem] rounded-full bg-blue-600/5 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-blue-400/5 translate-y-1/2 -translate-x-1/4 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-full bg-blue-900/10 pointer-events-none blur-3xl" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-16">

          {/* Column 1 — Brand */}
          <div className="flex flex-col items-center sm:items-start">
            <div className="mb-5 p-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 inline-block">
              <Image
                src={logoSrc}
                alt={`${name} logo`}
                width={140}
                height={56}
                className="h-10 w-auto object-contain"
                unoptimized={logoSrc.startsWith("http")}
              />
            </div>
            <p className="text-blue-200/60 text-sm leading-relaxed text-center sm:text-left max-w-xs">
              Streamline operations, boost efficiency and maximize profits across your filling station.
            </p>
          </div>

          {/* Column 2 — Product links */}
          <div className="flex flex-col items-center sm:items-start">
            <h4 className="text-white/90 font-semibold text-xs uppercase tracking-widest mb-5">
              Product
            </h4>
            <nav className="flex flex-col gap-3">
              {["Features", "Pricing", "Support", "Documentation"].map((item) => (
                <Link
                  key={item}
                  href="#"
                  className="text-blue-200/60 text-sm hover:text-white transition-all duration-200 hover:translate-x-1 transform"
                >
                  {item}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3 — Contact */}
          <div className="flex flex-col items-center sm:items-start">
            <h4 className="text-white/90 font-semibold text-xs uppercase tracking-widest mb-5">
              Contact
            </h4>
            <div className="flex flex-col gap-3.5">
              {settings?.contactEmail && (
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="flex items-center gap-3 text-blue-200/60 text-sm hover:text-white transition-colors group"
                >
                  <span className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
                    <Mail size={13} className="text-blue-400" />
                  </span>
                  {settings.contactEmail}
                </a>
              )}
              {settings?.contactPhone && (
                <a
                  href={`tel:${settings.contactPhone}`}
                  className="flex items-center gap-3 text-blue-200/60 text-sm hover:text-white transition-colors group"
                >
                  <span className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
                    <Phone size={13} className="text-blue-400" />
                  </span>
                  {settings.contactPhone}
                </a>
              )}
              {settings?.contactAddress && (
                <div className="flex items-start gap-3 text-blue-200/60 text-sm">
                  <span className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin size={13} className="text-blue-400" />
                  </span>
                  <span className="leading-relaxed">{settings.contactAddress}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-blue-200/40 text-xs text-center sm:text-left">
            &copy; {new Date().getFullYear()} {name}. All rights reserved.
          </p>
          <div className="flex gap-5">
            <button
              type="button"
              onClick={() => setLegalDoc("privacy")}
              className="text-blue-200/40 text-xs hover:text-blue-200/80 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => setLegalDoc("terms")}
              className="text-blue-200/40 text-xs hover:text-blue-200/80 transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>

      <LegalModal type={legalDoc} onClose={() => setLegalDoc(null)} />
    </footer>
  );
}
