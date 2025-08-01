"use client"

import DisplayCard from "./DisplayCard";
import dynamic from 'next/dynamic';

const SalesChart = dynamic(() => import("../Dashboard/SalesOverviewChart"), {
  ssr: false,
  loading: () => <p>Loading chart...</p>
});

export default function MainContainer() {
    return (
        <div>
            <h1 className="text-[23px] font-semibold">Welcome, Oboh ThankGod</h1>
            <div className="mt-4 grid grid-cols-1  w-full gap-3">
                <DisplayCard span={2} height={400} />
                <DisplayCard />
                <DisplayCard />
                <SalesChart />
            </div>
        </div>
    )
}