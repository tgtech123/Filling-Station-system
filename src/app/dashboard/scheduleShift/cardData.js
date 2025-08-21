import { BriefcaseBusiness, Users } from "lucide-react";
import { TbTargetArrow } from "react-icons/tb";

export const cardData = [
    {
        id: 1,
        name: "Total Staff",
        number: 8,
        icon: <Users />
    },
    {
        id: 2,
        name: "On Duty",
        period: "Today",
        number: "6/8",
        icon: <BriefcaseBusiness />
    },
    {
        id: 3,
        name: "Overall Staff Performance",
        number: "98.8%",
        icon: <TbTargetArrow />
    }
]