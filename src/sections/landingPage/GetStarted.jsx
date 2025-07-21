import Image from "next/image";
import bgImg from "../../assets/framebg.png";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function GetStarted() {
  return (
    <div className="px-6 lg:px-40 py-10 h-[400px] relative">
      <Image
        src={bgImg}
        alt="background frame"
        className="rounded-[24px] inset-0 h-full w-full"
      />

      <div className="absolute z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <h2 className="text-xl lg:text-3xl font-semibold text-white text-center">
          Ready to Begin Your Journey?
        </h2>
        <p className="text-center w-[100%] text-sm lg:text-md text-white my-4">
          Join hundreds of station workers who have revolutionized their
          operations
        </p>
        <div className="flex justify-center mt-10">
          <Button
            size="lg"
            className="cursor-pointer border-2 border-white py-6 bg-gradient-to-r from-[#0080FF]  via-[#0244A9] to-[#0244A9]"
          >
            <Link href="/login" className="flex items-center gap-2">Get Started Now <ArrowRight /></Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
