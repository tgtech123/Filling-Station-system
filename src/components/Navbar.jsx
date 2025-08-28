"use client";

import Image from "next/image";
import img from "../assets/station-logo.png";
import Link from "next/link";
import { Button } from "./ui/button";
import { AlignJustify, ArrowRight, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  function handleOpen() {
    setIsOpen(true);
  }

  function handleClose() {
    setIsOpen(false);
  }
  return (
    <div className="h-[90px] flex justify-between items-center px-6 lg:px-40">
      <Image src={img} className="w-[90px] lg:w-[130px]" alt="logo image" />

      <div className="hidden lg:flex gap-10 items-center">
        <Link href="/" className="text-lg font-semibold text-gray-500">
          Home
        </Link>
        <Link href="/features" className="text-lg font-semibold text-gray-500">
          Features
        </Link>
        <Link href="/contact" className="text-lg font-semibold text-gray-500">
          Contact
        </Link>

        <Button className="bg-[#0080FF] flex" size="lg">
          <Link href="/login">Get Started Now</Link>
          <span>
            <ArrowRight />
          </span>
        </Button>
      </div>

      <div
        className="block lg:hidden cursor-pointer bg-[#0080FF] text-white p-[6px] rounded-md"
        onClick={handleOpen}
      >
        <AlignJustify size={26} className="font-semibold" />
      </div>

      {isOpen && (
        <div className="absolute top-2 px-4 py-6 rounded-md bg-[#FFFAF4] right-3 z-40 flex flex-col gap-3">
          <div className="flex justify-end my-2 cursor-pointer" onClick={handleClose} >
            <X size={32} className="bg-[#0080ff] text-white p-[2px] rounded-md" />
          </div>
          <Link href="/">Home</Link>
          <Link href="/features">Features</Link>
          <Link href="/contact">Contact</Link>

          <div className="mt-2">
            <Button className="bg-[#0080FF] flex" size="lg">
              <Link href="/login">Get Started Now</Link>
              <span>
                <ArrowRight />
              </span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
