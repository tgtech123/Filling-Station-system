import Image from "next/image";

export default function FeatureCard({ img, icon: Icon, accent = "#0080FF", badge, caption, description }) {
    return (
        <div className="flex flex-col items-center lg:items-start">
            {img ? (
                <Image src={img} alt="feature img" />
            ) : Icon ? (
                <div
                    className="w-[45px] h-[45px] rounded-xl flex items-center justify-center"
                    style={{
                        backgroundColor: `${accent}1A`,
                        border: `1px solid ${accent}33`
                    }}
                >
                    <Icon size={22} style={{ color: accent }} />
                </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 my-4">
                <h4 className="text-xl font-semibold">{caption}</h4>
                {badge && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-[2px] rounded-full text-[#faa300] bg-[#faa300]/10 border border-[#faa300]/40">
                        {badge}
                    </span>
                )}
            </div>

            <p className="text-sm text-center lg:text-left">
                {description}
            </p>
        </div>
    )
}
