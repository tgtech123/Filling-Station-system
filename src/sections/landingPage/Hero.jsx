import Image from "next/image";
import bgImg from "../../assets/fuel-bg.svg";
import liveDb from "../../assets/LiveDashboard.png";
import { ArrowRight, BriefcaseBusiness } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <div className="relative h-auto">
      <Image src={bgImg} alt="background svg" className="w-[100%] h-[100vh]" />

      <div className="px-6 lg:px-40 absolute top-0 left-0 w-[100%] opacity-80 h-[100vh] bg-gradient-to-b from-[#cee1ff] to-[#ffe9c9] flex flex-col lg:flex-row items-center justify-center lg:justify-between">
        <div className="flex-1">
          <button className="bg-[#ffe9c9] rounded-[30px] px-4 py-1 flex mx-auto lg:mx-0 items-center gap-2 text-sm text-[#faa300] font-semibold border-2 border-[#faa300]">
            <BriefcaseBusiness color="#faa300" />
            From pump attendants to manager
          </button>
          <h1 className="mt-2 text-center lg:text-left text-black text-[34px] lg:text-[50px] font-semibold leading-10 lg:leading-14">
            Unified <span className="text-[#0080FF]">Fuel Station</span> <br />
            Management System
          </h1>
          <p className="text-center lg:text-left mt-4 w-[100%] text-md font-semibold">
            Real time monitoring, smart analytics and automated workflows in one
            powerful solution. Trusted by modern filling stations to eliminate
            discrepancies, improve efficiency and keep every transaction
            accountable
          </p>
            <div className="flex justify-center lg:justify-start">

          <Button
            size="lg"
            className="bg-gradient-to-r from-[#0080ff] via-[#0c3865] font-semibold mt-8 to-[#0c3865] py-6"
            >
            Get started now <ArrowRight />
          </Button>
              </div>

          <div className="mt-4 flex justify-center lg:justify-start gap-6">
            <div>
                <h4 className="font-semibold text-2xl">100%</h4>
                <p>Uptime</p>
            </div>
            <div>
                <h4 className="font-semibold text-2xl">24/7</h4>
                <p>Support</p>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 w-[400px] lg:w-[650px]">
          {" "}
          <Image
            src={liveDb}
            alt="live dashboard img"
            className="w-full h-auto"
          />
        </div>
      </div>
    </div>
  );
}
