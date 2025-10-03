import Link from "next/link";

export default function QuickActionsCard({icon, title, desc, action, link}) {
    return (
        <div className="border-2 border-gray-300 p-4 flex flex-col justify-between rounded-[10px]">
            <section className="mb-10 flex gap-3 justify-start">
                <div className="h-10 w-10 rounded-full flex justify-center items-center bg-[#0080ff] text-white">
                    {icon}
                </div>
                <div>
                    <h5 className="text-lg font-semibold mb-2">{title}</h5>
                    <p className="text-sm text-gray-600">
                        {desc}
                    </p>
                </div>
            </section>

            <Link href={link} className="flex justify-center font-semibold cursor-pointer items-center gap-2 w-full py-2 text-sm bg-white hover:bg-[#0080ff] text-[#0080ff] border-2 border-[#0080ff] hover:border-0 hover:text-white rounded-[8px]">
                {action}
            </Link>
        </div>
    )
}