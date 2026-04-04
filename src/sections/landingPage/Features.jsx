import { Grid3X3 } from "lucide-react";
import img1 from "../../assets/analyticsImg.png"
import img2 from "../../assets/pumpImg.png"
import img3 from "../../assets/financeImg.png"
import img4 from "../../assets/mobileImg.png"
import img5 from "../../assets/securityImg.png"
import img6 from "../../assets/smartImg.png"
import FeatureCard from "@/components/FeatureCard";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function Features() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

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
    ];

    return (
        <div className="py-20 flex flex-col items-center px-6 lg:px-40">
            <button className="flex gap-2 border-2 border-[#faa300] items-center py-2 px-6 rounded-[30px] text-[#faa300] bg-gradient-to-r from-[#c5e2ff] to-[#fff5c5]">
                <Grid3X3 className="text-[#faa300]" />
                <p className="font-semibold">Powerful Features</p>
            </button>

            {/* SECTION TITLE — fade in when scrolled to */}
            <motion.h3
                ref={ref}
                className="text-2xl lg:text-3xl font-semibold text-center mt-4 mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6 }}
            >
                Everything You Need to Succeed
            </motion.h3>

            <p className="text-center w-[90%] lg:w-[50%]">
                Our comprehensive platform provides all the tools and insights you need to
                run your filling station efficiently and profitably.
            </p>

            {/* FEATURE CARDS — staggered scroll reveal */}
            <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-10">
                {data.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                        transition={{
                            duration: 0.5,
                            delay: index * 0.1,
                            ease: "easeOut"
                        }}
                        whileHover={{
                            y: -8,
                            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                            transition: { duration: 0.2 }
                        }}
                        style={{
                            border: "1px solid #e5e7eb",
                            borderRadius: "16px",
                            background: "transparent",
                            padding: "1.5rem",
                            cursor: "pointer"
                        }}
                    >
                        <FeatureCard
                            img={item.img}
                            caption={item.caption}
                            description={item.description}
                        />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
