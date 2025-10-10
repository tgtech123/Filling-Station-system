"use client";
import { useEffect, useState } from "react";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import CustomTable from "./CustomTable";

export default function Deliveries() {
  const [deliveryData, setDeliveryData] = useState([]);
  const API_URL = process.env.NEXT_PUBLIC_API;
  const deliveryColumn = ["Tank Title", "Fuel Type", "Quantity (L)", "Supplier", "Expected Delivery", "Status"];

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found in localStorage");
          return;
        }

        const res = await fetch(`${API_URL}/api/delivery`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();
        console.log("Fetched deliveries:", result);

        if (res.ok && Array.isArray(result.data)) {
          const formatted = result.data.map((delivery) => [
            delivery.tankTitle || "N/A",
            delivery.fuelType || "N/A",
            `${delivery.quantity || 0} L`,
            delivery.supplier || "N/A",
            new Date(delivery.deliveryDate).toLocaleDateString() || "N/A",
            delivery.status || "Pending",
          ]);
          setDeliveryData(formatted);
        } else {
          console.error("Error fetching deliveries:", result.message || result.error);
        }
      } catch (error) {
        console.error("Error fetching deliveries:", error);
      }
    };

    fetchDeliveries();
  }, [API_URL]);

  const handleStatusAction = (action, row, rowIndex) => {
    console.log(`${action} action for delivery:`, row[0]);
    switch (action) {
      case "edit":
        break;
      case "view":
        break;
      case "delete":
        break;
      default:
        break;
    }
  };

  return (
    <DisplayCard>
      <h3 className="text-xl font-semibold">Recent Deliveries</h3>
      <p>Track fuel schedules and deliveries</p>

      <CustomTable
        data={deliveryData}
        columns={deliveryColumn}
        onStatusAction={handleStatusAction}
        lastColumnType="status"
      />
    </DisplayCard>
  );
}
