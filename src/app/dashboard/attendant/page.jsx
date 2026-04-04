"use client";
import { useEffect } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import MainContainer from "@/components/Dashboard/MainContainer";
import TargetCelebrationModal from "@/components/TargetCelebrationModal";
import useNotificationStore from "@/store/useNotificationStore";
import useSalesTargetStore from "@/store/useSalesTargetStore";

export default function AttendantDashboard() {
    const { fetchAlerts, startPolling, stopPolling } = useNotificationStore();
    const { fetchMyTarget } = useSalesTargetStore();

    useEffect(() => {
        fetchAlerts();
        startPolling();
        console.log("Attendant notifications loaded: alerts fetched, polling started");
        return () => stopPolling();
    }, [fetchAlerts, startPolling, stopPolling]);

    useEffect(() => {
        fetchMyTarget();
        const interval = setInterval(fetchMyTarget, 300000);
        return () => clearInterval(interval);
    }, [fetchMyTarget]);

    return (
        <DashboardLayout>
           <MainContainer />
           <TargetCelebrationModal />
        </DashboardLayout>
    )
}