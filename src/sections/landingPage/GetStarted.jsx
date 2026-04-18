import Image from "next/image";
import bgImg from "../../assets/framebg.png";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function GetStarted() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div className="px-4 sm:px-8 lg:px-40 py-10 sm:py-16 lg:py-10 h-auto min-h-[300px] sm:h-[400px] relative">
      <Image
        src={bgImg}
        alt="background frame"
        className="rounded-[24px] inset-0 h-full w-full"
      />

      <div className="absolute z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">

        {/* HEADING — fade in + scale up */}
        <motion.h2
          ref={ref}
          className="text-lg sm:text-xl lg:text-3xl font-semibold text-white text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.7 }}
        >
          Ready to Begin Your Journey?
        </motion.h2>

        {/* DESCRIPTION — fade in with delay */}
        <motion.p
          className="text-center w-[100%] text-sm lg:text-md text-white my-4"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Join hundreds of station workers who have revolutionized their
          operations
        </motion.p>

        {/* BUTTON — scale entrance + hover effect */}
        <div className="flex justify-center mt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button
              size="lg"
              className="cursor-pointer border-2 border-white py-6 bg-gradient-to-r from-[#0080FF] via-[#0244A9] to-[#0244A9]"
            >
              <Link href="/login" className="flex items-center gap-2">Get Started Now <ArrowRight /></Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
