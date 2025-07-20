import Image from "next/image";
import bgImg from "../../assets/framebg.png"
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function GetStarted() {
    return (
        <div className="px-6 lg:px-40 py-10 h-[400px] relative">
            <Image src={bgImg} alt="background frame"  className="rounded-[24px] inset-0 h-full w-full" />

            <div className="absolute z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <h2 className="text-3xl font-semibold text-white text-center">Ready to Begin Your Journey?</h2>
                <p className="text-center w-[100%] text-white my-4">
                    Join hundreds of station workers who have revolutionized their operations
                </p>
                <div className="flex justify-center mt-10">
                    <Button size="lg" className="border-2 border-white py-6 bg-gradient-to-r from-[#0080FF]  via-[#0244A9] to-[#0244A9]">Get Started Now <ArrowRight /></Button>
                </div>
            </div>
        </div>
    )
}
// export default function GetStarted() {
//     return (
//         <div className="px-6 lg:px-40 py-10 h-[400px] relative">
//             <div className="relative h-full w-full">
//                 <Image 
//                     src={bgImg} 
//                     alt="background frame" 
//                     className="h-[400px] w-full object-contain" // Changed from object-cover
//                 />
                
//                 <div className="absolute inset-0 flex items-center justify-center">
//                     <div className="text-center px-4">
//                         <h2 className="text-3xl font-semibold text-white text-center">Ready to Begin Your Journey?</h2>
//                         <p className="text-center text-white my-4 max-w-md">
//                             Join hundreds of station workers who have revolutionized their operations
//                         </p>
//                         <div className="flex justify-center mt-10">
//                             <Button size="lg" className="border-2 border-white py-6 bg-gradient-to-r from-[#0080FF] via-[#0244A9] to-[#0244A9]">
//                                 Get Started Now <ArrowRight />
//                             </Button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }