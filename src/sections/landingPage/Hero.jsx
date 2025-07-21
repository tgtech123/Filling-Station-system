// import Image from "next/image";
// import bgImg from "../../assets/main-bg.png"
// import liveDb from "../../assets/LiveDashboard.png";
// import { ArrowRight, BriefcaseBusiness } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import Link from "next/link";

// export default function Hero() {
//   return (
//     <div className="relative min-h-screen bg-gradient-to-b from-[#cee1ff] to-[#ffe9c9]">
//       <Image 
//         src={bgImg} 
//         alt="background svg" 
//         className="absolute inset-0 w-full h-full object-cover opacity-20" 
//         priority
//       />

//       <div className="relative z-10 px-4 sm:px-6 lg:px-40 w-full h-auto min-h-screen flex flex-col lg:flex-row items-center justify-center lg:justify-between py-8 lg:py-12">

//         <div className="flex-1 text-center lg:text-left max-w-none lg:max-w-2xl">
//           <button className="bg-[#ffe9c9] rounded-[30px] px-3 sm:px-4 py-1 inline-flex items-center gap-2 text-xs sm:text-sm text-[#faa300] font-semibold border-2 border-[#faa300] mb-4">
//             <BriefcaseBusiness color="#faa300" size={16} />
//             <span className="whitespace-nowrap">From pump attendants to manager</span>
//           </button>
          
//           <h1 className="text-black text-2xl sm:text-3xl md:text-4xl lg:text-[50px] font-semibold leading-tight lg:leading-[3.5rem] mb-4">
//             Unified <span className="text-[#0080FF]">Fuel Station</span>{" "}
//             <br className="hidden sm:block" />
//             Management System
//           </h1>
          
//           <p className="mt-4 text-sm sm:text-base md:text-lg font-medium text-gray-700 leading-relaxed max-w-full lg:max-w-none">
//             Real time monitoring, smart analytics and automated workflows in one
//             powerful solution. Trusted by modern filling stations to eliminate
//             discrepancies, improve efficiency and keep every transaction
//             accountable
//           </p>
          
//           <div className="flex justify-center lg:justify-start mt-6">
//             <Button
//               size="lg"
//               className="bg-gradient-to-r from-[#0080ff] via-[#0c3865] to-[#0c3865] font-semibold py-3 px-6 h-auto"
//             >
//               <Link href="/login" className="flex items-center gap-2">
//                 Get started now <ArrowRight size={18} />
//               </Link>
//             </Button>
//           </div>

//           <div className="mt-6 flex justify-center lg:justify-start gap-8">
//             <div className="text-center lg:text-left">
//               <h4 className="font-semibold text-xl sm:text-2xl text-black">100%</h4>
//               <p className="text-sm text-gray-600">Uptime</p>
//             </div>
//             <div className="text-center lg:text-left">
//               <h4 className="font-semibold text-xl sm:text-2xl text-black">24/7</h4>
//               <p className="text-sm text-gray-600">Support</p>
//             </div>
//           </div>
//         </div>

//         <div className="flex-shrink-0 w-full max-w-sm sm:max-w-md lg:max-w-2xl mt-8 lg:mt-0 lg:ml-8">
//           <Image
//             src={liveDb}
//             alt="live dashboard img"
//             className="w-full h-auto"
//             priority
//           />
//         </div>
//       </div>
//     </div>
//   );
// }
import Image from "next/image";
import bgImg from "../../assets/main-bg.png"
import liveDb from "../../assets/LiveDashboard.png";
import { ArrowRight, BriefcaseBusiness } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Hero() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#cee1ff] to-[#ffe9c9]">
      {/* Background image with better responsive handling */}
      <Image 
        src={bgImg} 
        alt="background svg" 
        fill
        className="object-contain sm:object-cover opacity-20" 
        priority
        sizes="100vw"
      />

      <div className="relative z-10 px-4 sm:px-6 lg:px-40 w-full h-auto min-h-screen grid grid-cols-1 lg:grid-cols-2 justify-items-center items-center py-8 lg:py-12">

        <div className="flex-1 text-center lg:text-left max-w-none lg:max-w-2xl">
          <button className="bg-[#ffe9c9] rounded-[30px] px-3 sm:px-4 py-1 inline-flex items-center gap-2 text-xs sm:text-sm text-[#faa300] font-semibold border-2 border-[#faa300] mb-4">
            <BriefcaseBusiness color="#faa300" size={16} />
            <span className="whitespace-nowrap">From pump attendants to manager</span>
          </button>
          
          <h1 className="text-black text-2xl sm:text-3xl md:text-4xl xl:text-[50px] font-semibold leading-tight lg:leading-[3.5rem] mb-4">
            Unified <span className="text-[#0080FF]">Fuel Station</span>{" "}
            <br className="hidden sm:block" />
            Management System
          </h1>
          
          <p className="mt-4 text-sm sm:text-base md:text-lg font-medium text-gray-700 leading-relaxed max-w-full lg:max-w-none">
            Real time monitoring, smart analytics and automated workflows in one
            powerful solution. Trusted by modern filling stations to eliminate
            discrepancies, improve efficiency and keep every transaction
            accountable
          </p>
          
          <div className="flex justify-center lg:justify-start mt-6">
            <Button
              size="lg"
              className="bg-gradient-to-r from-[#0080ff] via-[#0c3865] to-[#0c3865] font-semibold py-3 px-6 h-auto"
            >
              <Link href="/login" className="flex items-center gap-2">
                Get started now <ArrowRight size={18} />
              </Link>
            </Button>
          </div>

          <div className="mt-6 flex justify-center lg:justify-start gap-8">
            <div className="text-center lg:text-left">
              <h4 className="font-semibold text-xl sm:text-2xl text-black">100%</h4>
              <p className="text-sm text-gray-600">Uptime</p>
            </div>
            <div className="text-center lg:text-left">
              <h4 className="font-semibold text-xl sm:text-2xl text-black">24/7</h4>
              <p className="text-sm text-gray-600">Support</p>
            </div>
          </div>
        </div>

        {/* Fixed responsive dashboard image */}
        <div className="flex-shrink-0 w-full max-w-[280px] sm:max-w-[350px] md:max-w-[400px] lg:max-w-[500px] xl:max-w-[600px] mt-8 lg:mt-0 lg:ml-8">
          <Image
            src={liveDb}
            alt="live dashboard img"
            
            className="w-full h-auto object-contain"
            priority
            sizes="(max-width: 640px) 280px, (max-width: 768px) 350px, (max-width: 1024px) 400px, (max-width: 1280px) 500px, 600px"
          />
        </div>
      </div>
    </div>
  );
}