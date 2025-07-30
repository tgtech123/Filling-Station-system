"use client"


import Sidebar from "@/components/Dashboard/Sidebar";
import Header from "@/components/Dashboard/Header";
import MainContainer from "@/components/Dashboard/MainContainer";
import { useState } from "react";
export default function Dashboard() {
    const [showSidebar, setShowSidebar] = useState(false);

    function toggleSidebar() {
        setShowSidebar(!showSidebar)
    }
    return (
        <div className="bg-gray-100 min-h-[100vh] h-auto">
            <Sidebar isVisible={showSidebar} toggleSidebar={toggleSidebar} />
            <Header toggleSidebar={toggleSidebar} />
            <MainContainer />
        </div>
    )
}