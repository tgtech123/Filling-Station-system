import {
    Grid3X3,
    Droplets,
    ClipboardCheck,
    Gift,
    Truck,
    BookOpenCheck,
    Building2,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import img1 from "../../assets/analyticsImg.png"
import img2 from "../../assets/pumpImg.png"
import img3 from "../../assets/financeImg.png"
import img4 from "../../assets/mobileImg.png"
import img5 from "../../assets/securityImg.png"
import img6 from "../../assets/smartImg.png"
import FeatureCard from "@/components/FeatureCard";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

export default function Features() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [showAll, setShowAll] = useState(false);

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
        },
        {
            id: 7,
            icon: Droplets,
            accent: "#0080FF",
            badge: "New",
            caption: "Wet-Stock Reconciliation",
            description: "Match tank dip readings against pump meter sales automatically. Per-tank yield factors expose shrinkage, calibration drift and losses before they quietly eat your margin."
        },
        {
            id: 8,
            icon: ClipboardCheck,
            accent: "#faa300",
            caption: "Shift & Cash Accountability",
            description: "Attendants close their shift on the spot, supervisors and managers approve it, and every variance is flagged. Each naira is traced to a person, a pump and a timestamp."
        },
        {
            id: 9,
            icon: Gift,
            accent: "#0080FF",
            badge: "New",
            caption: "Loyalty & SMS Rewards",
            description: "Enrol drivers in seconds, award points on every litre sold, and let them redeem right at the pump — with SMS alerts that keep customers coming back to your station."
        },
        {
            id: 10,
            icon: Truck,
            accent: "#faa300",
            caption: "Procurement to Payment",
            description: "Raise purchase orders, receive goods against them, and post supplier invoices automatically — with credit notes and payment reversals for when things go wrong."
        },
        {
            id: 11,
            icon: BookOpenCheck,
            accent: "#0080FF",
            caption: "Built-in Accounting Engine",
            description: "Double-entry journals, trial balance, profit & loss and a fixed-asset register that post themselves from daily operations. Hand your accountant a closed book, not a shoebox."
        },
        {
            id: 12,
            icon: Building2,
            accent: "#faa300",
            caption: "Multi-Branch Command",
            description: "Run every station from a single login. Consolidated sales, stock and payroll across branches, with one-click drill-down into any individual site."
        }
    ];

    const visible = showAll ? data : data.slice(0, 6);

    return (
        // id + scroll-mt: the footer's "Features" link points at /#features, and
        // the margin keeps the heading clear of the sticky header when it lands.
        <div id="features" className="scroll-mt-24 py-12 sm:py-16 lg:py-20 flex flex-col items-center px-4 sm:px-8 lg:px-40">
            <button className="flex gap-2 border-2 border-[#faa300] items-center py-2 px-6 rounded-[30px] text-[#faa300] bg-gradient-to-r from-[#c5e2ff] to-[#fff5c5]">
                <Grid3X3 className="text-[#faa300]" />
                <p className="font-semibold">Powerful Features</p>
            </button>

            {/* SECTION TITLE — fade in when scrolled to */}
            <motion.h3
                ref={ref}
                className="text-xl sm:text-2xl lg:text-3xl font-semibold text-center mt-4 mb-6"
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
            <div className="mt-10 sm:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
                {visible.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                        transition={{
                            duration: 0.5,
                            delay: index < 6 ? index * 0.1 : (index - 6) * 0.08,
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
                            icon={item.icon}
                            accent={item.accent}
                            badge={item.badge}
                            caption={item.caption}
                            description={item.description}
                        />
                    </motion.div>
                ))}
            </div>

            {/* EXPAND / COLLAPSE */}
            <motion.button
                type="button"
                onClick={() => setShowAll((prev) => !prev)}
                className="cursor-pointer mt-10 flex items-center gap-2 py-2 px-6 rounded-[30px] font-semibold text-white bg-gradient-to-r from-[#0080ff] via-[#0c3865] to-[#0c3865]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
            >
                {showAll ? (
                    <>Show fewer features <ChevronUp size={18} /></>
                ) : (
                    <>Explore all {data.length} capabilities <ChevronDown size={18} /></>
                )}
            </motion.button>
        </div>
    );
}
