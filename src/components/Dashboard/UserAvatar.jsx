import Image from "next/image"
import Link from "next/link"

export default function UserAvatar({userAvatarImg, userRole, username}) {
    return(
        <div className="flex gap-2">
            <Image src={userAvatarImg} alt="user avatar" />
            <div>
                <h4 className="text-black text-md font-semibold">{username}</h4>
                <p className="text-sm">{userRole === "View Profile" ? <Link className="text-[#1a71f6] font-semibold" href="/dashboard/profile">View Profile</Link> : userRole}</p>
            </div>
        </div>
    )
}