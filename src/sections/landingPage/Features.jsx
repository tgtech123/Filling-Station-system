import { Grid3X3 } from "lucide-react";
import img1 from "../../assets/analyticsImg.png"
import img2 from "../../assets/pumpImg.png"
import img3 from "../../assets/financeImg.png"
import img4 from "../../assets/mobileImg.png"
import img5 from "../../assets/securityImg.png"
import img6 from "../../assets/smartImg.png"
import FeatureCard from "@/components/FeatureCard";

export default function Features() {
    const data = [
        {
            id: 1,
            img: img1,
            caption: "Real-time Analytics",
            description: "Monitor your station's performance with live data and comprehensive reporting tools"
        },
        {
            id: 2,
            img: img2,
            caption: "Pump Management",
            description: "Control and monitor all fuel pumps remotely with automated alerts and diagnostics"
        },
        {
            id: 3,
            img: img3,
            caption: "Finance Tracking",
            description: "Track revenue, expenses, and profit margins with detailed financial analytics"
        },
        {
            id: 4,
            img: img4,
            caption: "Mobile Accessibility",
            description: "Access your dashboard anywhere with our responsive mobile-first design"
        },
        {
            id: 5,
            img: img5,
            caption: "Security & Compliance",
            description: "Enterprise-grade security with compliance monitoring and audit trails"
        },
        {
            id: 6,
            img: img6,
            caption: "Smart Automation",
            description: "Automate routine tasks and get intelligent insights to optimize operations"
        }
    ]
    return (
        <div className="py-20 flex flex-col items-center px-6 lg:px-40">
            <button className="flex gap-2 border-2 border-[#faa300] items-center py-2 px-6 rounded-[30px] text-[#faa300] bg-gradient-to-r from-[#c5e2ff] to-[#fff5c5]">
                <Grid3X3 className="text-[#faa300]" />
                <p className="font-semibold">Powerful Features</p>
            </button>

            <h3 className="text-2xl lg:text-3xl font-semibold text-center mt-4 mb-6">Everything You Need to Succeed</h3>
            <p className="text-center w-[90%] lg:w-[50%]">
                Our comprehensive platform provides all the tools and insights you need to
                run your filling station efficiently and profitably.
            </p>

            <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {data.map((item) => (
                        <FeatureCard 
                        key={item.id}
                        img={item.img}
                        caption={item.caption}
                        description={item.description}
                        />
                    ))}
            </div>

        </div>
    )
}