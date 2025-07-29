import Header from "@/components/Dashboard/Header";
import Sidebar from "@/components/Dashboard/Sidebar";

export default function Shifts() {
    return (
        <div>
            <Sidebar />
            <Header />
            <main className="pl-[280px] pt-[90px]">
                Shifts Page
            </main>
        </div>
    )
}