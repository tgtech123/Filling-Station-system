import Image from "next/image";
import logo from "../../assets/station-logo.png";
import { CircleFadingArrowUp, CircleQuestionMark, House, LogOut, Moon, TrendingUp } from "lucide-react";
import { PiToggleLeftFill } from "react-icons/pi";
import userAvatarImg from "../../assets/userAvatar.png"

export default function Sidebar() {
  return (
    <div className="fixed w-[280px] h-[100vh] top-0 left-0 bg-white shadow-md flex mt-6 flex-col items-center">
      <div>
        <Image src={logo} width={130} alt="logo image" />
      </div>

      <aside className="mt-6 text-[#888] flex flex-col w-full px-4 ">
        {/* General */}
        <p className="mb-4">GENERAL</p>

        <div className="links">
          <div className="flex items-center gap-2 bg-[#ff9d29] rounded-[12px] text-white px-6 py-3">
            <House />
            Dashboard
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-[12px] px-6 py-3">
            <CircleFadingArrowUp />
            Shifts
          </div>
          <div className="flex items-center gap-2 rounded-[12px] px-6 py-3">
            <TrendingUp />
            Sales Report
          </div>
        </div>

        {/* Tools */}
        <div>
          <p className="mb-4">TOOLS</p>

          <div className="links">
            <div className="flex items-center gap-2 rounded-[12px] px-6 py-3">
              <CircleQuestionMark />
              Help
            </div>

            <div className="flex items-center justify-between gap-2 rounded-[12px] px-6 py-3">
                <div className="flex gap-2 items-center">    
                    <Moon />
                    DarkMode
                </div>
                <PiToggleLeftFill size={30} className="text-[#d0d5dd] font-semibold" />
            </div>
          </div>

        </div>

        <div className="absolute bottom-20 p-2 rounded-[12px] border-2 border-gray-300 flex gap-6 items-center">
        {/* User Avatar  */}
        <div className="flex gap-2">
            <Image src={userAvatarImg} alt="user avatar" />
            <div>
                <h4 className="text-black text-lg font-semibold">Oboh ThankGod</h4>
                <p className="text-sm">Attendant</p>
            </div>
        </div>
        <div>
            <LogOut  className="text-[#ff1f1f] font-semibold"/>
        </div>

        </div>
      </aside>
    </div>
  );
}
