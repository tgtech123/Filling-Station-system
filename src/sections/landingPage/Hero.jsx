"use client";

import Image from "next/image";
import bgImg from "../../assets/main-bg.png"
import liveDb from "../../assets/LiveDashboard.png";
import { ArrowRight, BriefcaseBusiness } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";


export default function Hero() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#cee1ff] to-[#ffe9c9] dark:from-gray-900 dark:to-gray-800">
      <Image
        src={bgImg}
        alt="background svg"
        fill
        className="object-contain sm:object-cover opacity-20"
        priority
        sizes="100vw"
      />

      <div className="relative z-10 px-4 sm:px-6 lg:px-40 w-full h-auto min-h-screen grid grid-cols-1 lg:grid-cols-2 justify-items-center items-center py-8 lg:py-12">

        <div className="flex-1 text-center lg:text-left max-w-none lg:max-w-2xl dark:bg-gray-900/60 rounded-lg p-4 lg:p-6">

          {/* BADGE — fade in + slide down from top */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <button className="bg-[#ffe9c9] dark:bg-[#faa300]/20 rounded-[30px] px-3 sm:px-4 py-1 inline-flex items-center gap-2 text-xs sm:text-sm text-[#faa300] dark:text-[#faa300] font-semibold border-2 border-[#faa300] mb-4">
              <BriefcaseBusiness color="#faa300" size={16} />
              <span className="whitespace-nowrap">From pump attendants to manager</span>
            </button>
          </motion.div>

          {/* HEADLINE — fade in + slide up with delay */}
          <motion.h1
            className="text-black dark:text-white text-2xl sm:text-3xl md:text-4xl xl:text-[50px] font-semibold leading-tight lg:leading-[3.5rem] mb-4"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          >
            Unified <span className="text-[#0080FF]">Fuel Station</span>{" "}
            <br className="hidden sm:block" />
            Management System
          </motion.h1>

          {/* DESCRIPTION — fade in with delay */}
          <motion.p
            className="mt-4 text-sm sm:text-base md:text-lg font-medium text-gray-700 dark:text-gray-200 leading-relaxed max-w-full lg:max-w-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Real time monitoring, smart analytics and automated workflows in one
            powerful solution. Trusted by modern filling stations to eliminate
            discrepancies, improve efficiency and keep every transaction
            accountable
          </motion.p>

          {/* GET STARTED BUTTON — scale + fade in */}
          <motion.div
            className="flex cursor-pointer justify-center lg:justify-start mt-6"
            onClick={() => router.push("/pricing")}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button
              size="lg"
              className="cursor-pointer flex bg-gradient-to-r from-[#0080ff] via-[#0c3865] to-[#0c3865] font-semibold py-3 px-6 h-auto"
            >
                Get started now <ArrowRight size={18} />
            </Button>
          </motion.div>

          {/* STATS ROW — staggered fade in */}
          <motion.div
            className="mt-6 flex justify-center lg:justify-start gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="text-center lg:text-left">
              <h4 className="font-semibold text-xl sm:text-2xl text-black dark:text-white">100%</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Uptime</p>
            </div>
            <div className="text-center lg:text-left">
              <h4 className="font-semibold text-xl sm:text-2xl text-black dark:text-white">24/7</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Support</p>
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN IMAGE — slide in from right with floating effect */}
        <motion.div
          className="flex-shrink-0 w-full max-w-[280px] sm:max-w-[350px] md:max-w-[400px] lg:max-w-[500px] xl:max-w-[600px] mt-8 lg:mt-0 lg:ml-8"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
          style={{ animation: "float 4s ease-in-out infinite" }}
        >
          <Image
            src={liveDb}
            alt="live dashboard img"
            className="w-full h-auto object-contain"
            priority
            sizes="(max-width: 640px) 280px, (max-width: 768px) 350px, (max-width: 1024px) 400px, (max-width: 1280px) 500px, 600px"
          />
        </motion.div>
      </div>
    </div>
  );
}
