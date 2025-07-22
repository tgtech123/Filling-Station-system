import Sidebar from "@/components/Dashboard/Sidebar";
import Header from "@/components/Dashboard/Header";

export default function Dashboard() {
    return (
        <div className="bg-[#e7e7e7] h-[100vh]">
            <Sidebar />
            <Header />
        </div>
    )
}