import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import MainContainer from "@/components/Dashboard/MainContainer";
import { RoleProvider } from "../context/RoleContext";

export default function Dashboard() {
   
    return (
        <RoleProvider>

        <DashboardLayout>
            <MainContainer />
        </DashboardLayout>
        </RoleProvider>

    )
}