"use client";
import { useEffect, useState } from "react";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import CustomTable from "./CustomTable";

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API;
  const columns = [
    "Tank Title",
    "Fuel Type",
    "Quantity (L)",
    "Supplier",
    "Expected Delivery",
    "Status",
  ];

  const fetchDeliveries = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/delivery`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();

      if (res.ok && Array.isArray(result.data)) {
        setDeliveries(result.data);
      } else {
        console.error("Error fetching deliveries:", result.message);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleMarkAsCompleted = async (supplyId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/delivery/update-supply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ supplyId, status: "Completed" }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Delivery marked as completed");
        fetchDeliveries(); // Refresh list
      } else {
        alert(data.error || data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong while updating");
    }
  };

  const handleStatusAction = (action, row, rowIndex) => {
    const delivery = deliveries[rowIndex];
    if (!delivery) return;

    switch (action) {
      case "complete":
        handleMarkAsCompleted(delivery._id);
        break;
      case "edit":
        console.log("Edit delivery:", delivery._id);
        break;
      case "delete":
        console.log("Delete delivery:", delivery._id);
        break;
      default:
        break;
    }
  };

  const tableData = deliveries.map((delivery) => [
    delivery.tankTitle || "N/A",
    delivery.fuelType || "N/A",
    `${delivery.quantity || 0} L`,
    delivery.supplier || "N/A",
    new Date(delivery.deliveryDate).toLocaleDateString() || "N/A",
    delivery.status || "Pending",
  ]);

  return (
    <DisplayCard>
      <h3 className="text-xl font-semibold">Recent Deliveries</h3>
      <p>Track fuel schedules and deliveries</p>

      {loading ? (
        <p>Loading deliveries...</p>
      ) : (
        <CustomTable
          data={tableData}
          columns={columns}
          onStatusAction={handleStatusAction}
          lastColumnType="status"
        />
      )}
    </DisplayCard>
  );
}
