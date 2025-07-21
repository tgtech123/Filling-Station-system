import Image from "next/image";
import img from "../assets/station-logo.png";
import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

export default function Navbar() {
  return (
    <div className="h-[90px] flex justify-between items-center px-40">
      <Image src={img} width={110} alt="logo image" />

      <div className="hidden lg:flex gap-10 items-center">
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
    </div>
  );
}
