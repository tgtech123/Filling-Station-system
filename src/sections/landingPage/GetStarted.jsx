import Image from "next/image";
import bgImg from "../../assets/framebg.png";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function GetStarted() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div className="px-4 sm:px-8 lg:px-40 py-10 sm:py-16 lg:py-10">
      {/*
        The image is a BACKGROUND LAYER, not a flow element. Previously it sat in
        normal flow while the text was absolutely positioned against the outer
        padded container — so the text was centred on the padding box, not on the
        image, and had no width limit. On narrow screens it grew wider than the
        image and spilled out of it.

        Now this box defines the image area, and the content is an ordinary
        centred flex child inside it. It can never escape: the box grows to fit
        the content instead (min-h, not a fixed h), and overflow-hidden keeps
        everything within the rounded corners.
      */}
      <div
        ref={ref}
        className="relative isolate flex items-center justify-center overflow-hidden rounded-[24px] min-h-[300px] sm:min-h-[360px] lg:min-h-[400px]"
      >
        <Image
          src={bgImg}
          alt=""
          aria-hidden="true"
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
          className="-z-10 object-cover"
          placeholder="blur"
        />

        {/* Content — capped width and its own padding, so the text always sits
            inside the image with breathing room on every screen size. */}
        <div className="relative z-10 w-full max-w-[34rem] px-6 py-12 sm:px-8 sm:py-14 text-center">
          {/* HEADING — fade in + scale up */}
          <motion.h2
            className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white text-balance"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.7 }}
          >
            Ready to Begin Your Journey?
          </motion.h2>

          {/* DESCRIPTION — fade in with delay */}
          <motion.p
            className="mt-3 text-sm sm:text-base text-white/90 text-pretty"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Join hundreds of station workers who have revolutionized their
            operations
          </motion.p>

          {/* BUTTON — scale entrance + hover effect */}
          <motion.div
            className="mt-7 sm:mt-8 flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            {/* asChild renders the Link AS the button — the previous markup put
                an <a> inside a <button>, which is invalid and breaks keyboard
                and screen-reader navigation. */}
            <Button
              asChild
              size="lg"
              className="cursor-pointer border-2 border-white py-6 bg-gradient-to-r from-[#0080FF] via-[#0244A9] to-[#0244A9]"
            >
              <Link href="/login" className="flex items-center gap-2">
                Get Started Now
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
