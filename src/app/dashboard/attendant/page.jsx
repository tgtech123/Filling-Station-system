"use client";
import { useEffect } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import MainContainer from "@/components/Dashboard/MainContainer";
import TargetCelebrationModal from "@/components/TargetCelebrationModal";
import MyShortfallCard from "@/components/Dashboard/MyShortfallCard";
import useNotificationStore from "@/store/useNotificationStore";
import useSalesTargetStore from "@/store/useSalesTargetStore";
import { useSocket } from "@/hooks/useSocket";

export default function AttendantDashboard() {
    const { fetchAlerts, startPolling, stopPolling } = useNotificationStore();
    const { fetchMyTarget } = useSalesTargetStore();

    useEffect(() => {
        fetchAlerts();
        // 5-min safety poll — socket handles the fast path
        startPolling();
        return () => stopPolling();
    }, [fetchAlerts, startPolling, stopPolling]);

    // Socket: refresh alerts & messages when a new notification arrives
    useSocket({
        "notification:new": () => useNotificationStore.getState().invalidate(),
        "shift:approved":   () => useNotificationStore.getState().invalidate(),
    });

    useEffect(() => {
        fetchMyTarget();
        const interval = setInterval(fetchMyTarget, 300000);
        return () => clearInterval(interval);
    }, [fetchMyTarget]);

    return (
        <DashboardLayout>
           {/* Above everything else: an attendant should not learn what they owe
               from an argument three weeks later. Renders nothing when clear. */}
           <MyShortfallCard />
           <MainContainer />
           <TargetCelebrationModal />
        </DashboardLayout>
    )
}