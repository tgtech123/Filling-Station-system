import Image from "next/image";

export default function FeatureCard({ img, caption, description }) {
    return (
        <div className="flex flex-col items-center lg:items-start">
            <Image src={img} alt="feature img" />
            <h4 className="text-xl font-semibold my-4">{caption}</h4>
            <p className="text-sm text-center lg:text-left">
                {description}
            </p>
        </div>
    )
}