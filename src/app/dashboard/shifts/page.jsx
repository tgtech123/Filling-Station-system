import Header from "@/components/Dashboard/Header";
import Sidebar from "@/components/Dashboard/Sidebar";
import ShiftsPage from "./ShiftsPage";

export default function Shifts() {
    return (
        <div>
            <Sidebar />
            <Header />
            <main className="pl-[290px] pt-[90px]">
                <ShiftsPage/>
            </main>
        </div>
    )
}