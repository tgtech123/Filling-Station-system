import Image from "next/image";
import logo from "../assets/station-logo.png"
export default function Footer() {
    return (
        <div className="bg-[#132958] py-10 px-6 lg:px-40">
            <div className="grid grid-cols-1 justify-items-center lg:justify-items-start lg:grid-cols-3 gap-10">
                <div className="flex flex-col items-center lg:items-start">
                    <Image src={logo} alt="logo image" />
                    <p className="text-white text-center lg:text-left mt-4">
                        Streamline operations. boost efficiency
                        and maximize profits.
                    </p>
                </div>

                <div className="text-white">
                    <h4 className="text-xl font-semibold mb-8">Product</h4>
                    <p className="mb-2">
                        Features
                    </p>
                    <p>
                        Support
                    </p>
                </div>

                <div className="text-white">
                    <h4 className="text-xl text-center lg:text-left  font-semibold mb-8">Contact</h4>
                    <p className="mb-2 text-center lg:text-left ">
                        hello@flourishstation.com
                    </p>
                    <p className="text-center lg:text-left ">
                        +234904503302
                    </p>
                </div>
            </div>
            <p className="mt-8 text-white text-center">&copy; 2025 Flourish Station. All rights reserved</p>

        </div>
    )
}