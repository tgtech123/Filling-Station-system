import Image from "next/image";
import bgImg from "../../assets/fuel-bg.svg";
import liveDb from "../../assets/LiveDashboard.png";
import { ArrowRight, BriefcaseBusiness } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <div className="relative">
      <Image src={bgImg} alt="background svg" className="w-[100%] h-[100vh]" />

      <div className="px-40 absolute top-0 left-0 w-[100%] opacity-80 h-[700px] bg-gradient-to-b from-[#cee1ff] to-[#ffe9c9] flex flex-col lg:flex-row items-center justify-between">
        <div>
          <button className="bg-[#ffe9c9] rounded-[30px] px-4 py-1 flex items-center gap-2 text-sm text-[#faa300] font-semibold border-2 border-[#faa300]">
            <BriefcaseBusiness color="#faa300" />
            From pump attendants to manager
          </button>
          <h1 className="mt-2 text-black text-[50px] font-semibold leading-14">
            Unified <span className="text-[#0080FF]">Fuel Station</span> <br />
            Management System
          </h1>
          <p className="mt-4 w-[60%]">
            Real time monitoring, smart analytics and automated workflows in one
            powerful solution. Trusted by modern filling stations to eliminate
            discrepancies, improve efficiency and keep every transaction
            accountable
          </p>

          <Button className="bg-gradient-to-r from-[#0080ff] via-[#0c3865] font-semibold mt-8 py-4 to-[#0c3865]">Get started now <ArrowRight /></Button>
        </div>

        <Image src={liveDb} alt="live dashboard img" className="w-[100%]" />
      </div>
    </div>
  );
}
