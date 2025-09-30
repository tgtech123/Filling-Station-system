"use client";

import Image from "next/image";
import img from "../assets/station-logo.png";
import Link from "next/link";
import { Button } from "./ui/button";
import { AlignJustify, ArrowRight, X } from "lucide-react";
import { useState } from "react";
import RegisterManagerModal from "./RegisterManagerModal";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  function openModal() {
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

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
        <Link href="/pricing" className="text-lg font-semibold text-gray-500">
          Plans & Pricing
        </Link>

        <Link href="/contact" className="text-lg font-semibold text-gray-500">
          Contact
        </Link>
        <Link href="/login" className="text-lg font-semibold text-gray-500">
          Login
        </Link>

        <div className="flex bg-[#0080ff] gap-2 py-3 px-6 rounded-[8px] text-white items-center cursor-pointer" onClick={openModal}>
          Get Started Now
          <button className="bg-[#0080FF]" size="lg">
            <span>
              <ArrowRight />
            </span>
          </button>
        </div>
      </div>

      <div
        className="block lg:hidden cursor-pointer bg-[#0080FF] text-white p-[6px] rounded-md"
        onClick={handleOpen}
      >
        <AlignJustify size={26} className="font-semibold" />
      </div>

      {isOpen && (
        <div className="absolute top-2 px-4 py-6 rounded-md bg-[#FFFAF4] right-3 z-40 flex flex-col gap-3">
          <div
            className="flex justify-end my-2 cursor-pointer"
            onClick={handleClose}
          >
            <X
              size={32}
              className="bg-[#0080ff] text-white p-[2px] rounded-md"
            />
          </div>
          <Link href="/">Home</Link>
          <Link href="/features">Features</Link>
          <Link href="/contact">Contact</Link>
 Tgtech-Branch
          <Link href="/pricing">Pricing</Link>

          <Link href="/login">Login</Link>
 master

          
        <div className="cursor-pointer flex bg-[#0080ff] py-3 px-6 rounded-[8px] text-white items-center" onClick={openModal}>
          Get Started Now
          <button className="bg-[#0080FF] " size="lg">
            <span>
              <ArrowRight />
            </span>
          </button>
        </div>
        </div>
      )}

      {isModalOpen && <RegisterManagerModal onclose={closeModal} />}
    </div>
  );
}
