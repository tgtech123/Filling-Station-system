import { Bell, Mail, Menu } from "lucide-react";
import NotificationsIcon from "./NotificationsIcon";
import UserAvatar from "./UserAvatar";
import userAvatarImg from "../../assets/userAvatar.png"
import Image from "next/image";
import stroke from "../../assets/stroke.png"
import LogoutButton from "./LogoutButton";

export default function Header({toggleSidebar, showSidebar}) {
    return (
        <div className="px-4 z-10 pl-0 lg:pl-[280px] fixed shadow-md h-[90px] w-full bg-white flex items-center justify-end gap-4">
            <div className="hidden lg:flex gap-2">
            <NotificationsIcon iconName={<Mail />} messageCount={2} />
            <NotificationsIcon iconName={<Bell />} messageCount={8} />
            </div>
            <div className="hidden lg:flex">
                <Image src={stroke} alt="stroke" />
            </div>
            <UserAvatar 
                userAvatarImg={userAvatarImg}
                username="Oboh ThankGod"
                userRole="View Profile"
             />
            <div className="hidden lg:flex">
                <Image src={stroke} alt="stroke"/>
            </div>
            <div className="border-2 border-red-400 p-2 rounded-[12px] hidden lg:flex items-center gap-3">
                <p className="text-[#ff1f1f] font-semibold">Logout</p>
                <LogoutButton />
            </div>

            <div onClick={toggleSidebar} className="block lg:hidden absolute left-4 bg-[#0080FF] p-2 text-white text-lg rounded-md cursor-pointer">
                <Menu />
            </div>
        </div>
    )
}