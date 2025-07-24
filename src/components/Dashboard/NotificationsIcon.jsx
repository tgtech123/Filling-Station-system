
export default function NotificationsIcon({iconName, messageCount}) {
    return (
        <div className="bg-[#f6f6f6] relative w-fit cursor-pointer px-4 py-5 rounded-[9px] flex items-center justify-center">
            {iconName}
            <span className="bg-[#ea3030] text-xs px-[5px] py-[2px] absolute top-[5px] right-2 rounded-[2px] font-semibold text-white ">{messageCount}</span>
        </div>
    )
}