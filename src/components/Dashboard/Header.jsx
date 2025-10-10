"use client";

import { Bell, Mail, Menu } from "lucide-react";
import NotificationsIcon from "./NotificationsIcon";
import UserAvatar from "./UserAvatar";
import userAvatarImg from "../../assets/userAvatar.png"
import Image from "next/image";
import stroke from "../../assets/stroke.png"
import LogoutButton from "./LogoutButton";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Header({toggleSidebar, showSidebar}) {
    const [userData, setUserData] = useState(null);
    const router = useRouter();
    
    const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

 
  
    // Get user data from localStorage
    useEffect(() => {
      const getUserData = () => {
        try {
          const userString = localStorage.getItem("user");
          
          if (userString) {
            const user = JSON.parse(userString);
            console.log("📦 User from localStorage:", user);
            
            if (user?.role) {
              const role = user.role.toLowerCase().trim();
              console.log("✅ Setting role to:", role);
            //   setUserRole(role);
              setUserData(user);
            } else {
              console.log("❌ No role found in user object");
              router.push("/login");
            }
          } else {
            console.log("❌ No user found in localStorage");
            router.push("/login");
          }
        } catch (error) {
          console.error("❌ Error parsing user data:", error);
          router.push("/login");
        } 
      };
  
      getUserData();
    }, [router]);
  
    const fullName = userData?.firstName && userData?.lastName 
  ? `${userData.firstName} ${userData.lastName}` 
  : userData?.firstName || userData?.lastName || "User";

    return (
        <div className="px-4 z-10  shadow-md h-[90px] w-full bg-white flex items-center justify-end gap-4">
            <div className="hidden lg:flex gap-2">
            <NotificationsIcon iconName={<Mail />} messageCount={2} />
            <NotificationsIcon iconName={<Bell />} messageCount={8} />
            </div>
            <div className="hidden lg:flex">
                <Image src={stroke} alt="stroke" />
            </div>
            <UserAvatar 
                userAvatarImg={userAvatarImg}
                username={fullName}
                userRole="View Profile"
             />
            <div className="hidden lg:flex">
                <Image src={stroke} alt="stroke"/>
            </div>
            <div onClick={handleLogout} className="cursor-pointer border-2 border-red-400 p-2 rounded-[12px] hidden lg:flex items-center gap-3">
                <p className="text-[#ff1f1f] font-semibold">Logout</p>
                <LogoutButton />
            </div>

            <div onClick={toggleSidebar} className="block lg:hidden absolute left-4 bg-[#0080FF] p-2 text-white text-lg rounded-md cursor-pointer">
                <Menu />
            </div>
        </div>
    )
}