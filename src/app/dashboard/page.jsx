import Sidebar from "@/components/Dashboard/Sidebar";
import Header from "@/components/Dashboard/Header";
import MainContainer from "@/components/Dashboard/MainContainer";

export default function Dashboard() {
    return (
        <div className="bg-gray-100 min-h-[100vh] h-auto">
            <Sidebar />
            <Header />
            <MainContainer />
        </div>
    )
}