import DisplayCard from "./DisplayCard";

export default function MainContainer() {
    return (
        <div className="ml-0 lg:ml-[280px] pt-[100px] py-4 px-4">
            <h1 className="text-[23px] font-semibold">Welcome, Oboh ThankGod</h1>
            <div className="mt-4 grid grid-cols-1  w-full gap-3">
                <DisplayCard span={2} height={400} />
                <DisplayCard />
                <DisplayCard />
            </div>
        </div>
    )
}